# Toproll Delivery Plan

## Objective
Deliver a production-ready casino experience that matches the provided reference UI while satisfying the feature set described in the PRD, design system documentation, and launch checklist. This plan covers ~1 week of focused execution with a 30–60 minute deep-planning runway before each major work block to mitigate rework.

## Guiding References
- `design.md` for visual tokens and responsive breakpoints.
- `requirements.md`, `tasks.md`, and `TDD_CHECKS.md` for acceptance criteria and testing expectations.
- `PRD.md` for Steam authentication, profile, and inventory requirements.
- `LAUNCH_PLAN.md` for release-readiness checkpoints.

## Phase 0 – Discovery & Environment Hardening (4–6 hours)
1. **Asset review**: Capture measurements from `static/images/reference/casino-desktop.png` and mobile mocks; build a component inventory.
2. **Design token audit**: Confirm Tailwind v4 config aligns with design variables (colors, radii, typography).
3. **Dependency sweep**:
   - Update SvelteKit 2 + Svelte 5 runes usage (replace deprecated syntax, verify `onclick` migration).
   - Validate Supabase client setup and env bindings for SSR.
4. **Build break fixes**: Resolve outstanding `pnpm build` errors from legacy slots/components.
5. **Testing baseline**: Ensure `pnpm test`, `pnpm lint`, and Vitest suites are green.

## Phase 1 – Shell & Global UI Parity (1.5 days)
1. **Layout grid**:
   - Lock shell to 280 px sidebar, fluid content, 360 px chat rail.
   - Remove residual 1140 px clamps; adopt 32 px radius + blur/shadow tokens.
2. **Header**:
   - Implement ticker, search, locale switcher, notifications, profile dropdown.
   - Ensure keyboard navigation, focus states, and Supabase session awareness.
3. **Sidebar + Bottom nav**:
   - Align iconography, active states, and hover treatments with reference.
   - Implement mobile-safe-area padding.
4. **Chat rail**:
   - Compose rain pot card, member list, chat feed, composer.
   - Add optimistic sending states and WebSocket placeholder integration points.
5. **Global polish**: animations, loading shimmer, theming compliance.

## Phase 2 – Home Page Content Systems (1.5 days)
1. **Hero carousel**: Match height/curve, add CTA + stats, autoplay with pause on hover.
2. **Search + filter chips**: Responsive stack, scrollable on mobile, `aria-pressed` states.
3. **Carousels & galleries**:
   - Featured horizontal scrollers with snap.
   - “Popular” and “Megaways” 5-column responsive grids.
   - Hover lift, gradient overlays, vendor labels.
4. **Data plumbing**: Wire to Supabase/Mock data service; prepare GraphQL/REST adapters.
5. **Empty/error states**: Provide fallback copy, skeletons.

## Phase 3 – Authentication & Profile (2 days)
1. **Steam OpenID flow**:
   - Implement server endpoints (`/auth/steam`, `/auth/callback`).
   - Validate nonce/state, exchange for Steam ID, create Supabase session.
2. **Supabase integration**:
   - Onboard `user_profiles` table (migration + types).
   - Upsert username/avatar on login.
3. **Protected routes**:
   - Gate `/profile`, `/inventory`, `/community`.
   - Hydrate session in `+layout.server.ts` and Svelte stores.
4. **Profile UI**: Display avatar, Steam ID, stats, CTA for inventory.
5. **Logout**: Header dropdown action + toasts.

## Phase 4 – Casino Gameplay & Community (2 days)
1. **Game launcher**:
   - Implement provider modal with iframe placeholder.
   - Track recently played, favorites.
2. **Community pots**:
   - Build pot cards, contribution flow (mock data now, Supabase RPC later).
   - Real-time updates stub via Supabase Realtime.
3. **Messaging**:
   - Chat drawer + rail hooking into Supabase channels.
   - Typing indicators, presence counts.
4. **Rewards & promos**: Banner carousel, limited-time CTA blocks.

## Phase 5 – Quality Bar & Launch Readiness (1 day)
1. **Accessibility**: Axe audits, keyboard traps, screen reader labels.
2. **Internationalization**: Validate en + placeholder locales via `project.inlang`.
3. **Performance**: Lighthouse desktop/mobile ≥ 90, code-split heavy routes.
4. **Analytics/observability**: Hook Supabase logs + front-end telemetry.
5. **Docs**: Update `README`, changelog, handoff notes.

## Execution Rhythm
- Daily start: 30-minute review of docs + task reprioritization.
- Mid-day: Commit + push incremental slices, run test suite.
- End-day: QA checklist from `TDD_CHECKS.md` and annotate DEV_LOG.

## Open Questions
1. Finalized mobile mock dimensions? (Need confirmation for notch-safe layout.)
2. Casino providers API contracts? (Placeholder vs. production feed.)
3. Community pot mechanics (timer, contribution limits, rewards) – need PRD.

## Deliverables
- Pixel-perfect desktop/mobile per reference.
- Steam auth with Supabase session + profile/inventory.
- Fully interactive casino experience: browsing, launching games, joining pots, chat.
- Passing `pnpm build`, `pnpm test`, `pnpm lint`, and e2e smoke.
- Updated documentation reflecting implementation details.
