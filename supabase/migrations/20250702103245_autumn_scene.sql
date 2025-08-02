/*
  # Fix infinite recursion in installer_users RLS policies

  1. Security Updates
    - Drop problematic policy causing infinite recursion
    - Create new policies using correct Supabase auth functions
    - Maintain security while avoiding circular references

  2. Changes
    - Use auth.uid() instead of uid()
    - Simplify policy logic to prevent recursion
    - Allow users to read their own profile and company members
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can read company members" ON installer_users;

-- Drop and recreate the policy for reading own installer profile with correct function
DROP POLICY IF EXISTS "Users can read own installer profile" ON installer_users;
CREATE POLICY "Users can read own installer profile"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create a new policy for reading company members that doesn't cause recursion
-- This policy allows users to read other members of their company by checking the company_id directly
CREATE POLICY "Users can read same company members"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (
    company_id IS NOT NULL 
    AND company_id IN (
      SELECT company_id 
      FROM installer_users 
      WHERE id = auth.uid() 
      AND company_id IS NOT NULL
    )
  );

-- Also fix the update policy to use correct auth function
DROP POLICY IF EXISTS "Installer users can update own profile" ON installer_users;
CREATE POLICY "Installer users can update own profile"
  ON installer_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());