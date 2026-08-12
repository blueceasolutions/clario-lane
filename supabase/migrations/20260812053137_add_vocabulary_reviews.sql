-- Words tied to comprehension questions a user got wrong, queued for
-- spaced-repetition review instead of the signal being discarded once the
-- quiz closes. See supabase/schemas/vocabulary-reviews.sql for the
-- declarative source of truth this mirrors.

create table "public"."vocabulary_reviews" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "word" text not null,
    "context" text not null,
    "correct_answer" text not null,
    "passage_id" uuid,
    "correct_streak" integer not null default 0,
    "interval_days" integer not null default 1,
    "next_review_at" timestamp with time zone not null default now(),
    "last_reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);

alter table "public"."vocabulary_reviews" enable row level security;

CREATE UNIQUE INDEX vocabulary_reviews_pkey ON public.vocabulary_reviews USING btree (id);

CREATE UNIQUE INDEX vocabulary_reviews_user_id_word_key ON public.vocabulary_reviews USING btree (user_id, word);

alter table "public"."vocabulary_reviews" add constraint "vocabulary_reviews_pkey" PRIMARY KEY using index "vocabulary_reviews_pkey";

alter table "public"."vocabulary_reviews" add constraint "vocabulary_reviews_passage_id_fkey" FOREIGN KEY (passage_id) REFERENCES public.passages(id) ON DELETE SET NULL not valid;

alter table "public"."vocabulary_reviews" validate constraint "vocabulary_reviews_passage_id_fkey";

alter table "public"."vocabulary_reviews" add constraint "vocabulary_reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."vocabulary_reviews" validate constraint "vocabulary_reviews_user_id_fkey";

alter table "public"."vocabulary_reviews" add constraint "vocabulary_reviews_user_id_word_key" UNIQUE using index "vocabulary_reviews_user_id_word_key";

grant delete on table "public"."vocabulary_reviews" to "anon";
grant insert on table "public"."vocabulary_reviews" to "anon";
grant references on table "public"."vocabulary_reviews" to "anon";
grant select on table "public"."vocabulary_reviews" to "anon";
grant trigger on table "public"."vocabulary_reviews" to "anon";
grant truncate on table "public"."vocabulary_reviews" to "anon";
grant update on table "public"."vocabulary_reviews" to "anon";

grant delete on table "public"."vocabulary_reviews" to "authenticated";
grant insert on table "public"."vocabulary_reviews" to "authenticated";
grant references on table "public"."vocabulary_reviews" to "authenticated";
grant select on table "public"."vocabulary_reviews" to "authenticated";
grant trigger on table "public"."vocabulary_reviews" to "authenticated";
grant truncate on table "public"."vocabulary_reviews" to "authenticated";
grant update on table "public"."vocabulary_reviews" to "authenticated";

grant delete on table "public"."vocabulary_reviews" to "service_role";
grant insert on table "public"."vocabulary_reviews" to "service_role";
grant references on table "public"."vocabulary_reviews" to "service_role";
grant select on table "public"."vocabulary_reviews" to "service_role";
grant trigger on table "public"."vocabulary_reviews" to "service_role";
grant truncate on table "public"."vocabulary_reviews" to "service_role";
grant update on table "public"."vocabulary_reviews" to "service_role";

create policy "Users can insert their own vocabulary reviews"
on "public"."vocabulary_reviews"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));

create policy "Users can update their own vocabulary reviews"
on "public"."vocabulary_reviews"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));

create policy "Users can view their own vocabulary reviews"
on "public"."vocabulary_reviews"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.vocabulary_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
