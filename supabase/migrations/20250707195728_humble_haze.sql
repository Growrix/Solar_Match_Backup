/*
  # Reinforce Database Security Migration

  1. Security Updates
    - Re-enable Row Level Security (RLS) on all installer tables
    - Create robust, non-recursive RLS policies
    - Fix security vulnerabilities in existing policies

  2. Changes
    - Enable RLS on installer_users, installer_wallets, installer_lead_purchases, installer_wallet_transactions
    - Create safe policies that avoid recursion issues
    - Use security definer functions where needed to prevent permission issues
*/

-- Re-enable RLS on all installer tables that had it disabled
ALTER TABLE installer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_lead_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE installer_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to safely get a user's company ID
CREATE OR REPLACE FUNCTION get_user_company_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  company_id uuid;
BEGIN
  SELECT iu.company_id INTO company_id
  FROM installer_users iu
  WHERE iu.id = user_id;
  
  RETURN company_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_company_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_company_id(uuid) TO anon;

-- Create a security definer function to check if user belongs to a company
CREATE OR REPLACE FUNCTION user_belongs_to_company(user_id uuid, company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  belongs boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM installer_users
    WHERE id = user_id AND company_id = $2
  ) INTO belongs;
  
  RETURN belongs;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION user_belongs_to_company(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_belongs_to_company(uuid, uuid) TO anon;

-- Create a security definer function to check if user can manage company
CREATE OR REPLACE FUNCTION user_can_manage_company(user_id uuid, company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  can_manage boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM installer_users
    WHERE id = user_id 
      AND company_id = $2
      AND can_manage_company = true
  ) INTO can_manage;
  
  RETURN can_manage;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION user_can_manage_company(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_manage_company(uuid, uuid) TO anon;

-- Create a security definer function to check if user can purchase leads
CREATE OR REPLACE FUNCTION user_can_purchase_leads(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  can_purchase boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM installer_users
    WHERE id = user_id AND can_purchase_leads = true
  ) INTO can_purchase;
  
  RETURN can_purchase;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION user_can_purchase_leads(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_purchase_leads(uuid) TO anon;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Installer users can read own wallet" ON installer_wallets;
DROP POLICY IF EXISTS "Installer users can read own transactions" ON installer_wallet_transactions;
DROP POLICY IF EXISTS "Installer users can read own purchases" ON installer_lead_purchases;
DROP POLICY IF EXISTS "Installer users can insert purchases" ON installer_lead_purchases;
DROP POLICY IF EXISTS "Installer users can update own purchases" ON installer_lead_purchases;

-- Create safe policies for installer_users
CREATE POLICY "Users can read own installer profile"
  ON installer_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own installer profile"
  ON installer_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create safe policies for installer_wallets
CREATE POLICY "Users can read company wallet"
  ON installer_wallets
  FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- Create safe policies for installer_wallet_transactions
CREATE POLICY "Users can read company wallet transactions"
  ON installer_wallet_transactions
  FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM installer_wallets
      WHERE company_id = get_user_company_id(auth.uid())
    )
  );

-- Create safe policies for installer_lead_purchases
CREATE POLICY "Users can read company lead purchases"
  ON installer_lead_purchases
  FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert lead purchases"
  ON installer_lead_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = get_user_company_id(auth.uid()) AND
    user_can_purchase_leads(auth.uid())
  );

CREATE POLICY "Users can update company lead purchases"
  ON installer_lead_purchases
  FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- Create a function to safely purchase a lead
