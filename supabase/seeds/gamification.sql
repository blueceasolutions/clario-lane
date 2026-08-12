-- Seed Initial Achievements
insert into public.achievements (id, title, description, category, condition_type, condition_value, xp_reward, icon_url) values
('first_session', 'First Steps', 'Complete your first reading session', 'milestone', 'session_count', 1, 50, '🎯'),
('streak_3', 'Getting Consistent', 'Maintain a 3-day streak', 'streak', 'streak_days', 3, 100, '🔥'),
('streak_7', 'Week Warrior', 'Maintain a 7-day streak', 'streak', 'streak_days', 7, 250, '🔥'),
('streak_30', 'Monthly Master', 'Maintain a 30-day streak', 'streak', 'streak_days', 30, 1000, '🏆'),
('words_10k', 'Bookworm', 'Read 10,000 words total', 'volume', 'total_words', 10000, 500, '📚'),
('words_100k', 'Scholar', 'Read 100,000 words total', 'volume', 'total_words', 100000, 5000, '📖'),
('speed_400', 'Speed Reader', 'Hit 400 WPM in a session', 'speed', 'wpm', 400, 300, '⚡'),
('speed_600', 'Speed Demon', 'Hit 600 WPM in a session', 'speed', 'wpm', 600, 800, '💨'),
('perfect_quiz', 'Perfect Score', 'Score 100% on a comprehension quiz', 'accuracy', 'comprehension', 100, 200, '✨'),
-- Additional achievements for variety
('early_bird', 'Early Bird', 'Complete a reading session before 8 AM', 'habit', 'time_of_day', 800, 50, 'sunrise'),
('marathoner_1', 'Marathoner I', 'Read for 30 minutes in a single session', 'endurance', 'session_time', 30, 200, 'flame'),
('speed_demon_1', 'Speed Demon I', 'Reach 400 WPM with >80% comprehension', 'speed', 'wpm', 400, 150, 'zap'),
('scholar_1', 'Scholar I', 'Read 10,000 words total', 'volume', 'total_words', 10000, 300, 'book'),
('streak_master_1', 'Streak Master I', 'Maintain a 7-day reading streak', 'streak', 'streak_days', 7, 500, 'calendar')
on conflict (id) do nothing;

-- Seed Quests (Examples)
-- Note: In a real app, these might be generated dynamically or rotated.
insert into public.quests (type, description, target_metric, target_value, xp_reward, expires_at) values
('daily', 'Read 500 words', 'words', 500, 50, now() + interval '1 day'),
('daily', 'Complete 1 Speed Reading Session', 'sessions', 1, 50, now() + interval '1 day'),
('weekly', 'Read for 60 minutes total', 'minutes', 60, 200, now() + interval '1 week')
on conflict do nothing;

-- Seasonal / limited-time quests (type = 'special'): a fixed end date
-- rather than an interval offset from now(), since a season has an actual
-- calendar deadline, not a rolling window that should shift every time the
-- database is reset. Bigger targets and XP than the standing daily/weekly
-- rotation, so they read as a real event worth coming back for.
insert into public.quests (type, description, target_metric, target_value, xp_reward, expires_at) values
('special', 'Late-Summer Reading Sprint: read 5,000 words before it ends', 'words', 5000, 1000, '2026-08-31 23:59:59+00'),
('special', 'Late-Summer Reading Sprint: complete 10 sessions before it ends', 'sessions', 10, 500, '2026-08-31 23:59:59+00')
on conflict do nothing;
