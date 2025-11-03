-- Case Battles: rounds and pulls detailed schema
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS battle_cases_battle_idx ON battle_cases(battle_id, order_index);
CREATE INDEX IF NOT EXISTS battle_rounds_battle_idx ON battle_rounds(battle_id, round_index);
CREATE INDEX IF NOT EXISTS battle_pulls_round_idx ON battle_pulls(round_id);
CREATE INDEX IF NOT EXISTS battle_pulls_participant_round_idx ON battle_pulls(participant_id, round_id);
CREATE INDEX IF NOT EXISTS battles_status_idx ON battles(status);
CREATE INDEX IF NOT EXISTS battles_created_by_idx ON battles(created_by);
CREATE INDEX IF NOT EXISTS battle_participants_user_idx ON battle_participants(user_id);
CREATE INDEX IF NOT EXISTS battle_participants_battle_idx ON battle_participants(battle_id);

COMMIT;;
