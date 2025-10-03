# Phase Status Dashboard

| Phase                           | Doc Status     | Implementation Status     | Owner        | Notes                                                             |
| ------------------------------- | -------------- | ------------------------- | ------------ | ----------------------------------------------------------------- |
| P0 — Charter & Baseline         | 🔄 Drafting    | ⏸ Pending spec approval  | Orchestrator | Need to align docs & repo hygiene (templates/CI).                 |
| P1 — Architecture & Conventions | ⏳ Not started | ⏸ Pending P0             | TBD          | Depends on finalized governance from P0.                          |
| P2 — DevEx & CI/CD              | ⏳ Not started | ⏸ Pending P0             | TBD          | Will extend `.github` workflows defined in P0.                    |
| P3 — Observability & Security   | ⏳ Not started | ⏸ Pending earlier phases | TBD          | Logging schema & correlation middleware required.                 |
| P4 — Core Features              | 🔄 Drafting    | ⏸ Pending specs          | TBD          | Marketplace & Community Pots module PRDs in progress (see below). |
| P5 — UX & Accessibility         | ⏳ Not started | ⏸ Pending tokens         | TBD          | Align with `UI_IMPROVEMENT_GUIDE.md` and design system.           |
| P6 — Release & QA               | ⏳ Not started | ⏸ Pending earlier phases | TBD          | Release checklist, rollback, analytics.                           |

## Module Spec Index

| Module         | Spec                                                                       | Status      | Notes                                                                      |
| -------------- | -------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| Marketplace    | [`docs/product/specs/marketplace.md`](specs/marketplace.md)                | 🆕 Draft    | Captures listings, purchase APIs, and realtime UX requirements.            |
| Community Pots | [`docs/product/specs/community-pots.md`](specs/community-pots.md)          | 🆕 Draft    | Defines pot lifecycle, commit/reveal, and anti-collusion controls.         |
| Case Battles   | [`docs/CASE_BATTLES_GAME_PLAN_2025.md`](../CASE_BATTLES_GAME_PLAN_2025.md) | ✅ Enhanced | Svelte 5 migration completed, real API integration, enhanced toast system. |

Update this table in every spec PR. "Doc Status" reflects the spec readiness (Draft, Ready for Review, Approved). "Implementation Status" tracks code PR progress.
