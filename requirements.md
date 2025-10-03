# Project Requirements Baseline (Oct 2025)

This document defines project-wide functional and non-functional requirements for launch. Module-specific requirements (e.g., Steam Auth) inherit from this baseline.

## 1. Functional Requirements (by Pillar)

### 1.1 Auth & Profiles

- Steam OpenID login, session management (HttpOnly, Secure), logout
- Create/refresh user profile row; avatar/name; show Steam64 ID

### 1.2 Inventory & Marketplace

- Read CS2 inventory; valuation snapshot; list item for credits; purchase flow
- Pricing from market midpoint with median/MAD clamping; stale-feed guardrails

### 1.3 Community Pots (MVP)

- Create/join pot; pool credits; draw winner provably; payout; basic anti-collusion

### 1.4 Games — Case Battles (MVP)

- 1v1/2v2 standard mode; case sequence; realtime pulls; totals; settlement; PF verifier

### 1.5 Social

- Live Drops Ticker; global chat; spectate lobby/battle; CTA to join next

### 1.6 Admin/Ops

- Pause games; lock deposits; seed rotation; refund/settlement override with dual approval

## 2. Non-Functional Requirements

- Security & Privacy: RLS on all tables; PF seed handling in vault; minimal PII; KYC tiering; region gating
- Performance: p95 page < 3s; p95 WS fanout < 150ms; PF verify < 500ms
- Reliability: idempotent settlements; circuit breakers; clear rollback
- Observability: structured logs with correlation IDs; basic metrics (auth, wagers, payouts); error budgets
- Accessibility: WCAG AA contrast; keyboard navigation; reduced motion

## 3. Scope / Out of Scope

- In: pillars in 1.1–1.6 for MVP
- Out: full trading automation, large tournament systems, broad game catalogue beyond Case Battles

## 4. Assumptions

- Steam users are primary persona; inventory access allowed
- Supabase provides DB/Auth/Realtime; Vite/SvelteKit handles SSR

## 5. Constraints

- Regulatory: KYC before wagering in restricted regions; age gating
- Budget/perf: avoid heavy server-side pricing calls per request; cache and snapshot

## 6. Dependencies

- Steam OpenID & Web API; Supabase; pricing feeds; build/CI infra

## 7. Data Privacy & Retention

- Store minimal identifiers; segregate KYC; delete upon request; retention policy documented in security doc

## 8. Observability & Telemetry

- Log schema: timestamp, level, corr_id, user_id (if any), event, attrs
- Metrics: auth success/fail, active battles, RTP drift, error rate, latency

## 9. Accessibility & Localization

- English at launch; a11y acceptance checks in CI smoke (axe-linter where feasible)

## 10. Risks & Mitigations

- Pricing volatility → clamp + stale-feed guard + delist
- Collusion → heuristics; throttle; KYC escalation
- PF compromise → sealed seeds, rotation schedule, verifier transparency

## 11. Success Metrics (KPIs)

- D1/D7 retention, session length, interactions/session
- GGR variance within ±2% target; user support SLO p95 < 24h

## 12. Definition of Done

- Spec PR approved; implementation PR passes tests; docs updated; runbook entries added

## 13. Glossary

- PF: Provably Fair; MAD: Median Absolute Deviation; RTP: Return to Player

---

# Annex — Module: Steam Auth (kept for continuity)

(Module-level details can remain in PRD.md Annex A.)
