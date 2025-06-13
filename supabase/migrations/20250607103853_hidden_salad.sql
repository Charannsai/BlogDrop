/*
  # Create blogs table

  1. New Tables
    - `blogs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (jsonb, for rich text content)
      - `excerpt` (text, nullable)
      - `published` (boolean, default false)
      - `author_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `likes_count` (integer, default 0)
      - `comments_count` (integer, default 0)
      - `views_count` (integer, default 0)

  2. Security
    - Enable RLS on `blogs` table
    - Add policies for reading published blogs and managing own blogs
*/

CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content jsonb NOT NULL,
  excerpt text,
  published boolean DEFAULT false,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  views_count integer DEFAULT 0
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published blogs
CREATE POLICY "Published blogs are viewable by everyone"
  ON blogs
  FOR SELECT
  TO authenticated
  USING (published = true);

-- Allow users to read their own blogs (published or draft)
CREATE POLICY "Users can view own blogs"
  ON blogs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Allow users to insert their own blogs
CREATE POLICY "Users can insert own blogs"
  ON blogs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own blogs
CREATE POLICY "Users can update own blogs"
  ON blogs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- Allow users to delete their own blogs
CREATE POLICY "Users can delete own blogs"
  ON blogs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);