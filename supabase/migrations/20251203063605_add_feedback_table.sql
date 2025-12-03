-- Create feedback table for user feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'general')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
   ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback (optional - you can add admin role checks later)
-- CREATE POLICY "Admins can view all feedback"
--   ON public.feedback FOR SELECT
--   USING (auth.jwt() ->> 'role' = 'admin');

-- Create index for faster queries
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);
