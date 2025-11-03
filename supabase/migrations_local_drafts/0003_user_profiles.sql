-- User Profiles with Steam Integration
-- Creates user_profiles table linked to auth.users via user_id
-- Includes gamification stats for casino features
-- Safe to re-run (IF NOT EXISTS used where possible)

BEGIN;

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  steam_id text UNIQUE NOT NULL,
  username text NOT NULL,
  avatar_url text,
  steam_profile_url text,
  total_wagered numeric(10,2) DEFAULT 0,
  total_profit numeric(10,2) DEFAULT 0,
  win_rate numeric(5,2) DEFAULT 0,
  biggest_win numeric(10,2) DEFAULT 0,
  case_battle_wins integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Keep data fresh
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_set_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS user_profiles_steam_id_idx ON user_profiles(steam_id);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON user_profiles(created_at);

COMMIT;

-- Enable RLS and create policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY IF NOT EXISTS select_own_profile ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own profile row
CREATE POLICY IF NOT EXISTS insert_own_profile ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile row
CREATE POLICY IF NOT EXISTS update_own_profile ON user_profiles
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
