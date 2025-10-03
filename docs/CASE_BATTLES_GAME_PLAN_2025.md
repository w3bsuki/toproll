# CS2 Case Battles — Launch Game Plan (Oct 2025)

## Executive Summary
- Pick: CS2 Case Battles (multiplayer case opening with winner-takes-all variants).
- Why: Highest social virality in CS2 skin casinos, strong viewer appeal, deep retention via formats (2v2, 3v3, ‘Crazy Mode’, All-In), synergizes with your Marketplace and Community Pots, and aligns with existing repo primitives (cases, items, battles tables).
- Outcome: Ship a polished, provably-fair, highly watchable flagship game with clear upgrade paths (tournaments, streaks, seasonal ladders).

## Market Context (2025)
- Case Battles and Upgrader remain top-engagement CS2 modes; Crash is ubiquitous but less CS2-native. Battles drive concurrent viewership and creator content.
- Community features (chat, live drops, spectating, rematch) multiply retention vs solo modes.
- Monetization comes from case markup + optional rake on special modes, not from altering odds.

## Goals & KPIs
- DAU to concurrent spectators ratio ≥ 0.35
- Avg session length ≥ 12 minutes; ≥ 3 battles/user/session
- Bet conversion ≥ 22% from spectators within 24h
- GGR margin 6–10% (case markup + optional mode rake)
- < 1% chargeback rate; collusion detection flagged < 0.5% of battles, with < 0.05% false positives

## Game Modes (V1 and beyond)
- V1 (MVP, 2–3 weeks):
  - 1v1, 2v2 battles
  - Standard mode (highest total value wins)
  - Battle length: 3, 5, 10 cases per battle
  - Tie-break: provably-fair coinflip using next nonce
  - Public spectate + chat + live battle feed
- V1.1 (weeks 4–6):
  - Crazy Mode (lowest total wins)
  - 3v3, 4-way FFA
  - Rematch, Battle of the Day highlight, creator rooms
- V2 (post-launch):
  - Mixed case sequences, custom case lists
  - Tournaments, ladders, quests, streak multipliers
  - Side-bets for spectators (micro-wagers on next pull outcome)

## Core Rules
- Each battle defines: participants (2–6), case list (N cases), mode (standard/crazy), entry price (sum of case prices), winner payout (all items or value).
- Every round: all participants open the same case simultaneously; pulled item values sum per team/participant.
- Winner: highest total (Standard) or lowest total (Crazy). Ties resolved by provably-fair coinflip.
- Payout: winner(s) receive the full basket value (or the actual items, depending on custody model). For MVP, credit payouts valued at market midpoint, items delivered on withdrawal.

## Economy & Monetization
- Case pricing = market value baseline × (1 + markup%). Start at 6–8%.
- Optional mode rake (0–2%) on special formats (Crazy, 3v3). Leave at 0% for MVP to boost adoption.
- Skin valuation: hourly market midpoint; block extreme volatility outliers with rolling median + MAD.
- Deposits/withdrawals: internal credit ledger; deliver items on withdrawal via bot once tradelocked constraints allow.

## Provably Fair
- Seeds:
  - Server seed (HMAC key) committed as SHA256(server_seed) at rotation start.
  - Client seed (per user session) + nonce per pull.
- Per pull hash: H = HMAC_SHA256(server_seed, client_seed || ':' || global_round_id || ':' || pull_nonce)
- Map to outcome:
  - Convert first 8 bytes of H to uint64, normalize to [0,1).
  - Use cumulative probability table built from `case_items.probability` to select the item.
- Transparency:
  - Expose verifier page to input server seed (revealed on rotation end), client seed, nonce, and reproduce pulls.
  - Publish rotation schedule and last 20 rounds’ proof bundle.

## Anti-Abuse & Risk Controls
- Collusion detection: identical IP/device across opposing teams; abnormal join patterns; repeated transfers post-win; win/loss correlation clustering. Auto-throttle or require additional KYC.
- Limits: per-battle max pot; per-user daily loss and wager caps; global circuit breaker if payout-to-wager ratio exceeds X sigma.
- Fairness: odds strictly match `case_items.probability`; never change by user, size, or time.
- Compliance: region gating; age/KYC gates before wager; conspicuous responsible gambling UI.

