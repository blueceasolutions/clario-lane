-- Seasonal / limited-time quests (type = 'special'): claim_quest gains an
-- expires_at check (a quest completed just before its deadline shouldn't
-- be claimable indefinitely afterward), and record_practice_session's
-- quest-progress upsert stops advancing quests whose window has already
-- closed. claim_quest is also formally brought into the declarative
-- schema here -- it previously only existed as a migration.

CREATE OR REPLACE FUNCTION public.claim_quest(quest_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_user_id uuid;
  v_quest RECORD;
  v_user_quest RECORD;
  v_current_stats RECORD;
  v_xp_reward int;
  v_new_total_xp int;
  v_new_level int;
begin
  v_user_id := auth.uid();

  select * from quests where id = quest_uuid into v_quest;
  if not found then
    raise exception 'Quest not found';
  end if;

  if v_quest.expires_at is not null and v_quest.expires_at < now() then
    raise exception 'This quest has expired';
  end if;

  select * from user_quests
   where user_id = v_user_id and quest_id = quest_uuid
    into v_user_quest;

  if not found then
    raise exception 'Quest progress not found';
  end if;

  if v_user_quest.is_completed = false then
    raise exception 'Quest is not completed yet';
  end if;

  if v_user_quest.claimed_at is not null then
    raise exception 'Quest already claimed';
  end if;

  v_xp_reward := v_quest.xp_reward;

  update user_quests
     set claimed_at = now(),
         updated_at = now()
   where user_id = v_user_id and quest_id = quest_uuid;

  select * from user_stats where user_id = v_user_id into v_current_stats;

  if not found then
    insert into user_stats (user_id, xp, level)
    values (v_user_id, v_xp_reward, 1)
    returning xp, level into v_new_total_xp, v_new_level;
  else
    v_new_total_xp := v_current_stats.xp + v_xp_reward;
    v_new_level := calculate_level(v_new_total_xp);

    update user_stats
       set xp = v_new_total_xp,
           level = v_new_level,
           updated_at = now()
     where user_id = v_user_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'xp_gained', v_xp_reward,
    'new_total_xp', v_new_total_xp,
    'new_level', v_new_level
  );

exception
  when others then
    return jsonb_build_object(
      'success', false,
      'message', sqlerrm
    );
end;
$function$
;

revoke execute on function public.claim_quest(uuid) from public;
grant execute on function public.claim_quest(uuid) to authenticated;

