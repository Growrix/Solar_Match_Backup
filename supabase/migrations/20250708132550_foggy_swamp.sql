/*
  # Fix Quote Settings Policies

  1. New Tables
    - None (quote_settings table already exists)
  
  2. Security
    - Drop existing policies before recreating them
    - Recreate policies for reading and updating quote settings
  
  3. Changes
    - No schema changes, just policy fixes
*/

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read quote settings" ON public.quote_settings;
DROP POLICY IF EXISTS "Admins can update quote settings" ON public.quote_settings;

-- Recreate policies
CREATE POLICY "Anyone can read quote settings"
  ON public.quote_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update quote settings"
  ON public.quote_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE email = 'admin@example.com'));