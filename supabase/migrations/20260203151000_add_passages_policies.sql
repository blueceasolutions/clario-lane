-- Migration: Add user_id to passages and enable RLS policies for CRUD
-- Created: 2026-02-03
-- Description: Adds user_id column to passages table and sets up policies for users to manage their own passages.

-- 1. Add user_id column if it doesn't exist
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'passages' and column_name = 'user_id') then
    alter table public.passages add column user_id uuid references auth.users(id) default auth.uid();
  end if;
end $$;

-- 2. Create policies

-- INSERT
create policy "Users can insert their own passages"
  on public.passages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- UPDATE
create policy "Users can update their own passages"
  on public.passages for update
  to authenticated
  using (auth.uid() = user_id);

-- DELETE
create policy "Users can delete their own passages"
  on public.passages for delete
  to authenticated
  using (auth.uid() = user_id);

