-- Content types table with RLS
create table if not exists content_types (
    id uuid primary key default gen_random_uuid(),
    content text unique not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table content_types enable row level security;

-- RLS Policies for content_types table
create policy "Service role can manage content types"
on content_types for all
to service_role
using (true)
with check (true);

create policy "Authenticated users can select content types"
on content_types for select
to anon, authenticated
using (true);
