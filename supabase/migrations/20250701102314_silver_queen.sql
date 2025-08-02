/*
  # Fix Newsletter RLS Policies

  1. Security Updates
    - Drop existing restrictive policies
    - Add new policies to allow anonymous users to subscribe/unsubscribe
    - Maintain data integrity while allowing public newsletter access

  2. Changes
    - Allow anonymous users to insert newsletter subscriptions
    - Allow anonymous users to update their subscription status
    - Keep existing select policies for reading subscriptions
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON newsletter_subscribers;

-- Create new policies that properly allow anonymous access
CREATE POLICY "Allow anonymous newsletter subscription"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous newsletter updates"
  ON newsletter_subscribers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Keep the existing select policy or create one if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'newsletter_subscribers' 
    AND policyname = 'Allow reading newsletter subscriptions'
  ) THEN
    CREATE POLICY "Allow reading newsletter subscriptions"
      ON newsletter_subscribers
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;