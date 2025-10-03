# Module PRD — Community Pots (P4 Scope)

**Status:** Draft • **Phase Link:** [P4 — Core Features](../phases/P4.md) • **Parent PRD:** [Launch PRD §D.3](../../PRD.md)

## 1. Objective & Outcomes

Ship a transparent pooled game where users contribute credits into rotating
pots, watch live ticket reveals, and see provably-fair outcomes with audited
payouts. Community Pots act as a retention funnel into Case Battles and the
Marketplace by highlighting high-velocity wins.

### Success Metrics

- Time-to-fill (TTF) ≤ 90 seconds for 75% of pots during peak hours.
- Payout accuracy: 100% of pots settle with correct credit transfers.
- Fraud detection: flag ≥ 95% of suspicious entries before settlement.

## 2. Scope & Non-Goals (MVP)

### In Scope

- Pot lobby showing active, filling, and completed pots with live credit totals.
- Entry flow: select pot → choose ticket count → confirm spend.
- Ticket allocation with per-user cap and anti-collusion checks.
- Provably-fair commit/reveal: orchestrator stores commit hash, settlement service verifies reveal.
- Realtime updates for pot totals, entrant roster, and winner announcement.
- Post-settlement summary modal with hashes, winners, and credit distribution.

### Out of Scope

- Multi-winner or tiered payout structures (single winner only for MVP).
- Cross-pot auto-entry or queueing.
- Cash-out / withdrawal of winnings (handled by wallet later).

## 3. User Stories

- **As a player**, I can join a pot, see my entries accumulate, and watch the draw in real time.
- **As a spectator**, I can observe pots filling, cheer, and join before lock.
- **As compliance**, I can audit the commit/reveal data and pause suspicious pots.

## 4. Functional Requirements

### 4.1 Pot Lifecycle

- `pots` table stores `id`, `status` (`open`, `locked`, `settling`, `settled`, `cancelled`),
  `entry_cost`, `max_tickets`, `max_per_user`, `commit_hash`, `reveal_seed`, timestamps.
- API:
  - GET `/api/pots` → paginated list with filters `status`, `min_value`, `max_value`.
  - POST `/api/pots/{id}/join` → reserve tickets; validates balance, per-user limit, RLS.
  - POST `/api/pots/{id}/lock` → orchestrator transitions to drawing state when filled or timer hits.
  - POST `/api/pots/{id}/reveal` → settlement service provides reveal seed + signature.
- Locking triggers commit broadcast and realtime event `pots:{id}:locked`.

### 4.2 Ticket Management

- `pot_entries` table stores `id`, `pot_id`, `user_id`, `ticket_count`, `credits_spent`, `created_at`.
- Entries are immutable once pot locks; cancellations only during `open` state.
- Track per-user totals to enforce `max_per_user` and detect collusion (same IP/device). Logs forwarded to compliance pipeline.

### 4.3 Settlement & Payouts

- Winner chosen via deterministic hash: `winner_index = HMAC_SHA256(reveal_seed, commit_hash) % total_tickets`.
- Settlement service credits winner and updates `pots.winner_user_id`, `settled_at`.
- Realtime event `pots:{id}:settled` broadcasts results and triggers Live Drops entry.
- Store `settlement_proof` blob linking commit, reveal, orchestrator signature, settlement signature.

### 4.4 UX & Notifications

- Lobby shows progress bar per pot (`credits_committed / (entry_cost * max_tickets)`).
- Entry modal pre-fills recommended ticket counts (1, 3, 5) with accessible buttons.
- Winner modal lists commit hash, reveal seed, fairness verification instructions.
- Push notifications (webhooks) for large wins (configurable threshold).

### 4.5 Compliance & Moderation

- Admin API `/api/pots/{id}/pause` to halt entries; reason logged in `pots_audit` table.
- Guard rails: blocked regions, velocity limits, duplicate device detection.
- All user actions log to structured events with correlation IDs per ADR.

## 5. Data Model & DTOs

| Table         | Key Fields                                                                                                                   | Notes                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `pots`        | `id` UUID, `status`, `entry_cost`, `max_tickets`, `max_per_user`, `commit_hash`, `reveal_seed`, `winner_user_id`, timestamps | RLS ensures only orchestrator/service can mutate status beyond join. |
| `pot_entries` | `id`, `pot_id`, `user_id`, `ticket_count`, `credits_spent`, `ip_hash`, `device_hash`, timestamps                             | Used for anti-collusion analytics.                                   |
| `pots_audit`  | `id`, `pot_id`, `action`, `actor_id`, `reason`, `metadata`, `created_at`                                                     | Append-only log for moderation.                                      |

### DTOs

- `PotSummary`: `id`, `status`, `entry_cost`, `credits_committed`, `participant_count`, `fill_percent`, `max_tickets`, `max_per_user`, `commit_hash?` (exposed once locked).
- `PotDetail`: `PotSummary` + entries list (partial for spectators), fairness proofs, winner info.
- `JoinPotRequest`: `{ pot_id: string, ticket_count: number }`.
- `RevealPayload`: `{ pot_id: string, reveal_seed: string, settlement_signature: string }`.

## 6. UX Flow

1. Lobby fetches `/api/pots` server-side and hydrates Svelte stores; subscribes to realtime channel `pots:lobby`.
2. User opens entry modal, selects ticket count, confirms purchase. UI shows optimistic entry while awaiting server confirmation.
3. When pot locks, UI transitions to countdown + fairness commit display.
4. Settlement reveal triggers winner animation and summary modal; losers see CTA to join next pot.
5. Completed pots move to history tab with accessible transcript of commit/reveal data.

## 7. Dependencies

- Requires Supabase realtime channels and Postgres functions for commit/reveal locking.
- Settlement service provides reveal seed + credits transfer.
- Shared provably-fair utilities with Case Battles (reuse DTOs where possible).
- Observability pipeline must capture fairness metrics per pot.

## 8. Analytics & Alerts

- Track events: `pot_joined`, `pot_locked`, `pot_settled`, `pot_cancelled`.
- Alert on: pot locked > 2 minutes without settlement, duplicate IPs > threshold, reveal mismatch.
- Dashboard: TTF distribution, churn rate (players joining subsequent pots), fraud flag volume.

## 9. Risks & Open Questions

- Need final decision on spectator view of entrant list (full vs summarized) for privacy.
- Collusion detection heuristics may cause false positives; require override UX.
- Settlement dependency latency—define SLA with settlement service.

## 10. Acceptance Criteria

- APIs documented here implemented with Supabase schema and RLS.
- Frontend lobby shows realtime fills, handles locked/settled transitions gracefully.
- Commit/reveal proofs persisted and exposed for audit with verifiable hash chain.
- Automated tests cover entry caps, fairness calculations, settlement success/failure paths.
