# 🔧 UI Implementation Tasks - Quick Reference

**Sprint Goal:** Transform TopRoll from dual-sidebar layout to CSGOGem-inspired single-column design

---

## 📋 Task Breakdown (4 Week Sprint)

### **WEEK 1: Layout Foundation** 

#### Task 1.1: Remove Dual Sidebars ⭐ PRIORITY
**File:** `src/routes/+layout.svelte`

**Current:**
```svelte
<div class="flex h-screen">
  <aside class="w-[280px]"><SidebarLeft /></aside>
  <main class="flex-1">{@render children()}</main>
  <aside class="w-[320px]"><SidebarRight /></aside>
</div>
```

**Change to:**
```svelte
<div class="flex h-screen flex-col">
  <ShellHeader />
  <LiveDropsTicker />
  <main class="flex-1 overflow-y-auto">
    <div class="container mx-auto px-6 py-8 max-w-[1600px]">
      {@render children()}
    </div>
  </main>
  <Footer />
  <ChatDrawer />
</div>
```

**Estimate:** 2 hours  
**Dependencies:** None  
**Testing:** Verify content fills full width

---

#### Task 1.2: Create Horizontal Navigation ⭐ PRIORITY
**File:** `src/lib/features/layout/NavTab.svelte` (NEW)

**Component:**
```svelte
<script lang="ts">
  import type { Component } from 'svelte';
  import { page } from '$app/state';
  
  let { 
    href, 
    icon: Icon, 
    children 
  }: { 
    href: string; 
    icon: Component; 
    children: any;
  } = $props();
  
  const active = $derived(page.url.pathname === href);
</script>

<a
  {href}
  class="
    relative flex h-[72px] items-center gap-2 px-4
    text-sm font-semibold transition-colors
    {active 
      ? 'text-primary' 
      : 'text-muted-foreground hover:text-foreground'
    }
  "
>
  <Icon class="h-4 w-4" />
  {@render children()}
  
  {#if active}
    <span class="absolute inset-x-0 bottom-0 h-[2px] bg-primary"></span>
  {/if}
</a>
```

**Estimate:** 1 hour  
**Dependencies:** None  
**Testing:** Verify active state highlights correctly

---

#### Task 1.3: Update Header with Game Navigation ⭐ PRIORITY
**File:** `src/lib/features/layout/ShellHeader.svelte`

**Add after logo:**
```svelte
<nav class="hidden lg:flex items-center gap-1" aria-label="Game modes">
  <NavTab href="/cases" icon={Package}>Cases</NavTab>
  <NavTab href="/battles" icon={Swords}>Battles</NavTab>
  <NavTab href="/pots" icon={Coins}>Pots</NavTab>
  <NavTab href="/marketplace" icon={Store}>Marketplace</NavTab>
  <NavTab href="/upgrader" icon={TrendingUp}>Upgrader</NavTab>
</nav>
```

**Imports needed:**
```svelte
import { Package, Swords, Coins, Store, TrendingUp } from '@lucide/svelte';
import NavTab from './NavTab.svelte';
```

**Estimate:** 1 hour  
**Dependencies:** Task 1.2  
**Testing:** Click each tab, verify routing

---

#### Task 1.4: Create Chat Drawer Component
**File:** `src/lib/features/layout/ChatDrawer.svelte` (NEW)

**Component:**
```svelte
<script lang="ts">
  import { getUIState } from './ui-state.svelte';
  import { ChatPanel } from '$lib/features/layout';
  import { Button } from '$lib/components/ui/button';
  import { X, MessageCircle } from '@lucide/svelte';
  
  const ui = getUIState();
</script>

<!-- Desktop Side Drawer -->
<aside
  class="
    fixed top-0 right-0 z-50 h-screen w-[400px]
    bg-card border-l border-border
    transform transition-transform duration-300
    {ui.chatOpen ? 'translate-x-0' : 'translate-x-full'}
    hidden lg:block
  "
>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex h-16 items-center justify-between border-b border-border px-4">
      <div class="flex items-center gap-2">
        <MessageCircle class="h-5 w-5 text-primary" />
        <h2 class="font-semibold">Live Chat</h2>
      </div>
      <Button variant="ghost" size="icon" onclick={() => ui.toggleChat()}>
        <X class="h-4 w-4" />
      </Button>
    </div>
    
    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <ChatPanel />
    </div>
  </div>
</aside>

<!-- Mobile: Use existing ChatDrawer component -->
```

**Estimate:** 2 hours  
**Dependencies:** UI state update  
**Testing:** Toggle drawer open/close

