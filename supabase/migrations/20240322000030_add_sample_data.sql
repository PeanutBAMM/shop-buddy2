-- Insert sample data for development and testing

-- Insert sample users
INSERT INTO users (id, email, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', 'Thomas van der Berg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample shopping lists
INSERT INTO shopping_lists (id, user_id, name, shared) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Weekboodschappen', false),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Albert Heijn', false),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Jumbo', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample shopping items
INSERT INTO shopping_items (list_id, name, quantity, completed) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Melk', '2 liter', false),
('550e8400-e29b-41d4-a716-446655440001', 'Brood', '1 heel', true),
('550e8400-e29b-41d4-a716-446655440001', 'Eieren', '12 stuks', false),
('550e8400-e29b-41d4-a716-446655440001', 'Kaas', '200g', false),
('550e8400-e29b-41d4-a716-446655440001', 'Appels', '1 kg', true),
('550e8400-e29b-41d4-a716-446655440002', 'Yoghurt', '4 stuks', false),
('550e8400-e29b-41d4-a716-446655440002', 'Bananen', '6 stuks', false),
('550e8400-e29b-41d4-a716-446655440003', 'Pasta', '500g', false),
('550e8400-e29b-41d4-a716-446655440003', 'Tomatensaus', '1 pot', false)
ON CONFLICT DO NOTHING;

-- Insert sample recipes
INSERT INTO recipes (user_id, name, image_url, cook_time, servings, difficulty, ingredients, instructions, category) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Spaghetti Carbonara', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80', '20 min', 4, 'Gemiddeld', '["Spaghetti", "Eieren", "Parmezaanse kaas", "Pancetta", "Zwarte peper", "Zout"]', '["Kook de spaghetti", "Bak de pancetta", "Meng eieren met kaas", "Combineer alles"]', 'Diner'),
('550e8400-e29b-41d4-a716-446655440000', 'Pannenkoeken', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&q=80', '15 min', 2, 'Makkelijk', '["Bloem", "Melk", "Eieren", "Zout", "Boter"]', '["Meng alle ingrediënten", "Bak in de pan", "Serveer warm"]', 'Ontbijt'),
('550e8400-e29b-41d4-a716-446655440000', 'Caesar Salade', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80', '10 min', 2, 'Makkelijk', '["Romeinse sla", "Parmezaanse kaas", "Croutons", "Caesar dressing", "Kip"]', '["Was de sla", "Grill de kip", "Meng met dressing", "Garneer met kaas"]', 'Lunch')
ON CONFLICT DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory (user_id, name, quantity, unit, category, expiry_date, low_stock) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Melk', 1, 'liter', 'Zuivel', '2024-03-25', true),
('550e8400-e29b-41d4-a716-446655440000', 'Brood', 1, 'heel', 'Droog', '2024-03-22', false),
('550e8400-e29b-41d4-a716-446655440000', 'Appels', 5, 'stuks', 'Fruit', '2024-03-30', false),
('550e8400-e29b-41d4-a716-446655440000', 'Yoghurt', 2, 'stuks', 'Zuivel', '2024-03-28', true),
('550e8400-e29b-41d4-a716-446655440000', 'Pasta', 3, 'pakken', 'Droog', '2025-01-01', false),
('550e8400-e29b-41d4-a716-446655440000', 'Tomaten', 4, 'stuks', 'Groenten', '2024-03-24', false)
ON CONFLICT DO NOTHING;

-- Insert sample household members
INSERT INTO household_members (user_id, name, type, avatar_type, avatar_url, age, relationship) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Emma', 'person', 'default', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 32, 'Partner'),
('550e8400-e29b-41d4-a716-446655440000', 'Liam', 'person', 'child', 'https://api.dicebear.com/7.x/big-smile/svg?seed=Liam', 8, 'Kind'),
('550e8400-e29b-41d4-a716-446655440000', 'Sophie', 'person', 'baby', 'https://api.dicebear.com/7.x/bottts/svg?seed=Sophie', 2, 'Kind'),
('550e8400-e29b-41d4-a716-446655440000', 'Max', 'pet', 'pet', 'https://api.dicebear.com/7.x/bottts/svg?seed=Max', 3, 'Hond')
ON CONFLICT DO NOTHING;

-- Insert sample loyalty cards
INSERT INTO loyalty_cards (user_id, name, card_number) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Albert Heijn', '1234567890123456'),
('550e8400-e29b-41d4-a716-446655440000', 'Jumbo', '9876543210987654'),
('550e8400-e29b-41d4-a716-446655440000', 'Lidl Plus', '5555666677778888')
ON CONFLICT DO NOTHING;
