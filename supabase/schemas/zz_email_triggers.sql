-- Transactional and reminder email triggers.
--
-- These previously existed only as ad-hoc migrations, never captured here
-- in the declarative schema -- which is exactly why a `db diff` migration
-- (20260202155058_alter_passages_table.sql) concluded they were extraneous
-- and dropped both send_welcome_email/send_password_change_email and their
-- triggers. Nothing recreated the triggers afterward, so neither email has
-- fired since. See 20260811235626_add_reminder_emails.sql for the fix and
-- full history.
--
-- Sending requires two Vault secrets that can't be committed here (see
-- that migration's header comment for the one-time setup command):
--   functions_url     e.g. https://<project-ref>.supabase.co/functions/v1
--   service_role_key  the project's service_role key
-- Every function below checks for both and no-ops if either is missing.

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

drop trigger if exists on_user_onboarded on public.users;
create trigger on_user_onboarded
after update on public.users
for each row
execute function public.send_welcome_email();

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

drop trigger if exists on_password_change on auth.users;
create trigger on_password_change
after update on auth.users
for each row
execute function public.send_password_change_email();

-- Daily reminder: once a day, at the user's own reminder_time (hour
-- granularity -- there's no per-user timezone stored, so reminder_time is
-- interpreted as UTC), and only for users who haven't practiced yet today
-- so this doesn't nag people who already have. Scheduled hourly via
-- pg_cron in the migration (cron.schedule isn't schema-diffable DDL, so it
-- isn't repeated here).
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
-- Also computes a WPM trend against the prior 7-day window and a
-- highlight stat (best single-session WPM this week), so the digest shows
-- direction and a specific standout moment, not just flat totals. Skips a
-- user entirely if they had no sessions this week -- there's no trend or
-- highlight to report, and a summary of all zeros reads as nagging rather
-- than useful.
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
  v_prev_avg_wpm numeric;
  v_best_wpm numeric;
  v_best_wpm_date text;
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

    if v_sessions = 0 then
      continue;
    end if;

    select coalesce(round(avg(wpm)), 0)
      into v_prev_avg_wpm
      from practice_sessions
      where user_id = u.id
        and created_at >= now() - interval '14 days'
        and created_at < now() - interval '7 days';

    select wpm, to_char(created_at, 'FMDay, FMMon FMDD')
      into v_best_wpm, v_best_wpm_date
      from practice_sessions
      where user_id = u.id
        and created_at >= now() - interval '7 days'
      order by wpm desc
      limit 1;

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
          -- 0 (rather than null) means "no prior week to compare against";
          -- the email only renders a trend when this is > 0.
          'prevAvgWpm', v_prev_avg_wpm,
          'bestWpm', v_best_wpm,
          'bestWpmDate', v_best_wpm_date,
          'streak', u.streak_days
        )
      )
    );
  end loop;
end;
$$;

revoke execute on function public.send_weekly_summaries() from public;
