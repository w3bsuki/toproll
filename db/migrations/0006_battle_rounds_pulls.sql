-- Case Battles: rounds and pulls (Oct 2025)
-- Safe to re-run: uses IF NOT EXISTS, creates RLS policies.

BEGIN;

-- Sequence of cases per battle
CREATE TABLE IF NOT EXISTS battle_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Per-round metadata for a battle
CREATE TABLE IF NOT EXISTS battle_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  round_index integer NOT NULL,
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  server_seed_hash text NOT NULL,
  revealed_server_seed text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (battle_id, round_index)
);

-- Each participant's pull per round (provably-fair trace)
CREATE TABLE IF NOT EXISTS battle_pulls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES battle_rounds(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES battle_participants(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES case_items(id) ON DELETE RESTRICT,
  client_seed text NOT NULL,
  nonce bigint NOT NULL,
  hash text NOT NULL,
  mapped_roll numeric(10,8) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (round_id, participant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS battle_cases_battle_idx ON battle_cases(battle_id, order_index);
CREATE INDEX IF NOT EXISTS battle_rounds_battle_idx ON battle_rounds(battle_id, round_index);
CREATE INDEX IF NOT EXISTS battle_pulls_round_idx ON battle_pulls(round_id);
CREATE INDEX IF NOT EXISTS battle_pulls_participant_round_idx ON battle_pulls(participant_id, round_id);

COMMIT;

-- Enable RLS
ALTER TABLE battle_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_pulls ENABLE ROW LEVEL SECURITY;

-- Public read for transparency
CREATE POLICY IF NOT EXISTS battle_cases_select_all ON battle_cases FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS battle_rounds_select_all ON battle_rounds FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS battle_pulls_select_all ON battle_pulls FOR SELECT USING (true);

-- Insert by authenticated participants/creators only (conservative MVP)
CREATE POLICY IF NOT EXISTS battle_cases_insert_by_creator ON battle_cases
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM battles WHERE id = battle_id
    )
  );

CREATE POLICY IF NOT EXISTS battle_rounds_insert_by_creator ON battle_rounds
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM battles WHERE id = battle_id
    )
  );

CREATE POLICY IF NOT EXISTS battle_pulls_insert_by_participant ON battle_pulls
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT bp.user_id FROM battle_participants bp WHERE bp.id = participant_id
    )
  );

