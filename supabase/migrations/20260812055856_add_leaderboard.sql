-- Opt-in weekly leaderboard: users.leaderboard_opt_in controls visibility,
-- get_weekly_leaderboard() ranks opted-in users by XP earned since the
-- start of the current calendar week.

alter table "public"."users" add column "leaderboard_opt_in" boolean not null default false;

CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard(limit_count integer DEFAULT 20)
 RETURNS TABLE(user_id uuid, name text, weekly_xp bigint, rank bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

revoke execute on function public.get_weekly_leaderboard(int) from public;
grant execute on function public.get_weekly_leaderboard(int) to authenticated;
