# Architecture (Oct 2025)

## System Context

- Client: SvelteKit v2 (Svelte 5), TypeScript, Tailwind tokens
- Backend: SvelteKit endpoints (+server.ts), Supabase (DB/Auth/Realtime)
- Realtime: Supabase channels (e.g., `battles:{id}`)
- Observability: structured logs, correlation IDs, basic metrics

## Module Boundaries

- Auth & Profiles → Steam OpenID, session mgmt, profile persistence
- Inventory & Marketplace → inventory read, valuation, listing/purchase
- Community Pots → pooled entries, draw/payout, fairness & limits
- Games (Case Battles) → multi-round state machine, PF mapping, settlement
- Risk/Compliance → KYC tiers, region gating, rate/limits, RLS policies
- Admin/Ops → toggles (pause), seed rotation, refunds/overrides

## Data

- Postgres tables per module; RLS by default
- Case Battles adds: `battle_cases`, `battle_rounds`, `battle_pulls`

## PF (Provably Fair)

- Commit server seed (sha256), client seed + nonce
- HMAC-SHA256 to roll; map roll to cumulative probability of case items
- Verifier page to reproduce outcomes

## Error Model & DTOs

- Use Zod for request/response schemas; stable DTOs, additive changes preferred
- Error shape: `{ error: { code, message }, corr_id }`

## State Machines

- Battles: waiting → locking → in_progress(k) → settling → completed/cancelled
- Pots: waiting → locking → drawing → settled → completed
