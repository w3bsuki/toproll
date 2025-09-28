# TDD Checks

A lightweight checklist to drive implementation via tests first. Update this file as features are implemented.

## Global

- [ ] Lint passes (ESLint + Prettier) — 3 demo file errors
- [x] TypeScript passes (svelte-check)
- [ ] Unit tests pass (Vitest)
- [ ] E2E tests pass (Playwright)

## Auth (Steam OpenID → Supabase)

- [ ] generates auth URL with state/nonce
- [ ] validates callback parameters (issuer, signature placeholder)
- [ ] sets session cookie (Supabase) on success
- [ ] handles error flows (invalid, expired, CSRF)

## Profile

- [ ] first login creates `user_profiles` row
- [ ] subsequent logins update username/avatar when changed
- [ ] GET /api/profile returns own profile (RLS verified by tests)

## Inventory

- [ ] GET /api/inventory returns parsed items
- [ ] private inventory path returns 403 + message
- [ ] caching reduces calls (5m TTL) and respects errors

## Routes/Guards

- [ ] /profile and /inventory require auth (302 → login)
- [ ] logout clears session and redirects
