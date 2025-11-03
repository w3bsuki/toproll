-- Enable RLS and create policies for battle tables
BEGIN;

-- Enable RLS on all battle tables
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_pulls ENABLE ROW LEVEL SECURITY;

-- Battles table policies
DROP POLICY IF EXISTS battles_select_all ON battles;
DROP POLICY IF EXISTS battles_insert_authenticated ON battles;
DROP POLICY IF EXISTS battles_update_creator ON battles;

CREATE POLICY battles_select_all ON battles FOR SELECT USING (true);
CREATE POLICY battles_insert_authenticated ON battles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY battles_update_creator ON battles FOR UPDATE USING (auth.uid() = created_by);

-- Battle participants policies
DROP POLICY IF EXISTS battle_participants_select_all ON battle_participants;
DROP POLICY IF EXISTS battle_participants_insert_authenticated ON battle_participants;
DROP POLICY IF EXISTS battle_participants_update_own ON battle_participants;

CREATE POLICY battle_participants_select_all ON battle_participants FOR SELECT USING (true);
CREATE POLICY battle_participants_insert_authenticated ON battle_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY battle_participants_update_own ON battle_participants FOR UPDATE USING (auth.uid() = user_id);

-- Battle results policies
DROP POLICY IF EXISTS battle_results_select_all ON battle_results;
DROP POLICY IF EXISTS battle_results_insert_system ON battle_results;

CREATE POLICY battle_results_select_all ON battle_results FOR SELECT USING (true);
CREATE POLICY battle_results_insert_system ON battle_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Battle cases policies
DROP POLICY IF EXISTS battle_cases_select_all ON battle_cases;
DROP POLICY IF EXISTS battle_cases_insert_creator ON battle_cases;

CREATE POLICY battle_cases_select_all ON battle_cases FOR SELECT USING (true);
CREATE POLICY battle_cases_insert_creator ON battle_cases
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM battles WHERE id = battle_id
    )
  );

-- Battle rounds policies
DROP POLICY IF EXISTS battle_rounds_select_all ON battle_rounds;
DROP POLICY IF EXISTS battle_rounds_insert_creator ON battle_rounds;

CREATE POLICY battle_rounds_select_all ON battle_rounds FOR SELECT USING (true);
CREATE POLICY battle_rounds_insert_creator ON battle_rounds
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM battles WHERE id = battle_id
    )
  );

-- Battle pulls policies
DROP POLICY IF EXISTS battle_pulls_select_all ON battle_pulls;
DROP POLICY IF EXISTS battle_pulls_insert_participant ON battle_pulls;

CREATE POLICY battle_pulls_select_all ON battle_pulls FOR SELECT USING (true);
CREATE POLICY battle_pulls_insert_participant ON battle_pulls
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT bp.user_id FROM battle_participants bp WHERE bp.id = participant_id
    )
  );

COMMIT;;
