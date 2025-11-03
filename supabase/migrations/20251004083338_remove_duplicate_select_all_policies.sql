-- Remove all the remaining _select_all policies that are causing duplicates

-- Drop all remaining duplicate policies
DROP POLICY IF EXISTS "battle_cases_select_all" ON public.battle_cases;
DROP POLICY IF EXISTS "battle_participants_select_all" ON public.battle_participants;
DROP POLICY IF EXISTS "battle_pulls_select_all" ON public.battle_pulls;
DROP POLICY IF EXISTS "battle_results_select_all" ON public.battle_results;
DROP POLICY IF EXISTS "battle_rounds_select_all" ON public.battle_rounds;
DROP POLICY IF EXISTS "chat_messages_select_all" ON public.chat_messages;
DROP POLICY IF EXISTS "pot_entries_select_all" ON public.pot_entries;

-- Also fix the typo in battles policy name
DROP POLICY IF EXISTS "battles_optified_modify" ON public.battles;
CREATE POLICY "battles_optimized_modify" ON public.battles
    FOR ALL WITH CHECK (
        (select auth.uid()) = created_by
    );;
