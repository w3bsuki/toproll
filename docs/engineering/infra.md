# Infrastructure & CI/CD (Oct 2025)

## Environments
- Local dev; staging; production

## CI/CD
- GitHub Actions: check, lint, unit (PR); optional e2e matrix
- Gate merges on CI green; optional preview deploy

## Migrations
- SQL under `db/migrations`; apply via Supabase or migrator; rollback notes in PRs

## Feature Flags
- Config-driven toggles for games, pots, marketplace operations

## Release & Rollback
- Canary with internal accounts; rollback script; data snapshots for risky changes

