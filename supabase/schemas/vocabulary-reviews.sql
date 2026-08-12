-- Words tied to comprehension questions a user got wrong, queued for
-- spaced-repetition review instead of the signal being discarded once the
-- quiz closes. One row per (user, word); a repeat miss on the same word
-- resets its schedule via upsert rather than creating a duplicate row.
create table "public"."vocabulary_reviews" (
    "id" uuid primary key default gen_random_uuid(),
    "user_id" uuid not null references auth.users(id) on delete cascade,
    "word" text not null,
    "context" text not null, -- the quiz question that surfaced this word
    "correct_answer" text not null, -- the correct option, shown on review as the answer
    "passage_id" uuid references public.passages(id) on delete set null,
    "correct_streak" integer not null default 0,
    "interval_days" integer not null default 1,
    "next_review_at" timestamp with time zone not null default now(),
    "last_reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    unique ("user_id", "word")
);

alter table "public"."vocabulary_reviews" enable row level security;

create policy "Users can view their own vocabulary reviews"
on "public"."vocabulary_reviews"
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own vocabulary reviews"
on "public"."vocabulary_reviews"
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own vocabulary reviews"
on "public"."vocabulary_reviews"
for update
to authenticated
using (auth.uid() = user_id);

create trigger handle_updated_at
before update on public.vocabulary_reviews
for each row
execute procedure public.handle_updated_at();
