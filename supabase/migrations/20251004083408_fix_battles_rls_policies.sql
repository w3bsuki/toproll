-- Fix battles table to have proper separate policies for SELECT and MODIFY
DROP POLICY IF EXISTS "battles_optimized_select" ON public.battles;
DROP POLICY IF EXISTS "battles_optimized_modify" ON public.battles;

-- Create separate policies for SELECT and INSERT/UPDATE
CREATE POLICY "battles_select_policy" ON public.battles
    FOR SELECT USING (
        status = 'completed' OR 
        (select auth.uid()) = created_by
    );

CREATE POLICY "battles_modify_policy" ON public.battles
    FOR INSERT WITH CHECK (
        (select auth.uid()) = created_by
    );

CREATE POLICY "battles_update_policy" ON public.battles
    FOR UPDATE USING (
        (select auth.uid()) = created_by
    );

-- Drop duplicate index on battle_pulls
DROP INDEX IF EXISTS battle_pulls_round_idx;;
