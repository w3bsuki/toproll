-- Add missing indexes for foreign keys to improve query performance

-- Battle cases foreign key indexes
CREATE INDEX IF NOT EXISTS idx_battle_cases_case_id ON public.battle_cases(case_id);
CREATE INDEX IF NOT EXISTS idx_battle_cases_battle_id ON public.battle_cases(battle_id);

-- Battle pulls foreign key indexes  
CREATE INDEX IF NOT EXISTS idx_battle_pulls_item_id ON public.battle_pulls(item_id);
CREATE INDEX IF NOT EXISTS idx_battle_pulls_round_id ON public.battle_pulls(round_id);
CREATE INDEX IF NOT EXISTS idx_battle_pulls_participant_id ON public.battle_pulls(participant_id);

-- Battle results foreign key indexes
CREATE INDEX IF NOT EXISTS idx_battle_results_battle_id ON public.battle_results(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_results_participant_id ON public.battle_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_battle_results_item_id ON public.battle_results(item_id);

-- Battle rounds foreign key indexes
CREATE INDEX IF NOT EXISTS idx_battle_rounds_case_id ON public.battle_rounds(case_id);
CREATE INDEX IF NOT EXISTS idx_battle_rounds_battle_id ON public.battle_rounds(battle_id);

-- Battles foreign key indexes
CREATE INDEX IF NOT EXISTS idx_battles_case_id ON public.battles(case_id);
CREATE INDEX IF NOT EXISTS idx_battles_winner_participant_id ON public.battles(winner_participant_id);

-- Case openings foreign key indexes
CREATE INDEX IF NOT EXISTS idx_case_openings_opened_item_id ON public.case_openings(opened_item_id);
CREATE INDEX IF NOT EXISTS idx_case_openings_case_id ON public.case_openings(case_id);
CREATE INDEX IF NOT EXISTS idx_case_openings_user_id ON public.case_openings(user_id);

-- Pots foreign key indexes
CREATE INDEX IF NOT EXISTS idx_pots_winner_user_id ON public.pots(winner_user_id);

-- Pots audit foreign key indexes (table is called pots_audit not pot_audit)
CREATE INDEX IF NOT EXISTS idx_pots_audit_pot_id ON public.pots_audit(pot_id);
CREATE INDEX IF NOT EXISTS idx_pots_audit_actor_id ON public.pots_audit(actor_id);

-- Case items foreign key indexes (already have case_id index but ensure it exists)
CREATE INDEX IF NOT EXISTS idx_case_items_case_id ON public.case_items(case_id);;
