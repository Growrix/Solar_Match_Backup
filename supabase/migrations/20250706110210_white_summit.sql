/*
  # Notifications System Migration

  1. New Tables
    - `notifications` - Stores user notifications and reminders
    - `notification_settings` - User preferences for notification types

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own notifications
    - Add functions for notification management

  3. Features
    - Support for different notification types
    - Read/unread status tracking
    - Deep linking to relevant content
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('verification', 'quote', 'chat', 'bid', 'followup')),
  title text NOT NULL,
  message text NOT NULL,
  action_link text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email_verification boolean DEFAULT true,
  email_quotes boolean DEFAULT true,
  email_chat boolean DEFAULT true,
  email_bid boolean DEFAULT true,
  email_followup boolean DEFAULT true,
  
  sms_verification boolean DEFAULT false,
  sms_quotes boolean DEFAULT false,
  sms_chat boolean DEFAULT false,
  sms_bid boolean DEFAULT false,
  sms_followup boolean DEFAULT false,
  
  push_verification boolean DEFAULT true,
  push_quotes boolean DEFAULT true,
  push_chat boolean DEFAULT true,
  push_bid boolean DEFAULT true,
  push_followup boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Notification settings policies
CREATE POLICY "Users can read own notification settings"
  ON notification_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification settings"
  ON notification_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification settings"
  ON notification_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Add updated_at trigger to notification_settings
CREATE TRIGGER update_notification_settings_updated_at 
  BEFORE UPDATE ON notification_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_action_link text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id uuid;
BEGIN
  -- Validate notification type
  IF p_type NOT IN ('verification', 'quote', 'chat', 'bid', 'followup') THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (
    user_id, type, title, message, action_link, metadata
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_action_link, p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(
  p_notification_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success boolean := false;
BEGIN
  UPDATE notifications
  SET status = 'read'
  WHERE id = p_notification_id
  AND user_id = auth.uid();
  
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE notifications
  SET status = 'read'
  WHERE user_id = p_user_id
  AND status = 'unread';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$;

-- Function to delete expired notifications
CREATE OR REPLACE FUNCTION delete_expired_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM notifications
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Function to create default notification settings for new users
CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set up default notification settings for new users
CREATE TRIGGER create_notification_settings_for_new_user
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_settings();

-- Insert sample data for testing
DO $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Get a sample user
  SELECT id INTO sample_user_id FROM profiles LIMIT 1;
  
  -- Only insert if we have a user
  IF sample_user_id IS NOT NULL THEN
    -- Insert sample notifications
    INSERT INTO notifications (
      user_id, type, title, message, action_link, status, created_at
    ) VALUES
    (sample_user_id, 'verification', 'Verify Your Email', 'Verify your email to continue requesting quotes.', 'verification_settings', 'unread', now() - interval '30 minutes'),
    (sample_user_id, 'quote', 'New Quote from SunPro', 'Quote for 6.6kW system with battery backup', 'quote_123', 'unread', now() - interval '2 hours'),
    (sample_user_id, 'chat', 'Installer Messaged You', 'GreenSpark has sent a counteroffer message.', 'chat_456', 'read', now() - interval '5 hours'),
    (sample_user_id, 'bid', 'Bid Ending in 12 Hours', 'Your bidding window for BrightVolt is about to close.', 'bid_789', 'read', now() - interval '1 day'),
    (sample_user_id, 'followup', 'How Was the Call?', 'Did you speak to SolarOne? Rate your experience.', 'rate_321', 'read', now() - interval '2 days')
    ON CONFLICT DO NOTHING;
    
    -- Insert notification settings
    INSERT INTO notification_settings (user_id)
    VALUES (sample_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;