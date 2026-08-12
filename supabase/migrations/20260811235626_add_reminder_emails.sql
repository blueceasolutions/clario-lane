-- Migration: Actually send the reminder emails users opt into
-- Created: 2026-08-11
-- Description:
--   users.daily_reminder / reminder_time / weekly_summary are collected at
--   onboarding and toggleable in Settings, but nothing has ever sent
--   either email -- send-email's EmailRequest.type never had a
--   DAILY_REMINDER or WEEKLY_SUMMARY case (added in the same change set as
--   this migration).
--
--   While building this, found that the two existing email triggers
--   (send_welcome_email, send_password_change_email, added in
--   20251212100000_add_email_triggers.sql and
--   20260129150000_fix_welcome_email_trigger.sql) call net.http_post with
--   the literal placeholder strings 'YOUR_PROJECT_REF' and
--   'YOUR_SERVICE_ROLE_KEY' that were seemingly never replaced -- so
--   welcome emails and password-changed security alerts have never
--   actually been sent either. Fixed both using the same mechanism this
--   migration sets up for the new reminder emails.
--
-- ============================================================
-- REQUIRED ONE-TIME SETUP (cannot be done from this migration: it would
-- mean committing real production secrets to git). Run once against the
-- target project, after this migration is applied:
--
--   select vault.create_secret(
--     'https://<your-project-ref>.supabase.co/functions/v1',
--     'functions_url'
--   );
--   select vault.create_secret(
--     '<your service_role key, from Project Settings > API>',
--     'service_role_key'
--   );
--
-- Until both secrets exist, every function below is a documented no-op
-- (it checks for them and returns early rather than erroring) -- so this
-- migration is safe to deploy before that setup step happens.
-- ============================================================

create extension if not exists pg_cron with schema extensions;

-- Internal helper: read a secret from Vault. Not exposed to PostgREST --
-- only ever called from other SECURITY DEFINER functions in this file.
create or replace function public._get_vault_secret(secret_name text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select decrypted_secret from vault.decrypted_secrets where name = secret_name limit 1;
$$;

revoke execute on function public._get_vault_secret(text) from public;

-- Fix: previously hardcoded 'YOUR_PROJECT_REF'/'YOUR_SERVICE_ROLE_KEY' placeholders.
create or replace function public.send_welcome_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_functions_url text := public._get_vault_secret('functions_url');
  v_service_key text := public._get_vault_secret('service_role_key');
begin
  if new.onboarding_completed = true and (old.onboarding_completed = false or old.onboarding_completed is null) then
    if v_functions_url is not null and v_service_key is not null then
      perform net.http_post(
        url := v_functions_url || '/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'type', 'WELCOME',
          'email', new.email,
          'data', jsonb_build_object('name', new.name)
        )
      );
    end if;
  end if;
  return new;
end;
$$;

-- Fix: previously hardcoded 'YOUR_PROJECT_REF'/'YOUR_SERVICE_ROLE_KEY' placeholders.
create or replace function public.send_password_change_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_functions_url text := public._get_vault_secret('functions_url');
  v_service_key text := public._get_vault_secret('service_role_key');
begin
  if new.encrypted_password <> old.encrypted_password then
    if v_functions_url is not null and v_service_key is not null then
      perform net.http_post(
        url := v_functions_url || '/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'type', 'PASSWORD_CHANGED',
          'email', new.email,
          'data', jsonb_build_object('name', coalesce(new.raw_user_meta_data->>'name', 'there'))
        )
      );
    end if;
  end if;
  return new;
end;
$$;

-- Fix: these two triggers were dropped by 20260202155058_alter_passages_table.sql
-- (an auto-generated `db diff` migration -- send_welcome_email/
-- send_password_change_email were never captured in supabase/schemas/, so a
-- diff against that declarative source concluded they were extraneous and
-- dropped both the triggers AND the functions). The functions got quietly
-- recreated by 20260129150000_fix_welcome_email_trigger.sql applying
-- *before* the drop in migration order, but nothing ever recreated the
-- triggers afterward, so neither email has fired since 2026-02-02
-- regardless of the placeholder-secret bug. Recreating both here, and
-- adding both to supabase/schemas/ this time so a future `db diff` doesn't
-- repeat this.
drop trigger if exists on_user_onboarded on public.users;
create trigger on_user_onboarded
after update on public.users
for each row
execute function public.send_welcome_email();

drop trigger if exists on_password_change on auth.users;
create trigger on_password_change
after update on auth.users
for each row
execute function public.send_password_change_email();

-- Daily reminder: once a day, at the user's own reminder_time (hour
-- granularity -- there's no per-user timezone stored, so reminder_time is
-- interpreted as UTC; see the note in feature.md), and only for users who
-- haven't practiced yet today so this doesn't nag people who already have.
create or replace function public.send_daily_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_functions_url text := public._get_vault_secret('functions_url');
  v_service_key text := public._get_vault_secret('service_role_key');
  u record;
begin
  if v_functions_url is null or v_service_key is null then
    raise notice 'send_daily_reminders: functions_url/service_role_key not set in vault yet, skipping';
    return;
  end if;

  for u in
    select id, email, name, coalesce(streak_days, 0) as streak_days
    from users
    where daily_reminder = true
      and onboarding_completed = true
      and extract(hour from reminder_time) = extract(hour from now())
      and (last_active_date is null or last_active_date::date < current_date)
  loop
    perform net.http_post(
      url := v_functions_url || '/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'type', 'DAILY_REMINDER',
        'email', u.email,
        'data', jsonb_build_object('name', u.name, 'streak', u.streak_days)
      )
    );
  end loop;
end;
$$;

revoke execute on function public.send_daily_reminders() from public;

-- Weekly summary: once a week (Monday, chosen arbitrarily -- there's no
-- per-user day-of-week setting, only reminder_time), at the user's
-- reminder_time hour, covering the trailing 7 days of practice_sessions.
create or replace function public.send_weekly_summaries()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_functions_url text := public._get_vault_secret('functions_url');
  v_service_key text := public._get_vault_secret('service_role_key');
  u record;
  v_sessions int;
  v_words bigint;
  v_avg_wpm numeric;
begin
  if v_functions_url is null or v_service_key is null then
    raise notice 'send_weekly_summaries: functions_url/service_role_key not set in vault yet, skipping';
    return;
  end if;

  if extract(isodow from now()) <> 1 then
    return;
  end if;

  for u in
    select id, email, name, coalesce(streak_days, 0) as streak_days
    from users
    where weekly_summary = true
      and onboarding_completed = true
      and extract(hour from reminder_time) = extract(hour from now())
  loop
    select count(*), coalesce(sum(total_words), 0), coalesce(round(avg(wpm)), 0)
      into v_sessions, v_words, v_avg_wpm
      from practice_sessions
      where user_id = u.id
        and created_at >= now() - interval '7 days';

    perform net.http_post(
      url := v_functions_url || '/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'type', 'WEEKLY_SUMMARY',
        'email', u.email,
        'data', jsonb_build_object(
          'name', u.name,
          'sessionsCompleted', v_sessions,
          'wordsRead', v_words,
          'avgWpm', v_avg_wpm,
          'streak', u.streak_days
        )
      )
    );
  end loop;
end;
$$;

revoke execute on function public.send_weekly_summaries() from public;

select cron.schedule('send-daily-reminders', '0 * * * *', $$select public.send_daily_reminders();$$);
select cron.schedule('send-weekly-summaries', '0 * * * *', $$select public.send_weekly_summaries();$$);
