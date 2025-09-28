# Requirements Document

## Introduction

The Steam Authentication & User Profiles feature provides the foundational user management system for the TopRoll CS2 platform. This feature enables users to authenticate exclusively through Steam OpenID, automatically creates user profiles linked to their Steam64 ID, and provides access to their CS2 inventory data. This system serves as the authentication and user data foundation that all other platform features will depend on.

## Requirements

### Requirement 1

**User Story:** As a CS2 player, I want to sign in using my Steam account, so that I can access the TopRoll platform without creating a separate account.

#### Acceptance Criteria — Requirement 1

1. WHEN a user visits the platform THEN the system SHALL display a "Sign in with Steam" option as the only authentication method
2. WHEN a user clicks "Sign in with Steam" THEN the system SHALL redirect them to Steam's OpenID authentication page
3. WHEN Steam authentication is successful THEN the system SHALL receive the user's Steam64 ID and basic profile information
4. WHEN authentication completes THEN the system SHALL integrate with Supabase Auth to issue a JWT token
5. IF authentication fails THEN the system SHALL display an appropriate error message and allow retry

### Requirement 2

**User Story:** As a new user, I want my profile to be automatically created when I first sign in, so that I don't need to manually set up my account.

#### Acceptance Criteria — Requirement 2

1. WHEN a user successfully authenticates for the first time THEN the system SHALL automatically create a profile record in the Supabase database
2. WHEN creating a profile THEN the system SHALL store the user's Steam64 ID as the primary identifier
3. WHEN creating a profile THEN the system SHALL fetch and store the user's current Steam username and avatar URL
4. WHEN a profile is created THEN the system SHALL initialize default gamification stats (total wagered: 0, total profit: 0, win rate: 0, etc.)
5. IF profile creation fails THEN the system SHALL log the error and prevent user access until resolved

### Requirement 3

**User Story:** As a returning user, I want my profile information to be automatically updated with my current Steam data, so that my display name and avatar stay current.

#### Acceptance Criteria — Requirement 3

1. WHEN a user signs in THEN the system SHALL fetch their current Steam profile data
2. WHEN Steam profile data is retrieved THEN the system SHALL update the stored username and avatar URL if they have changed
3. WHEN profile updates occur THEN the system SHALL maintain the Steam64 ID as immutable
4. IF Steam API is unavailable THEN the system SHALL use cached profile data and log the issue
5. WHEN profile updates complete THEN the system SHALL reflect changes immediately in the user interface

### Requirement 4

**User Story:** As a user, I want to view my CS2 inventory on the platform, so that I can see what items I have available for trading or gaming.

#### Acceptance Criteria — Requirement 4

1. WHEN a user accesses their inventory page THEN the system SHALL fetch their CS2 inventory via Steam Web API
2. WHEN inventory is fetched THEN the system SHALL display item names, images, market values, and rarity information
3. WHEN inventory loading occurs THEN the system SHALL show appropriate loading states
4. IF inventory is private THEN the system SHALL display a message explaining how to make it public
5. IF Steam API fails THEN the system SHALL show an error message and retry option
6. WHEN inventory loads successfully THEN the system SHALL cache the data for 5 minutes to reduce API calls

### Requirement 5

**User Story:** As a user, I want to view my profile page with my Steam information and platform statistics, so that I can see my gaming history and achievements.

#### Acceptance Criteria — Requirement 5

1. WHEN a user accesses their profile page THEN the system SHALL display their Steam username, avatar, and link to Steam profile
2. WHEN displaying profile THEN the system SHALL show key gamification statistics (total wagered, profit, win rate, biggest win, etc.)
3. WHEN profile loads THEN the system SHALL display any earned badges or achievements
4. WHEN viewing profile THEN the system SHALL show recent activity or transaction history
5. IF profile data is missing THEN the system SHALL display default values and attempt to refresh data

### Requirement 6

**User Story:** As a platform administrator, I want user sessions to be secure and properly managed, so that user data is protected and sessions expire appropriately.

#### Acceptance Criteria — Requirement 6

1. WHEN a user authenticates THEN the system SHALL create a secure JWT token with appropriate expiration
2. WHEN tokens expire THEN the system SHALL automatically redirect users to re-authenticate
3. WHEN users log out THEN the system SHALL invalidate their session and clear all client-side tokens
4. WHEN handling sensitive operations THEN the system SHALL verify token validity and user permissions
5. IF token validation fails THEN the system SHALL require re-authentication before proceeding

