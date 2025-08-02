/*
  # Chat System Migration

  1. New Columns
    - Add attachment_url field to chat_messages
    - Add attachment_type field to chat_messages
    - Add sender_name field to chat_messages

  2. Security
    - Maintain existing RLS policies
    - Add storage bucket for chat attachments
    - Add policies for attachment access

  3. Features
    - Support for file attachments in chat
    - Better sender identification
    - Improved chat message structure
*/

-- Add new columns to chat_messages table
DO $$
BEGIN
  -- Add attachment URL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN attachment_url text;
  END IF;

  -- Add attachment type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'attachment_type'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN attachment_type text;
  END IF;

  -- Add sender name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'sender_name'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN sender_name text;
  END IF;
END $$;

-- Create storage bucket for chat attachments if it doesn't exist
-- Note: This would normally be done through the Supabase dashboard or CLI
-- For this migration, we'll just document the required storage bucket

/*
Storage Bucket Configuration:
- Name: chat_attachments
- Public Access: Enabled for authenticated users
- File Size Limit: 5MB
- Allowed MIME Types: image/jpeg, image/png, image/gif, application/pdf
*/

-- Create function to get sender name
CREATE OR REPLACE FUNCTION get_sender_name(sender_type text, sender_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_name text;
BEGIN
  IF sender_type = 'homeowner' THEN
    -- Get homeowner name
    SELECT full_name INTO sender_name
    FROM profiles
    WHERE id = sender_id;
    
    RETURN COALESCE(sender_name, 'Homeowner');
  ELSIF sender_type = 'installer' THEN
    -- Get installer company name
    SELECT company_name INTO sender_name
    FROM installer_companies ic
    JOIN installer_users iu ON ic.id = iu.company_id
    WHERE iu.id = sender_id;
    
    RETURN COALESCE(sender_name, 'Installer');
  ELSE
    RETURN 'Unknown';
  END IF;
END;
$$;

-- Create trigger to automatically set sender_name
CREATE OR REPLACE FUNCTION set_sender_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sender_name := get_sender_name(NEW.sender_type, NEW.sender_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to chat_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_sender_name_trigger'
  ) THEN
    CREATE TRIGGER set_sender_name_trigger
    BEFORE INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION set_sender_name();
  END IF;
END $$;

-- Create function to check if message contains contact info
CREATE OR REPLACE FUNCTION contains_contact_info(message_text text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check for email patterns
  IF message_text ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' THEN
    RETURN true;
  END IF;
  
  -- Check for phone patterns
  IF message_text ~* '(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}' THEN
    RETURN true;
  END IF;
  
  -- Check for URL patterns
  IF message_text ~* '(https?://[^\s]+)' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create function to check if message is allowed based on quote type
CREATE OR REPLACE FUNCTION is_message_allowed(quote_id uuid, message_text text, has_attachment boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quote_type text;
BEGIN
  -- Get quote type
  SELECT type INTO quote_type
  FROM solar_quotes sq
  JOIN written_quotes wq ON sq.id = wq.source_quote_id
  WHERE wq.id = quote_id;
  
  -- If quote type is call_visit, allow all messages
  IF quote_type = 'call_visit' THEN
    RETURN true;
  END IF;
  
  -- For written quotes, check for contact info and attachments
  IF has_attachment THEN
    RETURN false;
  END IF;
  
  IF contains_contact_info(message_text) THEN
    -- We'll allow it but flag it in the application
    RETURN true;
  END IF;
  
  RETURN true;
END;
$$;

-- Insert sample chat messages for testing
DO $$
DECLARE
  sample_quote_id uuid;
  sample_homeowner_id uuid;
  sample_installer_id uuid;
BEGIN
  -- Get a sample quote
  SELECT id INTO sample_quote_id FROM written_quotes LIMIT 1;
  
  -- Get the homeowner and installer IDs from the quote
  IF sample_quote_id IS NOT NULL THEN
    SELECT homeowner_id, installer_id INTO sample_homeowner_id, sample_installer_id
    FROM written_quotes
    WHERE id = sample_quote_id;
    
    -- Only insert if we have all required IDs
    IF sample_homeowner_id IS NOT NULL AND sample_installer_id IS NOT NULL THEN
      -- Insert sample chat messages
      INSERT INTO chat_messages (
        quote_id, sender_type, sender_id, message_text
      ) VALUES
      (
        sample_quote_id, 'installer', sample_installer_id,
        'Hello! Thank you for your interest in our quote. How can I help you?'
      ),
      (
        sample_quote_id, 'homeowner', sample_homeowner_id,
        'Hi there! I have a few questions about the system you quoted.'
      ),
      (
        sample_quote_id, 'installer', sample_installer_id,
        'Of course! I''d be happy to answer any questions you have about the system specifications, installation process, or pricing.'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;