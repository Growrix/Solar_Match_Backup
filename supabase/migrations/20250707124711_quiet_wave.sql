/*
  # Add Lead Type Field to Installer Leads

  1. New Columns
    - Add `lead_type` field to installer_leads table to distinguish between call/visit and written quotes
    - Add constraint to ensure valid lead types

  2. Security
    - Maintain existing RLS policies
    - Ensure backward compatibility
*/

-- Add lead_type field to installer_leads table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'installer_leads' AND column_name = 'lead_type'
  ) THEN
    -- Add lead_type column with default value and constraint
    ALTER TABLE installer_leads ADD COLUMN lead_type text NOT NULL DEFAULT 'written' CHECK (lead_type IN ('call_visit', 'written'));
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_installer_leads_lead_type ON installer_leads(lead_type);

-- Update existing leads to have a type if needed
UPDATE installer_leads
SET lead_type = 'written'
WHERE lead_type IS NULL;

-- Add sample data for testing
DO $$
DECLARE
  lead_count integer;
BEGIN
  -- Check if we already have leads
  SELECT COUNT(*) INTO lead_count FROM installer_leads;
  
  -- Only insert if we don't have many leads yet
  IF lead_count < 10 THEN
    -- Insert some call/visit leads
    INSERT INTO installer_leads (
      property_type, location, state, postcode, estimated_system_size,
      budget_range, customer_name, customer_email, customer_phone,
      lead_quality_score, price, status, lead_type
    ) VALUES
    (
      'House', 'Sydney', 'NSW', '2000', 6.6,
      '10000-20000', 'John Smith', 'john.smith@example.com', '0400123456',
      8, 65.00, 'available', 'call_visit'
    ),
    (
      'Townhouse', 'Melbourne', 'VIC', '3000', 10.0,
      '20000-30000', 'Jane Brown', 'jane.brown@example.com', '0400234567',
      9, 75.00, 'available', 'call_visit'
    ),
    (
      'House', 'Brisbane', 'QLD', '4000', 8.0,
      '15000-25000', 'Robert Wilson', 'robert.wilson@example.com', '0400345678',
      7, 60.00, 'available', 'call_visit'
    );
    
    -- Insert some written quote leads
    INSERT INTO installer_leads (
      property_type, location, state, postcode, estimated_system_size,
      budget_range, customer_name, customer_email, customer_phone,
      lead_quality_score, price, status, lead_type
    ) VALUES
    (
      'Apartment', 'Perth', 'WA', '6000', 5.0,
      '8000-15000', 'Alice Chen', 'alice.chen@example.com', '0400456789',
      6, 45.00, 'available', 'written'
    ),
    (
      'House', 'Adelaide', 'SA', '5000', 7.5,
      '12000-22000', 'Michael Davis', 'michael.davis@example.com', '0400567890',
      8, 55.00, 'available', 'written'
    ),
    (
      'House', 'Hobart', 'TAS', '7000', 6.0,
      '10000-18000', 'Sarah Johnson', 'sarah.johnson@example.com', '0400678901',
      7, 50.00, 'available', 'written'
    );
  END IF;
END $$;