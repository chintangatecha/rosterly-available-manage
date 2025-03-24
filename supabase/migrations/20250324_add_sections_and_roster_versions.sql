-- Add section column to profiles table
ALTER TABLE profiles ADD COLUMN section TEXT;

-- Create roster_versions table
CREATE TABLE roster_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('operational', 'finalized')),
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true
);

-- Create roster_shifts table to store shifts for different roster versions
CREATE TABLE roster_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roster_version_id UUID REFERENCES roster_versions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create sections table
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Insert default sections
INSERT INTO sections (name) VALUES 
  ('Front House'),
  ('Back House'),
  ('Administration'),
  ('Other');

-- Add RLS policies for roster_versions
ALTER TABLE roster_versions ENABLE ROW LEVEL SECURITY;

-- Managers can see all roster versions
CREATE POLICY "Managers can see all roster versions"
  ON roster_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

-- Employees can only see operational roster versions
CREATE POLICY "Employees can only see operational roster versions"
  ON roster_versions
  FOR SELECT
  USING (
    (type = 'operational' AND is_active = true) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

-- Only managers can create/update/delete roster versions
CREATE POLICY "Only managers can create roster versions"
  ON roster_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Only managers can update roster versions"
  ON roster_versions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Only managers can delete roster versions"
  ON roster_versions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

-- Add RLS policies for roster_shifts
ALTER TABLE roster_shifts ENABLE ROW LEVEL SECURITY;

-- Managers can see all roster shifts
CREATE POLICY "Managers can see all roster shifts"
  ON roster_shifts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

-- Employees can only see operational roster shifts
CREATE POLICY "Employees can only see operational roster shifts"
  ON roster_shifts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roster_versions
      WHERE roster_versions.id = roster_shifts.roster_version_id
      AND (
        roster_versions.type = 'operational' AND roster_versions.is_active = true
        OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
        )
      )
    )
  );

-- Only managers can create/update/delete roster shifts
CREATE POLICY "Only managers can create roster shifts"
  ON roster_shifts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Only managers can update roster shifts"
  ON roster_shifts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Only managers can delete roster shifts"
  ON roster_shifts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

-- Add RLS policies for sections
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Everyone can see sections
CREATE POLICY "Everyone can see sections"
  ON sections
  FOR SELECT
  USING (true);

-- Only managers can create/update/delete sections
CREATE POLICY "Only managers can create sections"
  ON sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Only managers can update sections"
  ON sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Only managers can delete sections"
  ON sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'manager'
    )
  );