## Architecture
- Realtime:
  - WebSocket room per battle: `battles:{id}`
  - Broadcast states: `waiting` → `in_progress` (per-round ticks) → `settling` → `completed`
- Services:
  - Battle Orchestrator (authoritative state machine)
  - RNG/Provably Fair Service (seed mgmt, hashing, mapping)
  - Pricing Service (market pulls, medianization, caches)
  - Settlement Service (idempotent payouts, fee accounting)
- Data:
  - Postgres (Supabase) for battles, items, openings (already scaffolded in db/migrations/0004_cases_battles.sql)
  - Redis (or Supabase Realtime / Postgres NOTIFY) for pub/sub

## Data Model (Delta on existing schema)
- Add tables:
  - `battle_cases` (sequence of cases per battle)
    - id (uuid), battle_id (fk), case_id (fk), order_index (int)
  - `battle_rounds` (per case per battle)
    - id, battle_id, round_index, case_id, server_seed_hash, revealed_server_seed (nullable until rotation end), created_at
  - `battle_pulls` (per participant per round)
    - id, round_id, participant_id, item_id, client_seed, nonce, hash, mapped_roll, created_at
- Add indexes for (battle_id, order_index), (round_id), (participant_id, round_id).
- Keep current `battles`, `battle_participants`, `battle_results` for summary; materialize winner results post-settlement.

## State Machine (per battle)
- waiting: accept joins until `max_participants` reached or countdown expires
- locking: lock participants, debit entry fees, construct `battle_cases`
- in_progress(round=k): orchestrator emits `round_start(k)`, collects provably-fair pulls, emits `round_result`
- settling: compute totals; tie-check; payout
- completed/cancelled: final snapshot; allow rematch link

## API & Realtime Contracts
- HTTP (REST):
  - POST `/api/battles` create battle {cases[], mode, teams, max_participants}
  - POST `/api/battles/{id}/join`
  - POST `/api/battles/{id}/start` (creator or auto when full)
  - GET `/api/battles/{id}` details
  - GET `/api/battles/feed?status=waiting|active` lobby feed
- WS events (channel `battles:{id}`):
  - `participant_joined`, `participant_left`
  - `battle_locked`, `round_start {index, case_id}`
  - `round_pull {participant_id, item, hash, nonce}` (can be batched)
  - `round_result {index, pulls[], subtotals}`
  - `battle_settled {winner_id|teams, totals, tie_break?}`

## Frontend (SvelteKit)
- Views:
  - Battle Lobby: filter, create, join, spectate
  - Battle Room: timeline (rounds), pull reels, totals, chat, players
  - Verifier: provably-fair seed/nonce checker
- Components (reuse where possible):
  - Use `ChatPanel.svelte`, `LiveDropsTicker.svelte`, `HeroBanner.svelte`
  - New: `BattleRoom.svelte`, `BattlePullReel.svelte`, `BattleTotals.svelte`, `BattleCreateDialog.svelte`
- UX details:
  - Animations tied to `round_start` and `round_result`
  - Spectator CTA to join next/rematch; quick buy-in presets
  - Accessibility: reduced motion mode, screen-reader labels

## Pricing & Items
- Source `market_value` hourly; apply rolling median + MAD to clamp anomalies.
- For payout: credit winners with total at fair value snapshot taken at battle start; item delivery on withdrawal.
- Edge cases: delist or pause cases if pricing feed stale > 2h or variance spikes.

## Security & Compliance
- KYC tiers with limits; AML monitoring for rapid in/out; region blocks.
- Custody: inventory segregation; journaling of every credit and item move; 4-eyes for hot wallet ops.
- Secrets: server seed handling in HSM or sealed vault; seed rotation schedule with immutable logs.

## Analytics & A/B
- Events: create/join/start, per-round pulls, totals, win/loss, rematch, spectate duration.
- Experiments: case list length (3 vs 5 vs 10), default mode (standard vs crazy), reveal pacing (fast vs dramatic).
- Success metrics: retention D1/D7, ARPDAU, GGR stability, churn cohorts.

