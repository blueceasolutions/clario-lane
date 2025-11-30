-- Passages table with RLS
create table if not exists passages (
    id uuid primary key default gen_random_uuid(),
    passage jsonb not null default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
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