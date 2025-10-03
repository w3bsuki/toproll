# Project-wide Tasks & Roadmap

This file now tracks project-wide execution. See also: docs/roadmap.md

- [ ] P0 — Project Charter & Baseline Docs ([spec](docs/product/phases/P0.md))
  - [x] Normalize PRD.md, requirements.md within `docs/product/`
  - [x] Create product status dashboard and phase hub
  - [x] Add ADR formalizing spec-driven workflow
  - [ ] Add `.github` scaffolding (PR template, issue templates, CODEOWNERS)
  - [ ] Add CI skeleton workflow (`.github/workflows/ci.yml`)
  - [ ] Confirm `docs/engineering/{testing, observability, security, infra}.md` align with workflow (update if gaps)
  - [ ] Update `docs/tasks.md` and labels guide post-implementation PR
- [ ] P1 — Architecture & Conventions
  - Confirm module boundaries, DTO style, error model, folder layout, tokens
- [ ] P2 — DevEx & CI/CD
  - Typecheck/lint/test in CI; pre-push hooks; preview deploy (if used)
- [ ] P3 — Observability & Security
  - Logging schema, correlation IDs; basic metrics; RLS review; abuse gates
- [ ] P4 — Core Features
  - Community Pots (MVP), Marketplace, Case Battles wiring to spec
    - [x] Draft module PRD for Marketplace (docs/product/specs/marketplace.md)
    - [x] Draft module PRD for Community Pots (docs/product/specs/community-pots.md)
- [ ] P5 — UX & A11y
  - Component taxonomy, tokens, keyboard/reduced motion, contrast
- [ ] P6 — Release & QA
  - Release checklist, rollback, perf smoke, runbooks

# Implementation Plan

- [ ] 1. Set up project foundation and environment configuration
  - Initialize SvelteKit project with Svelte 5 and TypeScript
  - Configure Tailwind CSS v4 and install shadcn-svelte components
  - Set up Supabase client configuration and environment variables
  - Create basic project structure with lib, routes, and components directories
  - _Requirements: 1.1, 2.1_
  - Commands (run from repo root)
    - Dev: `pnpm dev`
    - Lint: `pnpm lint`
    - Typecheck: `pnpm check`
    - Unit tests: `pnpm test:unit -- --run`
    - E2E tests: `pnpm test:e2e`

- [ ] 2. Create database schema and Supabase configuration
  - Create user_profiles table with all required fields and constraints
  - Set up Row Level Security policies for user_profiles table
  - Create database indexes for optimal query performance
  - Write and test database migration scripts
  - _Requirements: 2.2, 2.4, 6.4_
  - Deliverables
    - SQL migration with `user_id` PK referencing `auth.users(id)`
    - RLS policies: select/insert/update own row
    - Trigger: `set_updated_at()`
  - MCP
    - Prefer Supabase MCP for: apply migration, execute SQL, list tables, verify RLS

- [ ] 3. Implement Steam OpenID authentication flow
  - Create Steam OpenID URL generation utility function
  - Implement Steam OpenID callback validation and parsing
  - Create authentication route handlers for login and callback
  - Add error handling for Steam authentication failures
  - Write unit tests for Steam OpenID utilities
  - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - DoD
    - Login redirects to Steam with `state`/`nonce`
    - Callback validates signature and expected claims
    - Errors surfaced with user-safe messages

- [ ] 4. Integrate Steam authentication with Supabase Auth
  - Create custom Supabase Auth provider for Steam
  - Implement JWT token generation and validation
  - Create session management utilities
  - Add authentication middleware for protected routes
  - Write integration tests for auth flow
  - _Requirements: 1.4, 6.1, 6.2, 6.4_
  - DoD
    - Session cookie is HttpOnly, Secure, SameSite
    - 401 redirect for unauthenticated protected routes
    - Tokens expire and require re-authentication

