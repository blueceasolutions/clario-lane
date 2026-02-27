-- Ensure the INSERT policy for user_stats exists and is correct
drop policy if exists "Users can insert their own stats" on public.user_stats;

create policy "Users can insert their own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);
