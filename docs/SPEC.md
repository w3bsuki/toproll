# TopRoll Product Specification

**Version:** 1.0  
**Last Updated:** October 2025  
**Status:** Active

---

## 1. Product Vision

Build a CS2 skin-gaming platform combining community engagement with provably fair mechanics. Launch with **Community Pots**, **Marketplace**, and **Case Battles** as core experiences.

### Mission
Create a transparent, fast, watchable gambling platform where CS2 players can engage with their skins through multiple game modes while maintaining trust through cryptographic fairness.

### Success Metrics
- **Retention:** D1 ≥35%, D7 ≥15%, D30 ≥8%
- **Engagement:** Avg session ≥12min, ≥3 interactions/session
- **Performance:** p95 page load <3s, p95 WS fanout <150ms
- **Reliability:** <1 critical incident/month, p95 support resolution <24h
- **Revenue:** GGR stability ±2% of target over 30 days

---

## 2. User Personas

### Primary: Active CS2 Gambler (18-35)
- **Goals:** Quick games, fair odds, inventory liquidity, social engagement
- **Pain Points:** Slow skin trading, opaque odds, boring UX
- **Needs:** Fast auth, real-time updates, mobile support, verifiable fairness

### Secondary: Casual CS2 Player
- **Goals:** Try gambling without commitment, understand mechanics
- **Pain Points:** Complex interfaces, high minimums, confusing rules
- **Needs:** Clear onboarding, low entry barriers, educational content

### Tertiary: Spectator/Social User
- **Goals:** Watch big wins, chat, discover new games
- **Pain Points:** Can't participate without inventory
- **Needs:** Live drops ticker, chat, easy transition to player

---

## 3. Core Features

### 3.1 Authentication & Profiles
**User Story:** *As a visitor, I can sign in with Steam and access the platform instantly.*

**Requirements:**
- Steam OpenID authentication flow
- Automatic profile creation (username, avatar, Steam64 ID)
- Secure session management (HttpOnly, Secure cookies)
- Profile page showing stats (total wagered, profit, win rate)
- KYC tier assignment based on region/verification

**Acceptance Criteria:**
- [ ] Steam auth completes in <3s
- [ ] Session persists 30 days
- [ ] Profile shows real-time balance
- [ ] Users can logout and clear session

---

### 3.2 Inventory & Marketplace
**User Story:** *As a user, I can convert CS2 skins to credits and purchase listed items.*

**Requirements:**
- Fetch CS2 inventory via Steam API
- Real-time item valuation (market midpoint with MAD clamping)
- List items for sale with automatic pricing
- Purchase items with credit balance
- Transaction history and receipts
- Stale price protection (max 1hr old prices)

**Acceptance Criteria:**
- [ ] Inventory loads in <2s
- [ ] Prices updated every 15min
- [ ] Listings appear in marketplace within 5s
- [ ] Purchase flow has confirmation step
- [ ] Failed transactions rollback atomically

**Data Model:**
```typescript
interface MarketplaceListing {
  id: string;
  seller_id: string;
  item_name: string;
  market_name: string;
  market_value: number;
  listed_price: number;
  status: 'active' | 'sold' | 'removed';
  created_at: timestamp;
}
```

---

### 3.3 Community Pots (MVP)
**User Story:** *As a user, I can join pooled pots with transparent winner selection.*

**Requirements:**
- Create pot with entry fee and max participants
- Join pot with credit deduction
- Provably fair winner selection (SHA-256 + block hash)
- Real-time participant list
- Winner payout with 5% house edge
- Anti-collusion: IP/device fingerprinting
- Pot history and fairness verification

**Game Flow:**
1. Pot created with parameters (fee, max_participants, duration)
2. Users join until full or timeout
3. System generates server_seed + combines with block_hash
4. Winner selected: `hash(server_seed + block_hash + pot_id) % participant_count`
5. Payout executed, fairness proof published

**Acceptance Criteria:**
- [ ] Pot fills within 5min on average
- [ ] Winner selection verifiable by any user
- [ ] Payout executes within 10s of selection
- [ ] No same-IP users in single pot
- [ ] Pot creation rate limited to 1/min/user

**Data Model:**
```typescript
interface Pot {
  id: string;
  entry_fee: number;
  max_participants: number;
  current_participants: number;
  status: 'open' | 'active' | 'completed';
  winner_id?: string;
  server_seed_hash: string;
  server_seed?: string; // revealed after completion
  block_hash?: string;
  total_pool: number;
  payout_amount: number;
  created_at: timestamp;
  completed_at?: timestamp;
}

interface PotEntry {
  id: string;
  pot_id: string;
  user_id: string;
  entry_number: number;
  joined_at: timestamp;
}
```

---

### 3.4 Case Battles (MVP)
**User Story:** *As a user, I can battle opponents by opening cases with verifiable outcomes.*

