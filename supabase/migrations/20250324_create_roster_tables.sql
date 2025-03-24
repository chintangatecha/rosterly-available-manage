-- Create roster_versions table
CREATE TABLE IF NOT EXISTS public.roster_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('operational', 'finalized')),
  week_start DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create RLS policies for roster_versions
ALTER TABLE public.roster_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can create roster versions"
  ON public.roster_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can update roster versions"
  ON public.roster_versions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Users can view roster versions"
  ON public.roster_versions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create roster_shifts table
CREATE TABLE IF NOT EXISTS public.roster_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roster_version_id UUID NOT NULL REFERENCES public.roster_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create RLS policies for roster_shifts
ALTER TABLE public.roster_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can create roster shifts"
  ON public.roster_shifts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can update roster shifts"
  ON public.roster_shifts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can delete roster shifts"
  ON public.roster_shifts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Users can view roster shifts"
  ON public.roster_shifts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create RLS policies for sections
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can create sections"
  ON public.sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can update sections"
  ON public.sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can delete sections"
  ON public.sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Users can view sections"
  ON public.sections
  FOR SELECT
  TO authenticated
  USING (true);

-- Add section column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section UUID REFERENCES public.sections(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roster_versions_week_start ON public.roster_versions(week_start);
CREATE INDEX IF NOT EXISTS idx_roster_shifts_roster_version_id ON public.roster_shifts(roster_version_id);
CREATE INDEX IF NOT EXISTS idx_roster_shifts_user_id ON public.roster_shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_roster_shifts_date ON public.roster_shifts(date);
CREATE INDEX IF NOT EXISTS idx_profiles_section ON public.profiles(section);
