-- Create a secure function to upsert user stats, bypassing RLS
create or replace function public.upsert_user_stats(
  _user_id uuid,
  _xp bigint,
  _level int,
  _current_streak int,
  _longest_streak int,
  _last_activity_date date,
  _total_words_read bigint,
  _total_time_seconds bigint
)
returns void as $$
begin
  insert into public.user_stats (
    user_id,
    xp,
    level,
    current_streak,
    longest_streak,
    last_activity_date,
    total_words_read,
    total_time_seconds,
    updated_at
  )
  values (
    _user_id,
    _xp,
    _level,
    _current_streak,
    _longest_streak,
    _last_activity_date,
    _total_words_read,
    _total_time_seconds,
    now()
  )
  on conflict (user_id) do update
  set
    xp = EXCLUDED.xp,
    level = EXCLUDED.level,
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    last_activity_date = EXCLUDED.last_activity_date,
    total_words_read = EXCLUDED.total_words_read,
    total_time_seconds = EXCLUDED.total_time_seconds,
    updated_at = now();
end;
$$ language plpgsql security definer;
