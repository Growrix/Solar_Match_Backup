/*
  # Add User Settings Fields Migration

  1. New Columns
    - Add quote_module field to profiles
    - Add accept_calls field to profiles
    - Add timezone field to profiles

  2. Changes
    - Update existing profiles with default values
    - Add constraints to ensure valid values
*/

-- Add new columns to profiles table
DO $$
BEGIN
  -- Add quote_module field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'quote_module'
  ) THEN
    ALTER TABLE profiles ADD COLUMN quote_module text DEFAULT 'both' CHECK (quote_module IN ('call', 'written', 'both'));
  END IF;

  -- Add accept_calls field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'accept_calls'
  ) THEN
    ALTER TABLE profiles ADD COLUMN accept_calls boolean DEFAULT true;
  END IF;

  -- Add timezone field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'Australia/Sydney';
  END IF;
END $$;

-- Update existing profiles with default values
UPDATE profiles
SET 
  quote_module = 'both',
  accept_calls = true,
  timezone = 'Australia/Sydney'
WHERE quote_module IS NULL OR accept_calls IS NULL OR timezone IS NULL;

-- Create function to update user settings
CREATE OR REPLACE FUNCTION update_user_settings(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_quote_module text,
  p_accept_calls boolean,
  p_language text,
  p_timezone text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Validate quote_module
  IF p_quote_module NOT IN ('call', 'written', 'both') THEN
    RAISE EXCEPTION 'Invalid quote_module value: %', p_quote_module;
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET 
    full_name = p_full_name,
    phone = p_phone,
    quote_module = p_quote_module,
    accept_calls = p_accept_calls,
    preferred_language = p_language,
    timezone = p_timezone,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'User settings updated successfully'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error
  result := json_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to update user settings'
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_settings(uuid, text, text, text, boolean, text, text) TO authenticated;