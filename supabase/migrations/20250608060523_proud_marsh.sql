/*
  # Create missing profiles for existing users

  1. Changes
    - Create profiles for any authenticated users who don't have profiles yet
    - This handles cases where users signed up but profile creation failed due to RLS issues

  2. Security
    - Only creates profiles for users who exist in auth.users but not in profiles
    - Uses safe INSERT with conflict handling
*/

-- Create profiles for existing users who don't have profiles
INSERT INTO profiles (id, username, full_name, avatar_url, bio, website, twitter, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', 'user_' || substr(au.id::text, 1, 8)) as username,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  NULL as bio,
  NULL as website,
  NULL as twitter,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Also handle username conflicts by making them unique
UPDATE profiles 
SET username = username || '_' || substr(id::text, 1, 4)
WHERE id IN (
  SELECT id FROM (
    SELECT id, username, 
           ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as rn
    FROM profiles
  ) t WHERE rn > 1
);