-- Migration: Restore user_stats INSERT policy
-- Created: 2025-12-12
-- Description: Re-creates the INSERT policy for user_stats that was accidentally removed in migration 20251211140559

DROP POLICY IF EXISTS "Users can insert their own stats" ON public.user_stats;
create policy "Users can insert their own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);
