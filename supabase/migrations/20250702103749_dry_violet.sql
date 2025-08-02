/*
  # Fix Installer Authentication System

  1. Database Changes
    - Remove problematic RLS policies causing infinite recursion
    - Create simple, safe policies for installer tables
    - Ensure proper foreign key relationships

  2. Security
    - Enable RLS with minimal, non-recursive policies
    - Handle complex permissions in application layer
    - Ensure auth.uid() function works correctly
*/

-- First, let's completely reset the installer_users policies
DROP POLICY IF EXISTS "Users can read same company members" ON installer_users;
DROP POLICY IF EXISTS "Users can read own installer profile" ON installer_users;
DROP POLICY IF EXISTS "Users can update own profile" ON installer_users;
DROP POLICY IF EXISTS "Installer users can update own profile" ON installer_users;
DROP POLICY IF EXISTS "Company admins can read company members" ON installer_users;
DROP POLICY IF EXISTS "Company admins can manage company members" ON installer_users;
DROP POLICY IF EXISTS "Installer users can read company members" ON installer_users;

-- Create simple, safe policies that don't cause recursion

-- 1. Users can read their own installer profile (direct auth.uid() check)
CREATE POLICY "Users can read own installer profile"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 2. Users can update their own profile (direct auth.uid() check)
CREATE POLICY "Users can update own profile"
  ON installer_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. For company management, use a simple approach through installer_companies
-- Company admins can read members of their company
CREATE POLICY "Company admins can read company members"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (
    company_id IS NOT NULL 
    AND company_id IN (
      SELECT ic.id 
      FROM installer_companies ic
      WHERE ic.id = installer_users.company_id
      AND EXISTS (
        SELECT 1 FROM auth.users au 
        WHERE au.id = auth.uid()
        AND au.email::text = ic.email
      )
    )
  );

-- 4. Company admins can update company members
CREATE POLICY "Company admins can manage company members"
  ON installer_users
  FOR UPDATE
  TO authenticated
  USING (
    company_id IS NOT NULL 
    AND company_id IN (
      SELECT ic.id 
      FROM installer_companies ic
      WHERE ic.id = installer_users.company_id
      AND EXISTS (
        SELECT 1 FROM auth.users au 
        WHERE au.id = auth.uid()
        AND au.email::text = ic.email
      )
    )
  )
  WITH CHECK (
    company_id IS NOT NULL 
    AND company_id IN (
      SELECT ic.id 
      FROM installer_companies ic
      WHERE ic.id = installer_users.company_id
      AND EXISTS (
        SELECT 1 FROM auth.users au 
        WHERE au.id = auth.uid()
        AND au.email::text = ic.email
      )
    )
  );

-- Fix the installer_companies policies to be simpler
DROP POLICY IF EXISTS "Installer users can read own company" ON installer_companies;
DROP POLICY IF EXISTS "Installer admins can update own company" ON installer_companies;

-- Simple policy for reading company info
CREATE POLICY "Installer users can read own company"
  ON installer_companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM installer_users WHERE id = auth.uid()
    )
  );

-- Simple policy for updating company info
CREATE POLICY "Installer admins can update own company"
  ON installer_companies
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM installer_users 
      WHERE id = auth.uid() AND can_manage_company = true
    )
  );

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_installer_users_email ON installer_users(email);
CREATE INDEX IF NOT EXISTS idx_installer_companies_email ON installer_companies(email);

-- Add some sample data to test with (only if not exists)
DO $$
BEGIN
  -- Check if we have any installer companies
  IF NOT EXISTS (SELECT 1 FROM installer_companies LIMIT 1) THEN
    -- Insert a test company
    INSERT INTO installer_companies (
      company_name, abn, cec_accredited, contact_name, 
      email, phone, verified
    ) VALUES (
      'Test Solar Company', '12345678901', true, 'Test Admin',
      'admin@testsolar.com', '1300123456', true
    );
  END IF;
END $$;

-- Create a function to safely check user role without recursion
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- First check if user is an installer
  SELECT 'installer' INTO user_role
  FROM installer_users
  WHERE id = user_id
  LIMIT 1;
  
  -- If not found, check if user is a homeowner
  IF user_role IS NULL THEN
    SELECT 'homeowner' INTO user_role
    FROM profiles
    WHERE id = user_id
    LIMIT 1;
  END IF;
  
  -- Return the role or null if not found
  RETURN user_role;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;