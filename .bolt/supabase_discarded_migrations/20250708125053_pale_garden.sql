/*
  # Fix Quote Settings Table and Policies

  1. New Tables
    - `quote_settings` table if it doesn't exist
  
  2. Security
    - Enable RLS on `quote_settings` table
    - Add policies for reading and updating quote settings
  
  3. Changes
    - Add default settings values
    - Add type and contact_revealed columns to solar_quotes
    - Add constraints and indexes
*/

-- Create quote_settings table
CREATE TABLE IF NOT EXISTS public.quote_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quote_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for reading settings (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quote_settings' AND policyname = 'Anyone can read quote settings'
  ) THEN
    CREATE POLICY "Anyone can read quote settings"
      ON public.quote_settings
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Create policy for admins to update settings (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quote_settings' AND policyname = 'Admins can update quote settings'
  ) THEN
    CREATE POLICY "Admins can update quote settings"
      ON public.quote_settings
      FOR UPDATE
      TO authenticated
      USING (auth.uid() IN (SELECT id FROM public.profiles WHERE email = 'admin@example.com'));
  END IF;
END $$;

-- Insert default settings
INSERT INTO public.quote_settings (key, value, description)
VALUES
  ('base_price_per_kw', '1100', 'Base price per kW for solar system'),
  ('federal_rebate_per_kw', '500', 'Federal rebate amount per kW'),
  ('battery_cost', '4500', 'Cost for battery storage'),
  ('rebates_enabled', 'true', 'Whether rebates are enabled'),
  ('qld_rebate_enabled', 'true', 'Whether Queensland rebate is enabled'),
  ('qld_state_rebate', '1000', 'Queensland state rebate amount'),
  ('default_price_per_kwh', '0.28', 'Default price per kWh for electricity')
ON CONFLICT (key) DO NOTHING;

-- Create trigger to update updated_at column (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_quote_settings_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_quote_settings_updated_at
    BEFORE UPDATE ON public.quote_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add type column to solar_quotes table if it doesn't exist
ALTER TABLE public.solar_quotes 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'written';

-- Add contact_revealed column
ALTER TABLE public.solar_quotes 
ADD COLUMN IF NOT EXISTS contact_revealed boolean DEFAULT false;

-- Create index on type column for faster filtering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_solar_quotes_type'
  ) THEN
    CREATE INDEX idx_solar_quotes_type 
    ON public.solar_quotes USING btree (type);
  END IF;
END $$;

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