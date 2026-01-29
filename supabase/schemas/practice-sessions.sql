-- Practice sessions table with RLS
create table if not exists practice_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    passage_id uuid null references passages(id) on delete set null,
    exercise_id uuid null references exercises(id) on delete set null,
    wpm numeric not null,
    next_wpm numeric default 0,
    comprehension numeric not null,
    duration numeric,
    total_words numeric,
    correct_answers numeric,
    total_questions numeric,
    start_time numeric,
    elapsed_time numeric,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table practice_sessions enable row level security;

-- RLS Policies for practice_sessions table
create policy "Users can insert their own practice sessions"
on practice_sessions for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view their own practice sessions"
on practice_sessions for select
to authenticated
using (auth.uid() = user_id);

create policy "Service role can view all practice sessions"
on practice_sessions for select
to service_role
using (true);