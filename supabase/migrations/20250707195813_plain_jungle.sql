/*
  # Automate Lead Generation Migration

  1. New Functionality
    - Automatically create installer_leads from solar_quotes
    - Ensure proper lead type mapping
    - Set appropriate pricing based on lead quality

  2. Changes
    - Create trigger function to generate leads from quotes
    - Add trigger to solar_quotes table
    - Ensure proper data mapping between tables
*/

-- Create function to generate installer leads from solar quotes
CREATE OR REPLACE FUNCTION generate_installer_lead_from_quote()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_id uuid;
  v_lead_quality_score integer;
  v_lead_price numeric(10,2);
  v_lead_urgency text;
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
  
  -- Calculate lead price based on quality and type
  -- Base price: $40 for written, $60 for call/visit
  IF NEW.type = 'call_visit' THEN
    v_lead_price := 60.00;
  ELSE
    v_lead_price := 40.00;
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
    NEW.type,
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
  RAISE NOTICE 'Created installer lead % from solar quote %', v_lead_id, NEW.id;
  
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
DO $$
DECLARE
  quote record;
BEGIN
  FOR quote IN 
    SELECT sq.* 
    FROM solar_quotes sq
    LEFT JOIN installer_leads il ON il.source_quote_id = sq.id
    WHERE il.id IS NULL
  LOOP
    -- Call the trigger function manually for each quote
    PERFORM generate_installer_lead_from_quote()
    FROM (SELECT quote.*) AS sq;
  END LOOP;
END $$;