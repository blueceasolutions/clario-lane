-- Challenges table with RLS
create table if not exists challenges (
    id uuid primary key default gen_random_uuid(),
    challenge text unique not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table challenges enable row level security;

-- RLS Policies for challenges table
create policy "Service role can manage challenges"
on challenges for all
to service_role
using (true)
with check (true);

create policy "Authenticated users can select challenges"
on challenges for select
to anon, authenticated
using (true);