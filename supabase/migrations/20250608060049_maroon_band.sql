/*
  # Fix profiles RLS policy for user registration

  1. Security Changes
    - Update the INSERT policy on profiles table to properly allow authenticated users to create their own profiles
    - The policy should use auth.uid() in the WITH CHECK clause instead of the USING clause for INSERT operations

  This migration fixes the RLS policy that was preventing new users from creating their profiles during registration.
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new INSERT policy that properly allows users to create their own profiles
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);