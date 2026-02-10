-- Passages table with RLS
create table if not exists passages (
    id uuid primary key default gen_random_uuid(),
    tags text[] not null default '{}',
    text text not null,
    title text not null,
    difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
    questions jsonb not null default '[]'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
    -- user_id uuid references auth.users(id) default auth.uid()
);

-- Enable RLS
alter table passages enable row level security;

-- RLS Policies for passages table
create policy "Service role can manage passages"
on passages for all
to service_role
using (true)
with check (true);

create policy "Authenticated users can select passages"
on passages for select
to anon, authenticated
using (true);

-- create policy "Users can insert their own passages"
-- on passages for insert
-- to authenticated
-- with check (auth.uid() = user_id);

-- create policy "Users can update their own passages"
-- on passages for update
-- to authenticated
-- using (auth.uid() = user_id);

-- create policy "Users can delete their own passages"
-- on passages for delete
-- to authenticated
-- using (auth.uid() = user_id);