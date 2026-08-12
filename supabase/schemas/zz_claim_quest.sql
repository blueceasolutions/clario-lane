-- Claims a completed quest's XP reward. Brought into the declarative
-- schema (previously only existed as a migration) while adding an
-- expires_at check: seasonal/limited-time quests (quests.type = 'special')
-- have a real deadline, and without this a quest completed just before
-- expiry could still be claimed indefinitely afterward.
create or replace function public.claim_quest(quest_uuid uuid)
returns jsonb
language plpgsql
security definer
as $$
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
$$;

revoke execute on function public.claim_quest(uuid) from public;
grant execute on function public.claim_quest(uuid) to authenticated;