---

#### Task 1.5: Update UI State
**File:** `src/lib/features/layout/ui-state.svelte.ts`

**Add:**
```typescript
export class UIState {
  sidebarOpen = $state(false);
  chatOpen = $state(false); // NEW
  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  toggleChat() { // NEW
    this.chatOpen = !this.chatOpen;
  }
}
```

**Estimate:** 15 minutes  
**Dependencies:** None  
**Testing:** Verify state toggles correctly

---

#### Task 1.6: Add Chat FAB Button
**File:** `src/routes/+layout.svelte`

**Add before closing div:**
```svelte
<!-- Chat FAB (Desktop) -->
<button
  type="button"
  class="
    hidden lg:flex
    fixed bottom-8 right-8 z-40
    h-14 w-14 items-center justify-center
    bg-primary text-primary-foreground
    rounded-full shadow-lg hover:shadow-xl
    hover:scale-110 transition-all
  "
  onclick={() => ui.toggleChat()}
  aria-label="Open chat"
>
  <MessageCircle class="h-6 w-6" />
</button>
```

**Estimate:** 30 minutes  
**Dependencies:** Task 1.4, 1.5  
**Testing:** Click to open drawer

---

### **WEEK 2: Components & Dropdowns**

#### Task 2.1: Create User Dropdown ⭐ PRIORITY
**File:** `src/lib/features/layout/UserDropdown.svelte` (NEW)

**Component structure:**
```svelte
<script lang="ts">
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '$lib/components/ui/dropdown-menu';
  import { Button } from '$lib/components/ui/button';
  import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
  import { 
    User, Package, Receipt, Settings, Shield, LogOut,
    Wallet, ArrowUpFromLine 
  } from '@lucide/svelte';
  
  let { user, balance } = $props();
</script>

<DropdownMenu>
  <DropdownMenuTrigger asChild let:builder>
    <button {...builder} use:builder.action class="flex items-center gap-3 ...">
      <Avatar>
        <AvatarImage src={user.avatar} alt={user.username} />
        <AvatarFallback>{user.username[0]}</AvatarFallback>
      </Avatar>
      <div class="hidden xl:block">
        <p class="font-semibold">{user.username}</p>
        <p class="text-sm text-primary">${balance}</p>
      </div>
    </button>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end" class="w-64">
    <!-- Quick Actions -->
    <div class="p-3 space-y-2">
      <Button variant="default" class="w-full">
        <Wallet class="h-4 w-4" />
        Deposit
      </Button>
      <Button variant="outline" class="w-full">
        <ArrowUpFromLine class="h-4 w-4" />
        Withdraw
      </Button>
    </div>
    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem href="/profile">
      <User class="h-4 w-4" />
      Profile
    </DropdownMenuItem>
    <DropdownMenuItem href="/inventory">
      <Package class="h-4 w-4" />
      Inventory
    </DropdownMenuItem>
    <DropdownMenuItem href="/transactions">
      <Receipt class="h-4 w-4" />
      Transactions
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem href="/settings">
      <Settings class="h-4 w-4" />
      Settings
    </DropdownMenuItem>
    <DropdownMenuItem href="/provably-fair">
      <Shield class="h-4 w-4" />
      Provably Fair
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem class="text-destructive">
      <LogOut class="h-4 w-4" />
      Sign Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Estimate:** 3 hours  
**Dependencies:** shadcn dropdown menu  
**Testing:** All menu items clickable, proper navigation

---

#### Task 2.2: Create Footer Component
**File:** `src/lib/features/layout/Footer.svelte` (NEW)

**Component:**
```svelte
<script lang="ts">
  import { LifeBuoy, HelpCircle, Shield, FileText, Users } from '@lucide/svelte';
</script>