## Scope

- Authentication via Steam OpenID only (no email/password, no other providers)
- Automatic profile creation and updates linked to Steam64 ID
- Read-only access to CS2 inventory via Steam Web API
- Session issuance and validation using Supabase Auth
- User-facing pages for sign-in, profile, and inventory

## Out of Scope

- Trading, deposits/withdrawals, or marketplace functionality
- Payment processing or wallet management
- Non-Steam authentication providers
- Admin dashboards beyond basic session validation
- CS2 inventory write operations or trade offers

## Assumptions

- Users have public Steam profiles; inventory may be private
- Steam Web API and OpenID endpoints are available and stable
- Supabase project is available with Auth and Postgres enabled
- Deployment runs over HTTPS and supports secure cookies
- i18n framework exists (inlang/Paraglide) with at least English strings

## Constraints

- Must comply with Steam API Terms of Use and rate limits
- Supabase Row Level Security must protect user data at rest
- No PII beyond Steam profile data is stored
- Tokens must not be stored in insecure browser storage
- Pages must render within 3 seconds p95 on a standard broadband connection

## Non-Functional Requirements

- Security
  - Use `state` and `nonce` in OpenID flow; verify issuer and audience
  - Enforce HTTPS; secure, HttpOnly, SameSite cookies
  - Supabase RLS to restrict `user_profiles` access to the authenticated user
  - Input validation and output encoding for all endpoints
- Performance
  - p95 page load ≤ 3s; p95 API latency ≤ 600ms for cached calls
  - Inventory requests cached for 5 minutes
- Reliability & Availability
  - Graceful degradation when Steam API is unavailable (use cache)
  - Retry with exponential backoff for transient failures
- Observability
  - Structured logs for auth, profile, and inventory flows
  - Metrics for success/failure rates and latencies
- Scalability
  - Stateless server routes; externalize session via Supabase
  - Shared cache layer (e.g., Redis or edge KV) optional but supported
- Usability & Accessibility
  - Meet WCAG 2.1 AA for interactive components
  - Clear error states and recovery guidance

## Dependencies

- Steam OpenID and Steam Web API (`GetPlayerSummaries`, CS2 inventory endpoints)
- Supabase Auth, Postgres, and RLS
- SvelteKit runtime and adapter (Node or serverless platform)
- Optional: Sentry (or equivalent) for error tracking

## Data Privacy & Retention

- Stored data: `steam_id`, display name, avatar URLs, profile URL, derived stats
- No passwords or sensitive secrets stored client-side
- Users can request deletion of their profile record; related cached data purged

## Observability & Telemetry

- Capture counters: sign-in attempts, sign-in successes/failures, callback errors
- Capture latencies: OpenID round-trip, profile fetch, inventory fetch
- Log correlation IDs per request; mask tokens and PII

## Accessibility & Localization

- Launch language: English (`messages/en.json`); design is i18n-ready via inlang/Paraglide
- Visible focus states, semantic HTML, and keyboard operability

## Risks & Mitigations

- Steam API outages → Serve cached data with banner; retry later
- Private inventories → Explain how to make inventory public; allow retry
- OpenID replay/CSRF → Validate `state`, `nonce`, and callback origin
- Token leakage → HttpOnly cookies; short-lived tokens; no localStorage

## Success Metrics (KPIs)

- ≥ 95% successful Steam sign-ins (rolling 7 days)
- p95 inventory fetch latency ≤ 600ms when cached; ≤ 2.5s cold
- < 1% route-guard bypass attempts; 0 known P1 security incidents

## Definition of Done

- All requirements 1–6 acceptance criteria validated by automated tests
- Unit, integration, and E2E tests added and passing in CI
- RLS policies enabled and verified by tests
- Env/secrets configured in the deployment environment
- Runbooks and error messages in place for Steam outages and private inventories
- Documentation updated (`requirements.md`, `design.md`, `tasks.md`)

## Glossary

- Steam64 ID: 64-bit unique identifier for a Steam account
- OpenID: Authentication protocol used by Steam for third-party sign-in
- RLS: Row Level Security in Postgres/Supabase