**Requirements:**
- 1v1 and 2v2 battle modes
- Select 1-5 cases per battle
- Real-time case opening animation
- Provably fair outcome per case
- Total value comparison determines winner
- Spectator mode with live updates
- Battle history and replays
- Fairness verification UI

**Game Flow:**
1. User creates battle, selects mode (1v1/2v2) and cases
2. Opponent(s) join and pay entry fee
3. Battle starts, each player's cases open sequentially
4. Each case outcome: `hash(server_seed + client_seed + case_id + round) → item_id`
5. Total values calculated, winner takes pool (minus 5% house)
6. All seeds revealed for verification

**Acceptance Criteria:**
- [ ] Battle creation completes in <2s
- [ ] Case opening animation synced across all clients
- [ ] Outcome verification page shows all seeds
- [ ] Spectators see real-time updates with <150ms delay
- [ ] Winner payout executes within 10s

**Data Model:**
```typescript
interface Battle {
  id: string;
  mode: '1v1' | '2v2';
  case_ids: string[];
  entry_fee: number;
  status: 'waiting' | 'active' | 'completed';
  participants: BattleParticipant[];
  rounds: BattleRound[];
  winner_id?: string;
  total_pool: number;
  server_seed_hash: string;
  server_seed?: string;
  created_at: timestamp;
  started_at?: timestamp;
  completed_at?: timestamp;
}

interface BattleRound {
  round_number: number;
  participant_id: string;
  case_id: string;
  item_won: string;
  item_value: number;
  client_seed: string;
  outcome_hash: string;
}
```

---

### 3.5 Social Features
**User Story:** *As a user, I can engage with the community and follow big wins.*

**Requirements:**
- Live Drops Ticker (global feed of wins >$50)
- Public chat room with moderation
- Spectate any active battle/pot
- User profiles with stats
- Leaderboards (daily/weekly/all-time)

**Acceptance Criteria:**
- [ ] Live drops update within 5s of win
- [ ] Chat messages appear for all users within 500ms
- [ ] Spectator count shown on battles
- [ ] Leaderboards update every 5min

---

### 3.6 Risk & Compliance
**User Story:** *As ops, I can maintain platform safety and regulatory compliance.*

**Requirements:**
- **KYC Tiers:**
  - Tier 0: No verification, $50 daily limit
  - Tier 1: Email verified, $500 daily limit
  - Tier 2: Full KYC, $5000 daily limit
- **Region Gating:** Block restricted jurisdictions
- **Rate Limiting:** Per-user, per-IP limits on actions
- **RLS Policies:** Row-level security on all tables
- **Audit Logging:** All financial transactions logged
- **Feature Toggles:** Emergency pause for games
- **Refund System:** Admin refund with dual approval

**Acceptance Criteria:**
- [ ] KYC limits enforced at transaction level
- [ ] Blocked regions cannot access game routes
- [ ] All DB queries respect RLS policies
- [ ] Audit logs searchable by user/transaction/date
- [ ] Refunds require 2-admin approval

---

## 4. Technical Requirements

### 4.1 Performance
- **Page Load:** p95 < 3s (FCP), p99 < 5s
- **API Response:** p95 < 300ms, p99 < 1s
- **WebSocket Fanout:** p95 < 150ms for battle updates
- **Database Queries:** p95 < 100ms, p99 < 500ms
- **Provably Fair Verification:** < 500ms per proof

### 4.2 Security
- All passwords/seeds stored hashed (bcrypt rounds=12)
- Session cookies: HttpOnly, Secure, SameSite=Strict
- CSRF tokens on all mutations
- Rate limiting: 100 req/min/IP, 50 req/min/user
- RLS enforced on all Supabase tables
- Vault storage for server seeds
- No PII in logs except user_id

### 4.3 Reliability
- 99.5% uptime SLA (excluding maintenance)
- Idempotent settlement operations
- Circuit breakers on external APIs (Steam, market data)
- Automatic rollback on failed payouts
- Health check endpoint responds in <100ms
- Database backups every 6hr, retained 30 days

### 4.4 Accessibility
- WCAG 2.1 AA compliance
- Minimum contrast ratio 4.5:1 on text
- Keyboard navigation for all interactive elements
- Focus indicators visible and distinct
- Reduced motion support via `prefers-reduced-motion`
- Screen reader tested on critical flows

### 4.5 Observability
- Structured JSON logs with correlation IDs
- Metrics: auth events, wagers, payouts, errors
- Error budgets: <0.5% error rate, <1% slow requests
- Distributed tracing on cross-service calls
- Alerting: Critical errors, balance mismatches, high latency

---

## 5. Scope & Roadmap

### Launch (MVP) - Q4 2025
- ✅ Steam Authentication
- ✅ User Profiles
- ✅ Inventory Read
- ✅ Marketplace (list/buy)
- ✅ Community Pots
- ✅ Case Battles (1v1/2v2 standard)
- ✅ Live Drops Ticker
- ✅ Public Chat
- ✅ Provably Fair Verification
- ✅ KYC Tiers (0-2)
- ✅ Basic Admin Panel

