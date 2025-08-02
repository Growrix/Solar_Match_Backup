/*
  # Add type field to solar_quotes table

  1. Schema Changes
    - Add `type` column to `solar_quotes` table with values 'written' or 'call_visit'
    - Add constraint to ensure valid values
    - Set default value to 'written'
    - Add contact_revealed boolean field for tracking when contact info is shared
  
  2. Security
    - No changes to RLS policies
*/

-- Add type column to solar_quotes table
ALTER TABLE public.solar_quotes 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'written';

-- Add constraint to ensure valid values
ALTER TABLE public.solar_quotes 
ADD CONSTRAINT solar_quotes_type_check 
CHECK (type = ANY (ARRAY['call_visit'::text, 'written'::text]));

-- Add contact_revealed column to track when contact info is shared
ALTER TABLE public.solar_quotes 
ADD COLUMN IF NOT EXISTS contact_revealed boolean DEFAULT false;

-- Create index on type column for faster filtering
CREATE INDEX IF NOT EXISTS idx_solar_quotes_type 
ON public.solar_quotes USING btree (type);