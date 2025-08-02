/*
  # Written Quotes Schema

  1. New Tables
    - `written_quotes` - Detailed written quotes from installers to homeowners
    - `chat_messages` - Chat messages between homeowners and installers

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Allow installers to manage quotes they've created

  3. Features
    - Quote status progression tracking
    - Chat functionality unlocked by homeowner interest
    - Deal acceptance and negotiation
*/

-- Create written_quotes table
CREATE TABLE IF NOT EXISTS written_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homeowner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  installer_id uuid REFERENCES installer_companies(id) ON DELETE CASCADE,
  
  -- Quote details
  price numeric(10,2) NOT NULL,
  system_type text NOT NULL,
  install_time text NOT NULL,
  
  -- Status tracking
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'negotiation', 'deal', 'rejected')),
  interested boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES written_quotes(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('homeowner', 'installer')),
  sender_id uuid NOT NULL,
  message_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE written_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Written Quotes policies
CREATE POLICY "Homeowners can read their own quotes"
  ON written_quotes
  FOR SELECT
  TO authenticated
  USING (homeowner_id = auth.uid());

CREATE POLICY "Installers can read quotes they've created"
  ON written_quotes
  FOR SELECT
  TO authenticated
  USING (installer_id IN (
    SELECT company_id FROM installer_users WHERE id = auth.uid()
  ));

CREATE POLICY "Installers can create quotes"
  ON written_quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (installer_id IN (
    SELECT company_id FROM installer_users WHERE id = auth.uid()
  ));

CREATE POLICY "Homeowners can update their quotes"
  ON written_quotes
  FOR UPDATE
  TO authenticated
  USING (homeowner_id = auth.uid());

CREATE POLICY "Installers can update quotes they've created"
  ON written_quotes
  FOR UPDATE
  TO authenticated
  USING (installer_id IN (
    SELECT company_id FROM installer_users WHERE id = auth.uid()
  ));

-- Chat Messages policies
CREATE POLICY "Users can read messages for their quotes"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM written_quotes WHERE 
        homeowner_id = auth.uid() OR 
        installer_id IN (SELECT company_id FROM installer_users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages for their quotes"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    quote_id IN (
      SELECT id FROM written_quotes WHERE 
        homeowner_id = auth.uid() OR 
        installer_id IN (SELECT company_id FROM installer_users WHERE id = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_written_quotes_homeowner ON written_quotes(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_written_quotes_installer ON written_quotes(installer_id);
CREATE INDEX IF NOT EXISTS idx_written_quotes_status ON written_quotes(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_quote ON chat_messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id, sender_type);

-- Add updated_at trigger
CREATE TRIGGER update_written_quotes_updated_at 
  BEFORE UPDATE ON written_quotes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
DO $$
DECLARE
  sample_homeowner_id uuid;
  sample_installer_id uuid;
BEGIN
  -- Get a sample homeowner
  SELECT id INTO sample_homeowner_id FROM profiles LIMIT 1;
  
  -- Get a sample installer
  SELECT id INTO sample_installer_id FROM installer_companies LIMIT 1;
  
  -- Only insert if we have both a homeowner and installer
  IF sample_homeowner_id IS NOT NULL AND sample_installer_id IS NOT NULL THEN
    -- Insert sample written quotes
    INSERT INTO written_quotes (
      homeowner_id, installer_id, price, system_type, install_time, status, interested
    ) VALUES
    (
      sample_homeowner_id, sample_installer_id, 12500, '6.6kW Solar System', '2 weeks', 'submitted', true
    ),
    (
      sample_homeowner_id, sample_installer_id, 18900, '10kW Solar System with Battery', '3 weeks', 'draft', false
    ),
    (
      sample_homeowner_id, sample_installer_id, 9800, '5kW Budget System', '1 week', 'reviewed', true
    );
  END IF;
END $$;