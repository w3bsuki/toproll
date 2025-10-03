# Product & Delivery Hub

This directory collects the product-facing specifications that drive every phase of delivery. Each phase follows the same rhythm:

1. **Spec PR** – update the docs in this folder and the engineering annexes.
2. **Implementation PR** – code + tests that satisfy the approved spec, nothing more.
3. **Validation & Sign-off** – confirm acceptance criteria, update checklists, close tasks.

## How to use this directory

- `PRD.md` – canonical project-wide PRD snapshot (imported from root `PRD.md`).
- `requirements.md` – copy of baseline launch requirements with links to per-phase deltas.
- `phases/` – one file per phase (P0–P6) describing scope, deliverables, acceptance, and hand-off checklists.
- `status.md` – live tracker that shows where each phase sits (Spec, In Progress, Blocked, Done) and maps to GitHub labels.

Every document is source-controlled and updated via PRs. Implementation PRs must reference the phase spec they satisfy.

## Conventions

| Item                       | Convention                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Branch naming              | `feature/p{phase}-{slug}`                                                                                                         |
| Labels                     | `phase/p{n}`, `type/spec`, `type/feature`, `area/frontend`, `size/s-m-l`, `prio/p{0-3}`                                           |
| ADR IDs                    | `ADR-YYYYMMDD-<slug>`                                                                                                             |
| Spec PR contents           | `docs/product/PRD.md`, `docs/product/requirements.md`, `docs/engineering/*.md`, `docs/roadmap.md`, `docs/tasks.md`, relevant ADRs |
| Implementation PR contents | Code + tests only; may update runbooks/readme/checklists                                                                          |

See `phases/` for the specific spec templates.
