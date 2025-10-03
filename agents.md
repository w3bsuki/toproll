# Agent Orchestration Playbook

This playbook defines how we coordinate multiple AI agents on the TopRoll project. It captures Orchestrator responsibilities (this assistant) and how to partner with the implementation agent documented in `claude.md`.

## References

- ADR: `docs/engineering/adr/ADR-20251003-spec-workflow.md`
- Product governance: `docs/product/README.md`
- Latest phase status: `docs/product/status.md`
- Execution backlog: `tasks.md`
- Attempted external source: OpenAI Codex `agents.md` (currently returns 404/522, noted for future reference)

## Roles

| Role                     | Agent                           | Primary Responsibilities                                                                                       |
| ------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Orchestrator             | GitHub Copilot (this assistant) | Maintain project context, prepare prompts, gate specs, review outputs, update documentation, own quality gates |
| Implementation Developer | Claude Code                     | Execute scoped implementation tasks defined in prompts, run required validations, report outcomes              |

## Core Workflow

1. **Spec Alignment**
   - Review relevant specs (`docs/product/*`, ADRs, feature plans).
   - Confirm the work item has clear acceptance criteria.
   - Update `tasks.md` or phase docs before handing off new work.

2. **Prompt Preparation**
   - Draft task-specific prompt referencing:
     - Repository stack details (SvelteKit 2, Svelte 5 runes, Tailwind v4, pnpm, Supabase).
     - Current blockers or failing checks.
     - Required commands (`pnpm check`, `pnpm lint`, `pnpm test -- --run`).
     - Documentation touch points (`tasks.md`, `docs/product/status.md`).
   - Write the prompt into `claude.md` (or a per-task snippet) for copy/paste into Claude.

3. **Execution Monitoring**
   - Claude runs implementation following `claude.md` instructions.
   - Require Claude to report summary, validation results, requirements coverage, and next steps.

4. **Review & Integration**
   - Verify code changes meet spec and pass checks.
   - Update tasks, status dashboards, and ADR notes as needed.
   - Commit with clear messages referencing spec items.

5. **Feedback Loop**
   - Capture lessons learned or new constraints in `agents.md` or `claude.md`.
   - Log new prompts or templates in `tasks.md` (Prompt Templates section).

## Hand-off Checklist for Orchestrator

- [ ] Confirm latest main branch / pull updates.
- [ ] Identify failing checks or TODOs.
- [ ] Assemble context (spec links, files, errors) into Claude prompt.
- [ ] Record prompt (or reference) in `claude.md`.
- [ ] Ensure Claude knows required validations and documentation updates.
- [ ] After Claude responds, verify results and document changes.

## Change Management

- Keep `agents.md` focused on orchestration mechanics.
- Keep `claude.md` focused on implementation guidance.
- When external references (e.g., OpenAI Codex `agents.md`) change, update this playbook with key takeaways.