CREATE OR REPLACE FUNCTION purchase_lead(
  p_lead_id uuid,
  p_payment_method text DEFAULT 'wallet'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_company_id uuid;
  v_lead record;
  v_wallet record;
  v_purchase_id uuid;
  v_result json;
BEGIN
  -- Get user's company ID
  SELECT get_user_company_id(v_user_id) INTO v_company_id;
  
  IF v_company_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User is not associated with any company'
    );
  END IF;
  
  -- Check if user can purchase leads
  IF NOT user_can_purchase_leads(v_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User does not have permission to purchase leads'
    );
  END IF;
  
  -- Get lead details
  SELECT * INTO v_lead
  FROM installer_leads
  WHERE id = p_lead_id AND status = 'available';
  
  IF v_lead IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Lead not found or not available'
    );
  END IF;
  
  -- Check if lead is already purchased by this company
  IF EXISTS (
    SELECT 1 FROM installer_lead_purchases
    WHERE lead_id = p_lead_id AND company_id = v_company_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Lead already purchased by your company'
    );
  END IF;
  
  -- Get wallet balance
  IF p_payment_method = 'wallet' THEN
    SELECT * INTO v_wallet
    FROM installer_wallets
    WHERE company_id = v_company_id;
    
    IF v_wallet IS NULL THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Wallet not found'
      );
    END IF;
    
    -- Check if enough balance
    IF v_wallet.balance < v_lead.price THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Insufficient wallet balance'
      );
    END IF;
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Create purchase record
    INSERT INTO installer_lead_purchases (
      company_id,
      lead_id,
      purchased_by,
      purchase_price,
      payment_method,
      contact_status
    ) VALUES (
      v_company_id,
      p_lead_id,
      v_user_id,
      v_lead.price,
      p_payment_method,
      'new'
    ) RETURNING id INTO v_purchase_id;
    
    -- Update lead status
    UPDATE installer_leads
    SET status = 'purchased'
    WHERE id = p_lead_id;
    
    -- If using wallet, create transaction and update balance
    IF p_payment_method = 'wallet' THEN
      -- Create wallet transaction
      INSERT INTO installer_wallet_transactions (
        wallet_id,
        type,
        amount,
        description,
        reference,
        balance_before,
        balance_after
      ) VALUES (
        v_wallet.id,
        'debit',
        v_lead.price,
        'Lead purchase: ' || v_lead.location || ', ' || v_lead.state,
        v_purchase_id,
        v_wallet.balance,
        v_wallet.balance - v_lead.price
      );
      
      -- Update wallet balance
      UPDATE installer_wallets
      SET balance = balance - v_lead.price
      WHERE id = v_wallet.id;
    END IF;
    
    -- If this is a call/visit lead, update the original solar_quote to reveal contact
    IF v_lead.lead_type = 'call_visit' AND v_lead.source_quote_id IS NOT NULL THEN
      UPDATE solar_quotes
      SET contact_revealed = true
      WHERE id = v_lead.source_quote_id;
    END IF;
    
    -- Create notification for homeowner if source_quote_id exists
    IF v_lead.source_quote_id IS NOT NULL THEN
      -- Get homeowner ID from solar_quotes
      DECLARE
        v_homeowner_id text;
      BEGIN
        SELECT user_id INTO v_homeowner_id
        FROM solar_quotes
        WHERE id = v_lead.source_quote_id;
        
        IF v_homeowner_id != 'anonymous' AND v_homeowner_id IS NOT NULL THEN
          -- Create notification
          PERFORM create_notification(
            v_homeowner_id::uuid,
            'quote',
            'Your Quote Request Has Been Claimed',
            'An installer has purchased your quote request and will be in touch soon.',
            'quote_' || v_lead.source_quote_id,
            json_build_object(
              'lead_id', v_lead.id,
              'lead_type', v_lead.lead_type,
              'installer_id', v_company_id
            )
          );
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- Ignore notification errors
        NULL;
      END;
    END IF;
    
    -- Return success
    RETURN json_build_object(
      'success', true,
      'purchase_id', v_purchase_id,
      'message', 'Lead purchased successfully'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Rollback is automatic
    RETURN json_build_object(
      'success', false,
      'message', 'Error processing purchase: ' || SQLERRM
    );
  END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION purchase_lead(uuid, text) TO authenticated;