- [ ] 5. Build Steam API service for profile and inventory data
  - Create Steam Web API client with proper error handling
  - Implement player summary fetching functionality
  - Build CS2 inventory retrieval with item parsing
  - Add caching layer for Steam API responses
  - Create rate limiting for Steam API calls
  - Write unit tests for Steam API service
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.5_
  - DoD
    - PlayerSummary and Inventory parsed with types
    - Cache TTL: profile 1h, inventory 5m
    - Backoff on 429/5xx

- [ ] 6. Implement user profile management system
  - Create profile creation service for new users
  - Build profile update service for returning users
  - Implement profile data retrieval and caching
  - Add gamification stats initialization and tracking
  - Write unit tests for profile management
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_
  - DoD
    - New users create `user_profiles` row on first auth
    - Returning users update `username`/`avatar_url` if changed
    - RLS verified by tests

- [ ] 7. Create authentication UI components
  - Build AuthButton component with Steam branding
  - Create loading states and error handling for auth flow
  - Implement sign-out functionality and UI
  - Add responsive design for mobile and desktop
  - Write component tests for authentication UI
  - _Requirements: 1.1, 1.5, 6.3_
  - DoD
    - Button accessible (keyboard, ARIA)
    - Error toasts on failure

- [ ] 8. Build user profile display components
  - Create ProfileCard component with Steam data display
  - Implement gamification stats display
  - Add Steam profile link and avatar rendering
  - Create responsive profile layout
  - Write component tests for profile display
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - DoD
    - Displays name, avatar, profile link, stats
    - E2E verifies render post-login
  - MCP
    - Prefer Svelte MCP for: component scaffolding and route skeletons

- [ ] 9. Implement CS2 inventory display system
  - Create InventoryGrid component with item rendering
  - Build item filtering and sorting functionality
  - Add loading states and error handling for inventory
  - Implement private inventory detection and messaging
  - Create responsive grid layout for different screen sizes
  - Write component tests for inventory display
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - DoD
    - Loading/empty/error states implemented
    - Private inventory guidance shown
  - MCP
    - Prefer Svelte MCP for: component scaffolding and UI wiring

- [ ] 10. Create authentication guards and route protection
  - Implement route-level authentication guards
  - Create protected layout components
  - Add automatic redirect for unauthenticated users
  - Build session validation middleware

## Follow-ups

- Tighten empty/loading states for legacy demo components (CaseOpening, CaseCatalog) to match new marketplace theme.
  - Write integration tests for route protection
  - _Requirements: 6.1, 6.2, 6.4, 6.5_
  - DoD
    - Guarded routes return 302→login when not authenticated
    - 403 for insufficient access (future-proof)

- [ ] 11. Build user profile and inventory pages
  - Create profile page route with full user information
  - Implement inventory page with grid display
  - Add navigation between profile and inventory sections
  - Create breadcrumb navigation and page titles
  - Write end-to-end tests for user pages
  - _Requirements: 4.1, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5_
  - DoD
    - `/profile` and `/inventory` pass E2E
    - Navigation works on mobile/desktop

- [ ] 12. Implement error handling and user feedback
  - Create error boundary components for graceful failures
  - Build toast notification system for user feedback
  - Add retry mechanisms for failed API calls
  - Implement proper error logging and monitoring
  - Create user-friendly error messages and recovery options
  - Write tests for error scenarios and recovery
  - _Requirements: 1.5, 4.4, 4.5, 6.5_
  - DoD
    - Errors logged with correlation IDs
    - Retry/backoff tested

- [ ] 13. Add session management and security features
  - Implement automatic token refresh functionality
  - Create session timeout handling with user warnings
  - Add CSRF protection for authentication endpoints
  - Build secure logout with token invalidation
  - Write security tests for authentication vulnerabilities
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - DoD
    - Token refresh covered by tests
    - CSRF protection verified

- [ ] 14. Create comprehensive test suite
  - Write unit tests for all utility functions and services
  - Create integration tests for complete authentication flow
  - Build end-to-end tests for user journey scenarios
  - Add performance tests for Steam API integration
  - Create security tests for authentication and authorization
  - _Requirements: All requirements validation_
  - Commands
    - `pnpm test`
    - `pnpm test:e2e`
  - MCP
    - Prefer Svelte MCP for: generating test scaffolds for Svelte components (optional)