## Operational Runbook
- Incidents: auto-circuit breaker; admin toggle to pause new battles; seed rotation rollback.
- Refund policy: if round fails pre-pull → full refund; if mid-battle disruption → settle completed rounds, refund remainder.
- Support tooling: battle replay, PF verifier embed, manual settlement override with dual approval.

## Delivery Plan & Timeline
- Week 1
  - Backend: orchestrator skeleton, schema delta (battle_cases, rounds, pulls)
  - Frontend: lobby + basic room UI; WS channel wiring
  - PF service: seed commit/reveal, roll mapping
- Week 2
  - End-to-end flow (1v1, 3 rounds); settlements; verifier page
  - Animations + totals; pricing service integration; limits
  - QA: unit tests for mapping, e2e happy path, idempotent settlement
- Week 3 (buffer)
  - 2v2; Crazy Mode gated; production hardening; logs/metrics; incident toggles
  - Creator room polish; marketing hooks; docs

## Test Plan
- Determinism: fixed seeds regression pack; compare mapped outcomes vs expected percentiles
- Property tests: cumulative probability coverage, tie-break unbiasedness
- Load: 1k concurrent spectators, 200 active battles; WS fanout latency < 150ms p95
- Chaos: drop WS briefly mid-round; ensure settlement idempotency

## Backlog (Post-Launch)
- Mixed-case sequences and curated lists
- Spectator side-bets and streak boosters
- Battle tournaments + seasonal ladder
- Mobile-native gestures and picture-in-picture spectator mode

## References (public context)
- Market observation across major CS2 casinos (case battle mode presence and prominence)
- Industry-standard PF patterns (server/client seed + nonce; HMAC-SHA256 mapping)
- Existing repo primitives: `db/migrations/0004_cases_battles.sql`, `src/lib/types.ts`

## Implementation Guide & Tasklist (For Agent/Claude)

Use this tasklist as the single source of truth to implement Case Battles end‑to‑end. Follow the file paths and contracts exactly. Keep changes tight to scope.

### Milestones
- M0: Project setup + DB schema delta
- M1: Realtime battle flow (1v1, 3 rounds)
- M2: Settlements + PF Verifier + basic UI polish
- M3: 2v2 + Lobby feed + Limits/Telemetry hardening

### M0 — Setup + Schema Delta
- [ ] Validate Supabase/Postgres connectivity and run existing migrations.
- [ ] Add new migration `db/migrations/0006_battle_rounds_pulls.sql` with:
  - Table `battle_cases` (id uuid pk, battle_id fk, case_id fk, order_index int)
  - Table `battle_rounds` (id uuid, battle_id fk, round_index int, case_id fk, server_seed_hash text, revealed_server_seed text null, created_at timestamptz default now())
  - Table `battle_pulls` (id uuid, round_id fk, participant_id fk, item_id fk, client_seed text, nonce bigint, hash text, mapped_roll numeric(10,8), created_at timestamptz default now())
  - Indexes: (battle_id, order_index), (battle_id, round_index), (round_id), (participant_id, round_id)
  - RLS: SELECT public, INSERT own rows where applicable
- [ ] Seed rotation config file `config/provably-fair.json` (rotation period hours, reveal buffer minutes)

### M1 — Realtime Battle Flow
Backend
- [ ] Create `src/lib/server/pf.ts` with:
  - `commitServerSeed(): { serverSeed:string, serverSeedHash:string }`
  - `hmac(serverSeed, message): string`
  - `mapRollToItem(roll:number, items:{probability:number,id:string}[]): string`
- [ ] Create `src/lib/server/orchestrator/battles.ts`:
  - State machine: waiting → locking → in_progress(k) → settling → completed/cancelled
  - Emits WS events: `participant_joined`, `battle_locked`, `round_start`, `round_pull`, `round_result`, `battle_settled`
  - Idempotent handlers; safe on restart
