drop table if exists content_types cascade;

create table content_types (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  description text,
  created_at timestamptz default now()
);

alter table content_types enable row level security;

create policy "Authenticated users can select content types"
  on content_types for select
  to authenticated
  using (true);

create policy "Service role can manage content types"
  on content_types for all
  to service_role
  using (true)
  with check (true);
