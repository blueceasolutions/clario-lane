-- Enable pg_net extension if not already enabled
create extension if not exists "pg_net" with schema "extensions";

-- Function to trigger welcome email
create or replace function public.handle_new_user_email()
returns trigger
language plpgsql
security definer
as $$
declare
  response_id uuid;
begin
  -- Call send-email edge function
  -- Note: We use the internal Docker DNS name for local dev 'edge-runtime', but in production it's the project URL.
  -- For portability, we'll try to use a relative path if supported or we need the project URL.
  -- Since we can't easily inject the URL here without config, we'll assume a project_url secret or similar,
  -- OR we can use the net.http_post with the full URL. 
  -- We will use a placeholder 'https://PROJECT_ID.supabase.co/functions/v1/send-email' and ask user to replace or use env substitution if they use a tool for that.
  -- HOWEVER, for this task I will use a generic approach or ask user to updates constants.
  -- Actually, let's use a hardcoded URL structure that is common or just a placeholder.
  -- Better yet, we can use an App Setting / Vault secret if available, but simplest is hardcoding for specific env.
  
  perform net.http_post(
      url := 'https://' || current_setting('app.project_ref', true) || '.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true) -- This usually isn't available by default in postgres config
      ),
      -- We'll try to just use valid JSON. Authorization is tricky from SQL without secrets.
      -- A common pattern is to NOT send from SQL but have the client/auth flow do it.
      -- BUT user asked for "When a new user is successfully onboarded".
      -- If I can't set auth header, the function will reject it.
      -- Alternative: The trigger inserts into a 'job_queue' table and an Edge Function (cron) processes it.
      -- OR: We assume 'pg_net' is configured with secrets? No.
      
      -- Let's try to pass the ANON key if that is safe enough for this specific endpoint (we can make the endpoint verify a specific secret in body if needed, or just rely on obfuscation/headers).
      -- Actually, `net` requests originate from the database. 
      -- We will assume the Service Role Key is available in a vault or we have to ask the user to configure this migration with their output.
      
      body := jsonb_build_object(
          'type', 'WELCOME',
          'email', new.email,
          'data', jsonb_build_object('name', new.name)
      )
  );
  return new;
end;
$$;

-- Since 'current_setting' might not work for project_ref/keys without setup, 
-- and I need to deliver a working solution, I will use a different approach for the "Welcome" email if possible,
-- OR I will document that this migration needs the URL/Key replaced.
-- User approved "Trigger via Database Webhook".
-- Supabase Dashboard Webhooks (HTTP Request) are easier to configure than SQL triggers for this because they handle auth.
-- I'll create the SQL function but the trigger definition might be best done in the dashboard for "HTTP Request" type triggers.
-- BUT I can create a "native" Postgres trigger that calls `net.http_post` IF I have the URL/Key.
-- I will assume I can't put the key in source control (migration file).

-- Alternative: Use a `notifications` table.
-- 1. Trigger inserts into `public.notifications` (email, type, data).
-- 2. `send-email` function is triggered by database webhook on `insert` to `notifications`.
-- This is cleaner! Supabase can autosend webhooks on insert.
-- AND `paystack-webhook` can insert into this table too instead of calling fetch directly!
-- This centralizes everything.
-- Let's pivot to this architectural improvement? 
-- No, user approved the plan with "send-email function".
-- I'll stick to the plan but maybe just use `pg_net` with placeholders for now?
-- "use resend. api key ..." was given.
-- I'll use the notification table approach implicitly? No, that changes the plan.
-- I'll stick to modifying the migration to use `pg_net` but I'll add a comment about keys.

-- Actually, for `auth.users`, we can't easily add a trigger in `migrations` directory that touches `auth` schema without permissions issues sometimes.
-- But let's try.

-- NEW PLAN FOR TRIGGERs:
-- Just create the SQL functions. The user (or I) will have to manually configure the actual "Database Webhook" in the Supabase Dashboard, 
-- pointing it to the Edge Function.
-- This avoids hardcoding keys in SQL.
-- Supabase Dashboard -> Database -> Webhooks -> Create Webhook -> Table: users, Type: Insert -> HTTP Request -> Edge Function.
-- This is much better.

-- Writeup will explain this.
-- But I still need to handle "Password Changed".
-- Dashboard webhook for `auth.users`? Yes, usually possible.

-- So, for the migration, I might not need ANY SQL if I rely on Dashboard Webhooks.
-- EXCEPT, `paystack-webhook` is an edge function, so I code that.
-- "When a new user is successfully onboarded" -> `public.users` insert?
-- "When a user changes their password" -> `auth.users` update?

-- I will create a migration that ADDS the `handle_new_user_email` logic IF they want to do it via pure SQL/pg_net, 
-- but I heavily recommend Dashboard Webhooks.
-- The user asked to "generate a write up" which implies instructions.
-- BUT I am also "executing". 
-- I'll create a text file instructions for the triggers.

-- WAIT. "When a new user is successfully onboarded" -> Is "onboarded" just "created"?
-- In `users` table, there is `onboardingcompleted` boolean!
-- Line 93: "onboardingcompleted" boolean default false.
-- So I should trigger when `onboardingcompleted` changes to `true`!
-- That's `UPDATE` on `public.users`, not INSERT.

-- Trigger:
-- 1. `public.users` UPDATE of `onboardingcompleted` from false to true.

-- I will create a migration for this functional trigger.
-- And for `auth.users` password change.

-- I'll write the migration file with `pg_net` calls and PLACEHOLDERS.
-- I will notify the user to replace them.

create extension if not exists "pg_net" with schema "extensions";

create or replace function public.send_welcome_email()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.onboarding_completed = true and (old.onboarding_completed = false or old.onboarding_completed is null) then
      perform net.http_post(
          url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body := jsonb_build_object(
              'type', 'WELCOME',
              'email', new.email,
              'data', jsonb_build_object('name', new.name)
          )
      );
  end if;
  return new;
end;
$$;

create trigger on_user_onboarded
after update on public.users
for each row
execute function public.send_welcome_email();


create or replace function public.send_password_change_email()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.encrypted_password <> old.encrypted_password then
      perform net.http_post(
          url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body := jsonb_build_object(
              'type', 'PASSWORD_CHANGED',
              'email', new.email, -- auth.users has email
              'data', jsonb_build_object('name', coalesce(new.raw_user_meta_data->>'name', 'User')) -- auth.users has metadata
          )
      );
  end if;
  return new;
end;
$$;

create trigger on_password_change
after update on auth.users
for each row
execute function public.send_password_change_email();

