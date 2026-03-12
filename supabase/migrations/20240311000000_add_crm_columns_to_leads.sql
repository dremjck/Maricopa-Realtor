-- Add CRM columns to leads table (if they don't already exist)
-- Run this migration if your leads table was created by the scraper without these columns.

-- Add phone_number (nullable text)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_number text;

-- Add contacted (boolean, default false)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contacted boolean DEFAULT false;

-- Add status (text, default 'new')
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';

-- Add notes (nullable text)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes text;

-- Add created_at (timestamptz)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Add updated_at (timestamptz)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Optional: Create trigger to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS: Allow authenticated users to read and update leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can select all leads
DROP POLICY IF EXISTS "Authenticated users can read leads" ON leads;
CREATE POLICY "Authenticated users can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can update leads (for CRM fields)
DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
