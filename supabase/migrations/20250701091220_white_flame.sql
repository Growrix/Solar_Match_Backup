/*
  # Complete Solar Website Database Schema

  1. New Tables
    - `profiles` - User profile information linked to auth.users
    - `solar_quotes` - Solar quote requests and estimates
    - `installers` - Verified solar installation companies
    - `newsletter_subscribers` - Email newsletter subscriptions
    - `blog_posts` - Blog content management

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Allow public read access to installers and published blog posts
    - Allow anonymous quote submissions

  3. Sample Data
    - Sample installers across Australian states
    - Sample blog posts for content
    - Test newsletter subscribers
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create solar_quotes table
CREATE TABLE IF NOT EXISTS solar_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  location text NOT NULL,
  state text NOT NULL,
  budget_range text NOT NULL,
  property_type text NOT NULL,
  roof_type text,
  energy_usage integer,
  system_size numeric(4,1),
  estimated_cost integer,
  estimated_savings integer,
  rebate_amount integer,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'contacted', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create installers table
CREATE TABLE IF NOT EXISTS installers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  website text,
  license_number text UNIQUE NOT NULL,
  service_areas text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  read_time text NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Solar quotes policies
CREATE POLICY "Users can read own quotes"
  ON solar_quotes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert quotes"
  ON solar_quotes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own quotes"
  ON solar_quotes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Installers policies (public read access)
CREATE POLICY "Anyone can read verified installers"
  ON installers
  FOR SELECT
  TO anon, authenticated
  USING (verified = true);

-- Newsletter policies
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own subscription"
  ON newsletter_subscribers
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Blog posts policies (public read for published posts)
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_solar_quotes_user_id ON solar_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_solar_quotes_status ON solar_quotes(status);
CREATE INDEX IF NOT EXISTS idx_solar_quotes_created_at ON solar_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_installers_service_areas ON installers USING GIN(service_areas);
CREATE INDEX IF NOT EXISTS idx_installers_verified ON installers(verified);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Insert sample installers
INSERT INTO installers (company_name, contact_name, email, phone, website, license_number, service_areas, rating, reviews_count, verified) VALUES
('SolarTech Australia', 'John Smith', 'john@solartech.com.au', '1300 123 456', 'https://solartech.com.au', 'LIC123456', ARRAY['NSW', 'ACT'], 4.8, 127, true),
('Green Energy Solutions', 'Sarah Johnson', 'sarah@greenenergy.com.au', '1300 234 567', 'https://greenenergy.com.au', 'LIC234567', ARRAY['VIC', 'TAS'], 4.9, 89, true),
('Sunshine Solar', 'Mike Chen', 'mike@sunshinesolar.com.au', '1300 345 678', 'https://sunshinesolar.com.au', 'LIC345678', ARRAY['QLD'], 4.7, 156, true),
('Perth Solar Pros', 'Emma Wilson', 'emma@perthsolarpros.com.au', '1300 456 789', 'https://perthsolarpros.com.au', 'LIC456789', ARRAY['WA'], 4.6, 93, true),
('Adelaide Solar Co', 'David Brown', 'david@adelaidesolar.com.au', '1300 567 890', 'https://adelaidesolar.com.au', 'LIC567890', ARRAY['SA'], 4.8, 74, true);

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, author, category, read_time, published) VALUES
(
  '2024 Solar Rebate Changes: What Australian Homeowners Need to Know',
  '2024-solar-rebate-changes-australian-homeowners',
  'Understanding the latest updates to government solar incentives and how they affect your savings potential.',
  'The Australian solar rebate landscape is constantly evolving, and 2024 brings several important changes that homeowners need to understand. The Small-scale Technology Certificate (STC) scheme continues to provide substantial upfront discounts, but the value of certificates fluctuates based on market conditions. This year, we''ve seen changes in how rebates are calculated for different system sizes and locations. Understanding these changes is crucial for maximizing your solar investment and ensuring you receive all available incentives.',
  'Sarah Johnson',
  'Policy Updates',
  '6 min read',
  true
),
(
  'Tesla Powerwall vs Competitors: Battery Storage Comparison',
  'tesla-powerwall-vs-competitors-battery-storage-comparison',
  'An in-depth analysis of the top battery storage systems available in Australia, including costs and performance.',
  'Battery storage is becoming increasingly popular among Australian homeowners looking to maximize their solar investment. The Tesla Powerwall has been a market leader, but several competitors now offer compelling alternatives. In this comprehensive comparison, we examine capacity, efficiency, warranty terms, and total cost of ownership for the top battery systems available in Australia. We''ll help you understand which system might be the best fit for your home and energy needs.',
  'Michael Chen',
  'Technology',
  '8 min read',
  true
),
(
  'Summer Solar Tips: Maximizing Your System''s Performance',
  'summer-solar-tips-maximizing-system-performance',
  'How to get the most out of your solar panels during Australia''s peak sunshine months.',
  'Summer is the perfect time to maximize your solar system''s performance. With longer days and more intense sunlight, your panels can generate significantly more electricity. However, extreme heat can actually reduce panel efficiency. In this guide, we share practical tips for maintaining optimal performance during the hot Australian summer, including cleaning schedules, monitoring techniques, and when to consider professional maintenance.',
  'Emma Thompson',
  'Maintenance',
  '4 min read',
  true
),
(
  'Understanding Solar Panel Efficiency Ratings',
  'understanding-solar-panel-efficiency-ratings',
  'A comprehensive guide to solar panel efficiency and what the numbers really mean for your home.',
  'When shopping for solar panels, you''ll encounter various efficiency ratings and technical specifications that can be confusing. Panel efficiency typically ranges from 15% to 22% for residential systems, but what does this actually mean for your electricity generation? We break down the key metrics, explain how efficiency affects your system size and cost, and help you understand which specifications matter most for your specific situation.',
  'David Wilson',
  'Technology',
  '5 min read',
  true
),
(
  'Solar Installation Process: What to Expect',
  'solar-installation-process-what-to-expect',
  'A step-by-step guide through the solar installation process from quote to switch-on.',
  'Getting solar panels installed can seem daunting, but understanding the process helps set proper expectations. From initial site assessment to final grid connection, we walk you through each step of a typical solar installation. Learn about permits, inspections, equipment delivery, and what happens on installation day. We also cover common delays and how to prepare your home for the installation team.',
  'Lisa Anderson',
  'Installation',
  '7 min read',
  true
);

-- Insert sample newsletter subscribers (for testing)
INSERT INTO newsletter_subscribers (email, subscribed) VALUES
('test1@example.com', true),
('test2@example.com', true),
('test3@example.com', false)
ON CONFLICT (email) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solar_quotes_updated_at BEFORE UPDATE ON solar_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_installers_updated_at BEFORE UPDATE ON installers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_newsletter_updated_at BEFORE UPDATE ON newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();