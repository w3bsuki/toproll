# Spec-Driven Development Workflow

## Quick Start: How to Work with Claude (Implementation Agent)

You (Orchestrator) → Claude (Developer) → CI → Merge

### 1. **Check Current Status**

```powershell
pnpm check
```

Look at errors/warnings. Identify blockers.

### 2. **Prepare Context for Claude**

Write a prompt that includes:
- **Goal**: What needs to be fixed/built (be specific)
- **Context**: Files to check, specs to follow
- **Validation**: Commands Claude must run before claiming done
- **Constraints**: What NOT to change (API surfaces, public behavior, styling direction)
- **Expected output**: Exact format for reporting back

### 3. **Copy Prompt → Claude Terminal**

Open Claude Code in your terminal:
```powershell
# Paste the prompt
# Let Claude work
```

### 4. **Validate Claude's Work**

```powershell
pnpm check
pnpm lint
pnpm test -- --run
```

If pass → update docs + commit. If fail → iterate with focused prompt.

### 5. **Update Docs**

- `tasks.md`: Mark items done
- `docs/product/status.md`: Update phase status if needed
- Commit with clear message linking to specs/tasks

---

## Rules for Orchestrator (You)

### ✅ DO:
- Review specs first (`docs/product/specs/*`, ADRs, PRD)
- Write precise prompts with clear acceptance criteria
- Validate outputs yourself (run checks)
- Update `tasks.md` and status docs
- Keep prompts focused and scoped

### ❌ DON'T:
- Hand off vague tasks ("fix everything")
- Skip validation before marking complete
- Let Claude change specs or design direction
- Accept "Implementation Complete" without running checks yourself

---

## Rules for Developer (Claude)

Documented in `claude.md`. Key points:
- Follow specs strictly
- Run all validations before reporting
- Update docs (`tasks.md`, `status.md`)
- Report in standard format (summary, validations, coverage, diffs, next steps)

---

## Current Project State

**Stack:**
- SvelteKit 2 + Svelte 5 (runes mode: `$state`, `$derived`, `$effect`)
- Tailwind v4 (use `@theme`, avoid `@apply`)
- Supabase backend
- pnpm package manager

**Styling Direction:**
- **REJECTED**: Neo-brutalism (thick borders, offset shadows, neon accents)
- **ACTIVE**: Clean minimal casino UI with standard borders/shadows
- Reference: Your original design before neo-brutalism transformation

**Current Errors (as of last check):**
- 12 type errors
- 11 warnings (a11y: clickable divs, runes: `<svelte:component>` deprecated, non-reactive variables)

---

## Template: Prompt for Claude

```
Context
You're the implementation developer on TopRoll. Follow spec-first workflow per agents.md and claude.md.

Read first
- agents.md, claude.md
- docs/product/README.md, docs/product/status.md, tasks.md
- docs/engineering/adr/ADR-20251003-spec-workflow.md
- Specs in docs/product/specs/*

Stack
- SvelteKit 2 + Svelte 5 runes ($state, $derived, $effect)
- Tailwind v4 (theme tokens, no @apply)
- Supabase backend
- pnpm

Goal
[SPECIFIC GOAL HERE - e.g., "Fix remaining 12 type errors and 11 a11y/runes warnings"]

Scope
[LIST EXACT FILES OR AREAS]
1. Fix a11y: replace clickable divs with buttons in BattleCreateDialog
2. Fix runes: remove <svelte:component> in BattlePullReel, BattleTotals, BattleRoom
3. Make winnerElement reactive with $state
4. [etc.]

Constraints
- Keep diffs minimal
- Don't change public APIs or behavior
- No Neo-brutalism styling (strip if present)
- Svelte 5 runes idioms only
- No ts-ignore without TODO + reason

Acceptance Criteria
- pnpm check: 0 errors
- pnpm lint: pass
- pnpm test -- --run: pass
- No <svelte:component> warnings
- No a11y clickable div warnings
- tasks.md and status.md updated

Validations (PowerShell)
pnpm install
pnpm check
pnpm lint
pnpm test -- --run

Report Format
1. Summary (what changed, why)
2. Validation results (PASS/FAIL with counts)
3. Requirements coverage (each criterion → Done/Deferred)
4. Notable diffs (key files + nature of change)
5. Next steps (3-5 bullets max)

Edge Cases
- SSR vs client-only in SvelteKit
- Null/undefined in API responses
- Type narrowing for optional fields

Notes from Orchestrator
[YOUR SPECIFIC CONTEXT - e.g., "Focus on a11y and runes first; API types can be deferred"]
```

---

## Commit Message Format

```
type(scope): short description

- Details
- Link to tasks.md item or spec
- Validation results

Closes #issue (if applicable)
```

Example:
```
fix(battles): resolve a11y warnings and runes deprecations

- Replaced clickable divs with semantic buttons in BattleCreateDialog
- Removed <svelte:component> from BattlePullReel, BattleTotals, BattleRoom
- Made winnerElement reactive with $state

Validations:
- pnpm check: PASS (0 errors)
- pnpm lint: PASS
- pnpm test: PASS

Refs: tasks.md "Svelte 5 Runes Cleanup"
```

---

## Handling Neo-Brutalism Cleanup

Since you rejected neo-brutalism, we need to:
1. Remove/comment neo utilities from `src/app.css` and `tailwind.config.ts`
2. Strip `shadow-neo`, `border-neo`, `border-[3px]` from components
3. Revert to standard borders/shadows

Add this to next Claude prompt:
```
Additional Cleanup: Strip Neo-Brutalism Styling
- Remove neo-specific utilities from src/app.css (@theme tokens, .shadow-neo, .border-neo)
- Remove neo shadows from tailwind.config.ts (shadow-neo, shadow-neo-sm, etc.)
- Replace any border-[3px] with border or border-2 in components
- Replace shadow-neo* with standard shadow-sm/shadow-md
- Check: RainPotCard.svelte, sidebar-left.svelte, sidebar-right.svelte, button.svelte
- Archive NEO_BRUTALISM_TRANSFORMATION.md (add "ARCHIVED - not in use" at top)
```

---

## Next Immediate Steps

1. ✅ Read this workflow doc
2. ✅ Copy the prepared Claude prompt below
3. ✅ Paste into Claude Code terminal
4. ✅ Let Claude work
5. ✅ Run validations yourself
6. ✅ Update docs + commit

---

## Ready-to-Use Claude Prompt (Copy Below)

See next section ↓
