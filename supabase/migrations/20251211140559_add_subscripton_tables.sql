-- drop policy "Users can insert their own feedback" on "public"."feedback";
-- 
-- drop policy "Users can view their own feedback" on "public"."feedback";
-- 
-- drop policy "Users can insert their own stats" on "public"."user_stats";
-- 
-- revoke delete on table "public"."feedback" from "anon";
-- 
-- revoke insert on table "public"."feedback" from "anon";
-- 
-- revoke references on table "public"."feedback" from "anon";
-- 
-- revoke select on table "public"."feedback" from "anon";
-- 
-- revoke trigger on table "public"."feedback" from "anon";
-- 
-- revoke truncate on table "public"."feedback" from "anon";
-- 
-- revoke update on table "public"."feedback" from "anon";
-- 
-- revoke delete on table "public"."feedback" from "authenticated";
-- 
-- revoke insert on table "public"."feedback" from "authenticated";
-- 
-- revoke references on table "public"."feedback" from "authenticated";
-- 
-- revoke select on table "public"."feedback" from "authenticated";
-- 
-- revoke trigger on table "public"."feedback" from "authenticated";
-- 
-- revoke truncate on table "public"."feedback" from "authenticated";
-- 
-- revoke update on table "public"."feedback" from "authenticated";
-- 
-- revoke delete on table "public"."feedback" from "service_role";
-- 
-- revoke insert on table "public"."feedback" from "service_role";
-- 
-- revoke references on table "public"."feedback" from "service_role";
-- 
-- revoke select on table "public"."feedback" from "service_role";
-- 
-- revoke trigger on table "public"."feedback" from "service_role";
-- 
-- revoke truncate on table "public"."feedback" from "service_role";
-- 
-- revoke update on table "public"."feedback" from "service_role";
-- 
-- alter table "public"."feedback" drop constraint "feedback_category_check";
-- 
-- alter table "public"."feedback" drop constraint "feedback_status_check";
-- 
-- alter table "public"."feedback" drop constraint "feedback_user_id_fkey";
-- 
-- drop function if exists "public"."claim_quest"(quest_uuid uuid);
-- 
-- alter table "public"."feedback" drop constraint "feedback_pkey";
-- 
-- drop index if exists "public"."feedback_pkey";
-- 
-- drop index if exists "public"."idx_feedback_created_at";
-- 
-- drop index if exists "public"."idx_feedback_user_id";
-- 
-- drop table "public"."feedback";


  create table "public"."paystack_subscription_payloads" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "payload" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."paystack_subscription_payloads" enable row level security;

CREATE UNIQUE INDEX paystack_subscription_payloads_pkey ON public.paystack_subscription_payloads USING btree (id);

alter table "public"."paystack_subscription_payloads" add constraint "paystack_subscription_payloads_pkey" PRIMARY KEY using index "paystack_subscription_payloads_pkey";

alter table "public"."paystack_subscription_payloads" add constraint "paystack_subscription_payloads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."paystack_subscription_payloads" validate constraint "paystack_subscription_payloads_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_session_xp(words_read integer, duration_seconds integer, comprehension_pct numeric)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(uid uuid)
 RETURNS TABLE(achievement_id text, just_unlocked boolean)
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
  
  -- Achievement: First Steps (1 session)
  IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = uid AND achievement_id = 'first_session') THEN
    IF (SELECT COUNT(*) FROM practice_sessions WHERE user_id = uid) >= 1 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'first_session');
      RETURN QUERY SELECT 'first_session'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 3-Day Streak
  IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = uid AND achievement_id = 'streak_3') THEN
    IF user_stat.current_streak >= 3 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'streak_3');
      RETURN QUERY SELECT 'streak_3'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 7-Day Streak
  IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = uid AND achievement_id = 'streak_7') THEN
    IF user_stat.current_streak >= 7 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'streak_7');
      RETURN QUERY SELECT 'streak_7'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 30-Day Streak
  IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = uid AND achievement_id = 'streak_30') THEN
    IF user_stat.current_streak >= 30 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'streak_30');
      RETURN QUERY SELECT 'streak_30'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 10K Words
  IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = uid AND achievement_id = 'words_10k') THEN
    IF user_stat.total_words_read >= 10000 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'words_10k');
      RETURN QUERY SELECT 'words_10k'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 100K Words
  IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = uid AND achievement_id = 'words_100k') THEN
    IF user_stat.total_words_read >= 100000 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'words_100k');
      RETURN QUERY SELECT 'words_100k'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 400 WPM
  IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = uid AND achievement_id = 'speed_400') THEN
    IF latest_session.wpm >= 400 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'speed_400');
      RETURN QUERY SELECT 'speed_400'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: 600 WPM
  IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = uid AND achievement_id = 'speed_600') THEN
    IF latest_session.wpm >= 600 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'speed_600');
      RETURN QUERY SELECT 'speed_600'::TEXT, TRUE;
    END IF;
  END IF;
  
  -- Achievement: Perfect Score
  IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = uid AND achievement_id = 'perfect_quiz') THEN
    IF latest_session.comprehension >= 100 THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (uid, 'perfect_quiz');
      RETURN QUERY SELECT 'perfect_quiz'::TEXT, TRUE;
    END IF;
  END IF;
  
  RETURN;
END;
$function$
;

grant delete on table "public"."paystack_subscription_payloads" to "anon";

grant insert on table "public"."paystack_subscription_payloads" to "anon";

grant references on table "public"."paystack_subscription_payloads" to "anon";

grant select on table "public"."paystack_subscription_payloads" to "anon";

grant trigger on table "public"."paystack_subscription_payloads" to "anon";

grant truncate on table "public"."paystack_subscription_payloads" to "anon";

grant update on table "public"."paystack_subscription_payloads" to "anon";

grant delete on table "public"."paystack_subscription_payloads" to "authenticated";

grant insert on table "public"."paystack_subscription_payloads" to "authenticated";

grant references on table "public"."paystack_subscription_payloads" to "authenticated";

grant select on table "public"."paystack_subscription_payloads" to "authenticated";

grant trigger on table "public"."paystack_subscription_payloads" to "authenticated";

grant truncate on table "public"."paystack_subscription_payloads" to "authenticated";

grant update on table "public"."paystack_subscription_payloads" to "authenticated";

grant delete on table "public"."paystack_subscription_payloads" to "service_role";

grant insert on table "public"."paystack_subscription_payloads" to "service_role";

grant references on table "public"."paystack_subscription_payloads" to "service_role";

grant select on table "public"."paystack_subscription_payloads" to "service_role";

grant trigger on table "public"."paystack_subscription_payloads" to "service_role";

grant truncate on table "public"."paystack_subscription_payloads" to "service_role";

grant update on table "public"."paystack_subscription_payloads" to "service_role";


  create policy "Service role can manage paystack subscription payloads"
  on "public"."paystack_subscription_payloads"
  as permissive
  for all
  to service_role
using (true)
with check (true);



