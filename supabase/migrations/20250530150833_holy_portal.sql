/*
  # Create blogs table and related security policies

  1. New Tables
    - `blogs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `title` (text)
      - `slug` (text)
      - `content` (jsonb array)
      - `is_published` (boolean)
      - `random_url` (text)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `blogs` table
    - Add policies for:
      - Users can read their own blogs
      - Users can read published blogs
      - Users can create their own blogs
      - Users can update their own blogs
      - Users can delete their own blogs

  3. Indexes
    - Primary key on id
    - Index on user_id for faster lookups
    - Unique index on random_url
    - Index on slug for faster URL lookups
*/

-- Create the blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content jsonb[] DEFAULT '{}',
    is_published boolean DEFAULT false,
    random_url text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS blogs_user_id_idx ON public.blogs(user_id);
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON public.blogs(slug);

-- Enable Row Level Security
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Policies

-- Allow users to read their own blogs
CREATE POLICY "Users can read own blogs"
ON public.blogs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow anyone to read published blogs
CREATE POLICY "Anyone can read published blogs"
ON public.blogs
FOR SELECT
TO public
USING (is_published = true);

-- Allow users to create their own blogs
CREATE POLICY "Users can create own blogs"
ON public.blogs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own blogs
CREATE POLICY "Users can update own blogs"
ON public.blogs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own blogs
CREATE POLICY "Users can delete own blogs"
ON public.blogs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);