-- Case Battles Schema Patch - Fixes schema mismatches and adds missing functionality
-- Addresses issues identified in audit to make battles actually work

BEGIN;

-- Add missing columns to battles table
ALTER TABLE battles
ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'standard' CHECK (mode IN ('standard', 'crazy')),
ADD COLUMN IF NOT EXISTS entry_fee numeric NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rounds_count integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_round integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS winner_participant_id uuid REFERENCES battle_participants(id) ON DELETE SET NULL;

-- Add missing columns to battle_results table
ALTER TABLE battle_results
ADD COLUMN IF NOT EXISTS total_value numeric NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_winner boolean NOT NULL DEFAULT false;

-- Add timestamp defaults if missing
ALTER TABLE battles
ALTER COLUMN completed_at SET DEFAULT NULL,
ALTER COLUMN created_at SET DEFAULT now();

-- Add server seeds storage table for provably fair
CREATE TABLE IF NOT EXISTS server_seeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed text NOT NULL,
  seed_hash text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  revealed_at timestamptz,
  is_active boolean NOT NULL DEFAULT false,
  battle_id uuid REFERENCES battles(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS battles_status_idx ON battles(status);
CREATE INDEX IF NOT EXISTS battles_created_by_idx ON battles(created_by);
CREATE INDEX IF NOT EXISTS battles_mode_idx ON battles(mode);
CREATE INDEX IF NOT EXISTS battle_participants_battle_idx ON battle_participants(battle_id);
CREATE INDEX IF NOT EXISTS battle_participants_user_idx ON battle_participants(user_id);
CREATE INDEX IF NOT EXISTS server_seeds_active_idx ON server_seeds(is_active);
CREATE INDEX IF NOT EXISTS server_seeds_battle_idx ON server_seeds(battle_id);

-- Simple user ledger for payouts (temporary stub)
CREATE TABLE IF NOT EXISTS user_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric NOT NULL,
  type text NOT NULL DEFAULT 'battle_payout',
  reference_id uuid, -- battle_id or transaction reference
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, reference_id, type)
);

COMMIT;
