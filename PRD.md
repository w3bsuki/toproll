# Product Requirements Document — Project-wide (Oct 2025)

This PRD defines the end-to-end product scope for launch and organizes module PRDs (e.g., Steam Auth, Marketplace, Community Pots, Games). It supersedes earlier single-feature PRDs by adding an overall vision while preserving module details below.

## A. Project Vision & Objectives

Build a CS2 skin-gaming platform with:
- Community Pots (MVP), Marketplace, and one flagship Game (Case Battles) at launch
- Fast, watchable UX with Live Drops + Chat
- Fairness and safety by design (provably-fair, KYC gating, RLS)
- Spec-driven delivery (docs-first, PR-based, TDD)

### Success Metrics (project)
- D1 retention ≥ 35%, D7 ≥ 15%
- Avg session length ≥ 12 min; ≥ 3 interactions/session
- Support-resolved SLO p95 < 24h; critical incidents < 1/mo
- GGR stability within ±2% of target over 30 days

## B. Scope (Launch)
- Auth & Profiles: Steam sign-in, profile, session mgmt
- Inventory & Marketplace: inventory read, sell/buy credits, item valuation snapshotting
- Community Pots (MVP): pooled entries, winner payout, anti-collusion basics
- Games: Case Battles (1v1/2v2, standard mode, verifier)
- Social: Live Drops ticker, public chat, spectate
- Risk/Compliance: KYC tiers, region gating, limits, RLS enforcement
- Observability: structured logs, basic metrics, runbook

### Non-Goals (Launch)
- Full trading bot network, withdrawals at scale (pilot only)
- Advanced game catalogue (Crash/Upgrader later)
- Complex tournaments/creator programs (post-launch)

## C. User Stories (top-level)
- As a visitor, I can sign in with Steam and see my avatar/ID.
- As a user, I can view my inventory and list items for credits at a fair value.
- As a user, I can join/observe Community Pots and Case Battles with transparent rules and verifiable outcomes.
- As a spectator, I can watch live battles/drops and join the next round easily.
- As ops, I can pause games, review logs, and verify PF proofs quickly.

## D. Core Features (summary)
1) Steam Auth & Profiles (see Module PRD below)
2) Inventory & Marketplace (valuations, listing, purchases)
3) Community Pots (MVP) — pooled game
4) Case Battles (MVP) — see docs/CASE_BATTLES_GAME_PLAN_2025.md
5) Social/UX — Live Drops, Chat, Lobby & Battle Room UX
6) Risk/Compliance — KYC tiers, limits, region blocks, RLS policies
7) Observability & Runbooks — logging, metrics, circuit breakers

## E. Non-Functional Requirements (project)
- Security: RLS everywhere; seed/secret ops in vault; least privilege
- Performance: p95 WS event→UI < 150ms (spectators), p95 page < 3s
- Reliability: graceful degradation; incident toggles; idempotent settlements
- Privacy: minimal PII; KYC segregation; retention policies documented
- Accessibility: keyboard nav, reduced motion, color contrast AA

## F. Release Plan
- Phase P0→P6 (project-wide) — see docs/roadmap.md
- PR-only flow; feature flags for risky modules
- Staged rollout; canary with internal accounts; rollback runbook

---

# Annex A — Module PRD: Steam Authentication & User Profiles

## 1. Introduction & Objective

### Objective

To provide a simple, secure, and familiar way for Steam users to log into the application. This feature aims to create a seamless onboarding experience and personalize the application by fetching and displaying the user's public Steam profile information (username and avatar).

### Background

Many potential users of our application are already Steam users. By integrating Steam Authentication, we lower the barrier to entry, removing the need for users to create and remember a separate account. This aligns with modern web practices and meets user expectations for third-party login options.

## 1.1 Scope & Non-Goals

### In Scope

- Steam-only authentication via OpenID integrated with Supabase Auth sessions
- Automatic profile creation in Supabase (`user_profiles`) on first login
- Automatic profile refresh of username/avatar on subsequent logins
- Read-only CS2 inventory viewing via Steam Web API
- Protected profile and inventory pages; sign-in/out UX

### Out of Scope (v1)

- Trading, payments, deposits/withdrawals, marketplace
- Non-Steam auth providers
- Any write operations to Steam inventory

## 2. Target Audience

The primary target audience for this feature is any individual with a Steam account who wishes to use this application.

## 3. User Stories

- **As a new user**, I want to sign in with my Steam account so that I don't have to create and manage a separate username and password.
- **As a logged-in user**, I want to see my Steam username and avatar within the application so that the experience feels personalized and I know I'm logged in correctly.
- **As a logged-in user**, I want to be able to view my unique 64-bit Steam ID on my profile page for easy reference.
- **As a user**, I want to be able to log out of the application easily and securely to end my session.
- **As a user**, I want to view my CS2 inventory so I can see my items.