- [ ] 15. Optimize performance and add monitoring
  - Implement caching strategies for Steam API data
  - Add database query optimization and indexing
  - Create performance monitoring for API response times
  - Build error tracking and logging system
  - Add health check endpoints for system monitoring
  - _Requirements: Performance and reliability for all features_

## AI MCP Orchestration

- Purpose
  - Standardize how AI agents (e.g., Claude-Code) execute tasks using MCP tools.
  - Ensure DB tasks use Supabase MCP; Svelte UI tasks use Svelte MCP.

- Tools
  - Supabase MCP: migrations, SQL, RLS policies, logs, advisors, types generation.
  - Svelte MCP: scaffold Svelte/SvelteKit components, routes, basic tests.

- When to use
  - Database/schema/security tasks → Supabase MCP first. Fallback: manual SQL.
  - UI component/route scaffolding → Svelte MCP first. Fallback: manual files.

- Prompt templates (for Claude-Code)
  - Supabase (Apply migration)

    ```text
    You are Claude-Code with Supabase MCP.
    Goal: Apply migration "init_user_profiles" and enable RLS.
    Steps:
    - Call apply_migration with name: init_user_profiles and SQL from design.md UserProfile Table.
    - Call execute_sql to add RLS policies from design.md Supabase RLS Policies.
    - Call list_tables to verify user_profiles exists; call get_advisors security to check issues.
    - Return a concise summary and any advisor remediation URLs.
    ```

  - Supabase (Validate & logs)

    ```text
    Use Supabase MCP to:
    - list_migrations, list_tables
    - get_logs service=postgres
    - get_advisors type=security
    Summarize findings and next actions.
    ```

  - Svelte (Scaffold route + component)

    ```text
    You are Claude-Code with Svelte MCP.
    Goal: Scaffold /profile route and ProfileCard component per design.md.
    Steps:
    - Create +page.svelte with layout and load placeholders.
    - Create ProfileCard.svelte props: user, showStats?, compact?.
    - Generate minimal unit test stubs.
    Return files created/updated with paths.
    ```

- Conventions
  - Always prefer MCP over manual work when available and safe.
  - If MCP is unavailable, proceed manually and note the fallback in the PR/commit.
  - Keep outputs concise; include remediation links from advisors when present.

## Environment Setup

- Create `.env` (local only; use `.env.example` for template)
  - `PUBLIC_SUPABASE_URL=`
  - `PUBLIC_SUPABASE_ANON_KEY=`
  - `SUPABASE_SERVICE_ROLE_KEY=` (do not expose to client)
  - `STEAM_API_KEY=`
  - `BASE_URL=http://localhost:5173`
  - `SESSION_SECRET=`

## CI/CD

- Lint/Typecheck: run `pnpm lint` and `pnpm check`
- Tests: run `pnpm test` (Vitest + Playwright)
- Build: `pnpm build`; preview: `pnpm preview`
- Gate deploy on: all tests passing, no ESLint errors

## Launch Checklist

- [ ] All DoD items met for tasks 1–15
- [ ] Env vars set in prod/staging
- [ ] SQL migrations applied; RLS enabled
- [ ] Monitoring and logs confirmed working
- [ ] Error pages and outage banners verified
- [ ] E2E suite green against staging

## Mapping: Requirements → Validation

- Requirement 1: Tasks 3, 4, 7, 10, 11; Tests: unit/integration/e2e
- Requirement 2: Tasks 2, 6; Tests: unit/integration/e2e
- Requirement 3: Tasks 5, 6; Tests: unit/integration/e2e
- Requirement 4: Tasks 5, 9, 11; Tests: unit/e2e
- Requirement 5: Tasks 8, 11; Tests: e2e
- Requirement 6: Tasks 4, 10, 13; Tests: integration/security/e2e
