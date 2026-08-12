-- Lets a user spend earned XP on a streak freeze: the next time
-- record_practice_session sees they missed exactly one day, it consumes
-- one of these instead of resetting current_streak to 1. Capped so it
-- stays a scarce, deliberate purchase rather than a way to never lose a
-- streak.
create or replace function public.buy_streak_freeze()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
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
$$;

revoke execute on function public.buy_streak_freeze() from public;
grant execute on function public.buy_streak_freeze() to authenticated;
