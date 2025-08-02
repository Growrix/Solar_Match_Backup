/*
  # Add Quote Type Field Migration

  1. New Columns
    - Add `type` field to solar_quotes table to distinguish between call/visit and written quotes
    - Add `contact_revealed` boolean field for call/visit quotes

  2. Security
    - Maintain existing RLS policies
    - Ensure backward compatibility
*/

-- Add type field to solar_quotes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'solar_quotes' AND column_name = 'type'
  ) THEN
    -- Add type column with default value
    ALTER TABLE solar_quotes ADD COLUMN type text DEFAULT 'written' CHECK (type IN ('written', 'call_visit'));
  END IF;

  -- Add contact_revealed field for call/visit quotes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'solar_quotes' AND column_name = 'contact_revealed'
  ) THEN
    ALTER TABLE solar_quotes ADD COLUMN contact_revealed boolean DEFAULT false;
  END IF;
END $$;

-- Update existing quotes to have a type if needed
UPDATE solar_quotes
SET type = 'written'
WHERE type IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_solar_quotes_type ON solar_quotes(type);

-- Update status check constraint to include new statuses
ALTER TABLE solar_quotes DROP CONSTRAINT IF EXISTS solar_quotes_status_check;
ALTER TABLE solar_quotes ADD CONSTRAINT solar_quotes_status_check 
  CHECK (status IN ('pending', 'quoted', 'contacted', 'completed', 'draft', 'submitted', 'reviewed', 'negotiation'));

-- Update any existing quotes with old statuses to match new schema
UPDATE solar_quotes
SET status = 'pending'
WHERE status NOT IN ('pending', 'quoted', 'contacted', 'completed', 'draft', 'submitted', 'reviewed', 'negotiation');