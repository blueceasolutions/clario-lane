-- Migration: Fix ambiguous achievement_id column reference (Final)
-- Created: 2026-02-02
-- Description: Drops and recreates check_and_unlock_achievements with 'out_achievement_id' return column to strictly avoid ambiguity.

DROP FUNCTION IF EXISTS public.check_and_unlock_achievements(uuid);

CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(uid uuid)
 RETURNS TABLE(out_achievement_id text, just_unlocked boolean)
 LANGUAGE plpgsql
AS $function$
DECLARE
  user_stat RECORD;
  latest_session RECORD;
BEGIN
  -- Get user stats
  SELECT * INTO user_stat
  FROM user_stats
  WHERE user_id = uid;
  
  -- Get latest session
  SELECT * INTO latest_session
  FROM practice_sessions
  WHERE user_id = uid
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Use alias 'ua' for user_achievements table for clarity, though variable name change fixes the ambiguity
  
  -- Achievement: First Steps (1 session)
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'first_session') THEN
    IF (SELECT COUNT(*) FROM practice_sessions WHERE user_id = uid) >= 1 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'first_session');
      RETURN QUERY SELECT 'first_session'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 3-Day Streak
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'streak_3') THEN
    IF user_stat.current_streak >= 3 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'streak_3');
      RETURN QUERY SELECT 'streak_3'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 7-Day Streak
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'streak_7') THEN
    IF user_stat.current_streak >= 7 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'streak_7');
      RETURN QUERY SELECT 'streak_7'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 30-Day Streak
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'streak_30') THEN
    IF user_stat.current_streak >= 30 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'streak_30');
      RETURN QUERY SELECT 'streak_30'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 10K Words
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'words_10k') THEN
    IF user_stat.total_words_read >= 10000 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'words_10k');
      RETURN QUERY SELECT 'words_10k'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 100K Words
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'words_100k') THEN
    IF user_stat.total_words_read >= 100000 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'words_100k');
      RETURN QUERY SELECT 'words_100k'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 400 WPM
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'speed_400') THEN
    IF latest_session.wpm >= 400 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'speed_400');
      RETURN QUERY SELECT 'speed_400'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 600 WPM
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'speed_600') THEN
    IF latest_session.wpm >= 600 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'speed_600');
      RETURN QUERY SELECT 'speed_600'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: Perfect Score
  IF NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = uid AND ua.achievement_id = 'perfect_quiz') THEN
    IF latest_session.comprehension >= 100 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'perfect_quiz');
      RETURN QUERY SELECT 'perfect_quiz'::TEXT, TRUE;
    END IF;
  END IF;
  
  RETURN;
END;
$function$;
