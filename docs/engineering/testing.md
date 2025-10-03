# Testing Strategy (Oct 2025)

## Levels

- Unit: utils (PF mapping), services (pricing, settlement)
- Integration: endpoints with Zod, RLS interactions, DB ops
- E2E: auth/login, inventory view, marketplace list/purchase (stub), pots join/draw, battles flow
- Property: cumulative mapping coverage; tie-break unbiasedness
- Performance: p95 WS fanout; PF verify latency; basic page perf

## Tooling

- Vitest unit/integration; Playwright e2e
- CI: run check/lint/unit on PR; optional e2e matrix

## Data & Fixtures

- Seed scripts under `scripts/`; deterministic seeds for PF tests

## Gates

- Required: unit and typecheck green; e2e smoke for critical paths
