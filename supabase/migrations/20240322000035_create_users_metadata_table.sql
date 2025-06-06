CREATE TABLE IF NOT EXISTS users_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  registration_source TEXT NOT NULL CHECK (registration_source IN ('Google', 'Email')),
  onboarding_status BOOLEAN DEFAULT FALSE,
  preferences_json JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_metadata_user_id ON users_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_users_metadata_email ON users_metadata(email);

-- Enable realtime (only if not already added)
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'users_metadata'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE users_metadata;
    END IF;
END $;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_metadata_updated_at BEFORE UPDATE ON users_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
