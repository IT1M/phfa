-- Migration: Add metadata column to visitors table if not exists
-- This migration ensures the visitors table has the metadata column
-- required for the Excel export functionality

-- Add metadata column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'visitors' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE visitors 
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        
        RAISE NOTICE 'Added metadata column to visitors table';
    ELSE
        RAISE NOTICE 'Metadata column already exists in visitors table';
    END IF;
END $$;

-- Create index on metadata for better query performance
CREATE INDEX IF NOT EXISTS idx_visitors_metadata_language 
ON visitors ((metadata->>'language'));

CREATE INDEX IF NOT EXISTS idx_visitors_metadata_region 
ON visitors ((metadata->>'region'));

CREATE INDEX IF NOT EXISTS idx_visitors_metadata_city 
ON visitors ((metadata->>'city'));

CREATE INDEX IF NOT EXISTS idx_visitors_metadata_device 
ON visitors ((metadata->>'device_type'));

-- Update existing visitors with default metadata if null
UPDATE visitors 
SET metadata = jsonb_build_object(
    'language', 'en',
    'device_type', 'unknown',
    'notifications_enabled', 'false'
)
WHERE metadata IS NULL OR metadata = '{}'::jsonb;

-- Add comment to metadata column
COMMENT ON COLUMN visitors.metadata IS 'Stores visitor preferences and tracking data: language, device_type, city, region, notifications_enabled, etc.';

RAISE NOTICE 'Visitor metadata migration completed successfully';
