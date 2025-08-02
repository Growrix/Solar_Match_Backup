/*
  # Create quote_settings table

  1. New Tables
    - `quote_settings`
      - `key` (text, primary key)
      - `value` (text, not null)
      - `description` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `quote_settings` table
    - Add policy for authenticated users to read settings
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

-- Create policy for reading settings
CREATE POLICY "Anyone can read quote settings"
  ON public.quote_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policy for admins to update settings (future use)
CREATE POLICY "Admins can update quote settings"
  ON public.quote_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE email = 'admin@example.com'));

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

-- Create trigger to update updated_at column
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