/*
  # Add type and contact_revealed columns to solar_quotes

  1. New Columns
    - `type` (text) - Type of quote (written or call_visit)
    - `contact_revealed` (boolean) - Whether contact info has been shared

  2. Changes
    - Adds default value 'written' to type column
    - Adds default value false to contact_revealed column
    - Creates index on type column for faster filtering
    - Skips adding constraint if it already exists
*/

-- Add type column to solar_quotes table if it doesn't exist
ALTER TABLE public.solar_quotes 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'written';

-- Add contact_revealed column
ALTER TABLE public.solar_quotes 
ADD COLUMN IF NOT EXISTS contact_revealed boolean DEFAULT false;

-- Create index on type column for faster filtering
CREATE INDEX IF NOT EXISTS idx_solar_quotes_type 
ON public.solar_quotes USING btree (type);

-- Add constraint only if it doesn't exist already
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'solar_quotes_type_check' AND conrelid = 'public.solar_quotes'::regclass
  ) THEN
    -- Add constraint to ensure valid values
    ALTER TABLE public.solar_quotes 
    ADD CONSTRAINT solar_quotes_type_check 
    CHECK (type = ANY (ARRAY['call_visit'::text, 'written'::text]));
  END IF;
END $$;