CREATE OR REPLACE FUNCTION public.record_practice_session(p_passage_id uuid, p_exercise_id uuid, p_wpm numeric, p_next_wpm numeric, p_comprehension numeric, p_duration numeric, p_total_words numeric, p_correct_answers numeric, p_total_questions numeric, p_start_time numeric, p_elapsed_time numeric, p_next_difficulty text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_user RECORD;
  v_stats RECORD;
  v_existing RECORD;
  v_session_id uuid;
  v_session_xp int;
  v_new_total_xp bigint;
  v_new_level int;
  v_new_total_words bigint;
  v_new_total_time bigint;
  v_today date := current_date;
  v_diff_days int;
  v_new_streak int;
  v_new_longest_streak int;
  v_freeze_consumed boolean := false;
  v_achievements jsonb;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  -- Serialize concurrent session submissions for this user so the
  -- read-then-write of streak/xp below can't race with another request.
  select id, streak_days, last_active_date
    into v_user
    from users
   where id = v_uid
   for update;

  if not found then
    raise exception 'User % not found', v_uid using errcode = 'P0002';
  end if;

  -- Idempotency guard: a retried submission of the same session returns the
  -- previously computed result instead of double-awarding XP.
  select id, xp_earned into v_existing
    from practice_sessions
   where user_id = v_uid
     and exercise_id = p_exercise_id
     and start_time = p_start_time
   limit 1;

  if found then
    select xp, level into v_new_total_xp, v_new_level
      from user_stats where user_id = v_uid;

    return jsonb_build_object(
      'xp_gained', coalesce(v_existing.xp_earned, 0),
      'new_level', coalesce(v_new_level, 1),
      'new_achievements', '[]'::jsonb
    );
  end if;

  select * into v_stats from user_stats where user_id = v_uid for update;
  if not found then
    insert into user_stats (user_id) values (v_uid) returning * into v_stats;
  end if;

  insert into practice_sessions (
    user_id, passage_id, exercise_id, wpm, next_wpm, comprehension,
    duration, total_words, correct_answers, total_questions, start_time, elapsed_time
  ) values (
    v_uid, p_passage_id, p_exercise_id, p_wpm, p_next_wpm, p_comprehension,
    p_duration, p_total_words, p_correct_answers, p_total_questions, p_start_time, p_elapsed_time
  )
  returning id into v_session_id;

  v_session_xp := calculate_session_xp(
    round(p_total_words)::int,
    round(p_duration)::int,
    p_comprehension
  );
  v_new_total_xp := coalesce(v_stats.xp, 0) + v_session_xp;
  v_new_level := calculate_level(v_new_total_xp);

  update practice_sessions set xp_earned = v_session_xp where id = v_session_id;

  v_new_total_words := coalesce(v_stats.total_words_read, 0) + round(p_total_words);
  v_new_total_time := coalesce(v_stats.total_time_seconds, 0) + round(p_duration);

  -- Streak calculation (mirrors the removed updateStreak() in the edge
  -- function). A streak_freeze (bought via buy_streak_freeze()) absorbs
  -- exactly one missed day: the streak continues instead of resetting, and
  -- the freeze is spent. Missing two or more days still resets it -- a
  -- freeze bridges one gap, not an indefinite absence.
  if v_user.last_active_date is null then
    v_new_streak := 1;
  else
    v_diff_days := v_today - v_user.last_active_date::date;
    if v_diff_days = 0 then
      v_new_streak := coalesce(v_user.streak_days, 0)::int;
    elsif v_diff_days = 1 then
      v_new_streak := coalesce(v_user.streak_days, 0)::int + 1;
    elsif v_diff_days = 2 and coalesce(v_stats.streak_freezes, 0) > 0 then
      v_new_streak := coalesce(v_user.streak_days, 0)::int + 1;
      v_freeze_consumed := true;
    else
      v_new_streak := 1;
    end if;
  end if;

  v_new_longest_streak := greatest(v_new_streak, coalesce(v_stats.longest_streak, 0));

  update users
     set last_active_date = v_today,
         streak_days = v_new_streak,
         next_wpm = p_next_wpm,
         next_difficulty = coalesce(p_next_difficulty, next_difficulty),
         updated_at = now()
   where id = v_uid;

  insert into user_stats (
    user_id, xp, level, current_streak, longest_streak,
    last_activity_date, total_words_read, total_time_seconds,
    streak_freezes, updated_at
  ) values (
    v_uid, v_new_total_xp, v_new_level, v_new_streak, v_new_longest_streak,
    v_today, v_new_total_words, v_new_total_time,
    coalesce(v_stats.streak_freezes, 0) - (case when v_freeze_consumed then 1 else 0 end),
    now()
  )
  on conflict (user_id) do update set
    xp = excluded.xp,
    level = excluded.level,
    current_streak = excluded.current_streak,
    longest_streak = excluded.longest_streak,
    last_activity_date = excluded.last_activity_date,
    total_words_read = excluded.total_words_read,
    total_time_seconds = excluded.total_time_seconds,
    streak_freezes = excluded.streak_freezes,
    updated_at = now();

  -- Bulk quest-progress upsert: one statement across all quests instead of
  -- a per-quest read + upsert loop.
  with quest_progress as (
    select
      q.id as quest_id,
      coalesce(uq.current_value, 0) + case q.target_metric
        when 'words' then round(p_total_words)::int
        when 'minutes' then round(p_duration / 60.0)::int
        when 'sessions' then 1
        when 'wpm' then case when p_wpm >= q.target_value then q.target_value else 0 end
        else 0
      end as new_value,
      coalesce(uq.is_completed, false) as was_completed,
      uq.claimed_at as prev_claimed_at,
      q.target_value as target_value
    from quests q
    left join user_quests uq on uq.user_id = v_uid and uq.quest_id = q.id
    -- Don't keep advancing (or newly completing) a quest whose window has
    -- already closed -- matters most for limited-time (type = 'special')
    -- quests, which have a real deadline rather than daily/weekly's
    -- effectively-open-ended one.
    where q.expires_at is null or q.expires_at > now()
  )
  insert into user_quests (user_id, quest_id, current_value, is_completed, updated_at, claimed_at)
  select
    v_uid,
    quest_id,
    new_value,
    new_value >= target_value,
    now(),
    case when was_completed and new_value < target_value then null else prev_claimed_at end
  from quest_progress
  on conflict (user_id, quest_id) do update set
    current_value = excluded.current_value,
    is_completed = excluded.is_completed,
    updated_at = excluded.updated_at,
    claimed_at = excluded.claimed_at;

  perform update_avg_scores(v_uid);

  select coalesce(jsonb_agg(jsonb_build_object(
      'achievement_id', out_achievement_id,
      'just_unlocked', just_unlocked
    )), '[]'::jsonb)
    into v_achievements
    from check_and_unlock_achievements(v_uid);

  return jsonb_build_object(
    'xp_gained', v_session_xp,
    'new_level', v_new_level,
    'new_achievements', v_achievements,
    'freeze_consumed', v_freeze_consumed
  );
end;
$function$
;
