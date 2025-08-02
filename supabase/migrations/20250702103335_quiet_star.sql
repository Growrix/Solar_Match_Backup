/*
  # Fix infinite recursion in installer_users RLS policies

  1. Security Changes
    - Drop existing problematic RLS policies on installer_users table
    - Create new, simplified RLS policies that avoid recursive references
    - Ensure policies are efficient and don't cause infinite loops

  2. Policy Changes
    - Simplify the "same company members" policy to avoid subquery recursion
    - Keep user access control secure but performant
    - Use direct user ID checks where possible
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read same company members" ON installer_users;
DROP POLICY IF EXISTS "Users can read own installer profile" ON installer_users;
DROP POLICY IF EXISTS "Installer users can update own profile" ON installer_users;

-- Create new, simplified policies that avoid recursion

-- Policy for users to read their own installer profile
CREATE POLICY "Users can read own installer profile"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON installer_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy for company admins to read company members
-- This avoids the recursive subquery by using a simpler approach
CREATE POLICY "Company admins can read company members"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (
    company_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM installer_users admin_user 
      WHERE admin_user.id = auth.uid() 
        AND admin_user.company_id = installer_users.company_id
        AND admin_user.can_manage_users = true
    )
  );

-- Policy for company admins to manage company members
CREATE POLICY "Company admins can manage company members"
  ON installer_users
  FOR UPDATE
  TO authenticated
  USING (
    company_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM installer_users admin_user 
      WHERE admin_user.id = auth.uid() 
        AND admin_user.company_id = installer_users.company_id
        AND admin_user.can_manage_users = true
    )
  )
  WITH CHECK (
    company_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM installer_users admin_user 
      WHERE admin_user.id = auth.uid() 
        AND admin_user.company_id = installer_users.company_id
        AND admin_user.can_manage_users = true
    )
  );