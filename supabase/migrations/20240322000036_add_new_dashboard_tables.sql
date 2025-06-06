-- Create new tables for dynamic dashboard features

-- Daily hero content table
CREATE TABLE IF NOT EXISTS daily_hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  hero_image_url TEXT NOT NULL,
  header_text TEXT NOT NULL,
  subtext TEXT NOT NULL,
  action_button_text TEXT,
  action_button_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User behavior logs table
CREATE TABLE IF NOT EXISTS user_behavior_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_data JSONB,
  frequency_count INTEGER DEFAULT 1,
  last_performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assistant categories table
CREATE TABLE IF NOT EXISTS assistant_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_icon TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB,
  display_order INTEGER DEFAULT 0,
  is_personalized BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product suggestions table
CREATE TABLE IF NOT EXISTS product_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_icon TEXT,
  category_color TEXT,
  image_url TEXT,
  suggested_list_id UUID REFERENCES shopping_lists(id),
  prediction_score DECIMAL(3,2) DEFAULT 0.5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add hero images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('hero-images', 'hero-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for hero images
DROP POLICY IF EXISTS "Public access to hero images" ON storage.objects;
CREATE POLICY "Public access to hero images" ON storage.objects
FOR SELECT USING (bucket_id = 'hero-images');

DROP POLICY IF EXISTS "Admin can upload hero images" ON storage.objects;
CREATE POLICY "Admin can upload hero images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'hero-images');

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE daily_hero_content;
ALTER PUBLICATION supabase_realtime ADD TABLE user_behavior_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE assistant_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE product_suggestions;

-- Insert mock data for daily hero content
INSERT INTO daily_hero_content (date, hero_image_url, header_text, subtext, action_button_text, action_button_data) VALUES 
(CURRENT_DATE, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', 'Deze week in de bonus bij AH!', 'Verse groenten en fruit met 25% korting. Voeg ze nu toe aan je boodschappenlijst.', 'Voeg toe aan boodschappenlijst', '{"items": ["Appels", "Bananen", "Wortels", "Broccoli"]}'),
(CURRENT_DATE + INTERVAL '1 day', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 'Nieuwe recepten ontdekken', 'Laat onze AI je helpen met het plannen van je maaltijden voor deze week.', 'Plan maaltijden', '{"action": "meal_planning"}'),
(CURRENT_DATE + INTERVAL '2 days', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80', 'Slimme voorraad beheer', 'Scan je bonnetjes en houd automatisch je voorraad bij.', 'Scan bonnetje', '{"action": "scan_receipt"}')
ON CONFLICT (date) DO NOTHING;

-- Insert mock user behavior logs
INSERT INTO user_behavior_logs (user_id, action_type, action_data, frequency_count, last_performed_at) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'add_to_list', '{"list_name": "Weekboodschappen", "items_count": 5}', 15, NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440000', 'generate_recipe', '{"cuisine": "Italian", "difficulty": "easy"}', 8, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440000', 'update_inventory', '{"method": "manual", "items_count": 3}', 12, NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert mock assistant categories
INSERT INTO assistant_categories (user_id, category_name, category_icon, action_type, action_data, display_order, is_personalized, usage_count) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Snel toevoegen', 'plus', 'quick_add', '{"default_list": "Weekboodschappen"}', 1, true, 15),
('550e8400-e29b-41d4-a716-446655440000', 'Plan maaltijd', 'calendar', 'meal_planning', '{"preferences": ["quick", "healthy"]}', 2, true, 8),
('550e8400-e29b-41d4-a716-446655440000', 'Bekijk uitgaven', 'euro', 'view_expenses', '{"period": "week"}', 3, true, 5),
('550e8400-e29b-41d4-a716-446655440000', 'Winkelijst toevoegen', 'shopping-cart', 'add_to_list', '{}', 4, false, 0),
('550e8400-e29b-41d4-a716-446655440000', 'Recept genereren', 'book-open', 'generate_recipe', '{}', 5, false, 0),
('550e8400-e29b-41d4-a716-446655440000', 'Voorraad bijwerken', 'camera', 'update_inventory', '{"method": "camera"}', 6, false, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert mock product suggestions
INSERT INTO product_suggestions (user_id, product_name, category, category_icon, category_color, image_url, suggested_list_id, prediction_score) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Melk', 'Zuivel', 'milk', '#3B82F6', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&q=60', '550e8400-e29b-41d4-a716-446655440001', 0.85),
('550e8400-e29b-41d4-a716-446655440000', 'Brood', 'Bakkerij', 'wheat', '#F59E0B', 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=100&q=60', '550e8400-e29b-41d4-a716-446655440001', 0.78),
('550e8400-e29b-41d4-a716-446655440000', 'Bananen', 'Fruit', 'banana', '#10B981', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&q=60', '550e8400-e29b-41d4-a716-446655440001', 0.72),
('550e8400-e29b-41d4-a716-446655440000', 'Kip', 'Vlees', 'drumstick', '#EF4444', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=100&q=60', '550e8400-e29b-41d4-a716-446655440001', 0.65)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_user_id ON user_behavior_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_action_type ON user_behavior_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_assistant_categories_user_id ON assistant_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_categories_display_order ON assistant_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_product_suggestions_user_id ON product_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_product_suggestions_prediction_score ON product_suggestions(prediction_score DESC);
CREATE INDEX IF NOT EXISTS idx_daily_hero_content_date ON daily_hero_content(date);
