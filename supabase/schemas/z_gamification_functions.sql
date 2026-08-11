-- Migration: Add Gamification Logic
-- Created: 2025-12-02
-- Description: Adds XP calculation, level calculation, achievement unlocking, and daily goal tracking

-- ============================================
-- 1. XP Calculation Function
-- ============================================
-- Calculates XP based on words read, duration, and comprehension
-- Formula: (Base XP + Time Bonus) × Comprehension Multiplier
--   - Base XP: 1 XP per 10 words
--   - Time Bonus: 10 XP per minute
--   - Comprehension Multiplier: 1.0x → 1.5x (0% → 100%)

CREATE OR REPLACE FUNCTION calculate_session_xp(
  words_read INT,
  duration_seconds INT,
  comprehension_pct NUMERIC
) RETURNS INT AS $$
DECLARE
  base_xp INT;
  time_bonus INT;
  comp_multiplier NUMERIC;
  total_xp INT;
BEGIN
  -- Base XP: 1 XP per 10 words
  base_xp := FLOOR(words_read / 10.0);
  
  -- Time Bonus: 10 XP per minute
  time_bonus := FLOOR(duration_seconds / 60.0) * 10;
  
  -- Comprehension multiplier (1.0 to 1.5)
  comp_multiplier := 1.0 + (COALESCE(comprehension_pct, 0) / 100.0 * 0.5);
  
  -- Total XP
  total_xp := FLOOR((base_xp + time_bonus) * comp_multiplier);
  
  RETURN GREATEST(total_xp, 1); -- Minimum 1 XP
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 2. Level Calculation Function
-- ============================================
-- Formula: Level = FLOOR(SQRT(total_xp / 100))

CREATE OR REPLACE FUNCTION calculate_level(total_xp BIGINT)
RETURNS INT AS $$
BEGIN
  RETURN GREATEST(FLOOR(SQRT(total_xp / 100.0)), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 3. Daily Words Read Function
-- ============================================
-- Returns total words read today for a user

CREATE OR REPLACE FUNCTION get_words_read_today(uid UUID)
RETURNS INT AS $$
DECLARE
  words_today INT;
BEGIN
  SELECT COALESCE(SUM(total_words), 0)
  INTO words_today
  FROM practice_sessions
  WHERE user_id = uid
    AND DATE(created_at) = CURRENT_DATE;
  
  RETURN words_today;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 4. Achievement Unlocking Function
-- ============================================
-- Defined in gamification_schema.sql (as check_and_unlock_achievements,
-- returning out_achievement_id/just_unlocked). It used to be redefined here
-- too with a stale `achievement_id` return column from before the
-- 20260202180000_fix_ambiguous_achievement_id_final migration — since this
-- file loads after gamification_schema.sql, that duplicate silently won out
-- as the "declarative" version and didn't match what's actually deployed.
-- Removed rather than fixed in place to avoid maintaining the same function
-- in two files.
