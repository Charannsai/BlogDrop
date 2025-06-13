/*
  # Add tags column to blogs table

  1. Changes
    - Add `tags` column to blogs table as text array
    - This allows storing multiple tags per blog post

  2. Security
    - No additional RLS policies needed as existing policies cover this column
*/

-- Add tags column to blogs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blogs' AND column_name = 'tags'
  ) THEN
    ALTER TABLE blogs ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Create index for better tag search performance
CREATE INDEX IF NOT EXISTS idx_blogs_tags ON blogs USING GIN (tags);