## 4. Core Features & Requirements

### 4.1. Steam Authentication

- **Description**: Users must be able to initiate and complete authentication using their Steam account via the OpenID 2.0 protocol.
- **Requirements**:
  - The application must provide a "Sign in with Steam" button.
  - Users will be redirected to the official Steam community website to log in.
  - The application must securely handle the callback from Steam, verifying the user's identity.

### 4.2. User Profile (Persistence & Updates)

- **Description**: After logging in, users will have a dedicated profile page displaying their public Steam information.
- **Requirements**:
  - The profile page must display the user's current Steam username (persona name).
  - The profile page must display the user's current Steam avatar.
  - The profile page must display the user's 64-bit Steam ID.
  - On first login, create a `user_profiles` record linked to Supabase `auth.users.id`.
  - On subsequent logins, refresh username/avatar from Steam if changed.

### 4.3. Session Management & Route Protection

- **Description**: The application's UI and session handling must dynamically reflect the user's authentication state.
- **Requirements**:
  - Supabase Auth issues/validates session (HttpOnly, Secure cookies; short TTL).
  - The main navigation bar must show a "Sign in" option for logged-out users.
  - For logged-in users, the navigation bar must display their avatar and username, which links to their profile page.
  - The profile and inventory pages must be protected routes, accessible only to authenticated users.

### 4.4. Logout

- **Description**: Users must have a clear method to terminate their session.
- **Requirements**:
  - A "Logout" button must be available to authenticated users.
  - Clicking "Logout" must clear all session data and log the user out of the application.

### 4.5. CS2 Inventory (Read-only)

- **Description**: Users can view their CS2 inventory via Steam Web API.
- **Requirements**:
  - Inventory grid shows name, image, rarity, market value when available.
  - Handle private inventories with guidance to make public.
  - Cache inventory for 5 minutes; show loading and error states.

## 5. Design & User Experience (UX) Flow

1. **Initial Visit**: A user arrives at the site and is presented with a clean interface containing a prominent "Sign in with Steam" button.
2. **Authentication**: The user clicks the button and is seamlessly redirected to the familiar, trusted Steam login page.
3. **Authorization**: The user logs in with their Steam credentials and authorizes the application.
4. **Redirection & Profile**: Upon success, Steam redirects the user back to the application, directly to their newly created profile page, where their avatar, username, and Steam ID are displayed. The site's main navigation now shows their identity.
5. **Logout**: The user can navigate to their profile and click a "Logout" button, which signs them out and returns them to the state of a logged-out user.
6. **Inventory**: The user navigates to the inventory page to view items. If inventory is private, guidance is shown.

## 6. Success Metrics

The success of this feature will be measured by:

- **Login Completion Rate**: >95% of users who initiate the Steam login process successfully complete it.
- **User Adoption**: A steady increase in the number of unique users logging into the application over time.
- **Error Rate**: <1% of all login attempts result in a user-facing error message.
- **Inventory Load Latency**: p95 ≤ 600ms cached, ≤ 2.5s cold.

## 7. Out of Scope

The following items are explicitly out of scope for this initial implementation:

- Trading, deposits/withdrawals, payments, marketplace features.
- Non-Steam authentication providers.
- Modifying Steam inventory or initiating trades.
- Features beyond authentication, profile, and inventory display.

## 8. Dependencies & Interfaces

- Steam OpenID and Steam Web API (player summary, CS2 inventory)
- Supabase Auth and Postgres with RLS (`user_profiles` table)
- SvelteKit application and routes
- Optional: Redis/edge cache, Sentry

## 9. Non-Functional Requirements (summary)

- Security: Validate OpenID `state`/`nonce`; HttpOnly cookies; RLS; input validation
- Performance: p95 page ≤ 3s; cached inventory ≤ 600ms
- Reliability: Graceful degradation when Steam is down (serve cache + banner)
- Observability: Structured logs; basic metrics on auth/profile/inventory

## 10. Acceptance Criteria (traceable)

- Auth: Sign-in button; redirect to Steam; validated callback; session established
- Profile: First login creates `user_profiles`; subsequent login updates username/avatar
- Inventory: List items; handle private inventory; cache 5m; loading/error states
- Route protection: `/profile` and `/inventory` require auth; logout clears session

## 11. Rollout & Release Plan

1. Apply migrations and RLS in staging; verify with tests
2. Deploy app to staging; run E2E suite
3. Enable caching and monitors; validate logs/metrics
4. Production: apply migrations; deploy app; canary test with test account
5. Post-launch: watch error rates and latency; rollback if critical

## 12. Risks & Mitigations

- Steam outage or rate limits → serve cache, backoff, status banner
- Private inventories → clear guidance with retry
- Auth replay/CSRF → strict `state`/`nonce` validation, origin checks
- Token leakage → HttpOnly cookies; short TTL; no localStorage
