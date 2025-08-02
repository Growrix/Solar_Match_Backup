/*
  # Dual Account System Migration

  1. Updates
    - Modify auth flow to support dual account types
    - Update RPC functions to handle both homeowner and installer accounts
    - Add user type tracking in metadata

  2. Functions
    - Enhanced create_installer_user function
    - Better user type checking functions
    - Account type validation
*/

-- Update the create_installer_user function to handle dual accounts
CREATE OR REPLACE FUNCTION public.create_installer_user(
  user_id uuid,
  user_email text,
  company_name text,
  contact_name text,
  phone_number text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_id uuid;
  result json;
BEGIN
  -- First, create or get the company
  INSERT INTO installer_companies (
    company_name, abn, contact_name, email, phone, verified
  ) VALUES (
    company_name, 'PENDING-' || user_id::text, contact_name, user_email, phone_number, false
  )
  ON CONFLICT (email) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    contact_name = EXCLUDED.contact_name,
    phone = EXCLUDED.phone
  RETURNING id INTO company_id;
  
  -- Then create the installer user
  INSERT INTO installer_users (
    id, company_id, email, full_name, role, 
    can_manage_company, can_manage_users, can_purchase_leads
  ) VALUES (
    user_id, company_id, user_email, contact_name, 'admin',
    true, true, true
  )
  ON CONFLICT (id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Return success
  result := json_build_object(
    'success', true,
    'company_id', company_id,
    'message', 'Installer account created successfully'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error
  result := json_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to create installer account'
  );
  
  RETURN result;
END;
$$;

-- Create a function to handle homeowner account creation
CREATE OR REPLACE FUNCTION public.create_homeowner_user(
  user_id uuid,
  user_email text,
  full_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Create the homeowner profile
  INSERT INTO profiles (
    id, email, full_name
  ) VALUES (
    user_id, user_email, full_name
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'Homeowner account created successfully'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error
  result := json_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to create homeowner account'
  );
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_homeowner_user(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_homeowner_user(uuid, text, text) TO anon;

-- Update the get_user_role function to be more robust
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  is_installer boolean := false;
  is_homeowner boolean := false;
BEGIN
  -- Check if user is an installer
  SELECT public.check_installer_user(user_id) INTO is_installer;
  
  -- Check if user is a homeowner
  SELECT public.check_homeowner_user(user_id) INTO is_homeowner;
  
  -- Return the appropriate role
  IF is_installer THEN
    RETURN 'installer';
  ELSIF is_homeowner THEN
    RETURN 'homeowner';
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- Create a function to check if a user can have both account types
CREATE OR REPLACE FUNCTION public.can_create_dual_account(
  user_email text,
  new_user_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  existing_auth_user uuid;
BEGIN
  -- Check if there's already an auth user with this email
  SELECT id INTO existing_auth_user
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
  
  -- If no existing auth user, account can be created
  IF existing_auth_user IS NULL THEN
    RETURN true;
  END IF;
  
  -- If auth user exists, check if they already have the requested account type
  IF new_user_type = 'installer' THEN
    RETURN NOT public.check_installer_user(existing_auth_user);
  ELSIF new_user_type = 'homeowner' THEN
    RETURN NOT public.check_homeowner_user(existing_auth_user);
  END IF;
  
  RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.can_create_dual_account(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_create_dual_account(text, text) TO anon;

-- Create a function to link existing auth user to new account type
CREATE OR REPLACE FUNCTION public.link_user_to_account_type(
  user_email text,
  user_password text,
  account_type text,
  additional_data jsonb DEFAULT '{}'::jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user_id uuid;
  result json;
BEGIN
  -- Find existing auth user
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
  
  IF auth_user_id IS NULL THEN
    result := json_build_object(
      'success', false,
      'message', 'No existing account found with this email'
    );
    RETURN result;
  END IF;
  
  -- Create the appropriate account type
  IF account_type = 'installer' THEN
    -- Check if installer account already exists
    IF public.check_installer_user(auth_user_id) THEN
      result := json_build_object(
        'success', false,
        'message', 'Installer account already exists for this email'
      );
      RETURN result;
    END IF;
    
    -- Create installer account
    SELECT public.create_installer_user(
      auth_user_id,
      user_email,
      additional_data->>'company_name',
      additional_data->>'contact_name',
      additional_data->>'phone'
    ) INTO result;
    
  ELSIF account_type = 'homeowner' THEN
    -- Check if homeowner account already exists
    IF public.check_homeowner_user(auth_user_id) THEN
      result := json_build_object(
        'success', false,
        'message', 'Homeowner account already exists for this email'
      );
      RETURN result;
    END IF;
    
    -- Create homeowner account
    SELECT public.create_homeowner_user(
      auth_user_id,
      user_email,
      additional_data->>'full_name'
    ) INTO result;
    
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Invalid account type specified'
    );
  END IF;
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  result := json_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to link account'
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.link_user_to_account_type(text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_user_to_account_type(text, text, text, jsonb) TO anon;

-- Add some sample data for testing dual accounts
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Create a test user that can have both account types
  -- This simulates a user who first created a homeowner account
  -- and later wants to create an installer account
  
  -- Note: In a real scenario, this would be handled by the auth system
  -- This is just for testing the dual account functionality
  
  -- Insert a test auth user (this would normally be done by Supabase Auth)
  -- We'll just create the profile and installer records to test the system
  
  NULL; -- Placeholder - actual implementation would be handled by the frontend
END $$;

-- Update the installer sign-in function to handle existing auth users
CREATE OR REPLACE FUNCTION public.installer_sign_in_with_existing_auth(
  user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  is_installer boolean;
BEGIN
  -- Check if user is already an installer
  SELECT public.check_installer_user(user_id) INTO is_installer;
  
  IF is_installer THEN
    result := json_build_object(
      'success', true,
      'user_type', 'installer',
      'message', 'Installer sign-in successful'
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'This account is not registered as an installer'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.installer_sign_in_with_existing_auth(uuid) TO authenticated;

-- Update the homeowner sign-in function
CREATE OR REPLACE FUNCTION public.homeowner_sign_in_with_existing_auth(
  user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  is_homeowner boolean;
BEGIN
  -- Check if user is a homeowner
  SELECT public.check_homeowner_user(user_id) INTO is_homeowner;
  
  IF is_homeowner THEN
    result := json_build_object(
      'success', true,
      'user_type', 'homeowner',
      'message', 'Homeowner sign-in successful'
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'This account is not registered as a homeowner'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.homeowner_sign_in_with_existing_auth(uuid) TO authenticated;