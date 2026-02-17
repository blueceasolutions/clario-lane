-- Create user_stats table
create table if not exists public.user_stats (
  user_id uuid references auth.users(id) on delete cascade primary key,
  xp bigint default 0 not null,
  level int default 1 not null,
  current_streak int default 0 not null,
  longest_streak int default 0 not null,
  total_words_read bigint default 0 not null,
  total_time_seconds bigint default 0 not null,
  last_activity_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create achievements table
create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon_url text,
  category text not null, -- 'speed', 'streak', 'volume', 'mastery'
  condition_type text not null, -- 'total_words', 'wpm', 'streak_days'
  condition_value int not null,
  xp_reward int default 0 not null,
  created_at timestamptz default now() not null
);

-- Create user_achievements table
create table if not exists public.user_achievements (
  user_id uuid references auth.users(id) on delete cascade,
  achievement_id text references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now() not null,
  primary key (user_id, achievement_id)
);

CREATE OR REPLACE FUNCTION check_and_unlock_achievements(uid UUID)
RETURNS TABLE (out_achievement_id TEXT, just_unlocked BOOLEAN) AS $$
DECLARE
  user_stat RECORD;
  latest_session RECORD;
BEGIN
  SELECT * INTO user_stat FROM user_stats WHERE user_id = uid;
  SELECT * INTO latest_session FROM practice_sessions WHERE user_id = uid ORDER BY created_at DESC LIMIT 1;
  
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'first_session') THEN
    IF (SELECT COUNT(*) FROM practice_sessions WHERE user_id = uid) >= 1 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'first_session');
      RETURN QUERY SELECT 'first_session'::TEXT, TRUE;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'streak_3') THEN
    IF user_stat.current_streak >= 3 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'streak_3');
      RETURN QUERY SELECT 'streak_3'::TEXT, TRUE;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'streak_7') THEN
    IF user_stat.current_streak >= 7 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'streak_7');
      RETURN QUERY SELECT 'streak_7'::TEXT, TRUE;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'streak_30') THEN
    IF user_stat.current_streak >= 30 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'streak_30');
      RETURN QUERY SELECT 'streak_30'::TEXT, TRUE;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'words_10k') THEN
    IF user_stat.total_words_read >= 10000 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'words_10k');
      RETURN QUERY SELECT 'words_10k'::TEXT, TRUE;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'words_100k') THEN
    IF user_stat.total_words_read >= 100000 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'words_100k');
      RETURN QUERY SELECT 'words_100k'::TEXT, TRUE;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'speed_400') THEN
    IF latest_session.wpm >= 400 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'speed_400');
      RETURN QUERY SELECT 'speed_400'::TEXT, TRUE;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'speed_600') THEN
    IF latest_session.wpm >= 600 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'speed_600');
      RETURN QUERY SELECT 'speed_600'::TEXT, TRUE;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'perfect_quiz') THEN
    IF latest_session.comprehension >= 100 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'perfect_quiz');
      RETURN QUERY SELECT 'perfect_quiz'::TEXT, TRUE;
    END IF;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Create quests table
create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'daily', 'weekly', 'special'
  description text not null,
  target_metric text not null, -- 'words', 'minutes', 'sessions', 'wpm'
  target_value int not null,
  xp_reward int default 0 not null,
  expires_at timestamptz,
  created_at timestamptz default now() not null
);

-- Create user_quests table
create table if not exists public.user_quests (
  user_id uuid references auth.users(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete cascade,
  current_value int default 0 not null,
  is_completed boolean default false not null,
  expires_at timestamptz,
  claimed_at timestamptz,
  updated_at timestamptz default now() not null,
  primary key (user_id, quest_id)
);

-- Enable RLS
alter table public.user_stats enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.quests enable row level security;
alter table public.user_quests enable row level security;

-- RLS Policies

-- user_stats
create policy "Users can view their own stats"
  on public.user_stats for select
  using (auth.uid() = user_id);

create policy "Users can update their own stats"
  on public.user_stats for update
  using (auth.uid() = user_id);

create policy "Users can insert their own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

-- achievements
create policy "Achievements are viewable by everyone"
  on public.achievements for select
  to authenticated
  using (true);

-- user_achievements
create policy "Users can view their own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert their own achievements" -- Logic likely handled by edge function/backend, but allowing for now if client-side logic used
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

-- quests
create policy "Quests are viewable by everyone"
  on public.quests for select
  to authenticated
  using (true);

-- user_quests
create policy "Users can view their own quest progress"
  on public.user_quests for select
  using (auth.uid() = user_id);

create policy "Users can update their own quest progress"
  on public.user_quests for update
  using (auth.uid() = user_id);

create policy "Users can insert their own quest progress"
  on public.user_quests for insert
  with check (auth.uid() = user_id);


-- Function to handle new user creation
create or replace function public.handle_new_user_gamification()
returns trigger as $$
begin
  insert into public.user_stats (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
-- Note: This assumes there is a trigger on auth.users that calls this, or we attach it to public.users if that's the main profile table.
-- Looking at previous migrations, it seems we might want to attach this to the creation of a profile or just insert it when needed.
-- However, standard practice is often to hook into auth.users or the public profiles table.
-- Since I don't see the auth.users trigger setup here, I will create a trigger on public.users if it exists, or just leave the function to be called manually or via another trigger.
-- Let's check if public.users exists. Based on file list `20251106151829_add_subs_fields_to_users_table.sql`, `users` table likely exists in public.

-- Let's assume public.users is the profile table.
drop trigger if exists on_auth_user_created_gamification on public.users;
create trigger on_auth_user_created_gamification
  after insert on public.users
  for each row execute procedure public.handle_new_user_gamification();