- [ ] REST endpoints (SvelteKit + handleHooks auth):
  - `POST /api/battles` payload {cases:string[], mode:'standard', max_participants:2|4}
  - `POST /api/battles/[id]/join`
  - `POST /api/battles/[id]/start`
  - `GET /api/battles/[id]`
  - `GET /api/battles/feed?status=waiting|active`
- [ ] WebSocket channel `battles:{id}` (Supabase Realtime or ws server): publish/subscribe helpers in `src/lib/realtime.ts`

Frontend
- [ ] Routes:
  - Lobby `src/routes/battles/+page.svelte` (list, filters, create, spectate)
  - Room `src/routes/battles/[id]/+page.svelte` (timeline, reels, totals, chat)
  - Verifier `src/routes/provably-fair/+page.svelte`
- [ ] Components under `src/lib/components/battles/`:
  - `BattleCreateDialog.svelte`
  - `BattleRoom.svelte`, `BattlePullReel.svelte`, `BattleTotals.svelte`
- [ ] Wire existing `ChatPanel.svelte` and `LiveDropsTicker.svelte` into the Room

### M2 — Settlement, PF Verifier, UI Polish
- [ ] Settlement service `src/lib/server/settlement.ts`:
  - Sum totals per team/participant; detect ties; apply coinflip with next nonce
  - Credit winners at snapshot market value (Pricing service)
- [ ] Pricing service `src/lib/server/pricing.ts`:
  - `getFairValue(item_id)` uses `case_items.market_value` with rolling median/MAD clamping
- [ ] PF Verifier page:
  - Inputs: serverSeed (revealed), clientSeed, nonce, case_id → reproduce item mapping
  - Show `server_seed_hash` match, roll value, selected item
- [ ] Basic limits in `src/lib/config/limits.ts` (max pot, per-user daily loss/wager)

### M3 — 2v2, Feed, Hardening
- [ ] Extend orchestrator for teams (2v2): team totals, UI layout
- [ ] Lobby Feed query optimized with indexes, status filters
- [ ] Telemetry `src/lib/analytics.ts`: battle create/join/start, round pulls, settle, spectate time
- [ ] Incident toggles: pause new battles, circuit breaker when payout/wager ratio spikes

### Contracts & Types
- [ ] Align DTOs with `src/lib/types.ts` and add:
  - `BattleRound { id, battle_id, round_index, case_id, server_seed_hash, created_at }`
  - `BattlePull { id, round_id, participant_id, item_id, client_seed, nonce, hash, mapped_roll }`
- [ ] WS payloads documented in code comments near emit points

### Acceptance Criteria
- Create → Join → Start → 3 rounds → Settle flow works with 2 participants
- PF verifier reproduces all pulls for a finished battle
- Restart during in_progress does not double-settle or lose state
- p95 WS event-to-UI latency < 150ms at 1k spectators

### Out of Scope (MVP)
- Crazy Mode, 3v3/FFA, mixed case sequences, spectator side-bets, tournaments

### Developer Notes
- Do not alter `case_items.probability` shape. Use exact cumulative mapping.
- Keep all settlement operations idempotent with dedupe keys (battle_id, round_index).
- Publish human-readable audit logs for each battle lifecycle.

### Copy-Paste Prompt for Claude (Agent Build)
You are implementing CS2 Case Battles in a SvelteKit + Supabase project. Follow docs/CASE_BATTLES_GAME_PLAN_2025.md and the Implementation Guide & Tasklist section. Deliver in milestones (M0→M3):
- Add DB migration 0006 for battle_cases, battle_rounds, battle_pulls with indexes and RLS.
- Implement PF library (HMAC commit/reveal, mapRollToItem), battle orchestrator, REST endpoints, and WS channel `battles:{id}`.
- Create Lobby page, Battle Room, and PF Verifier routes and components under the specified paths; reuse ChatPanel and LiveDropsTicker.
- Implement settlement with idempotency and pricing with rolling median/MAD clamping.
- Add limits/config, analytics events, and incident toggles.
Definition of Done: The 1v1 3-round battle runs end-to-end with reproducible PF, correct settlement, and lobby/room UX usable on desktop. Keep code focused to scope; do not refactor unrelated files.
