/*
  # Create profiles table and configure authentication

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users, primary key)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `display_name` (text)
      - `subdomain` (text, unique)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for:
      - Public read access to all profiles
      - Users can insert their own profile
      - Users can update their own profile

  3. Triggers
    - Create trigger to automatically create profile on user signup
*/

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  display_name text,
  subdomain text unique
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, subdomain)
  values (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'subdomain');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;