CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT DEFAULT '1',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  cook_time TEXT NOT NULL,
  servings INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Makkelijk', 'Gemiddeld', 'Moeilijk')),
  ingredients JSONB NOT NULL,
  instructions JSONB,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  expiry_date DATE,
  low_stock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE users;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'shopping_lists'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE shopping_lists;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'shopping_items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE shopping_items;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'recipes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'inventory'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
    END IF;
END $;

INSERT INTO users (id, email, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', 'Demo User')
ON CONFLICT (email) DO NOTHING;

INSERT INTO shopping_lists (id, user_id, name, shared) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Weekboodschappen', true),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Feestje zaterdag', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO shopping_items (list_id, name, quantity, completed) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Melk', '1L', false),
('550e8400-e29b-41d4-a716-446655440001', 'Brood', '2 stuks', true),
('550e8400-e29b-41d4-a716-446655440001', 'Appels', '1kg', false),
('550e8400-e29b-41d4-a716-446655440002', 'Chips', '3 zakken', false),
('550e8400-e29b-41d4-a716-446655440002', 'Frisdrank', '2L', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO recipes (user_id, name, image_url, cook_time, servings, difficulty, ingredients, category) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Spaghetti Carbonara', 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&q=80', '20 min', 4, 'Makkelijk', '["Spaghetti", "Eieren", "Spek", "Parmezaanse kaas", "Zwarte peper"]', 'Diner'),
('550e8400-e29b-41d4-a716-446655440000', 'Avocado Toast', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=80', '5 min', 2, 'Makkelijk', '["Brood", "Avocado", "Limoen", "Zout", "Peper"]', 'Ontbijt'),
('550e8400-e29b-41d4-a716-446655440000', 'Kip Teriyaki', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', '30 min', 3, 'Gemiddeld', '["Kipfilet", "Teriyaki saus", "Rijst", "Broccoli", "Sesamzaad"]', 'Diner')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (user_id, name, quantity, unit, category, expiry_date, low_stock) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Melk', 2, 'L', 'Zuivel', '2024-01-15', false),
('550e8400-e29b-41d4-a716-446655440000', 'Appels', 1, 'kg', 'Fruit', '2024-01-20', true),
('550e8400-e29b-41d4-a716-446655440000', 'Brood', 1, 'stuks', 'Droog', '2024-01-12', false),
('550e8400-e29b-41d4-a716-446655440000', 'Eieren', 3, 'stuks', 'Zuivel', null, true)
ON CONFLICT (id) DO NOTHING;