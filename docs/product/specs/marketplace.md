# Module PRD — Marketplace (P4 Scope)

**Status:** Draft  •  **Phase Link:** [P4 — Core Features](../phases/P4.md)  •  **Parent PRD:** [Launch PRD §D.2](../../PRD.md)

## 1. Objective & Outcomes

Deliver the first version of the skin Marketplace where authenticated users
can list CS2 items for credits, browse listings with live valuations, and
purchase items instantly. The Marketplace must align with the provably-fair
and compliance guardrails defined in the launch requirements.

### Success Metrics
- ≥ 85% of attempted listings succeed without manual intervention.
- Listing-to-purchase conversion ≥ 25% within the first 24h of posting.
- No more than 0.5% of transactions require manual refunds.

## 2. Scope & Non-Goals (MVP)

### In Scope
- Browse grid of active listings with rarity, float, price, and freshness badges.
- Item detail drawer with valuation history and seller metadata.
- Listing flow: select inventory item → suggested price → confirm listing.
- Purchase flow: review listing → confirm spend → success/error states.
- Supabase persistence for listings, transactions, and inventory snapshots.
- Realtime updates via Supabase channels for new/updated listings.
- Compliance hooks: soft region gating, trade lock detection, max price limit.

### Out of Scope (Defer)
- Automated bot fulfillment or escrow withdrawal flows.
- Auction bidding, counter-offers, or bundle listings.
- Cross-currency pricing and localized taxation.
- Creator storefronts or featured slots.

## 3. User Stories
- **As a seller**, I can list a CS2 item with an auto-suggested fair price and confirm before publishing.
- **As a buyer**, I can filter and sort listings to find the items I want and purchase instantly.
- **As operations**, I can pause listings that violate policies and audit listing history.

## 4. Functional Requirements

### 4.1 Listings & Catalog
- Provide `/api/marketplace/listings` endpoint with pagination, rarity filters, price sorting.
- Each listing includes: `id`, `item_id`, `user_id`, `ask_price`, `suggested_price`,
  `rarity`, `float_value`, `wear_tier`, `thumbnail_url`, `created_at`, `expires_at`.
- Catalog view refreshes server-side every request and subscribes to realtime updates for incremental changes.

### 4.2 Listing Creation
- Protected POST `/api/marketplace/listings` that validates inventory ownership,
  verifies trade lock, and enforces price bands (`0.8x` – `1.2x` of valuation).
- Listing uses valuation snapshot table to prevent race conditions; snapshot TTL 5 minutes.
- On success, emit Supabase realtime event `marketplace:listings:created` for subscribers.

### 4.3 Purchasing
- Protected POST `/api/marketplace/purchase` verifying listing availability, buyer balance,
  and concurrency via `status='available'` row lock.
- Deduct buyer credits and credit seller via settlement service webhook.
- Persist transaction record with PF hash for audit.
- Emit realtime events for `marketplace:listings:fulfilled` and append to Live Drops ticker.

### 4.4 Moderation & Compliance
- Admin-only PATCH `/api/marketplace/listings/{id}/status` to pause/resume listings.
- Store `region_blocked` flag derived from user profile settings.
- Record rejection reasons for compliance audit trail.

## 5. Data Model & DTOs

| Table | Key Fields | Notes |
|-------|------------|-------|
| `marketplace_listings` | `id` UUID PK, `user_id` FK → `auth.users`, `item_id`, `valuation_id`, `ask_price`, `status` (`available`, `sold`, `paused`, `expired`), timestamps | RLS: sellers manage own listings; admins can moderate. |
| `marketplace_transactions` | `id`, `listing_id`, `buyer_id`, `seller_id`, `final_price`, `pf_hash`, `settlement_id`, timestamps | Immutable after completion. |
| `inventory_snapshots` | `id`, `user_id`, `item_id`, `steam_asset_id`, `valuation`, `float`, `captured_at` | Created during listing flow. |

### DTOs
- `ListingSummary`: fields above + computed `is_new` (<=15min) and `price_delta` vs valuation.
- `ListingDetail`: `ListingSummary` + valuation history array, seller rep score, compliance flags.
- `CreateListingRequest`: `{ item_id: string, ask_price: number }`.
- `PurchaseRequest`: `{ listing_id: string }`.

## 6. UX & Interaction Notes
- Grid uses neo-brutalist cards, 3-column desktop / 1-column mobile.
- Filter bar anchored top with sticky behavior on desktop, collapsible on mobile.
- Listing drawer slides from right; confirm button uses `variant="neo-primary"` per design system.
- Loading skeletons mimic card layout; empty state references Community Pots for engagement.
- Errors surface via toast with actionable copy; forms fully keyboard accessible.

## 7. Dependencies & Integration
- Requires Steam inventory service for valuation data.
- Settlement service handles credit transfers; purchase API must call and await response.
- Live Drops ticker consumes realtime listing fulfillment events.
- Aligns with ADR-20251003-spec-workflow governance.

## 8. Analytics & Telemetry
- Track events: `listing_created`, `listing_paused`, `listing_purchased`, `listing_failed`.
- Include properties: `item_id`, `rarity`, `ask_price`, `valuation_delta`, `region`, `latency_ms`.
- Expose daily metrics dashboard for ops: volume, GMV, conversion, failure rate.

## 9. Risks & Open Questions
- Price volatility may require dynamic bands – monitor feedback.
- Need clear UX for trade-locked items; design iteration TBD.
- Settlement failure handling: define retry/backoff with settlement service team.

## 10. Acceptance Criteria
- API endpoints documented above implemented with tests.
- UI grid matches design system tokens and consumes realtime data.
- RLS policies enforce seller-only mutations; admin overrides audited.
- pnpm check/lint/test all green for implementation PRs.
