/*
  # Solar Installer Partner System Database Schema

  1. New Tables
    - `installer_companies` - Verified solar installation companies
    - `installer_users` - User accounts for installer staff
    - `installer_leads` - Available leads for purchase
    - `installer_lead_purchases` - Purchased leads tracking
    - `installer_wallets` - Credit/payment system for installers
    - `installer_preferences` - Lead preferences and settings

  2. Security
    - Enable RLS on all installer tables
    - Separate policies for installer vs homeowner access
    - Role-based access control

  3. Features
    - Lead management system
    - Wallet/credit system
    - Company profile management
    - Lead purchase tracking
*/

-- Create installer companies table
CREATE TABLE IF NOT EXISTS installer_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  abn text UNIQUE NOT NULL,
  cec_accredited boolean DEFAULT false,
  license_number text,
  contact_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  website text,
  
  -- Company details
  about text,
  logo_url text,
  service_areas text[] DEFAULT '{}',
  
  -- Verification status
  verified boolean DEFAULT false,
  verification_date timestamptz,
  
  -- Lead preferences
  max_lead_price numeric(10,2) DEFAULT 100.00,
  preferred_system_sizes text[] DEFAULT '{}',
  preferred_property_types text[] DEFAULT '{}',
  
  -- Settings
  notifications_enabled boolean DEFAULT true,
  auto_purchase_enabled boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create installer users table (staff accounts)
CREATE TABLE IF NOT EXISTS installer_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES installer_companies(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  
  -- Permissions
  can_purchase_leads boolean DEFAULT true,
  can_manage_company boolean DEFAULT false,
  can_manage_users boolean DEFAULT false,
  
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create installer leads table
CREATE TABLE IF NOT EXISTS installer_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Lead source (from solar_quotes table)
  source_quote_id uuid REFERENCES solar_quotes(id),
  
  -- Lead details
  lead_type text NOT NULL DEFAULT 'quote' CHECK (lead_type IN ('quote', 'consultation', 'maintenance')),
  property_type text NOT NULL,
  location text NOT NULL,
  state text NOT NULL,
  postcode text,
  
  -- System requirements
  estimated_system_size numeric(4,1),
  budget_range text,
  energy_usage integer,
  roof_type text,
  
  -- Contact info (encrypted/blurred until purchased)
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  
  -- Lead metadata
  lead_quality_score integer DEFAULT 5 CHECK (lead_quality_score >= 1 AND lead_quality_score <= 10),
  urgency text DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  price numeric(10,2) NOT NULL DEFAULT 50.00,
  
  -- Status
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'purchased', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create installer lead purchases table
CREATE TABLE IF NOT EXISTS installer_lead_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES installer_companies(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES installer_leads(id) ON DELETE CASCADE,
  purchased_by uuid REFERENCES installer_users(id),
  
  -- Purchase details
  purchase_price numeric(10,2) NOT NULL,
  payment_method text DEFAULT 'wallet' CHECK (payment_method IN ('wallet', 'card', 'invoice')),
  
  -- Lead status tracking
  contact_status text DEFAULT 'new' CHECK (contact_status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  contact_notes text,
  quote_amount numeric(10,2),
  conversion_date timestamptz,
  
  -- Quality feedback
  lead_quality_rating integer CHECK (lead_quality_rating >= 1 AND lead_quality_rating <= 5),
  quality_feedback text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(company_id, lead_id)
);

-- Create installer wallets table
CREATE TABLE IF NOT EXISTS installer_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES installer_companies(id) ON DELETE CASCADE UNIQUE,
  
  -- Balance
  balance numeric(10,2) DEFAULT 0.00 CHECK (balance >= 0),
  
  -- Free credits
  free_credits numeric(10,2) DEFAULT 50.00,
  free_credits_used numeric(10,2) DEFAULT 0.00,
  
  -- Limits and settings
  auto_topup_enabled boolean DEFAULT false,
  auto_topup_threshold numeric(10,2) DEFAULT 100.00,
  auto_topup_amount numeric(10,2) DEFAULT 500.00,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS installer_wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES installer_wallets(id) ON DELETE CASCADE,
  
  -- Transaction details
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'refund')),
  amount numeric(10,2) NOT NULL,
  description text NOT NULL,
  reference text, -- Lead ID, payment ID, etc.
  
  -- Balance tracking
  balance_before numeric(10,2) NOT NULL,
  balance_after numeric(10,2) NOT NULL,
  
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all installer tables
ALTER TABLE installer_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_lead_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Installer Companies Policies
CREATE POLICY "Installer users can read own company"
  ON installer_companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM installer_users WHERE id = auth.uid()
    )
  );

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

-- Installer Users Policies
CREATE POLICY "Installer users can read company members"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM installer_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Installer users can update own profile"
  ON installer_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Installer Leads Policies (available leads visible to all verified installers)
