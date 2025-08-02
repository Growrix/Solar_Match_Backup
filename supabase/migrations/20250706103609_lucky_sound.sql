/*
  # Installer Ratings and Call/Visit Leads Migration

  1. New Tables
    - `installer_ratings` - Store homeowner ratings for installers
  
  2. Updates
    - Add additional fields to existing tables to support call/visit leads
    - Ensure proper RLS policies for security
*/

-- Create installer_ratings table
CREATE TABLE IF NOT EXISTS installer_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES solar_quotes(id) ON DELETE CASCADE,
  homeowner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  installer_id uuid REFERENCES installer_companies(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one rating per homeowner-installer-lead combination
  UNIQUE(homeowner_id, installer_id, lead_id)
);

-- Enable Row Level Security
ALTER TABLE installer_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for installer_ratings
CREATE POLICY "Homeowners can insert their own ratings"
  ON installer_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (homeowner_id = auth.uid());

CREATE POLICY "Homeowners can update their own ratings"
  ON installer_ratings
  FOR UPDATE
  TO authenticated
  USING (homeowner_id = auth.uid());

CREATE POLICY "Homeowners can read their own ratings"
  ON installer_ratings
  FOR SELECT
  TO authenticated
  USING (homeowner_id = auth.uid());

CREATE POLICY "Installers can read ratings about them"
  ON installer_ratings
  FOR SELECT
  TO authenticated
  USING (installer_id IN (
    SELECT company_id FROM installer_users WHERE id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_installer_ratings_homeowner ON installer_ratings(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_installer_ratings_installer ON installer_ratings(installer_id);
CREATE INDEX IF NOT EXISTS idx_installer_ratings_lead ON installer_ratings(lead_id);

-- Add updated_at trigger
CREATE TRIGGER update_installer_ratings_updated_at 
  BEFORE UPDATE ON installer_ratings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
DO $$
DECLARE
  sample_homeowner_id uuid;
  sample_installer_id uuid;
  sample_lead_id uuid;
BEGIN
  -- Get a sample homeowner
  SELECT id INTO sample_homeowner_id FROM profiles LIMIT 1;
  
  -- Get a sample installer
  SELECT id INTO sample_installer_id FROM installer_companies LIMIT 1;
  
  -- Get a sample lead
  SELECT id INTO sample_lead_id FROM solar_quotes LIMIT 1;
  
  -- Only insert if we have all required IDs
  IF sample_homeowner_id IS NOT NULL AND sample_installer_id IS NOT NULL AND sample_lead_id IS NOT NULL THEN
    -- Insert sample rating
    INSERT INTO installer_ratings (
      lead_id, homeowner_id, installer_id, rating, review_text
    ) VALUES (
      sample_lead_id, sample_homeowner_id, sample_installer_id, 4, 'Great service and installation!'
    )
    ON CONFLICT (homeowner_id, installer_id, lead_id) DO NOTHING;
  END IF;
END $$;