<footer class="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
  <div class="container mx-auto px-6 py-8 max-w-[1600px]">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- About -->
      <div>
        <h3 class="font-bold mb-4">TopRoll</h3>
        <p class="text-sm text-muted-foreground">
          Premium CS2 skin marketplace and gaming platform
        </p>
      </div>
      
      <!-- Support -->
      <div>
        <h4 class="font-semibold mb-3 text-sm">Support</h4>
        <ul class="space-y-2 text-sm">
          <li>
            <a href="/support" class="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <LifeBuoy class="h-3 w-3" />
              Help Center
            </a>
          </li>
          <li>
            <a href="/support/contact" class="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <HelpCircle class="h-3 w-3" />
              Contact Us
            </a>
          </li>
          <li>
            <a href="/faq" class="text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Legal -->
      <div>
        <h4 class="font-semibold mb-3 text-sm">Legal</h4>
        <ul class="space-y-2 text-sm">
          <li>
            <a href="/terms" class="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <FileText class="h-3 w-3" />
              Terms of Service
            </a>
          </li>
          <li>
            <a href="/privacy" class="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Shield class="h-3 w-3" />
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/responsible-gaming" class="text-muted-foreground hover:text-primary transition-colors">
              Responsible Gaming
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Community -->
      <div>
        <h4 class="font-semibold mb-3 text-sm">Community</h4>
        <div class="flex gap-3">
          <a href="#" class="text-muted-foreground hover:text-primary transition-colors" aria-label="Discord">
            <!-- Discord icon -->
          </a>
          <a href="#" class="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
            <!-- Twitter icon -->
          </a>
        </div>
      </div>
    </div>
    
    <div class="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
      © 2025 TopRoll. All rights reserved.
    </div>
  </div>
</footer>
```

**Estimate:** 2 hours  
**Dependencies:** None  
**Testing:** All links work, responsive layout

---

#### Task 2.3: Update Mobile Bottom Nav
**File:** `src/lib/features/layout/BottomNav.svelte`

**Update items:**
```svelte
<nav class="grid grid-cols-5 h-16">
  <NavItem href="/" icon={Home} label="Home" />
  <NavItem href="/cases" icon={Package} label="Cases" />
  <NavItem href="/battles" icon={Swords} label="Battles" />
  <NavItem href="/pots" icon={Coins} label="Pots" />
  <NavItem href="/profile" icon={User} label="Profile" />
</nav>
```

**Remove:** Chat, Inventory, Support, Settings from bottom nav

**Estimate:** 1 hour  
**Dependencies:** None  
**Testing:** Test on mobile viewport

---

#### Task 2.4: Enhance Daily Bonus Button
**File:** `src/lib/features/layout/ShellHeader.svelte`

**Current button is good, just ensure shimmer effect:**
```svelte
<button
  class="
    group relative overflow-hidden
    h-11 px-6 rounded-xl
    font-extrabold text-sm
    shadow-lg hover:shadow-xl
    transition-all hover:scale-105
  "
  style="
    background: linear-gradient(135deg, 
      oklch(0.78 0.16 70) 0%, 
      oklch(0.72 0.14 60) 100%
    );
    color: oklch(0.2 0.01 70);
  "
>
  <Gift class="h-5 w-5" />
  <span>Daily Bonus</span>
  
  <!-- Shimmer -->
  <div class="
    absolute inset-0 
    bg-gradient-to-r from-transparent via-white/20 to-transparent
    -translate-x-full group-hover:translate-x-full
    transition-transform duration-1000
  "></div>
</button>
```

**Estimate:** 30 minutes  
**Dependencies:** None  
**Testing:** Hover to see shimmer effect

---

### **WEEK 3: Pages & Content**

#### Task 3.1: Update Home Page Hero
**File:** `src/routes/+page.svelte`

**Add game mode cards grid:**
```svelte
<div class="space-y-8">
  <!-- Hero Section -->
  <section class="text-center space-y-4 py-12">
    <h1 class="text-4xl md:text-5xl font-bold">
      CS2 Skin <span class="text-primary">Marketplace</span>
    </h1>
    <p class="text-lg text-muted-foreground">
      Open cases, join battles, and trade skins
    </p>
  </section>
  
  <!-- Game Modes Grid -->
  <section>
    <h2 class="text-2xl font-bold mb-6">Game Modes</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GameModeCard
        href="/cases"
        title="Cases"
        description="Open premium CS2 cases"
        icon={Package}
        gradientClass="gradient-cases"
        activeCount={248}
        volume="2.5k"
      />
      <GameModeCard
        href="/battles"
        title="Case Battles"
        description="Compete against other players"
        icon={Swords}
        gradientClass="gradient-battles"
        activeCount={156}
        volume="8.2k"
      />
      <GameModeCard
        href="/pots"
        title="Community Pots"
        description="Join shared prize pools"
        icon={Coins}
        gradientClass="gradient-pots"
        activeCount={89}
        volume="1.2k"
      />
    </div>
  </section>
