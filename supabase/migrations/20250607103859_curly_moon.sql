/*
  # Create likes table

  1. New Tables
    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `blog_id` (uuid, references blogs)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `likes` table
    - Add policies for managing likes
    - Add unique constraint to prevent duplicate likes
*/

CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, blog_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Allow users to read all likes
CREATE POLICY "Likes are viewable by everyone"
  ON likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own likes
CREATE POLICY "Users can insert own likes"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
CREATE POLICY "Users can delete own likes"
  ON likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);