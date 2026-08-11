-- Migration: Fix users.content_type/goals/challenges array-vs-text mismatch
-- Created: 2026-08-11
-- Description:
--   The frontend onboarding flow treats content_type/goals/challenges as
--   multi-select (OnboardingSchema types all three as z.array(z.string())),
--   but these three users columns are plain `text`. userMutation.ts inserts
--   the onboarding payload via a blind `as unknown as UserTable` cast with
--   no runtime conversion, so a JS array like ["fictions","technology"]
--   gets sent straight to PostgREST for a text column and lands as the
--   literal string '["fictions","technology"]' -- useless for filtering or
--   display. Verified against a local Supabase instance.
--
--   Converts all three columns to text[] so they store what the frontend
--   already sends. The USING clause has to cope with whatever shape
--   existing rows are actually in, since this bug may already have written
--   mangled data: the column default ('{}', which is coincidentally also
--   valid empty-array literal syntax), a plain scalar left over from before
--   the frontend became multi-select (e.g. content_type's old default
--   'mixed'), or the JSON-array-string produced by the bug itself.

create or replace function _text_to_text_array(val text) returns text[]
language plpgsql
immutable
as $$
begin
  if val is null or val = '' then
    return '{}'::text[];
  end if;

  -- JSON array string, e.g. '["fictions","technology"]' (the bug's output)
  if left(btrim(val), 1) = '[' then
    begin
      return array(select jsonb_array_elements_text(val::jsonb));
    exception when others then
      return array[val];
    end;
  end if;

  -- Already valid postgres array literal, e.g. '{}' or '{a,b}'
  if left(btrim(val), 1) = '{' then
    begin
      return val::text[];
    exception when others then
      return array[val];
    end;
  end if;

  -- Plain scalar left over from the pre-multi-select design (e.g. 'mixed')
  return array[val];
end;
$$;

alter table public.users
  alter column content_type drop default,
  alter column goals drop default,
  alter column challenges drop default;

alter table public.users
  alter column content_type type text[] using _text_to_text_array(content_type),
  alter column content_type set default '{}',
  alter column goals type text[] using _text_to_text_array(goals),
  alter column goals set default '{}',
  alter column challenges type text[] using _text_to_text_array(challenges),
  alter column challenges set default '{}';

drop function _text_to_text_array(text);

comment on column public.users.content_type is 'Preferred passage categories, matched against passages.tags (e.g. {fiction,technology}).';
comment on column public.users.goals is 'Onboarding goal selections.';
comment on column public.users.challenges is 'Onboarding challenge selections.';

-- Fix a naming mismatch between the onboarding options and actual passage
-- tags: content_types offered 'fictions' (plural) while every fiction
-- passage is tagged 'fiction' (singular), so that option could never match
-- anything. Also reads better as a category label alongside 'non-fiction'.
update public.content_types set content = 'fiction' where content = 'fictions';
