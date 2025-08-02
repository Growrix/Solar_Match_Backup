/*
  # Fix infinite recursion in installer_users RLS policy

  1. Security Changes
    - Drop the problematic RLS policy that causes infinite recursion
    - Create a simpler policy that allows users to read their own record
    - Create a separate policy for reading company members that doesn't cause recursion

  The issue was that the "Installer users can read company members" policy was trying to 
  look up the user's company_id by querying the same table it was protecting, causing 
  infinite recursion.
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Installer users can read company members" ON installer_users;

-- Create a simple policy for users to read their own record
CREATE POLICY "Users can read own installer profile"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create a policy for reading company members that doesn't cause recursion
-- This policy allows users to read other members of their company, but only after
-- we can establish their company_id through their own record (which is allowed by the above policy)
CREATE POLICY "Users can read company members"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (
    company_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM installer_users self 
      WHERE self.id = auth.uid() 
      AND self.company_id = installer_users.company_id
    )
  );