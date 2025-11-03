-- Add balance column to user_profiles
-- Adds credits balance tracking for user accounts
-- Safe to re-run (IF NOT EXISTS used where possible)

BEGIN;

-- Add balance column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS balance numeric(10,2) DEFAULT 0.00;

-- Create index for balance queries (useful for leaderboards, etc.)
CREATE INDEX IF NOT EXISTS user_profiles_balance_idx ON user_profiles(balance DESC);

-- Update existing users to have a default balance
UPDATE user_profiles
SET balance = 0.00
WHERE balance IS NULL;

COMMIT;
