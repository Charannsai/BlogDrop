/*
  # Add cover_url column to profiles table

  1. Changes
    - Add `cover_url` column to profiles table for cover images
    - This allows users to upload and display cover images on their profiles

  2. Security
    - No additional RLS policies needed as existing policies cover this column
*/

-- Add cover_url column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cover_url text;
  END IF;
END $$;