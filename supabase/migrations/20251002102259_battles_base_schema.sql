-- Create basic battles schema first
BEGIN;

-- Main battles table
CREATE TABLE IF NOT EXISTS battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'locking', 'in_progress', 'settling', 'completed', 'cancelled')),
  mode text NOT NULL DEFAULT 'standard' CHECK (mode IN ('standard', 'crazy')),
  max_participants integer NOT NULL DEFAULT 2 CHECK (max_participants IN (2, 4)),
  current_participants integer NOT NULL DEFAULT 0,
  total_pot numeric NOT NULL DEFAULT 0.00,
  entry_fee numeric NOT NULL DEFAULT 0.00,
  rounds_count integer NOT NULL DEFAULT 1,
  current_round integer NOT NULL DEFAULT 0,
  winner_id uuid,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id)
);

-- Battle participants table
CREATE TABLE IF NOT EXISTS battle_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  position integer NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE (battle_id, user_id)
);

-- Battle results summary table
CREATE TABLE IF NOT EXISTS battle_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES battle_participants(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES case_items(id) ON DELETE RESTRICT,
  total_value numeric NOT NULL DEFAULT 0.00,
  is_winner boolean NOT NULL DEFAULT false,
  tie_break_wins boolean,
  created_at timestamptz DEFAULT now()
);

COMMIT;;
