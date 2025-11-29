-- Add metadata columns to passages table for easier querying
ALTER TABLE public.passages 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS difficulty text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS questions jsonb;

-- Create an index on difficulty for faster filtering
CREATE INDEX IF NOT EXISTS idx_passages_difficulty ON public.passages(difficulty);
