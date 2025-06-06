CREATE TABLE IF NOT EXISTS loyalty_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  card_number TEXT NOT NULL,
  image_url TEXT,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('loyalty-cards', 'loyalty-cards', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload loyalty card images" ON storage.objects;
CREATE POLICY "Users can upload loyalty card images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'loyalty-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view loyalty card images" ON storage.objects;
CREATE POLICY "Users can view loyalty card images" ON storage.objects
FOR SELECT USING (bucket_id = 'loyalty-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update loyalty card images" ON storage.objects;
CREATE POLICY "Users can update loyalty card images" ON storage.objects
FOR UPDATE USING (bucket_id = 'loyalty-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete loyalty card images" ON storage.objects;
CREATE POLICY "Users can delete loyalty card images" ON storage.objects
FOR DELETE USING (bucket_id = 'loyalty-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

alter publication supabase_realtime add table loyalty_cards;

-- Insert mock data for loyalty cards
INSERT INTO loyalty_cards (user_id, name, card_number, image_url, barcode) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Albert Heijn', '1234567890123456', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80', '1234567890123456'),
('550e8400-e29b-41d4-a716-446655440000', 'Jumbo', '0987654321098765', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80', '0987654321098765'),
('550e8400-e29b-41d4-a716-446655440000', 'Lidl', '1122334455667788', null, null),
('550e8400-e29b-41d4-a716-446655440000', 'PLUS', '9988776655443322', null, '9988776655443322')
ON CONFLICT (id) DO NOTHING;

-- Insert mock data for household members
INSERT INTO household_members (user_id, name, type, avatar_type, avatar_url, age, relationship) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Emma', 'person', 'default', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 28, 'Partner'),
('550e8400-e29b-41d4-a716-446655440000', 'Max', 'pet', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetMax&accessories=prescription02&clothingGraphic=bear', 3, 'Hond'),
('550e8400-e29b-41d4-a716-446655440000', 'Sophie', 'person', 'child', 'https://api.dicebear.com/7.x/avataaars/svg?seed=KindSophie&top=longHairCurly', 8, 'Dochter'),
('550e8400-e29b-41d4-a716-446655440000', 'Luna', 'pet', 'pet', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PetLuna&accessories=prescription02&clothingGraphic=bear', 2, 'Kat')
ON CONFLICT (id) DO NOTHING;
