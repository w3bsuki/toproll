# ADR-20251003 – Spec-Driven Delivery Workflow

## Status

Accepted (P0)

## Context

The project historically blended documentation and implementation work without a consistent gate. Multiple agents are expected to collaborate via MCP integrations (Supabase, Svelte) across product pillars (Auth, Marketplace, Community Pots, Games). To avoid conflicting changes and to keep the roadmap coherent, we need an explicit spec-first workflow that scales with phases (P0–P6) and provides predictable hand-offs for implementation agents like Claude-Code.

Key pain points observed:

- Docs spread between the repo root and `/docs/` without a unified index.
- PRs occasionally mixing spec updates with code, complicating review.
- Lack of GitHub templates and CI guardrails to enforce the process.

## Decision

Adopt a spec-driven rhythm for every phase (P0–P6):

1. **Spec PR** (docs only) prepared by the orchestrator.
   - Update `docs/product/` (PRD snapshot, requirements deltas, phase spec, status dashboard).
   - Update relevant engineering annexes (`docs/engineering/*`) and roadmap/tasks.
   - Record key decisions via ADRs.
   - Merged once reviewers approve scope and acceptance criteria.

2. **Implementation PR(s)** executed by feature agents (Claude-Code, etc.).
   - Branch names follow `feature/p{phase}-<slug>`.
   - Include code & tests only; reference the approved spec.
   - Update checklists and runbooks as part of validation.

3. **Validation & Tracking.**
   - Status dashboard marks Doc vs Implementation progress.
   - Labels apply across GitHub issues/PRs (`phase/p{n}`, `type/spec`, `type/feature`, `area/...`).
   - MCP usage documented in `tasks.md` to standardize automation steps.

Additionally, add repository hygiene to support the workflow:

- `.github/PULL_REQUEST_TEMPLATE.md` differentiating spec vs implementation checklists.
- Basic CI workflow (`pnpm lint`, `pnpm check`, `pnpm test -- --run`).
- `CODEOWNERS` to enforce orchestrator review on spec PRs.

## Consequences

- **Positive:** Predictable cadence; easier reviews; clear coordination between orchestration and implementation agents. Scaling new contributors becomes easier through documented processes.
- **Negative:** Slight overhead upfront (two PRs per phase). Requires discipline to keep docs fresh; stale specs could block implementation.

## Follow-up Actions

- Complete the remaining P0 deliverables (templates, CI skeleton).
- Educate contributors via README updates and onboarding notes.
- Review the workflow after P2 to confirm it still meets team needs.
