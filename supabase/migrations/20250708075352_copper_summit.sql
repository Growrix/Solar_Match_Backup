/*
  # Fix Lead Type Validation Migration

  1. Updates
    - Ensure valid lead_type values when creating installer_leads
    - Map 'written' to 'written' and 'call_visit' to 'call_visit'
    - Handle NULL values in solar_quotes.type
    - Update trigger function and backfill logic
*/

-- Update the function to generate installer leads from solar quotes with proper type validation
CREATE OR REPLACE FUNCTION generate_installer_lead_from_quote()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_id uuid;
  v_lead_quality_score integer;
  v_lead_price numeric(10,2);
  v_lead_urgency text;
  v_lead_type text;
BEGIN
  -- Calculate lead quality score (1-10) based on quote completeness
  v_lead_quality_score := 5; -- Base score
  
  -- Increase score if more details are provided
  IF NEW.phone IS NOT NULL THEN
    v_lead_quality_score := v_lead_quality_score + 1;
  END IF;
  
  IF NEW.roof_type IS NOT NULL THEN
    v_lead_quality_score := v_lead_quality_score + 1;
  END IF;
  
  IF NEW.energy_usage IS NOT NULL THEN
    v_lead_quality_score := v_lead_quality_score + 1;
  END IF;
  
  IF NEW.system_size IS NOT NULL THEN
    v_lead_quality_score := v_lead_quality_score + 1;
  END IF;
  
  -- Cap at 10
  v_lead_quality_score := LEAST(v_lead_quality_score, 10);
  
  -- Ensure valid lead_type value
  IF NEW.type = 'call_visit' THEN
    v_lead_type := 'call_visit';
    v_lead_price := 60.00; -- Base price for call/visit
  ELSE
    v_lead_type := 'written'; -- Default to 'written' for any other value including NULL
    v_lead_price := 40.00; -- Base price for written
  END IF;
  
  -- Adjust price based on quality score
  v_lead_price := v_lead_price + (v_lead_quality_score - 5) * 5.00;
  
  -- Determine urgency based on budget range
  IF NEW.budget_range = '30000+' OR NEW.budget_range = '20000-30000' THEN
    v_lead_urgency := 'high';
  ELSIF NEW.budget_range = '10000-20000' THEN
    v_lead_urgency := 'medium';
  ELSE
    v_lead_urgency := 'low';
  END IF;
  
  -- Create the installer lead
  INSERT INTO installer_leads (
    source_quote_id,
    lead_type,
    property_type,
    location,
    state,
    postcode,
    estimated_system_size,
    budget_range,
    energy_usage,
    roof_type,
    customer_name,
    customer_email,
    customer_phone,
    lead_quality_score,
    urgency,
    price,
    status,
    expires_at
  ) VALUES (
    NEW.id,
    v_lead_type, -- Use validated lead type
    NEW.property_type,
    NEW.location,
    NEW.state,
    NULL, -- Postcode not in solar_quotes
    NEW.system_size,
    NEW.budget_range,
    NEW.energy_usage,
    NEW.roof_type,
    NEW.name,
    NEW.email,
    NEW.phone,
    v_lead_quality_score,
    v_lead_urgency,
    v_lead_price,
    'available',
    NOW() + interval '14 days'
  ) RETURNING id INTO v_lead_id;
  
  -- Log the lead creation (for debugging)
  RAISE NOTICE 'Created installer lead % from solar quote % with type %', v_lead_id, NEW.id, v_lead_type;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on solar_quotes table
DO $$
BEGIN
  -- Drop the trigger if it already exists
  DROP TRIGGER IF EXISTS generate_installer_lead_trigger ON solar_quotes;
  
  -- Create the trigger
  CREATE TRIGGER generate_installer_lead_trigger
    AFTER INSERT ON solar_quotes
    FOR EACH ROW
    EXECUTE FUNCTION generate_installer_lead_from_quote();
END $$;

-- Backfill existing quotes that don't have corresponding leads
-- Fixed version that doesn't use PERFORM with a record and ensures valid lead_type
DO $$
DECLARE
  quote_id uuid;
  quote_type text;
  quote_property_type text;
  quote_location text;
  quote_state text;
  quote_system_size numeric(4,1);
  quote_budget_range text;
  quote_energy_usage integer;
  quote_roof_type text;
  quote_name text;
  quote_email text;
  quote_phone text;
  
  v_lead_quality_score integer;
  v_lead_price numeric(10,2);
  v_lead_urgency text;
  v_lead_type text;
BEGIN
  -- Get quotes that don't have corresponding leads
  FOR quote_id, quote_type, quote_property_type, quote_location, quote_state, 
      quote_system_size, quote_budget_range, quote_energy_usage, quote_roof_type,
      quote_name, quote_email, quote_phone IN
    SELECT sq.id, COALESCE(sq.type, 'written'), sq.property_type, sq.location, sq.state,
           sq.system_size, sq.budget_range, sq.energy_usage, sq.roof_type,
           sq.name, sq.email, sq.phone
    FROM solar_quotes sq
    LEFT JOIN installer_leads il ON il.source_quote_id = sq.id
    WHERE il.id IS NULL
  LOOP
    -- Calculate lead quality score (1-10) based on quote completeness
    v_lead_quality_score := 5; -- Base score
    
    -- Increase score if more details are provided
    IF quote_phone IS NOT NULL THEN
      v_lead_quality_score := v_lead_quality_score + 1;
    END IF;
    
    IF quote_roof_type IS NOT NULL THEN
      v_lead_quality_score := v_lead_quality_score + 1;
    END IF;
    
    IF quote_energy_usage IS NOT NULL THEN
      v_lead_quality_score := v_lead_quality_score + 1;
    END IF;
    
    IF quote_system_size IS NOT NULL THEN
      v_lead_quality_score := v_lead_quality_score + 1;
    END IF;
    
    -- Cap at 10
    v_lead_quality_score := LEAST(v_lead_quality_score, 10);
    
    -- Ensure valid lead_type value
    IF quote_type = 'call_visit' THEN
      v_lead_type := 'call_visit';
      v_lead_price := 60.00; -- Base price for call/visit
    ELSE
      v_lead_type := 'written'; -- Default to 'written' for any other value including NULL
      v_lead_price := 40.00; -- Base price for written
    END IF;
    
    -- Adjust price based on quality score
    v_lead_price := v_lead_price + (v_lead_quality_score - 5) * 5.00;
    
    -- Determine urgency based on budget range
    IF quote_budget_range = '30000+' OR quote_budget_range = '20000-30000' THEN
      v_lead_urgency := 'high';
    ELSIF quote_budget_range = '10000-20000' THEN
      v_lead_urgency := 'medium';
    ELSE
      v_lead_urgency := 'low';
    END IF;
    
    -- Create the installer lead directly
    INSERT INTO installer_leads (
      source_quote_id,
      lead_type,
      property_type,
      location,
      state,
      postcode,
      estimated_system_size,
      budget_range,
      energy_usage,
      roof_type,
      customer_name,
      customer_email,
      customer_phone,
      lead_quality_score,
      urgency,
      price,
      status,
      expires_at
    ) VALUES (
      quote_id,
      v_lead_type, -- Use validated lead type
      quote_property_type,
      quote_location,
      quote_state,
      NULL, -- Postcode not in solar_quotes
      quote_system_size,
      quote_budget_range,
      quote_energy_usage,
      quote_roof_type,
      quote_name,
      quote_email,
      quote_phone,
      v_lead_quality_score,
      v_lead_urgency,
      v_lead_price,
      'available',
      NOW() + interval '14 days'
    );
  END LOOP;
END $$;