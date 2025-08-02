/*
  # Bidding System Database Schema

  1. New Tables
    - `bids` - Stores bid history for quote negotiations
    - `quote_bidding_status` - Tracks bidding status and timelines

  2. Security
    - Enable RLS on all tables
    - Add policies for homeowners and installers

  3. Features
    - Bid round tracking
    - Expiration timers
    - Extension requests
*/

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES written_quotes(id) ON DELETE CASCADE,
  installer_id uuid NOT NULL,
  homeowner_id uuid NOT NULL,
  round integer NOT NULL CHECK (round >= 1 AND round <= 3),
  offer_price numeric(10,2) NOT NULL,
  install_time text NOT NULL,
  notes text,
  sender_type text NOT NULL CHECK (sender_type IN ('installer', 'homeowner')),
  created_at timestamptz DEFAULT now()
);

-- Create quote_bidding_status table
CREATE TABLE IF NOT EXISTS quote_bidding_status (
  quote_id uuid PRIMARY KEY REFERENCES written_quotes(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('in_negotiation', 'accepted', 'declined', 'expired')),
  start_time timestamptz NOT NULL DEFAULT now(),
  expiry_time timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  extension_requested boolean DEFAULT false,
  extension_granted boolean DEFAULT false,
  rounds_completed integer DEFAULT 0 CHECK (rounds_completed >= 0 AND rounds_completed <= 3)
);

-- Enable Row Level Security
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_bidding_status ENABLE ROW LEVEL SECURITY;

-- Bids policies
CREATE POLICY "Homeowners can read bids for their quotes"
  ON bids
  FOR SELECT
  TO authenticated
  USING (homeowner_id = auth.uid());

CREATE POLICY "Installers can read bids for their quotes"
  ON bids
  FOR SELECT
  TO authenticated
  USING (installer_id IN (
    SELECT company_id FROM installer_users WHERE id = auth.uid()
  ));

CREATE POLICY "Homeowners can insert bids for their quotes"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (
    homeowner_id = auth.uid() AND
    sender_type = 'homeowner'
  );

CREATE POLICY "Installers can insert bids for their quotes"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (
    installer_id IN (
      SELECT company_id FROM installer_users WHERE id = auth.uid()
    ) AND
    sender_type = 'installer'
  );

-- Quote bidding status policies
CREATE POLICY "Homeowners can read bidding status for their quotes"
  ON quote_bidding_status
  FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM written_quotes WHERE homeowner_id = auth.uid()
    )
  );

CREATE POLICY "Installers can read bidding status for their quotes"
  ON quote_bidding_status
  FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM written_quotes WHERE installer_id IN (
        SELECT company_id FROM installer_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Homeowners can update bidding status for their quotes"
  ON quote_bidding_status
  FOR UPDATE
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM written_quotes WHERE homeowner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bids_quote_id ON bids(quote_id);
CREATE INDEX IF NOT EXISTS idx_bids_installer_id ON bids(installer_id);
CREATE INDEX IF NOT EXISTS idx_bids_homeowner_id ON bids(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_bids_round ON bids(round);
CREATE INDEX IF NOT EXISTS idx_quote_bidding_status_status ON quote_bidding_status(status);
CREATE INDEX IF NOT EXISTS idx_quote_bidding_status_expiry ON quote_bidding_status(expiry_time);

-- Function to check if a bid is valid (within rounds limit and time constraints)
CREATE OR REPLACE FUNCTION check_bid_validity()
RETURNS TRIGGER AS $$
DECLARE
  current_status record;
  rounds_count integer;
BEGIN
  -- Get current bidding status
  SELECT * INTO current_status 
  FROM quote_bidding_status 
  WHERE quote_id = NEW.quote_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No bidding status found for quote %', NEW.quote_id;
  END IF;
  
  -- Check if bidding is still active
  IF current_status.status != 'in_negotiation' THEN
    RAISE EXCEPTION 'Bidding is no longer active for this quote';
  END IF;
  
  -- Check if bid is within time limit
  IF current_status.expiry_time < NOW() THEN
    RAISE EXCEPTION 'Bidding period has expired';
  END IF;
  
  -- Check if within rounds limit
  IF NEW.round > 3 THEN
    RAISE EXCEPTION 'Maximum 3 bidding rounds allowed';
  END IF;
  
  -- Count existing bids for this round and sender type
  SELECT COUNT(*) INTO rounds_count
  FROM bids
  WHERE quote_id = NEW.quote_id 
    AND round = NEW.round 
    AND sender_type = NEW.sender_type;
  
  IF rounds_count > 0 THEN
    RAISE EXCEPTION 'Already submitted a bid for round % as %', NEW.round, NEW.sender_type;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bid validation
CREATE TRIGGER validate_bid_before_insert
  BEFORE INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION check_bid_validity();

-- Function to update rounds_completed when a new bid is added
CREATE OR REPLACE FUNCTION update_bidding_rounds()
RETURNS TRIGGER AS $$
DECLARE
  max_round integer;
BEGIN
  -- Find the highest round number for this quote
  SELECT MAX(round) INTO max_round
  FROM bids
  WHERE quote_id = NEW.quote_id;
  
  -- Update the rounds_completed in quote_bidding_status
  UPDATE quote_bidding_status
  SET rounds_completed = max_round
  WHERE quote_id = NEW.quote_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update rounds after bid insertion
CREATE TRIGGER update_rounds_after_bid_insert
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_bidding_rounds();

-- Function to check for expired bids and update status
CREATE OR REPLACE FUNCTION check_expired_bids()
RETURNS void AS $$
BEGIN
  UPDATE quote_bidding_status
  SET status = 'expired'
  WHERE status = 'in_negotiation'
    AND expiry_time < NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
DO $$
DECLARE
  sample_quote_id uuid;
  sample_homeowner_id uuid;
  sample_installer_id uuid;
BEGIN
  -- Get a sample quote
  SELECT id INTO sample_quote_id FROM written_quotes LIMIT 1;
  
  -- Get the homeowner and installer IDs from the quote
  IF sample_quote_id IS NOT NULL THEN
    SELECT homeowner_id, installer_id INTO sample_homeowner_id, sample_installer_id
    FROM written_quotes
    WHERE id = sample_quote_id;
    
    -- Only insert if we have all required IDs
    IF sample_homeowner_id IS NOT NULL AND sample_installer_id IS NOT NULL THEN
      -- Insert sample bidding status
      INSERT INTO quote_bidding_status (
        quote_id, status, start_time, expiry_time, rounds_completed
      ) VALUES (
        sample_quote_id, 'in_negotiation', 
        NOW() - interval '3 days', 
        NOW() + interval '4 days',
        2
      )
      ON CONFLICT (quote_id) DO NOTHING;
      
      -- Insert sample bids
      INSERT INTO bids (
        quote_id, installer_id, homeowner_id, round, 
        offer_price, install_time, notes, sender_type
      ) VALUES
      (
        sample_quote_id, sample_installer_id, sample_homeowner_id, 
        1, 15000, '3 weeks', 'Initial offer', 'installer'
      ),
      (
        sample_quote_id, sample_installer_id, sample_homeowner_id, 
        1, 13500, '3 weeks', 'I would like a better price', 'homeowner'
      ),
      (
        sample_quote_id, sample_installer_id, sample_homeowner_id, 
        2, 14000, '3 weeks', 'This is our counter offer', 'installer'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;