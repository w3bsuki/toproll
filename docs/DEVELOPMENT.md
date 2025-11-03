# TopRoll Development Guide

**Version:** 1.0  
**Last Updated:** October 2025

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Git
- Supabase account

### Setup

```powershell
# Clone repository
git clone https://github.com/w3bsuki/toproll.git
cd toproll

# Install dependencies
pnpm install --frozen-lockfile

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
pnpm run dev
```

Visit `http://localhost:5173`

---

## Scripts

```powershell
# Development
pnpm run dev          # Start dev server
pnpm run check        # Type checking
pnpm run lint         # Prettier + ESLint
pnpm run format       # Auto-format code

# Testing
pnpm run test -- --run    # Run unit tests
pnpm run test:watch       # Watch mode
pnpm run test:e2e         # Playwright E2E
pnpm run test:coverage    # Coverage report

# Build
pnpm run build        # Production build
pnpm run preview      # Preview build
```

---

## Tech Stack

- **SvelteKit 2** - Framework
- **Svelte 5** - UI library (runes mode)
- **TypeScript** - Type safety
- **Tailwind v4** - Styling
- **shadcn-svelte** - Component library
- **Supabase** - Backend (Postgres, Auth, Realtime)
- **Vite** - Build tool
- **Vitest** - Unit testing
- **Playwright** - E2E testing

---

## Project Structure

See ARCHITECTURE.md Section 3 for complete structure.

**Key Directories:**
- `src/lib/components/` - Reusable components
- `src/lib/state/` - Svelte 5 context state
- `src/routes/` - SvelteKit routes
- `docs/` - Documentation (5 files max)
- `db/migrations/` - Database migrations
- `e2e/` - E2E tests

---

## Development Workflow

### 1. Spec-Driven Development

1. Check `docs/SPEC.md` for feature requirements
2. Review `docs/ARCHITECTURE.md` for technical approach
3. Create feature branch: `git checkout -b feature/battle-system`

### 2. Implementation (TDD)

1. Write failing test first
2. Implement feature
3. Make test pass
4. Refactor
5. Document in code

### 3. Code Review

1. Self-review changes
2. Run all checks: `pnpm run check && pnpm run test -- --run`
3. Create PR with description linking to spec
4. Address review feedback
5. Merge when approved

---

## Coding Standards

### TypeScript

```typescript
// ✅ DO: Use strict types
interface BattleConfig {
  mode: '1v1' | '2v2';
  caseIds: string[];
  entryFee: number;
}

// ❌ DON'T: Use any
function createBattle(config: any) { }

// ✅ DO: Use type inference when obvious
const userId = 'abc'; // string inferred

// ✅ DO: Export types alongside functions
export type { BattleConfig };
export function createBattle(config: BattleConfig) { }
```

### Svelte 5 Components

```svelte
<script lang="ts">
  // ✅ DO: Use $props for props
  let { title, items = [], onSelect }: Props = $props();
  
  // ✅ DO: Use $state for local state
  let selectedId = $state<string | null>(null);
  
  // ✅ DO: Use $derived for computed values
  const selectedItem = $derived(items.find(i => i.id === selectedId));
  
  // ✅ DO: Use $effect for side effects with cleanup
  $effect(() => {
    const sub = api.subscribe(title);
    return () => sub.unsubscribe();
  });
  
  // ❌ DON'T: Use export let (Svelte 4)
  // export let title: string;
  
  // ❌ DON'T: Use stores ($:)
  // $: selectedItem = items.find(i => i.id === selectedId);
  
  // ❌ DON'T: Use onMount
  // onMount(() => { });
</script>
```

### State Management

```typescript
// ✅ DO: Use context + runes
export function setAuthState(initialUser?: User) {
  let user = $state<User | null>(initialUser);
  
  setContext('auth', {
    get user() { return user; },
    signOut: async () => { user = null; }
  });
  
  return getContext('auth');
}

// ❌ DON'T: Use writable stores
// export const userStore = writable<User | null>(null);
```

### File Naming

- Components: `PascalCase.svelte` (e.g., `BattleRoom.svelte`)
- Utilities: `camelCase.ts` (e.g., `provablyFair.ts`)
- Routes: `+page.svelte`, `+server.ts`, `+layout.svelte`
- Types: `PascalCase` interfaces/types

---

## Testing

### Unit Tests (Vitest)

```typescript
// src/lib/utils/formatting.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatting';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
  
  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
```

### Component Tests

