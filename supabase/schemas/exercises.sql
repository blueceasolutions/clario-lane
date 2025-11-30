-- Exercises table with RLS
create table if not exists exercises (
    id uuid primary key default gen_random_uuid(),
    exercise text unique not null,
    title text,
    description text,
    xp integer default 10,
    difficulty text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table exercises enable row level security;

-- RLS Policies for exercises table
create policy "Service role can manage exercises"
on exercises for all
to service_role
using (true)
with check (true);

create policy "Authenticated users can select exercises"
on exercises for select
to anon, authenticated
using (true);