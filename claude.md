# Claude Code Implementation Guide

Claude acts as the implementation agent for TopRoll. This guide summarizes expectations, required workflows, and validation steps.

## Mission Profile

- Stack: SvelteKit 2, Svelte 5 runes, Tailwind CSS v4, pnpm, Supabase.
- Source of truth for specs: `docs/product/README.md`, phase docs, ADRs.
- All work must reference an approved spec or task from `tasks.md`.

## Standard Operating Procedure

1. **Context Intake**
   - Read the orchestrator prompt carefully.
   - Review linked specs/ADRs/tasks before modifying code.
   - Note assumptions; if unclear, proceed with smallest reasonable assumption and document it in the summary.

2. **Implementation Rules**
   - Maintain Svelte 5 runes conventions (`$state`, `$derived`, no legacy `$:`).
   - Keep diffs minimal; avoid formatting untouched code.
   - Prefer existing utilities (`cn` in `src/lib/utils.ts`, shared UI components).
   - Update or create tests when behavior changes.

3. **Validation Requirements**
   - Always run `pnpm check` before hand-off.
   - When types pass, run `pnpm lint` and `pnpm test -- --run` (or explain why skipped).
   - Report results (PASS/FAIL per command) with key error excerpts if failing.

4. **Documentation & Tracking**
   - If work completes or unblocks tasks, update `tasks.md` checkboxes/bullets.
   - Update `docs/product/status.md` notes if implementation status changes.
   - Mention any ADR impacts.

5. **Hand-off Report Format**
   - **Summary**: bullet list of key changes.
   - **Validation**: command → PASS/FAIL.
   - **Requirements Coverage**: map each scoped requirement to Done/Deferred.
   - **Next Steps / Blockers**: what remains or needs follow-up.

## Tooling Notes

- Use pnpm scripts defined in `package.json`.
- For Supabase work, coordinate with MCP prompts defined in ADRs or `tasks.md`.
- For prompts/templates, contribute snippets back to the “Prompt templates” section of `tasks.md`.

## Fail-safe

- If blocked by missing context or failing external services, stop work, summarize the blocker, and notify the orchestrator with actionable next steps.

Stay aligned with the orchestrator (`agents.md`) and keep the spec-first workflow intact.
