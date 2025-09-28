# Launch Plan: Steam Authentication & User Profiles

## Overview

This plan coordinates engineering, testing, and release for the Steam Authentication, User Profiles, and CS2 Inventory features. It aligns with `PRD.md`, `requirements.md`, `design.md`, and `tasks.md`.

## Prerequisites

- Supabase project with Auth and Postgres
- Steam API key
- Runtime env configured (see `design.md` → Environment & Secrets)
- Redis/edge cache (optional) for Steam responses

## Milestones

- M0: Project setup & environment
  - SvelteKit app created; env vars wired; CI running lint/check/tests
- M1: Database & Auth
  - `user_profiles` schema + RLS; Steam OpenID → Supabase session
- M2: Profile & Inventory
  - Profile page; Inventory grid with cache and private-handling UX
- M3: Security & Observability
  - RLS verified; CSRF protections; structured logs and metrics
- M4: QA & Rollout
  - Unit/integration/E2E green; staging smoke; rollout prep
- M5: Launch
  - Production deploy; canary; monitor and iterate

## MCP Orchestration

- Supabase MCP (default for DB): apply migrations, execute SQL, verify RLS, advisors, logs
- Svelte MCP (default for UI scaffolding): components, routes, basic tests
- Conventions
  - Prefer MCP tools when available; fall back to manual with a note in the PR
  - Keep outputs concise; include advisor remediation links

### Prompt templates

```text
Supabase MCP — Apply migration + RLS
Goal: Apply user_profiles schema and RLS policies.
Steps:
- apply_migration name:init_user_profiles with SQL from design.md UserProfile Table
- execute_sql RLS policies from design.md Supabase RLS Policies
- list_tables to verify; get_advisors type=security; summarize
```

```text
Svelte MCP — Scaffold route + component
Goal: Scaffold /profile and ProfileCard per design.
Steps:
- create +page.svelte
- create ProfileCard.svelte props: user, showStats?, compact?
- generate test stubs; return created paths
```

## Supabase MCP Task List (one-shot)

Copy-paste to Claude-Code when ready to apply DB changes:

```text
You are Claude-Code with Supabase MCP.
Goal: Create user_profiles table, add indexes, enable RLS, and apply policies.

1) Apply migration
- name: init_user_profiles
- sql:
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  steam_id text UNIQUE NOT NULL,
  username text NOT NULL,
  avatar_url text,
  steam_profile_url text,
  total_wagered numeric(10,2) DEFAULT 0,
  total_profit numeric(10,2) DEFAULT 0,
  win_rate numeric(5,2) DEFAULT 0,
  biggest_win numeric(10,2) DEFAULT 0,
  case_battle_wins integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_set_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS user_profiles_steam_id_idx ON user_profiles(steam_id);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON user_profiles(created_at);

2) Enable RLS and policies (execute_sql):
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS select_own_profile ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS insert_own_profile ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS update_own_profile ON user_profiles
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

3) Validation and advisors
- list_tables (ensure user_profiles exists)
- get_advisors type=security (return remediation URLs)

Return a concise summary of actions, and any advisor findings with links.
```

## Checklists

### Pre-merge (every PR)

- Lint passes (`pnpm lint`)
- Typecheck passes (`pnpm check`)
- Unit tests pass (`pnpm test:unit -- --run`)

### Pre-deploy to staging

- Apply migrations + RLS via Supabase MCP
- Seed smoke data if needed (optional)
- E2E suite passes (`pnpm test:e2e`)

### Pre-deploy to production

- Re-apply migrations (idempotent); verify RLS
- Build succeeds (`pnpm build`); preview ok (`pnpm preview`)
- Observability configured (logs/metrics, optional Sentry)

### Post-deploy

- Canary test with a test account
- Monitor error rate (<1%) & inventory latency (p95 ≤ 600ms cached)
- Rollback if critical regressions

## Rollback & Recovery

- App: revert deploy
- DB: avoid destructive downgrades; use forward-fix migrations
- Feature disable: temporarily hide inventory if Steam unstable

## Runbooks

- Steam outage / rate limit
  - Serve cached data (up to TTL); show maintenance banner; backoff retries
- Private inventory
  - Explain how to make inventory public; offer retry
- Auth failure
  - Re-authenticate, verify `state`/`nonce`, check callback origin; log correlation ID

## Success Criteria

- Metrics in PRD met: login completion ≥95%, error rate <1%
- E2E green on staging and after production canary
- No RLS policy bypass; basic security checks pass

## Command Cheat Sheet

- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Typecheck: `pnpm check`
- Unit tests: `pnpm test:unit -- --run`
- E2E tests: `pnpm test:e2e`
- Build/Preview: `pnpm build` / `pnpm preview`
