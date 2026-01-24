-- Add link column to features table
ALTER TABLE features 
ADD COLUMN IF NOT EXISTS link TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN features.link IS 'External link URL for the feature';