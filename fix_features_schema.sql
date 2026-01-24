-- Comprehensive database schema fix for features table
-- This script ensures all required columns exist in the features table

-- Check if features table exists, create if it doesn't
CREATE TABLE IF NOT EXISTS features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT,
    sort_order INTEGER,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add link column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'features' AND column_name = 'link') THEN
        ALTER TABLE features ADD COLUMN link TEXT;
        COMMENT ON COLUMN features.link IS 'External link URL for the feature';
        RAISE NOTICE 'Added link column to features table';
    END IF;
    
    -- Add sort_order column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'features' AND column_name = 'sort_order') THEN
        ALTER TABLE features ADD COLUMN sort_order INTEGER;
        COMMENT ON COLUMN features.sort_order IS 'Sort order for feature display';
        RAISE NOTICE 'Added sort_order column to features table';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'features' AND column_name = 'status') THEN
        ALTER TABLE features ADD COLUMN status TEXT;
        COMMENT ON COLUMN features.status IS 'Feature status (e.g., active, inactive)';
        RAISE NOTICE 'Added status column to features table';
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'features' AND column_name = 'description') THEN
        ALTER TABLE features ADD COLUMN description TEXT;
        COMMENT ON COLUMN features.description IS 'Feature description text';
        RAISE NOTICE 'Added description column to features table';
    END IF;
END
$$;

-- Create or replace updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_features_updated_at 
    BEFORE UPDATE ON features 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add table comments
COMMENT ON TABLE features IS 'Application features and their metadata';
COMMENT ON COLUMN features.id IS 'Unique identifier for the feature';
COMMENT ON COLUMN features.title IS 'Feature title';
COMMENT ON COLUMN features.description IS 'Feature description';
COMMENT ON COLUMN features.status IS 'Feature status';
COMMENT ON COLUMN features.sort_order IS 'Display sort order';
COMMENT ON COLUMN features.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN features.updated_at IS 'Record last update timestamp';

-- Display final table structure
\d features