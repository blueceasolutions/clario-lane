-- Weekly summary digest: adds a WPM trend (vs. the prior 7-day window)
-- and a highlight stat (best single-session WPM this week), and skips
-- users with zero sessions this week instead of sending an all-zeros
-- email. See supabase/schemas/zz_email_triggers.sql for the declarative
-- source of truth this mirrors.

CREATE OR REPLACE FUNCTION public.send_weekly_summaries()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
          'prevAvgWpm', v_prev_avg_wpm,
          'bestWpm', v_best_wpm,
          'bestWpmDate', v_best_wpm_date,
          'streak', u.streak_days
        )
      )
    );
  end loop;
end;
$function$
;