```typescript
// src/lib/components/features/battles/BattleCard.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import BattleCard from './BattleCard.svelte';

describe('BattleCard', () => {
  it('renders battle info', () => {
    render(BattleCard, {
      props: {
        battle: {
          id: '123',
          mode: '1v1',
          entryFee: 10,
          status: 'waiting'
        }
      }
    });
    
    expect(screen.getByText('1v1')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/battles.spec.ts
import { test, expect } from '@playwright/test';

test('create and join battle', async ({ page }) => {
  // Login
  await page.goto('/');
  await page.click('text=Sign in with Steam');
  // ... Steam auth flow
  
  // Create battle
  await page.goto('/battles');
  await page.click('text=Create Battle');
  await page.selectOption('[name=mode]', '1v1');
  await page.click('text=Confirm');
  
  // Verify battle created
  await expect(page.locator('.battle-card')).toBeVisible();
});
```

---

## Database Migrations

### Create Migration

```powershell
# Create new migration file
npx supabase migration new add_battle_rounds
```

### Write Migration

```sql
-- db/migrations/20251011_add_battle_rounds.sql

-- Up
create table if not exists battle_rounds (
  id uuid primary key default uuid_generate_v4(),
  battle_id uuid references case_battles(id) on delete cascade,
  round_number int not null,
  item_won text,
  item_value numeric(10,2),
  created_at timestamptz default now()
);

create index idx_battle_rounds_battle_id on battle_rounds(battle_id);

-- RLS policies
alter table battle_rounds enable row level security;

create policy "Battle rounds visible to authenticated users"
  on battle_rounds for select
  to authenticated
  using (true);
```

### Apply Migration

```powershell
# Push to database
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > src/lib/types/supabase.ts
```

---

## Environment Variables

### Development (.env)

```bash
# Public (client-side)
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Private (server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STEAM_API_KEY=XXX
SESSION_SECRET=generate-random-32-bytes
NODE_ENV=development
```

### Production

Set via Vercel/Cloudflare dashboard. Never commit secrets to Git.

---

## Debugging

### Browser DevTools

- **Network Tab:** Check API requests/responses
- **Console:** View client-side errors
- **Svelte DevTools:** Inspect component state (install extension)

### Server Logs

```typescript
// Add structured logging
import { logger } from '$lib/utils/logger';

logger.info('Battle created', { battleId, userId });
logger.error(error, { context: 'join_battle' });
```

### Database Queries

```sql
-- Check Supabase SQL Editor
select * from case_battles where status = 'active';
```

---

## Performance

### Lazy Loading

```typescript
// +page.ts - Lazy load heavy components
export const load = async () => {
  const { default: BattleRoom } = await import('$lib/components/features/battles/BattleRoom.svelte');
  return { components: { BattleRoom } };
};
```

### Server Preloading

```typescript
// +page.server.ts - Preload data on server
export const load: PageServerLoad = async () => {
  const supabase = getSupabaseServer();
  const { data: battles } = await supabase
    .from('case_battles')
    .select('*')
    .limit(20);
  
  return { battles };
};
```

### Virtual Scrolling

```svelte
<script>
  import { VirtualScroll } from '$lib/components/shared';
  
  let items = $state(/* large array */);
</script>

<VirtualScroll {items} itemHeight={100} let:item>
  <ItemCard {item} />
</VirtualScroll>
```

---

## Common Tasks

### Add New Feature

1. Check `docs/SPEC.md` for requirements
2. Create database migration if needed
3. Create API endpoint in `src/routes/api/`
4. Create component in `src/lib/components/features/`
5. Create route in `src/routes/(app)/`
6. Write tests
7. Document in code

### Fix Bug

1. Write failing test reproducing bug
2. Debug using DevTools + logs
3. Fix bug
4. Verify test passes
5. Add regression test if needed

### Update Dependencies

```powershell
# Check outdated
pnpm outdated

# Update specific package
pnpm update sveltekit

# Update all (careful!)
pnpm update --latest

# Test after updates
pnpm run check && pnpm run test -- --run
```

---

## Deployment

### Vercel (Recommended)

```powershell
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Manual Build

```powershell
# Build for production
pnpm run build

# Preview locally
pnpm run preview

# Deploy .svelte-kit/cloudflare to hosting
```

---

## Troubleshooting

### "Cannot find module"

```powershell
# Clear cache and reinstall
rm -rf node_modules .svelte-kit
pnpm install
```

### Type errors after DB changes

```powershell
# Regenerate types
npx supabase gen types typescript --local > src/lib/types/supabase.ts
pnpm run check
```

### WebSocket not connecting

- Check Supabase project settings
- Verify anon key is correct
- Check browser console for CORS errors

### Build fails

```powershell
# Check for syntax errors
pnpm run check

# Clear build cache
rm -rf .svelte-kit
pnpm run build
```

---

## Resources

- **SvelteKit Docs:** https://kit.svelte.dev/docs
- **Svelte 5 Docs:** https://svelte.dev/docs/svelte/overview
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind v4:** https://tailwindcss.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs

---

**Document Owner:** Engineering Team  
**Review Cadence:** Quarterly  
**Questions:** Ask in #dev-support Discord
