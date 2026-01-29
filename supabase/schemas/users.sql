-- Users table with auth.uid() as primary key
create table if not exists users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    name text not null,
    baseline_wpm numeric default 0,
    baseline_comprehension numeric default 0,
    current_wpm numeric default 0,
    next_wpm numeric default 0,
    total_sessions numeric default 0,
    total_time_spent numeric default 0, -- in seconds
    goals text default '{}',
    content_type text default 'mixed', -- e.g., 'fiction', 'non-fiction', 'mixed'
    challenges text default '{}', -- JSON array of challenge IDs
    current_comprehension_score numeric default 0,
    onboarding_completed boolean default false,
    achievements text default '{}', -- JSON array of achievement IDs
    badges text default '{}', -- JSON array of badge IDs
    daily_reminder boolean default true,
    reminder_time time default '09:00:00',
    weekly_summary boolean default true,
    streak_days numeric default 0,
    last_active_date timestamptz default now(),
    xp_earned numeric default 0,
    level numeric default 1,
    focus_score numeric default 0,
    is_subscribed boolean default false,
    -- date_of_birth date,
    display_settings JSONB DEFAULT '{"fontFamily": "Inter", "fontSize": 48}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);


-- Enable RLS
alter table users enable row level security;

-- RLS Policies for users table
create policy "Users can view their own data"
on users for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own data"
on users for update
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own data"
on users for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can delete their own data"
on users for delete
to authenticated
using (auth.uid() = id);

-- Enable realtime for users table
alter publication supabase_realtime add table users;