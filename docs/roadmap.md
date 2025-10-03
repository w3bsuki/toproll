# Project Roadmap (Oct 2025)

Phases P0–P6 orchestrate the entire project. Each phase runs as: Spec PR (docs) → Implementation PR (code/tests) → Review.

## P0 — Charter & Baseline
- PRD.md updated to project-wide; requirements.md baseline; link module annexes
- Add docs/engineering/{architecture,testing,observability,security,infra}.md
- Add .github templates and CI skeleton

## P1 — Architecture & Conventions
- System context, module boundaries, DTO patterns, error model, API versioning
- Folder layout, TypeScript ESLint conventions, Tailwind tokens

## P2 — DevEx & CI/CD
- GitHub Actions: typecheck, lint, unit; optional e2e job matrix
- PR gating; CODEOWNERS; labels; pre-push hooks

## P3 — Observability & Security
- Logging schema, correlation IDs, basic metrics; dashboards/alerts plan
- Security: secrets mgmt, RLS review, KYC gating, rate limits, abuse heuristics

## P4 — Core Features (MVP scope)
- Auth & Profiles; Inventory & Marketplace; Community Pots; Case Battles
- Live Drops, Chat, Spectate; risk controls

## P5 — UX & Accessibility
- Design tokens, component taxonomy, flows; WCAG AA checks; reduced motion

## P6 — Release & QA
- Release checklist, rollback/runbooks; perf smoke; owners/on-call; post-launch analytics

Milestone cadence: small PRs, strict scope; tests and docs in every PR.
