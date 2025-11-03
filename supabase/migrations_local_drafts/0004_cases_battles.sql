-- CS2 Cases and Battles System
-- Creates tables for cases, items, case openings, battles, and battle participants
-- Safe to re-run (IF NOT EXISTS used where possible)

BEGIN;

-- CS2 Cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  image_url text,
  price numeric(10,2) NOT NULL CHECK (price > 0),
  item_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Case items with rarity and probabilities
CREATE TABLE IF NOT EXISTS case_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name text NOT NULL,
  market_name text NOT NULL,
  image_url text NOT NULL,
  rarity text NOT NULL, -- 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Contraband'
  probability numeric(5,4) NOT NULL CHECK (probability > 0 AND probability <= 100),
  market_value numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Case opening history
CREATE TABLE IF NOT EXISTS case_openings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  opened_item_id uuid NOT NULL REFERENCES case_items(id) ON DELETE CASCADE,
  cost numeric(10,2) NOT NULL,
  profit numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Battle rooms
CREATE TABLE IF NOT EXISTS battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'completed', 'cancelled'
  max_participants integer NOT NULL DEFAULT 2 CHECK (max_participants >= 2),
  current_participants integer NOT NULL DEFAULT 0,
  total_pot numeric(10,2) DEFAULT 0,
  winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Battle participants
CREATE TABLE IF NOT EXISTS battle_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position integer NOT NULL, -- 1, 2, 3, 4 for ordering
  joined_at timestamptz DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

-- Battle results (items won by each participant)
CREATE TABLE IF NOT EXISTS battle_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES battle_participants(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES case_items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS case_openings_user_id_idx ON case_openings(user_id);
CREATE INDEX IF NOT EXISTS case_openings_created_at_idx ON case_openings(created_at DESC);
CREATE INDEX IF NOT EXISTS battles_status_idx ON battles(status);
CREATE INDEX IF NOT EXISTS battles_created_at_idx ON battles(created_at DESC);
CREATE INDEX IF NOT EXISTS battle_participants_battle_id_idx ON battle_participants(battle_id);
CREATE INDEX IF NOT EXISTS battle_results_battle_id_idx ON battle_results(battle_id);

-- Update triggers
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS cases_set_updated_at ON cases;
CREATE TRIGGER cases_set_updated_at
BEFORE UPDATE ON cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Function to calculate battle pot
CREATE OR REPLACE FUNCTION calculate_battle_pot(battle_id uuid)
RETURNS numeric(10,2) AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) * c.price
    FROM battle_participants bp
    JOIN battles b ON b.id = bp.battle_id
    JOIN cases c ON c.id = b.case_id
    WHERE bp.battle_id = battle_id
  );
END; $$;

COMMIT;

-- Enable RLS and create policies
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;

-- Cases and case_items are public read-only
CREATE POLICY IF NOT EXISTS cases_select_all ON cases FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS case_items_select_all ON case_items FOR SELECT USING (true);

-- Users can only see their own case openings
CREATE POLICY IF NOT EXISTS case_openings_select_own ON case_openings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS case_openings_insert_own ON case_openings
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Battle policies
CREATE POLICY IF NOT EXISTS battles_select_all ON battles FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS battles_insert_own ON battles
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS battles_update_own ON battles
FOR UPDATE USING (auth.uid() = created_by OR auth.uid() IN (
  SELECT user_id FROM battle_participants WHERE battle_id = id
));

-- Battle participants policies
CREATE POLICY IF NOT EXISTS battle_participants_select_all ON battle_participants
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS battle_participants_insert_own ON battle_participants
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS battle_participants_delete_own ON battle_participants
FOR DELETE USING (auth.uid() = user_id);

-- Battle results policies
CREATE POLICY IF NOT EXISTS battle_results_select_all ON battle_results
FOR SELECT USING (true);