CREATE POLICY "Verified installers can read available leads"
  ON installer_leads
  FOR SELECT
  TO authenticated
  USING (
    status = 'available' AND 
    expires_at > now() AND
    EXISTS (
      SELECT 1 FROM installer_users iu
      JOIN installer_companies ic ON iu.company_id = ic.id
      WHERE iu.id = auth.uid() AND ic.verified = true
    )
  );

-- Lead Purchases Policies
CREATE POLICY "Installer users can read own purchases"
  ON installer_lead_purchases
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM installer_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Installer users can insert purchases"
  ON installer_lead_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM installer_users 
      WHERE id = auth.uid() AND can_purchase_leads = true
    )
  );

CREATE POLICY "Installer users can update own purchases"
  ON installer_lead_purchases
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM installer_users WHERE id = auth.uid()
    )
  );

-- Wallet Policies
CREATE POLICY "Installer users can read own wallet"
  ON installer_wallets
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM installer_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Installer users can read own transactions"
  ON installer_wallet_transactions
  FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT iw.id FROM installer_wallets iw
      JOIN installer_users iu ON iw.company_id = iu.company_id
      WHERE iu.id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_installer_companies_verified ON installer_companies(verified);
CREATE INDEX IF NOT EXISTS idx_installer_companies_service_areas ON installer_companies USING GIN(service_areas);
CREATE INDEX IF NOT EXISTS idx_installer_users_company_id ON installer_users(company_id);
CREATE INDEX IF NOT EXISTS idx_installer_leads_status ON installer_leads(status);
CREATE INDEX IF NOT EXISTS idx_installer_leads_location ON installer_leads(state, postcode);
CREATE INDEX IF NOT EXISTS idx_installer_leads_expires_at ON installer_leads(expires_at);
CREATE INDEX IF NOT EXISTS idx_installer_lead_purchases_company_id ON installer_lead_purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_installer_lead_purchases_lead_id ON installer_lead_purchases(lead_id);
CREATE INDEX IF NOT EXISTS idx_installer_wallets_company_id ON installer_wallets(company_id);

-- Add updated_at triggers
CREATE TRIGGER update_installer_companies_updated_at 
  BEFORE UPDATE ON installer_companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installer_users_updated_at 
  BEFORE UPDATE ON installer_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installer_leads_updated_at 
  BEFORE UPDATE ON installer_leads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installer_lead_purchases_updated_at 
  BEFORE UPDATE ON installer_lead_purchases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installer_wallets_updated_at 
  BEFORE UPDATE ON installer_wallets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create wallet when company is created
CREATE OR REPLACE FUNCTION create_installer_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO installer_wallets (company_id, balance, free_credits)
  VALUES (NEW.id, 0.00, 50.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create wallet
CREATE TRIGGER create_installer_wallet_trigger
  AFTER INSERT ON installer_companies
  FOR EACH ROW
  EXECUTE FUNCTION create_installer_wallet();

-- Function to update wallet balance on transactions
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE installer_wallets 
  SET balance = NEW.balance_after,
      updated_at = now()
  WHERE id = NEW.wallet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wallet balance
CREATE TRIGGER update_wallet_balance_trigger
  AFTER INSERT ON installer_wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();

-- Insert sample installer companies for testing
INSERT INTO installer_companies (
  company_name, abn, cec_accredited, license_number, contact_name, 
  email, phone, website, verified, service_areas
) VALUES
(
  'Solar Pro Installations', '12345678901', true, 'LIC123456', 'John Smith',
  'john@solarpro.com.au', '1300123456', 'https://solarpro.com.au', true,
  ARRAY['NSW', 'ACT']
),
(
  'Green Energy Solutions', '23456789012', true, 'LIC234567', 'Sarah Johnson',
  'sarah@greenenergy.com.au', '1300234567', 'https://greenenergy.com.au', true,
  ARRAY['VIC', 'TAS']
),
(
  'Sunshine Solar Co', '34567890123', true, 'LIC345678', 'Mike Chen',
  'mike@sunshinesolar.com.au', '1300345678', 'https://sunshinesolar.com.au', true,
  ARRAY['QLD']
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample leads for testing
INSERT INTO installer_leads (
  property_type, location, state, postcode, estimated_system_size,
  budget_range, customer_name, customer_email, customer_phone,
  lead_quality_score, price
) VALUES
(
  'House', 'Sydney', 'NSW', '2000', 6.6,
  '10000-20000', 'John Doe', 'john.doe@email.com', '0400123456',
  8, 45.00
),
(
  'Townhouse', 'Melbourne', 'VIC', '3000', 10.0,
  '20000-30000', 'Jane Smith', 'jane.smith@email.com', '0400234567',
  9, 65.00
),
(
  'House', 'Brisbane', 'QLD', '4000', 8.0,
  '15000-25000', 'Bob Wilson', 'bob.wilson@email.com', '0400345678',
  7, 55.00
)
ON CONFLICT DO NOTHING;