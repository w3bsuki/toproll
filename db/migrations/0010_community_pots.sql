-- Community Pots System
-- Pooled betting game with provably fair winner selection

BEGIN;

-- Main pots table
CREATE TABLE IF NOT EXISTS pots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Community Pot',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'locked', 'settling', 'settled', 'cancelled')),
  entry_cost NUMERIC(10,2) NOT NULL,
  max_tickets INTEGER NOT NULL,
  max_per_user INTEGER NOT NULL DEFAULT 10,
  total_tickets INTEGER NOT NULL DEFAULT 0,
  total_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  commit_hash TEXT,
  reveal_seed TEXT,
  winner_user_id UUID REFERENCES auth.users(id),
  winner_ticket_index INTEGER,
  fill_percent NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN max_tickets > 0 THEN (total_tickets::FLOAT / max_tickets::FLOAT) * 100
      ELSE 0
    END
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ
);

-- Pot entries table
CREATE TABLE IF NOT EXISTS pot_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pot_id UUID NOT NULL REFERENCES pots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  ticket_count INTEGER NOT NULL,
  ticket_start_index INTEGER NOT NULL,
  ticket_end_index INTEGER NOT NULL,
  credits_spent NUMERIC(10,2) NOT NULL,
  ip_hash TEXT,
  device_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pot audit log
CREATE TABLE IF NOT EXISTS pot_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pot_id UUID NOT NULL REFERENCES pots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pots_status ON pots(status);
CREATE INDEX IF NOT EXISTS idx_pots_created_at ON pots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pot_entries_pot_id ON pot_entries(pot_id);
CREATE INDEX IF NOT EXISTS idx_pot_entries_user_id ON pot_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_pot_audit_log_pot_id ON pot_audit_log(pot_id);

-- RLS Policies
ALTER TABLE pots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pot_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pot_audit_log ENABLE ROW LEVEL SECURITY;

-- Pots: Public read, authenticated write
CREATE POLICY "Pots are viewable by everyone"
  ON pots FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create pots"
  ON pots FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Pot entries: Public read, user can insert own
CREATE POLICY "Pot entries are viewable by everyone"
  ON pot_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own pot entries"
  ON pot_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Audit log: Public read for transparency
CREATE POLICY "Audit log viewable by everyone"
  ON pot_audit_log FOR SELECT
  USING (true);

CREATE POLICY "System can write audit log"
  ON pot_audit_log FOR INSERT
  WITH CHECK (true);

-- Add pots to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE pots;
ALTER PUBLICATION supabase_realtime ADD TABLE pot_entries;

-- Update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pot_updated_at_trigger
  BEFORE UPDATE ON pots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMIT;