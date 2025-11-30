-- Goals table with RLS
create table if not exists goals (
    id uuid primary key default gen_random_uuid(),
    goal text unique not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table goals enable row level security;

-- RLS Policies for goals table
create policy "Service role can manage goals"
on goals for all
to service_role
using (true)
with check (true);

create policy "Authenticated users can select goals"
on goals for select
to anon, authenticated
using (true);