### Post-Launch - Q1 2026
- Advanced game modes (Crazy mode, tournaments)
- Trading bot network
- Withdrawal system
- Mobile app (React Native)
- Creator program
- Advanced analytics dashboard

### Out of Scope
- Full trading automation at launch
- Complex tournament systems
- Affiliate/referral program (later)
- Cryptocurrency payments (later)

---

## 6. User Flows

### 6.1 First-Time User Flow
1. Land on homepage, see hero banner + live drops
2. Click "Sign in with Steam"
3. Redirect to Steam, authorize
4. Return to site, profile auto-created
5. See dashboard with balance ($0)
6. Navigate to Inventory
7. Select item to list
8. Confirm listing, receive credits
9. Join first Community Pot
10. Watch draw, see fairness proof

### 6.2 Battle Creation Flow
1. Navigate to "/battles"
2. Click "Create Battle"
3. Select mode (1v1/2v2)
4. Choose cases (1-5)
5. See total entry fee
6. Confirm creation
7. Wait in lobby (max 5min)
8. Battle starts when full
9. Watch cases open in real-time
10. See winner announcement
11. Credits added to balance
12. View fairness proof

### 6.3 Marketplace Purchase Flow
1. Navigate to "/marketplace"
2. Apply filters (price, rarity)
3. Click item card
4. See item details modal
5. Click "Buy for X credits"
6. Confirm purchase
7. See success message
8. Item appears in inventory
9. Receive trade offer (future)

---

## 7. Edge Cases & Error Handling

### 7.1 Payment Failures
- **Insufficient balance:** Show clear error, suggest listing items
- **Concurrent purchase:** Lock listing, return error to second user
- **Network timeout:** Rollback transaction, refund credits

### 7.2 Provably Fair Failures
- **Missing seeds:** Refund all participants, log incident
- **Hash collision:** Regenerate seed, retry draw
- **Verification mismatch:** Alert ops, freeze battle, investigate

### 7.3 Real-time Failures
- **WebSocket disconnect:** Auto-reconnect with exponential backoff
- **Message loss:** Client requests state resync
- **Stale state:** Show warning, disable actions until fresh

---

## 8. Non-Functional Requirements

### 8.1 Testability
- Unit test coverage >80% for business logic
- E2E tests for critical flows (auth, purchase, battle)
- Provably fair verification tested against known inputs
- Load testing: 1000 concurrent users, 10k RPM

### 8.2 Maintainability
- TypeScript strict mode enabled
- Svelte 5 runes exclusively (no legacy patterns)
- Component library with Storybook
- API documentation auto-generated from types
- Database migrations version controlled

### 8.3 Scalability
- Horizontal scaling for SvelteKit instances
- Supabase connection pooling (100 connections)
- CDN for static assets
- Rate limiting prevents abuse
- Database indexes on hot paths

---

## 9. Assumptions

1. Steam API remains accessible and stable
2. Users have CS2 inventories with tradable items
3. Market price data available from public sources
4. Supabase handles production load
5. Users understand basic gambling mechanics

---

## 10. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Steam API downtime | High | Low | Cache last-known inventories, show stale data warning |
| Market price manipulation | High | Medium | Use median with MAD outlier detection, 1hr price staleness limit |
| Collusion in pots | Medium | High | IP/device fingerprinting, behavioral analysis, manual review |
| Regulation changes | High | Medium | KYC system ready, region gating configurable, legal review |
| Database failure | Critical | Low | Automated backups every 6hr, failover replica, rollback procedures |
| Provably fair compromise | Critical | Very Low | Vault-protected seeds, regular audits, bug bounty program |

---

## 11. Success Criteria

**Launch is successful if:**
- [ ] All MVP features functional and tested
- [ ] 100 active users within first week
- [ ] <5 support tickets per 100 users
- [ ] Zero critical security incidents
- [ ] 99.5% uptime first month
- [ ] p95 page load <3s sustained
- [ ] All provably fair verifications pass external audit

---

## 12. Glossary

- **Case:** Container with random CS2 items, opened via battle or unboxing
- **Community Pot:** Pooled game where participants buy entries, one winner takes pool
- **Provably Fair:** Cryptographic proof that game outcomes are predetermined and verifiable
- **RLS:** Row Level Security - Postgres feature enforcing access control at row level
- **MAD:** Median Absolute Deviation - Statistical measure for outlier detection
- **House Edge:** Platform fee, typically 5% of pool/winnings
- **KYC:** Know Your Customer - Identity verification process
- **GGR:** Gross Gaming Revenue - Total wagers minus payouts

---

**Document Owner:** Product Team  
**Review Cadence:** Monthly  
**Change Control:** All changes require PM approval
