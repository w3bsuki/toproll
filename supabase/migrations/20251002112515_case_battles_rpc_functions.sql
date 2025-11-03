-- Add RPC functions for battle settlement and user payouts
-- These functions make the settlement system actually work

BEGIN;

-- Settlement function that handles the complete battle settlement process
CREATE OR REPLACE FUNCTION settle_battle_transaction(
  p_battle_id uuid,
  p_winner_participant_ids uuid[],
  p_totals jsonb, -- {participant_id: total_value}
  p_tie_break_winner_id uuid DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_battle_mode text;
  v_total_pot numeric;
  v_is_tie boolean;
  v_final_winner_id uuid;
BEGIN
  -- Get battle info
  SELECT mode, total_pot INTO v_battle_mode, v_total_pot
  FROM battles WHERE id = p_battle_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Battle not found: %', p_battle_id;
  END IF;
  
  -- Check for tie
  v_is_tie := (array_length(p_winner_participant_ids, 1) > 1);
  
  -- Determine final winner
  IF v_is_tie AND p_tie_break_winner_id IS NOT NULL THEN
    v_final_winner_id := p_tie_break_winner_id;
  ELSIF NOT v_is_tie THEN
    v_final_winner_id := p_winner_participant_ids[1];
  END IF;
  
  -- Update battle status
  UPDATE battles 
  SET 
    status = 'completed',
    winner_participant_id = v_final_winner_id,
    completed_at = now()
  WHERE id = p_battle_id;
  
  -- Insert/update results for each participant
  INSERT INTO battle_results (battle_id, participant_id, total_value, is_winner)
  SELECT 
    p_battle_id,
    participant_id,
    (p_totals::jsonb)->>participant_id::numeric,
    (participant_id = v_final_winner_id)
  FROM jsonb_object_keys(p_totals) AS participant_id;
  
  -- Credit winners (simplified for MVP)
  IF v_final_winner_id IS NOT NULL THEN
    PERFORM credit_user_account(
      (SELECT user_id FROM battle_participants WHERE id = v_final_winner_id),
      v_total_pot,
      p_battle_id
    );
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User credit function (temporary stub for MVP)
CREATE OR REPLACE FUNCTION credit_user_account(
  p_user_id uuid,
  p_amount numeric,
  p_reference_id uuid DEFAULT NULL
) RETURNS boolean AS $$
BEGIN
  -- Insert into user ledger (idempotent due to unique constraint)
  INSERT INTO user_ledger (user_id, amount, reference_id)
  VALUES (p_user_id, p_amount, p_reference_id)
  ON CONFLICT (user_id, reference_id, type) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active server seed for PF
CREATE OR REPLACE FUNCTION get_active_server_seed() RETURNS text AS $$
DECLARE
  v_seed text;
BEGIN
  SELECT seed INTO v_seed 
  FROM server_seeds 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  RETURN COALESCE(v_seed, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to commit server seed hash for a battle
CREATE OR REPLACE FUNCTION commit_battle_seed(p_battle_id uuid, p_seed_hash text) RETURNS boolean AS $$
BEGIN
  INSERT INTO server_seeds (battle_id, seed_hash, is_active)
  VALUES (p_battle_id, p_seed_hash, false)
  ON CONFLICT (seed_hash) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reveal server seed
CREATE OR REPLACE FUNCTION reveal_server_seed(p_seed_hash text, p_seed text) RETURNS boolean AS $$
BEGIN
  UPDATE server_seeds 
  SET seed = p_seed, revealed_at = now()
  WHERE seed_hash = p_seed_hash;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;;
