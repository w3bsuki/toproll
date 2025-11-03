-- Create table for storing auth nonces (CSRF tokens for Steam OpenID)
-- This is required for serverless environments where in-memory storage doesn't persist
CREATE TABLE IF NOT EXISTS auth_nonces (
    nonce TEXT PRIMARY KEY,
    return_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for efficient cleanup of expired nonces
CREATE INDEX IF NOT EXISTS idx_auth_nonces_expires_at ON auth_nonces(expires_at);

-- Function to automatically cleanup expired nonces
CREATE OR REPLACE FUNCTION cleanup_expired_nonces()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM auth_nonces WHERE expires_at < NOW();
END;
$$;
