-- Drop existing inefficient policies and create optimized ones

-- User profiles optimized policies
DROP POLICY IF EXISTS "select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Create optimized single policies
CREATE POLICY "user_profiles_optimized" ON public.user_profiles
    FOR ALL USING (
        (select auth.uid()) = user_id
    );

-- Chat messages optimized policies  
DROP POLICY IF EXISTS "chat_messages_insert_any" ON public.chat_messages;

CREATE POLICY "chat_messages_optimized" ON public.chat_messages
    FOR ALL WITH CHECK (
        (select auth.uid()) IS NOT NULL
    );

-- Case openings optimized policies
DROP POLICY IF EXISTS "Users can view own openings" ON public.case_openings;
DROP POLICY IF EXISTS "Users can insert own openings" ON public.case_openings;

CREATE POLICY "case_openings_optimized" ON public.case_openings
    FOR ALL USING (
        (select auth.uid()) = user_id
    );

-- Battles optimized policies
DROP POLICY IF EXISTS "battles_insert_authenticated" ON public.battles;
DROP POLICY IF EXISTS "battles_update_creator" ON public.battles;
DROP POLICY IF EXISTS "battles_select_all" ON public.battles;
DROP POLICY IF EXISTS "battles_service_select" ON public.battles;
DROP POLICY IF EXISTS "battles_service_update" ON public.battles;

CREATE POLICY "battles_optimized_select" ON public.battles
    FOR SELECT USING (
        status = 'completed' OR 
        (select auth.uid()) = created_by
    );

CREATE POLICY "battles_optified_modify" ON public.battles
    FOR ALL USING (
        (select auth.uid()) = created_by
    );

-- Battle participants optimized policies
DROP POLICY IF EXISTS "battle_participants_insert_authenticated" ON public.battle_participants;
DROP POLICY IF EXISTS "battle_participants_update_own" ON public.battle_participants;
DROP POLICY IF EXISTS "battle_participants_service_update" ON public.battle_participants;

CREATE POLICY "battle_participants_optimized" ON public.battle_participants
    FOR ALL USING (
        (select auth.uid()) = user_id
    );

-- Battle results optimized policies
DROP POLICY IF EXISTS "battle_results_insert_system" ON public.battle_results;
DROP POLICY IF EXISTS "battle_results_service_update" ON public.battle_results;

CREATE POLICY "battle_results_optimized" ON public.battle_results
    FOR ALL USING (
        (select auth.uid()) = (
            SELECT user_id FROM public.battle_participants 
            WHERE battle_participants.id = battle_results.participant_id
        )
    );

-- Battle cases optimized policies
DROP POLICY IF EXISTS "battle_cases_insert_creator" ON public.battle_cases;
DROP POLICY IF EXISTS "battle_cases_service_update" ON public.battle_cases;

CREATE POLICY "battle_cases_optimized" ON public.battle_cases
    FOR ALL USING (
        (select auth.uid()) = (
            SELECT created_by FROM public.battles 
            WHERE battles.id = battle_cases.battle_id
        )
    );

-- Battle rounds optimized policies
DROP POLICY IF EXISTS "battle_rounds_insert_creator" ON public.battle_rounds;
DROP POLICY IF EXISTS "battle_rounds_service_update" ON public.battle_rounds;

CREATE POLICY "battle_rounds_optimized" ON public.battle_rounds
    FOR ALL USING (
        (select auth.uid()) = (
            SELECT created_by FROM public.battles 
            WHERE battles.id = battle_rounds.battle_id
        )
    );

-- Battle pulls optimized policies
DROP POLICY IF EXISTS "battle_pulls_insert_participant" ON public.battle_pulls;
DROP POLICY IF EXISTS "battle_pulls_service_update" ON public.battle_pulls;

CREATE POLICY "battle_pulls_optimized" ON public.battle_pulls
    FOR ALL USING (
        (select auth.uid()) = (
            SELECT user_id FROM public.battle_participants 
            WHERE battle_participants.id = battle_pulls.participant_id
        )
    );

-- Server seeds optimized policies
DROP POLICY IF EXISTS "server_seeds_service_all" ON public.server_seeds;

CREATE POLICY "server_seeds_optimized" ON public.server_seeds
    FOR ALL USING (
        (select auth.uid()) IS NOT NULL
    );

-- User ledger optimized policies
DROP POLICY IF EXISTS "user_ledger_service_all" ON public.user_ledger;

CREATE POLICY "user_ledger_optimized" ON public.user_ledger
    FOR ALL USING (
        (select auth.uid()) = user_id
    );

-- Pot entries optimized policies
DROP POLICY IF EXISTS "pot_entries_insert_own" ON public.pot_entries;

CREATE POLICY "pot_entries_optimized" ON public.pot_entries
    FOR ALL USING (
        (select auth.uid()) = user_id
    );;
