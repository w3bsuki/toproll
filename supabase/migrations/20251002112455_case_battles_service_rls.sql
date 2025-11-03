-- Add service role access to battle tables
-- Allows backend services to write data while maintaining user restrictions

BEGIN;

-- Enable RLS on new tables if not already enabled
ALTER TABLE server_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ledger ENABLE ROW LEVEL SECURITY;

-- Service role policies for battles table
DROP POLICY IF EXISTS battles_service_select ON battles;
DROP POLICY IF EXISTS battles_service_update ON battles;

CREATE POLICY battles_service_select ON battles FOR SELECT USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY battles_service_update ON battles FOR UPDATE USING (auth.role() = 'service_role');

-- Service role policies for battle participants
DROP POLICY IF EXISTS battle_participants_service_update ON battle_participants;

CREATE POLICY battle_participants_service_update ON battle_participants FOR UPDATE USING (auth.role() = 'service_role');

-- Service role policies for battle results
DROP POLICY IF EXISTS battle_results_service_update ON battle_results;

CREATE POLICY battle_results_service_update ON battle_results FOR UPDATE USING (auth.role() = 'service_role');

-- Service role policies for battle cases
DROP POLICY IF EXISTS battle_cases_service_update ON battle_cases;

CREATE POLICY battle_cases_service_update ON battle_cases FOR UPDATE USING (auth.role() = 'service_role');

-- Service role policies for battle rounds
DROP POLICY IF EXISTS battle_rounds_service_update ON battle_rounds;

CREATE POLICY battle_rounds_service_update ON battle_rounds FOR UPDATE USING (auth.role() = 'service_role');

-- Service role policies for battle pulls
DROP POLICY IF EXISTS battle_pulls_service_update ON battle_pulls;

CREATE POLICY battle_pulls_service_update ON battle_pulls FOR UPDATE USING (auth.role() = 'service_role');

-- Service role policies for server seeds
CREATE POLICY server_seeds_service_all ON server_seeds FOR ALL USING (auth.role() = 'service_role');

-- Service role policies for user ledger
CREATE POLICY user_ledger_service_all ON user_ledger FOR ALL USING (auth.role() = 'service_role');

COMMIT;;
