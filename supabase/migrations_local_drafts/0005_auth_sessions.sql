-- Session management for Steam-authenticated users
-- Adds session tracking columns to user_profiles so we can manage Steam SSO cookies server-side
-- Safe to re-run and idempotent for Supabase migrations

BEGIN;

ALTER TABLE user_profiles
        ADD COLUMN IF NOT EXISTS session_token_hash text,
        ADD COLUMN IF NOT EXISTS session_expires_at timestamptz,
        ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

CREATE INDEX IF NOT EXISTS user_profiles_session_token_hash_idx
        ON user_profiles(session_token_hash)
        WHERE session_token_hash IS NOT NULL;

COMMIT;
