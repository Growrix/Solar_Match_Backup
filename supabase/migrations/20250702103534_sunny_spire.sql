/*
  # Fix Installer Users RLS Policies - Final Solution

  1. Problem
    - Infinite recursion in RLS policies on installer_users table
    - Policies referencing the same table they protect causes circular dependency

  2. Solution
    - Remove all problematic policies
    - Create simple, non-recursive policies
    - Use direct auth.uid() checks where possible
    - Avoid complex subqueries that reference the same table

  3. Security
    - Users can read/update their own installer profile
    - Company admins can manage users (simplified approach)
    - No recursive table references
*/

-- Drop ALL existing policies on installer_users to start fresh
DROP POLICY IF EXISTS "Users can read same company members" ON installer_users;
DROP POLICY IF EXISTS "Users can read own installer profile" ON installer_users;
DROP POLICY IF EXISTS "Users can update own profile" ON installer_users;
DROP POLICY IF EXISTS "Installer users can update own profile" ON installer_users;
DROP POLICY IF EXISTS "Company admins can read company members" ON installer_users;
DROP POLICY IF EXISTS "Company admins can manage company members" ON installer_users;
DROP POLICY IF EXISTS "Installer users can read company members" ON installer_users;

-- Create simple, non-recursive policies

-- 1. Users can always read their own installer profile
CREATE POLICY "Users can read own installer profile"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON installer_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. For company member management, we'll use a simpler approach
-- Store the user's company_id and permissions in a way that doesn't require recursive queries
-- This policy allows reading company members only if the user has management permissions
-- We'll check this through the installer_companies table instead of installer_users
CREATE POLICY "Company admins can read company members"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (
    company_id IS NOT NULL 
    AND company_id IN (
      -- Get company_id from installer_companies where the current user is listed as admin
      SELECT ic.id 
      FROM installer_companies ic
      WHERE ic.id = installer_users.company_id
      AND EXISTS (
        -- Check if current user is an admin of this company
        SELECT 1 FROM auth.users au 
        WHERE au.id = auth.uid()
        AND au.email = ic.email  -- Company admin email matches auth user email
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
        AND au.email = ic.email
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
        AND au.email = ic.email
      )
    )
  );

-- Alternative: If the above still causes issues, we can disable RLS temporarily
-- and handle permissions in the application layer
-- ALTER TABLE installer_users DISABLE ROW LEVEL SECURITY;

-- But let's try a completely different approach - minimal policies
-- Comment out the complex policies above and use these simple ones instead:

-- Drop the complex policies if they still cause issues
-- DROP POLICY IF EXISTS "Company admins can read company members" ON installer_users;
-- DROP POLICY IF EXISTS "Company admins can manage company members" ON installer_users;

-- Simple policy: authenticated users can read installer_users (we'll handle company filtering in app)
-- CREATE POLICY "Authenticated users can read installer profiles"
--   ON installer_users
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- For now, let's keep it simple and only allow users to manage their own records
-- Company management can be handled through the application layer with proper validation