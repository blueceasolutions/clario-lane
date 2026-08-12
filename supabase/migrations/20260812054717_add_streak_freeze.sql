-- Streak freeze / repair: users can spend earned XP (buy_streak_freeze)
-- to bank a token that record_practice_session automatically spends the
-- next time exactly one day is missed, keeping the streak alive instead
-- of resetting it to 1.

alter table "public"."user_stats" add column "streak_freezes" integer not null default 0;

CREATE OR REPLACE FUNCTION public.buy_streak_freeze()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_stats RECORD;
  v_cost constant int := 200;
  v_max_freezes constant int := 2;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select * into v_stats from user_stats where user_id = v_uid for update;
  if not found then
    raise exception 'No stats found for user %', v_uid using errcode = 'P0002';
  end if;

  if coalesce(v_stats.streak_freezes, 0) >= v_max_freezes then
    raise exception 'You already have the maximum number of streak freezes' using errcode = 'P0001';
  end if;

  if v_stats.xp < v_cost then
    raise exception 'Not enough XP to buy a streak freeze' using errcode = 'P0001';
  end if;

  update user_stats
     set xp = xp - v_cost,
         streak_freezes = coalesce(streak_freezes, 0) + 1,
         updated_at = now()
   where user_id = v_uid;

  return jsonb_build_object(
    'xp_spent', v_cost,
    'streak_freezes', coalesce(v_stats.streak_freezes, 0) + 1
  );
end;
$function$
;

revoke execute on function public.buy_streak_freeze() from public;
grant execute on function public.buy_streak_freeze() to authenticated;

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
