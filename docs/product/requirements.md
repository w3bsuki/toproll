# Launch Requirements (Baseline Snapshot)

> Canonical source: [`/requirements.md`](../../requirements.md)

Use this file to track any deltas introduced by a phase. Keep the baseline immutable; add sections that outline additional acceptance criteria or clarifications for the current workstream.

## Baseline Overview

- Auth & Profiles: Steam OpenID login, session management, profile surfaces
- Inventory & Marketplace: inventory ingest, valuations, listing/buy flows
- Community Pots: pooled entries, draw, payout, anti-collusion
- Case Battles: 1v1/2v2, realtime pulls, settlement, PF verifier
- Social: live drops, chat, spectate
- Admin/Ops: toggles, refunds, RLS-backed overrides
- Non-Functional: security (RLS, secrets), performance (p95 <3s / <150ms WS), observability, accessibility (AA), reliability (idempotent, circuit breakers)

## Pending Phase Additions

Document requirement refinements introduced by each phase here.

| Phase | Delta |
| ----- | ----- |
| P0 | _Define doc ownership, labels, and CI gating._ |
| P1 | _TBD – detail module boundaries & DTO conventions._ |
| ... | ... |
