-- Safe migration: add sort_order column to exercises if it doesn't exist
-- This fixes the 403 error on /api/workouts caused by missing column in existing databases

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercises' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE exercises ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;
