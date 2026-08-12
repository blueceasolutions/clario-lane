-- Ranks users who've opted in (users.leaderboard_opt_in) by XP earned
-- since the start of the current calendar week (resets every Monday, via
-- date_trunc('week', ...)).
--
-- SECURITY DEFINER: reading other users' names/XP needs to bypass the
-- users.select RLS policy (auth.uid() = id, i.e. "your own row only"), but
-- to keep that bypass narrow, this returns only what a leaderboard needs
-- (name, weekly XP, rank) -- never a full users/practice_sessions row --
-- and only for rows where the user explicitly opted in.
create or replace function public.get_weekly_leaderboard(limit_count int default 20)
returns table (
  user_id uuid,
  name text,
  weekly_xp bigint,
  rank bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    u.id as user_id,
    u.name,
    coalesce(sum(ps.xp_earned), 0)::bigint as weekly_xp,
    rank() over (order by coalesce(sum(ps.xp_earned), 0) desc) as rank
  from users u
  left join practice_sessions ps
    on ps.user_id = u.id
    and ps.created_at >= date_trunc('week', now())
  where u.leaderboard_opt_in = true
  group by u.id, u.name
  order by weekly_xp desc, u.name asc
  limit limit_count;
$$;

revoke execute on function public.get_weekly_leaderboard(int) from public;
grant execute on function public.get_weekly_leaderboard(int) to authenticated;
