-- Community Pots System Tables
-- Creates the complete database schema for community pots

-- Main pots table
CREATE TABLE IF NOT EXISTS pots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL CHECK (status IN ('open', 'locked', 'settling', 'settled', 'cancelled')),
  entry_cost numeric NOT NULL CHECK (entry_cost > 0),
  max_tickets integer NOT NULL CHECK (max_tickets > 0),
  max_per_user integer NOT NULL DEFAULT 10,
  total_tickets integer NOT NULL DEFAULT 0,
  total_value numeric NOT NULL DEFAULT 0,
  commit_hash text,
  reveal_seed text,
  winner_user_id uuid REFERENCES user_profiles(user_id),
  winner_ticket_index integer,
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  CONSTRAINT valid_winner CHECK (
    (status IN ('settled', 'cancelled') AND winner_user_id IS NOT NULL)
    OR status NOT IN ('settled', 'cancelled')
  ),
  CONSTRAINT non_negative_tickets CHECK (total_tickets >= 0),
  CONSTRAINT non_negative_value CHECK (total_value >= 0)
);

-- Pot entries table (tracks user participation)
CREATE TABLE IF NOT EXISTS pot_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pot_id uuid NOT NULL REFERENCES pots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(user_id),
  ticket_count integer NOT NULL CHECK (ticket_count > 0),
  credits_spent numeric NOT NULL CHECK (credits_spent > 0),
  ticket_start_index integer NOT NULL CHECK (ticket_start_index >= 0),
  ticket_end_index integer NOT NULL CHECK (ticket_end_index >= 0),
  ip_hash text,
  device_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_ticket_range CHECK (ticket_end_index >= ticket_start_index),
  CONSTRAINT positive_ticket_count CHECK (ticket_count = (ticket_end_index - ticket_start_index + 1))
);

-- Audit trail for compliance and transparency
CREATE TABLE IF NOT EXISTS pots_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pot_id uuid NOT NULL REFERENCES pots(id),
  action text NOT NULL,
  actor_id uuid REFERENCES user_profiles(user_id),
  reason text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS pots_status_idx ON pots(status, created_at DESC);
CREATE INDEX IF NOT EXISTS pots_expires_at_idx ON pots(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS pot_entries_pot_user_idx ON pot_entries(pot_id, user_id);
CREATE INDEX IF NOT EXISTS pot_entries_user_idx ON pot_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS pot_entries_pot_idx ON pot_entries(pot_id, created_at);
CREATE INDEX IF NOT EXISTS pots_audit_pot_idx ON pots_audit(pot_id, created_at);

-- Enable Row Level Security
ALTER TABLE pots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pot_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pots_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view active pots
CREATE POLICY pots_select_all ON pots FOR SELECT USING (true);

-- Everyone can view entries (for transparency)
CREATE POLICY pot_entries_select_all ON pot_entries FOR SELECT USING (true);

-- Authenticated users can insert entries for themselves
CREATE POLICY pot_entries_insert_own ON pot_entries
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only service role can modify pots (handled via API)
-- No update policies - pots are modified through service role only

-- Audit logs are read-only for transparency
CREATE POLICY pots_audit_select_all ON pots_audit FOR SELECT USING (true);

-- Realtime publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE pots;
ALTER PUBLICATION supabase_realtime ADD TABLE pot_entries;

-- Triggers for updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pots_updated_at
    BEFORE UPDATE ON pots
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();;
