# TopRoll Technical Architecture

**Version:** 2.0  
**Last Updated:** October 2025  
**Status:** Active - Post Svelte 5 Refactor

---

## 1. System Overview

TopRoll is a full-stack web application built with SvelteKit 2 and Svelte 5, backed by Supabase for data, auth, and real-time functionality.

### Technology Stack

**Frontend:**
- **Framework:** SvelteKit 2.43+ (SSR + SPA hybrid)
- **UI Library:** Svelte 5.39+ (runes mode, no legacy patterns)
- **Language:** TypeScript 5.3+ (strict mode)
- **Styling:** Tailwind CSS v4 (design tokens)
- **Component Library:** shadcn-svelte (bits-ui primitives)
- **State Management:** Svelte 5 context + runes ($state, $derived, $effect)
- **Build Tool:** Vite 7.1+ with code splitting

**Backend:**
- **Database:** Supabase Postgres 15
- **Authentication:** Supabase Auth (Steam OpenID)
- **Real-time:** Supabase Realtime (WebSockets)
- **Storage:** Supabase Storage (item images)
- **API:** SvelteKit endpoints (+server.ts files)

**DevOps:**
- **Package Manager:** pnpm 9
- **Testing:** Vitest (unit), Playwright (E2E)
- **Deployment:** Vercel / Cloudflare Pages
- **Monitoring:** Structured logging, Supabase dashboard
- **Version Control:** Git + GitHub

---

## 2. Architecture Principles

1. **Spec-Driven Development:** All features start from SPEC.md
2. **Type Safety:** TypeScript everywhere, no `any` types
3. **Svelte 5 Purity:** 100% runes, zero legacy patterns (export let, stores, onMount)
4. **Server-Side First:** Data preloaded in +page.server.ts when possible
5. **Progressive Enhancement:** Works without JS for critical paths
6. **Component Composition:** Small, focused components with clear boundaries
7. **Performance Budget:** p95 <3s page load, <150ms WS fanout
8. **Security by Default:** RLS on all tables, HttpOnly cookies, CSRF protection

---

## 3. Project Structure

```
toproll/
├── src/
│   ├── lib/
│   │   ├── api/                    # API client functions
│   │   ├── components/
│   │   │   ├── layout/             # Shell components
│   │   │   ├── features/           # Feature-specific
│   │   │   ├── shared/             # Cross-feature shared
│   │   │   └── ui/                 # shadcn-svelte primitives
│   │   ├── state/                  # Svelte 5 context state
│   │   ├── services/               # Business logic
│   │   ├── supabase/               # Supabase clients
│   │   ├── types/                  # TypeScript types
│   │   └── utils/                  # Utilities
│   │
│   ├── routes/
│   │   ├── (app)/                  # Auth-required routes
│   │   ├── (auth)/                 # Login routes
│   │   └── api/                    # API endpoints
│
├── docs/                           # 5 docs max
└── db/migrations/                  # DB migrations
```

See SPEC.md Section 3 for detailed feature requirements.  
See API.md for complete endpoint documentation.  
See DEVELOPMENT.md for setup and workflows.

---

**Document Owner:** Engineering Team  
**Review Cadence:** Quarterly
