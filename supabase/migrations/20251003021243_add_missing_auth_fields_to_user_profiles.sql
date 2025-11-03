ALTER TABLE user_profiles 
ADD COLUMN session_token_hash TEXT,
ADD COLUMN session_expires_at TIMESTAMPTZ,
ADD COLUMN last_login_at TIMESTAMPTZ DEFAULT now();

-- Add index for session token lookup for better performance
CREATE INDEX idx_user_profiles_session_token_hash ON user_profiles(session_token_hash) WHERE session_token_hash IS NOT NULL;;