</div>
```

**Estimate:** 3 hours  
**Dependencies:** GameModeCard component  
**Testing:** Responsive grid, hover effects

---

#### Task 3.2: Create GameModeCard Component
**File:** `src/lib/features/home/GameModeCard.svelte` (NEW)

**Full component in main plan** (see PRODUCTION_UI_UX_PLAN.md)

**Estimate:** 2 hours  
**Dependencies:** None  
**Testing:** Hover animations, click navigation

---

#### Task 3.3: Build Settings Page
**File:** `src/routes/(app)/settings/+page.svelte` (NEW)

**Structure:**
```svelte
<script lang="ts">
  import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold">Settings</h1>
    <p class="text-muted-foreground">Manage your account preferences</p>
  </div>
  
  <Tabs value="account">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="privacy">Privacy</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
      <TabsTrigger value="appearance">Appearance</TabsTrigger>
    </TabsList>
    
    <TabsContent value="account">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <!-- Account settings form -->
        </CardContent>
      </Card>
    </TabsContent>
    
    <!-- More tabs... -->
  </Tabs>
</div>
```

**Estimate:** 4 hours  
**Dependencies:** shadcn Tabs, Card  
**Testing:** Tab navigation, form submission

---

#### Task 3.4: Build Support Page
**File:** `src/routes/(app)/support/+page.svelte` (NEW)

**Structure:**
```svelte
<script lang="ts">
  import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '$lib/components/ui/accordion';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { MessageCircle, Mail, Book } from '@lucide/svelte';
</script>

<div class="space-y-8">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-bold">Support Center</h1>
    <p class="text-lg text-muted-foreground">We're here to help</p>
  </div>
  
  <!-- Contact Options -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card class="p-6 text-center">
      <MessageCircle class="h-12 w-12 mx-auto mb-4 text-primary" />
      <h3 class="font-semibold mb-2">Live Chat</h3>
      <p class="text-sm text-muted-foreground mb-4">Chat with our support team</p>
      <Button variant="outline" class="w-full">Start Chat</Button>
    </Card>
    
    <Card class="p-6 text-center">
      <Mail class="h-12 w-12 mx-auto mb-4 text-primary" />
      <h3 class="font-semibold mb-2">Email Support</h3>
      <p class="text-sm text-muted-foreground mb-4">Get help via email</p>
      <Button variant="outline" class="w-full">Send Email</Button>
    </Card>
    
    <Card class="p-6 text-center">
      <Book class="h-12 w-12 mx-auto mb-4 text-primary" />
      <h3 class="font-semibold mb-2">Help Articles</h3>
      <p class="text-sm text-muted-foreground mb-4">Browse our knowledge base</p>
      <Button variant="outline" class="w-full">View Articles</Button>
    </Card>
  </div>
  
  <!-- FAQ -->
  <div>
    <h2 class="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
    <Accordion type="single" collapsible>
      <AccordionItem value="1">
        <AccordionTrigger>How do I deposit funds?</AccordionTrigger>
        <AccordionContent>...</AccordionContent>
      </AccordionItem>
      <!-- More FAQ items -->
    </Accordion>
  </div>
</div>
```

**Estimate:** 3 hours  
**Dependencies:** shadcn Accordion  
**Testing:** Accordion expand/collapse, button clicks

---

### **WEEK 4: Testing & Polish**

#### Task 4.1: Add Loading States to All Buttons
**Files:** All components with action buttons

**Pattern:**
```svelte
<script lang="ts">
  let isLoading = $state(false);
  
  async function handleAction() {
    isLoading = true;
    try {
      await someAsyncAction();
    } finally {
      isLoading = false;
    }
  }
</script>

<Button disabled={isLoading} onclick={handleAction}>
  {#if isLoading}
    <Loader2 class="h-4 w-4 animate-spin" />
  {:else}
    <Icon class="h-4 w-4" />
  {/if}
  {label}
</Button>
```

**Estimate:** 4 hours (across all components)  
**Dependencies:** None  
**Testing:** Trigger actions, verify loading states

---

#### Task 4.2: Accessibility Audit
**Tool:** axe DevTools

**Checklist:**
- [ ] All interactive elements have labels
- [ ] Keyboard navigation works
- [ ] Focus rings visible
- [ ] Color contrast passes WCAG AA
- [ ] Semantic HTML used
- [ ] ARIA attributes correct
- [ ] Skip navigation link present

**Estimate:** 4 hours  
**Dependencies:** All UI complete  
**Testing:** Run axe scan, fix issues

---

#### Task 4.3: Write E2E Tests
**File:** `e2e/new-layout.spec.ts` (NEW)

**Tests:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('New Layout', () => {
  test('should display horizontal navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav[aria-label="Game modes"]')).toBeVisible();
  });
  
  test('should toggle chat drawer', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Open chat"]');
    await expect(page.locator('aside:has(h2:text("Live Chat"))')).toBeVisible();
  });
  
  test('should open user dropdown', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has(img[alt*="User"])');
    await expect(page.locator('text="Profile"')).toBeVisible();
  });
});
```

**Estimate:** 3 hours  
**Dependencies:** All UI complete  
**Testing:** Run `pnpm test:e2e`

---

#### Task 4.4: Performance Optimization
**Actions:**
- [ ] Lazy load chat component
- [ ] Add route-based code splitting
- [ ] Optimize images (WebP)
- [ ] Implement prefetch for nav links
- [ ] Add loading skeletons

**Estimate:** 4 hours  
**Dependencies:** None  
**Testing:** Lighthouse audit (target 90+)

---

#### Task 4.5: Cross-Browser Testing
**Browsers:**
- [ ] Chrome (Windows, Mac)
- [ ] Firefox (Windows, Mac)
- [ ] Safari (Mac, iOS)
- [ ] Edge (Windows)

**Devices:**
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667, 390x844)

