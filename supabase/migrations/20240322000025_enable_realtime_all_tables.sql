-- Enable realtime for all tables (only if not already added)
DO $
BEGIN
    -- Enable realtime for shopping_lists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'shopping_lists'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE shopping_lists;
    END IF;
    
    -- Enable realtime for shopping_items
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'shopping_items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE shopping_items;
    END IF;
    
    -- Enable realtime for inventory
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'inventory'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
    END IF;
    
    -- Enable realtime for recipes
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'recipes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
    END IF;
    
    -- Enable realtime for household_members
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'household_members'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE household_members;
    END IF;
    
    -- Enable realtime for loyalty_cards
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'loyalty_cards'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE loyalty_cards;
    END IF;
END $;