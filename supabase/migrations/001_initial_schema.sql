-- MakerMarket initial schema

CREATE TYPE user_role AS ENUM ('vendor', 'organizer');
CREATE TYPE craft_category AS ENUM (
  'fiber_arts',
  'ceramics',
  'jewelry',
  'illustration',
  'candles',
  'other'
);
CREATE TYPE market_status AS ENUM ('draft', 'open', 'closed');
CREATE TYPE application_status AS ENUM (
  'pending',
  'approved',
  'waitlisted',
  'declined'
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role user_role NOT NULL,
  business_name TEXT,
  instagram_handle TEXT,
  website_url TEXT,
  bio TEXT,
  portfolio_images TEXT[] NOT NULL DEFAULT '{}',
  category craft_category
);

CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  location_name TEXT NOT NULL,
  address TEXT,
  booth_fee NUMERIC(10, 2),
  application_deadline DATE,
  categories_needed TEXT[] NOT NULL DEFAULT '{}',
  status market_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (market_id, vendor_id)
);

CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_date ON markets(date);
CREATE INDEX idx_markets_organizer ON markets(organizer_id);
CREATE INDEX idx_applications_market ON applications(market_id);
CREATE INDEX idx_applications_vendor ON applications(vendor_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owners can update
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Markets: open markets public, organizers manage their own
CREATE POLICY "Open markets are viewable by everyone"
  ON markets FOR SELECT USING (status = 'open' OR organizer_id = auth.uid());

CREATE POLICY "Organizers can insert markets"
  ON markets FOR INSERT WITH CHECK (
    organizer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );

CREATE POLICY "Organizers can update their markets"
  ON markets FOR UPDATE USING (organizer_id = auth.uid());

CREATE POLICY "Organizers can delete their markets"
  ON markets FOR DELETE USING (organizer_id = auth.uid());

-- Applications
CREATE POLICY "Vendors can view their applications"
  ON applications FOR SELECT USING (
    vendor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM markets
      WHERE markets.id = applications.market_id
      AND markets.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can apply to markets"
  ON applications FOR INSERT WITH CHECK (
    vendor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'vendor'
    )
  );

CREATE POLICY "Organizers can update application status"
  ON applications FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM markets
      WHERE markets.id = applications.market_id
      AND markets.organizer_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
