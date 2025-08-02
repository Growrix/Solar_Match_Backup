/*
  # Quote Unlocks System Migration

  1. New Tables
    - `quote_unlocks` - Tracks quote unlocks for users
    - `referrals` - Tracks user referrals

  2. Features
    - Track different types of quote unlocks (referral, paid, admin_granted)
    - Track referrals between users
    - Support for both call/visit and written quote types
    - Verification tracking

  3. Security
    - Enable RLS on all tables
    - Policies for user access
*/

-- Create quote_unlocks table
CREATE TABLE IF NOT EXISTS quote_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  unlock_type text NOT NULL CHECK (unlock_type IN ('referral', 'paid', 'admin_granted')),
  quote_type text NOT NULL CHECK (quote_type IN ('call_visit', 'written')),
  count integer NOT NULL DEFAULT 1,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure each user can only be referred once
  UNIQUE(referred_id)
);

-- Enable Row Level Security
ALTER TABLE quote_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Quote Unlocks policies
CREATE POLICY "Users can read own quote unlocks"
  ON quote_unlocks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Referrals policies
CREATE POLICY "Users can read own referrals as referrer"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Users can read own referrals as referred"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (referred_id = auth.uid());

CREATE POLICY "Users can insert referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (referrer_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_unlocks_user_id ON quote_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_unlocks_type ON quote_unlocks(unlock_type, quote_type);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- Add updated_at trigger
CREATE TRIGGER update_quote_unlocks_updated_at 
  BEFORE UPDATE ON quote_unlocks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at 
  BEFORE UPDATE ON referrals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists_already boolean;
BEGIN
  -- Generate a code based on user ID and random numbers
  code := substring(user_id::text, 1, 6) || floor(random() * 1000)::text;
  
  -- Check if code already exists
  SELECT EXISTS(
    SELECT 1 FROM referrals WHERE referral_code = code
  ) INTO exists_already;
  
  -- If code exists, recursively try again
  IF exists_already THEN
    RETURN generate_referral_code(user_id);
  END IF;
  
  RETURN code;
END;
$$;

-- Function to process referral completion
CREATE OR REPLACE FUNCTION process_referral_completion(referral_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ref record;
BEGIN
  -- Get referral details
  SELECT * INTO ref FROM referrals WHERE id = referral_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referral not found';
  END IF;
  
  -- Update referral status
  UPDATE referrals
  SET status = 'completed',
      updated_at = now()
  WHERE id = referral_id;
  
  -- Add quote unlocks for referrer (2 of each type)
  INSERT INTO quote_unlocks (
    user_id, unlock_type, quote_type, count, verified
  ) VALUES
  (ref.referrer_id, 'referral', 'call_visit', 2, true),
  (ref.referrer_id, 'referral', 'written', 2, true);
  
  -- Add quote unlocks for referred user (2 of each type)
  INSERT INTO quote_unlocks (
    user_id, unlock_type, quote_type, count, verified
  ) VALUES
  (ref.referred_id, 'referral', 'call_visit', 2, true),
  (ref.referred_id, 'referral', 'written', 2, true);
END;
$$;

-- Insert sample data for testing
DO $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Get a sample user
  SELECT id INTO sample_user_id FROM profiles LIMIT 1;
  
  -- Only insert if we have a user
  IF sample_user_id IS NOT NULL THEN
    -- Insert sample quote unlocks
    INSERT INTO quote_unlocks (
      user_id, unlock_type, quote_type, count, verified
    ) VALUES
    (sample_user_id, 'referral', 'call_visit', 2, true),
    (sample_user_id, 'referral', 'written', 2, true),
    (sample_user_id, 'admin_granted', 'written', 1, true)
    ON CONFLICT DO NOTHING;
    
    -- Insert sample referral
    INSERT INTO referrals (
      referrer_id, referred_id, referral_code, status
    ) VALUES
    (sample_user_id, sample_user_id, generate_referral_code(sample_user_id), 'completed')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;