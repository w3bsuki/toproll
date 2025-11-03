<div align="center">

# TopRoll

[![CI](https://github.com/w3bsuki/toproll/actions/workflows/ci.yml/badge.svg)](https://github.com/w3bsuki/toproll/actions/workflows/ci.yml)

SvelteKit 2 + Svelte 5 runes app with Supabase backend, featuring Community Pots, Marketplace, and Case Battles.

</div>

## Quickstart

Prereqs: Node 20+, pnpm 9

```powershell
pnpm install --frozen-lockfile
copy .env.example .env
pnpm run dev
```

Optional: enable mock mode in `src/lib/config.ts` to develop without backend.

## Scripts

```powershell
pnpm run check      # svelte-check
pnpm run lint       # prettier + eslint
pnpm run build      # vite build
pnpm run test -- --run  # vitest unit
pnpm run test:e2e   # playwright e2e (requires browsers)
```

Run E2E browsers locally:

```powershell
npx playwright install
```

## CI

CI runs typecheck, lint, build, and unit tests on every push/PR to main. E2E can be triggered via "Run workflow" with `run_e2e: true`.

## Health Check

GET `/api/health` returns `{ status: 'ok', uptimeSec, version }` and includes `x-request-id` & `x-response-time` headers.

## Observability

- Structured JSON logs with correlation IDs
- Logger available at `event.locals.logger`
- See `docs/engineering/runbooks.md` for incident playbooks
