create table if not exists passages (
    id uuid primary key default gen_random_uuid(),
    passage jsonb not null default '{}'::jsonb, -- JSON array of questions
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);