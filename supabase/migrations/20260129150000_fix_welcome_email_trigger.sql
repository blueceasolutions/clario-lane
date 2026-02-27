-- Fix: Drop and recreate the welcome email trigger to ensure it uses the correct column name
-- The column was renamed from 'onboardingcompleted' to 'onboarding_completed' in migration '20251107081735_rname_fields.sql'
-- This migration ensures the trigger uses the correct column name

-- Drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_user_onboarded ON public.users;
DROP FUNCTION IF EXISTS public.send_welcome_email();

-- Recreate the function with the correct column name
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if onboarding_completed changed from false/null to true
  IF NEW.onboarding_completed = TRUE AND (OLD.onboarding_completed = FALSE OR OLD.onboarding_completed IS NULL) THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := jsonb_build_object(
        'type', 'WELCOME',
        'email', NEW.email,
        'data', jsonb_build_object('name', NEW.name)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_user_onboarded
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.send_welcome_email();
