-- Add last_seen timestamp to user_profiles
-- Tracks when user was last active on the platform
-- Safe to re-run (IF NOT EXISTS used where possible)

BEGIN;

-- Add last_seen column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();

-- Create index for performance on last_seen queries
CREATE INDEX IF NOT EXISTS user_profiles_last_seen_idx ON user_profiles(last_seen);

-- Update existing users to have a last_seen timestamp
UPDATE user_profiles 
SET last_seen = updated_at 
WHERE last_seen IS NULL;

COMMIT;