**Estimate:** 3 hours  
**Dependencies:** All UI complete  
**Testing:** Manual testing on each browser/device

---

## 📊 Progress Tracking

### Week 1 Progress: ____%
- [ ] Task 1.1: Remove dual sidebars
- [ ] Task 1.2: Create NavTab component
- [ ] Task 1.3: Update header navigation
- [ ] Task 1.4: Create ChatDrawer
- [ ] Task 1.5: Update UI state
- [ ] Task 1.6: Add chat FAB

### Week 2 Progress: ____%
- [ ] Task 2.1: Create UserDropdown
- [ ] Task 2.2: Create Footer
- [ ] Task 2.3: Update mobile nav
- [ ] Task 2.4: Enhance Daily Bonus

### Week 3 Progress: ____%
- [ ] Task 3.1: Update home page
- [ ] Task 3.2: Create GameModeCard
- [ ] Task 3.3: Build settings page
- [ ] Task 3.4: Build support page

### Week 4 Progress: ____%
- [ ] Task 4.1: Add loading states
- [ ] Task 4.2: Accessibility audit
- [ ] Task 4.3: Write E2E tests
- [ ] Task 4.4: Performance optimization
- [ ] Task 4.5: Cross-browser testing

---

## 🚀 Quick Start Commands

```powershell
# Start development server
pnpm dev

# Run type checking
pnpm run check

# Run linting
pnpm run lint

# Run unit tests
pnpm test -- --run

# Run E2E tests
pnpm test:e2e

# Build for production
pnpm run build
```

---

## 📁 Files to Create

**New Components:**
- `src/lib/features/layout/NavTab.svelte`
- `src/lib/features/layout/ChatDrawer.svelte`
- `src/lib/features/layout/UserDropdown.svelte`
- `src/lib/features/layout/Footer.svelte`
- `src/lib/features/home/GameModeCard.svelte`

**New Pages:**
- `src/routes/(app)/settings/+page.svelte`
- `src/routes/(app)/support/+page.svelte`

**New Tests:**
- `e2e/new-layout.spec.ts`

---

## 📁 Files to Delete

**After migration complete:**
- `src/lib/features/layout/SidebarLeft.svelte`
- `src/lib/features/layout/SidebarRight.svelte`
- `src/lib/features/layout/SidebarCTA.svelte` (if unused)

---

## 🎯 Success Criteria

### Visual
- [ ] No dual sidebars visible
- [ ] Horizontal navigation in header
- [ ] Chat drawer toggles correctly
- [ ] User dropdown shows all options
- [ ] Footer displays on all pages

### Functional
- [ ] All navigation links work
- [ ] Chat opens/closes smoothly
- [ ] User dropdown actions functional
- [ ] Settings page accessible
- [ ] Support page accessible

### Technical
- [ ] TypeScript errors: 0
- [ ] Linting errors: 0
- [ ] E2E tests pass: 100%
- [ ] Lighthouse score: 90+
- [ ] Accessibility: WCAG AA

---

## 📞 Need Help?

- **Design questions:** Check `PRODUCTION_UI_UX_PLAN.md`
- **Component patterns:** Check `DESIGN_TOKENS.md`
- **Svelte 5 syntax:** Use Svelte MCP tools
- **Shadcn components:** Check shadcn-svelte docs

---

**Last Updated:** November 4, 2025  
**Sprint Duration:** 4 weeks  
**Team Size:** 1-3 developers

---

**Let's ship this! 🚀**
