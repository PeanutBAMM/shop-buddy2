CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('person', 'pet')),
  avatar_type TEXT NOT NULL CHECK (avatar_type IN ('default', 'baby', 'child', 'pet', 'custom')),
  avatar_url TEXT,
  age INTEGER,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS avatar_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  avatar_type TEXT NOT NULL CHECK (avatar_type IN ('default', 'baby', 'child', 'pet', 'custom')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS default_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_type TEXT NOT NULL CHECK (avatar_type IN ('person', 'baby', 'child', 'pet')),
  avatar_url TEXT NOT NULL,
  seed TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO default_avatars (name, avatar_type, avatar_url, seed) VALUES
('Felix', 'person', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', 'Felix'),
('Aneka', 'person', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', 'Aneka'),
('Mia', 'person', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', 'Mia'),
('Oliver', 'person', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver', 'Oliver'),
('Emma', 'person', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 'Emma'),
('Lucas', 'person', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas', 'Lucas'),
('Sophie', 'person', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', 'Sophie'),
('Noah', 'person', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah', 'Noah'),
('Baby Emma', 'baby', 'https://api.dicebear.com/7.x/avataaars/svg?seed=BabyEmma&accessories=round&clothingGraphic=bear', 'BabyEmma'),
('Baby Max', 'baby', 'https://api.dicebear.com/7.x/avataaars/svg?seed=BabyMax&accessories=round&clothingGraphic=bear', 'BabyMax'),
('Baby Lily', 'baby', 'https://api.dicebear.com/7.x/avataaars/svg?seed=BabyLily&accessories=round&clothingGraphic=bear', 'BabyLily'),
('Baby Sam', 'baby', 'https://api.dicebear.com/7.x/avataaars/svg?seed=BabySam&accessories=round&clothingGraphic=bear', 'BabySam'),
('Kind Tim', 'child', 'https://api.dicebear.com/7.x/avataaars/svg?seed=KindTim&top=shortHairShortFlat', 'KindTim'),
('Kind Anna', 'child', 'https://api.dicebear.com/7.x/avataaars/svg?seed=KindAnna&top=longHairStraight', 'KindAnna'),
('Kind Ben', 'child', 'https://api.dicebear.com/7.x/avataaars/svg?seed=KindBen&top=shortHairShortCurly', 'KindBen'),
('Kind Lisa', 'child', 'https://api.dicebear.com/7.x/avataaars/svg?seed=KindLisa&top=longHairCurly', 'KindLisa'),
('Max', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetMax&accessories=prescription02&clothingGraphic=bear', 'PetMax'),
('Bella', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetBella&accessories=prescription02&clothingGraphic=bear', 'PetBella'),
('Charlie', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetCharlie&accessories=prescription02&clothingGraphic=bear', 'PetCharlie'),
('Luna', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetLuna&accessories=prescription02&clothingGraphic=bear', 'PetLuna'),
('Rocky', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetRocky&accessories=prescription02&clothingGraphic=bear', 'PetRocky'),
('Daisy', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetDaisy&accessories=prescription02&clothingGraphic=bear', 'PetDaisy'),
('Buddy', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetBuddy&accessories=prescription02&clothingGraphic=bear', 'PetBuddy'),
('Molly', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetMolly&accessories=prescription02&clothingGraphic=bear', 'PetMolly')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('household-avatars', 'household-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload household avatars" ON storage.objects;
CREATE POLICY "Users can upload household avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'household-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view household avatars" ON storage.objects;
CREATE POLICY "Users can view household avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'household-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update household avatars" ON storage.objects;
CREATE POLICY "Users can update household avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'household-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete household avatars" ON storage.objects;
CREATE POLICY "Users can delete household avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'household-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

alter publication supabase_realtime add table household_members;
alter publication supabase_realtime add table avatar_metadata;
alter publication supabase_realtime add table default_avatars;