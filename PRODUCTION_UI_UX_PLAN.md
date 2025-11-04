# 🎯 Production UI/UX Improvement Plan - CSGOGem Inspired

**Date:** November 4, 2025  
**Status:** Ready for Implementation  
**Target:** Production Launch Q4 2025

---

## 📊 Executive Summary

Based on analysis of **CSGOGem.com** (leading CS2 casino platform), this plan outlines strategic UI/UX improvements to finalize TopRoll for production. The primary focus is on **simplification, clarity, and conversion optimization** following proven casino gaming patterns.

### Key Changes:
1. ✅ **Single-sidebar layout** - Remove dual sidebars, adopt CSGOGem's clean single-column approach
2. ✅ **Horizontal game navigation** - Move from vertical sidebar to header tabs
3. ✅ **Utility pages relocated** - Settings/Support moved to dropdown menus
4. ✅ **Streamlined chat** - Optional bottom-drawer on mobile, side panel on desktop
5. ✅ **Enhanced CTAs** - Prominent deposit/bonus buttons with proper hierarchy
6. ✅ **Production-ready components** - All buttons functional, proper loading states

---

## 🔍 CSGOGem.com Analysis

### What They Do Right:

#### **1. Layout Architecture**
```
┌────────────────────────────────────────────────────┐
│ Logo | Cases | Battles | Upgrader | Wheel | User  │ ← SINGLE HEADER BAR
├────────────────────────────────────────────────────┤
│                                                    │
│              MAIN CONTENT AREA                     │
│           (Full-width, no sidebars)                │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Card    │  │  Card    │  │  Card    │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                    │
└────────────────────────────────────────────────────┘
         ↑ Footer (minimal)
```

**Key Insights:**
- ❌ **NO left navigation sidebar** - saves 280px of horizontal space
- ❌ **NO right chat sidebar** - chat is optional toggle or bottom sheet
- ✅ **Full-width content** - game modes dominate the viewport
- ✅ **Horizontal navigation** - all game modes in single row
- ✅ **Minimal chrome** - maximum space for gambling content

#### **2. Navigation Pattern**
- **Primary Games:** Cases, Battles, Upgrader, Wheel → Header tabs
- **User Actions:** Deposit, Withdraw, Profile → User dropdown (top-right)
- **Utility Pages:** Settings, Support, Provably Fair → Footer links
- **Chat:** Optional drawer/panel, not permanent fixture

#### **3. Visual Hierarchy**
1. **Hero CTAs** - Deposit/Bonus buttons (gold gradient)
2. **Game mode cards** - Large, prominent, with animations
3. **Live feed** - Subtle ticker, not distracting
4. **Chat** - Minimized by default, user opt-in

#### **4. Color & Contrast**
- **Dark base** (`#0a0a0f` type dark) - similar to your `oklch(0.22)`
- **Bright accents** - Gold for premium, Green for success
- **Strong borders** - Visible card separation (15-20% opacity)
- **Depth shadows** - Clear elevation hierarchy

#### **5. Mobile-First**
- **Bottom nav bar** - 5 primary actions
- **Hamburger menu** - Secondary items
- **Full-screen modes** - Game experiences take over viewport
- **Sticky CTAs** - Deposit button always accessible

---

## 🎨 Recommended Layout Changes

### **Current TopRoll Layout (To Replace):**
```
┌──────────┬─────────────────┬──────────┐
│  Left    │   Main Content  │  Right   │
│  Nav     │                 │  Chat    │
│  Sidebar │                 │  Sidebar │
│ (280px)  │   (variable)    │ (320px)  │
│          │                 │          │
│ - Home   │                 │ Messages │
│ - Cases  │                 │ Rain Pot │
│ - Battles│                 │          │
│ - Chat   │                 │          │
│ - Inv.   │                 │          │
│ - Support│ ← TOO DEEP      │          │
│ - Settings│← TOO DEEP      │          │
└──────────┴─────────────────┴──────────┘
```

**Problems:**
- 🔴 600px+ horizontal space wasted on sidebars
- 🔴 Navigation items compete with content
- 🔴 Chat always visible (distracting)
- 🔴 Settings/Support too prominent
- 🔴 Poor mobile experience

---

### **Proposed CSGOGem Layout (Production):**
```
┌──────────────────────────────────────────────────┐
│  TopRoll | Cases | Battles | Pots | Upgrader    │ ← HEADER (72px)
│  [Search] [Bell] [Daily Bonus] [User Dropdown]  │
├──────────────────────────────────────────────────┤
│  Live Drops: User123 won $450 • User456...      │ ← TICKER (40px)
├──────────────────────────────────────────────────┤
│                                                  │
│              FULL-WIDTH CONTENT AREA             │
│                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │ Cases  │  │Battles │  │  Pots  │            │
│  │ $2.5k  │  │ $8.2k  │  │ $1.2k  │            │
│  └────────┘  └────────┘  └────────┘            │
│                                                  │
│  Featured Cases                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ Case │ │ Case │ │ Case │ │ Case │          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
│                                                  │
└──────────────────────────────────────────────────┘
│  [Chat Toggle] (bottom-right fab)               │ ← OPTIONAL
└──────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ **+600px more content width** - better game card visibility
- ✅ **Cleaner hierarchy** - games are the hero
- ✅ **Faster navigation** - all modes in one glance
- ✅ **Professional appearance** - matches industry leaders
- ✅ **Better mobile** - translates to bottom nav naturally

---

## 📐 Component Architecture Changes

### **1. Header Component (ShellHeader.svelte)**

#### Current State:
```svelte
<!-- Desktop: Logo | Search | Actions | User -->
<!-- Missing: Game navigation tabs -->
```

#### Proposed Changes:
```svelte
<header class="h-[72px] border-b border-border bg-card">
  <div class="container flex h-full items-center justify-between">
    <!-- LEFT: Logo + Game Tabs -->
    <div class="flex items-center gap-8">
      <a href="/" class="flex items-center gap-2">
        <Logo />
      </a>
      
      <!-- HORIZONTAL GAME NAVIGATION -->
      <nav class="hidden lg:flex items-center gap-1">
        <NavTab href="/cases" icon={Package} active={pathname === '/cases'}>
          Cases
        </NavTab>
        <NavTab href="/battles" icon={Swords}>
          Battles
        </NavTab>
        <NavTab href="/pots" icon={Coins}>
          Community Pots
        </NavTab>
        <NavTab href="/marketplace" icon={Store}>
          Marketplace
        </NavTab>
        <NavTab href="/upgrader" icon={TrendingUp}>
          Upgrader
        </NavTab>
      </nav>
    </div>

    <!-- RIGHT: Search + Actions + User -->
    <div class="flex items-center gap-3">
      <SearchInput />
      <NotificationDropdown />
      <DailyBonusButton />
      <UserDropdown />
    </div>
  </div>
</header>
```

**New NavTab Component:**
```svelte
<!-- NavTab.svelte -->
<script lang="ts">
  let { href, icon: Icon, active = false, children } = $props();
</script>

<a
  {href}
  class="
    relative flex h-[72px] items-center gap-2 px-4
    text-sm font-semibold
    transition-colors
    {active 
      ? 'text-primary border-b-2 border-primary' 
      : 'text-muted-foreground hover:text-foreground'
    }
  "
>
  <Icon class="h-4 w-4" />
  {@render children()}
  
  {#if active}
    <span class="absolute bottom-0 inset-x-0 h-[2px] bg-primary"></span>
  {/if}
</a>
```

---

### **2. Layout Structure (+layout.svelte)**

#### Current (Two Sidebars):
```svelte
<div class="flex h-screen">
  <SidebarLeft /> <!-- 280px -->
  <main /> <!-- flex-1 -->
  <SidebarRight /> <!-- 320px -->
</div>
```

#### Proposed (Clean Single Column):
```svelte
<div class="flex h-screen flex-col">
  <!-- Header (fixed) -->
  <ShellHeader />
  
  <!-- Live Drops Ticker (fixed) -->
  <LiveDropsTicker />
  
  <!-- Main Content (scrollable) -->
  <main class="flex-1 overflow-y-auto">
    <div class="container mx-auto px-6 py-8 max-w-[1600px]">
      {@render children()}
    </div>
  </main>
  
  <!-- Optional Chat FAB (desktop) -->
  {#if !isMobile}
    <button
      class="fixed bottom-8 right-8 z-50"
      onclick={() => ui.toggleChat()}
    >
      <MessageCircle class="h-6 w-6" />
    </button>
  {/if}
  
  <!-- Mobile Bottom Nav -->
  {#if isMobile}
    <BottomNav />
  {/if}
  
  <!-- Chat Drawer (when open) -->
  <ChatDrawer open={ui.chatOpen} onClose={() => ui.toggleChat()} />
</div>
```

---

### **3. User Dropdown (Relocated Actions)**

Replace inline buttons with consolidated dropdown:

```svelte
<!-- UserDropdown.svelte -->
<DropdownMenu>
  <DropdownMenuTrigger>
    <Avatar src={user.avatar} />
    <span>{user.username}</span>
    <span class="text-primary">${balance}</span>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end" class="w-64">
    <!-- Quick Actions -->
    <div class="p-3 space-y-2">
      <Button variant="default" class="w-full">
        💰 Deposit
      </Button>
      <Button variant="outline" class="w-full">
        💸 Withdraw
      </Button>
    </div>
    
    <DropdownMenuSeparator />
    
    <!-- Profile Links -->
    <DropdownMenuItem href="/profile">
      <User class="h-4 w-4" />
      Profile
    </DropdownMenuItem>
    <DropdownMenuItem href="/inventory">
      <Package class="h-4 w-4" />
      Inventory
      <Badge>{inventoryCount}</Badge>
    </DropdownMenuItem>
    <DropdownMenuItem href="/transactions">
      <Receipt class="h-4 w-4" />
      Transactions
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <!-- Settings (moved from sidebar) -->
    <DropdownMenuItem href="/settings">
      <Settings class="h-4 w-4" />
      Settings
    </DropdownMenuItem>
    <DropdownMenuItem href="/provably-fair">
      <Shield class="h-4 w-4" />
      Provably Fair
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <!-- Logout -->
    <DropdownMenuItem class="text-destructive">
      <LogOut class="h-4 w-4" />
      Sign Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### **4. Footer Component (Utility Links)**

Add minimal footer for support/legal:

```svelte
<!-- Footer.svelte -->
<footer class="border-t border-border bg-card/50 backdrop-blur-sm">
  <div class="container mx-auto px-6 py-8 max-w-[1600px]">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <!-- About -->
      <div>
        <h3 class="font-bold mb-4">TopRoll</h3>
        <p class="text-sm text-muted-foreground">
          CS2 skin marketplace and casino platform
        </p>
      </div>
      
      <!-- Support (moved from sidebar) -->
      <div>
        <h4 class="font-semibold mb-3">Support</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/support" class="hover:text-primary">Help Center</a></li>
          <li><a href="/support/contact">Contact Us</a></li>
          <li><a href="/faq">FAQ</a></li>
        </ul>
      </div>
      
      <!-- Legal -->
      <div>
        <h4 class="font-semibold mb-3">Legal</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/responsible-gaming">Responsible Gaming</a></li>
        </ul>
      </div>
      
      <!-- Social -->
      <div>
        <h4 class="font-semibold mb-3">Community</h4>
        <div class="flex gap-3">
          <a href="#" aria-label="Discord"><DiscordIcon /></a>
          <a href="#" aria-label="Twitter"><TwitterIcon /></a>
          <a href="#" aria-label="YouTube"><YouTubeIcon /></a>
        </div>
      </div>
    </div>
    
    <div class="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
      © 2025 TopRoll. All rights reserved.
    </div>
  </div>
</footer>
```

---

### **5. Chat Component (Optional Drawer)**

Transform from always-visible sidebar to toggleable drawer:

```svelte
<!-- ChatDrawer.svelte -->
<script lang="ts">
  import { getUIState } from '$lib/features/layout/ui-state.svelte';
  import { Dialog, DialogContent } from '$lib/components/ui/dialog';
  import { ChatPanel } from '$lib/features/layout';
  
  const ui = getUIState();
</script>

<!-- Desktop: Side Drawer -->
<aside
  class="
    fixed top-0 right-0 z-40 h-screen w-[400px]
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
        <Badge variant="success">248 online</Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onclick={() => ui.toggleChat()}
      >
        <X class="h-4 w-4" />
      </Button>
    </div>
    
    <!-- Chat Content -->
    <div class="flex-1 overflow-hidden">
      <ChatPanel />
    </div>
  </div>
</aside>

<!-- Mobile: Bottom Sheet -->
{#if isMobile}
  <Dialog bind:open={ui.chatOpen}>
    <DialogContent class="h-[80vh] max-w-full">
      <ChatPanel />
    </DialogContent>
  </Dialog>
{/if}
```

---

### **6. Mobile Bottom Navigation**

Enhanced with proper icons and active states:

```svelte
<!-- BottomNav.svelte -->
<nav class="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/98 backdrop-blur-xl pb-safe">
  <div class="grid grid-cols-5 h-16">
    <NavItem href="/" icon={Home} label="Home" active={pathname === '/'} />
    <NavItem href="/cases" icon={Package} label="Cases" />
    <NavItem href="/battles" icon={Swords} label="Battles" />
    <NavItem href="/pots" icon={Coins} label="Pots" />
    <NavItem href="/profile" icon={User} label="Profile" />
  </div>
</nav>

<!-- NavItem Component -->
<a
  href={href}
  class="
    flex flex-col items-center justify-center gap-1
    {active ? 'text-primary' : 'text-muted-foreground'}
  "
>
  <Icon class="h-5 w-5" />
  <span class="text-xs font-medium">{label}</span>
</a>
```

---

## 🎯 Button & CTA Improvements

### **1. Daily Bonus Button (Gold Gradient)**

Current state is good, but ensure consistency:

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
  
  <!-- Shimmer effect -->
  <div class="
    absolute inset-0 
    bg-gradient-to-r from-transparent via-white/20 to-transparent
    -translate-x-full group-hover:translate-x-full
    transition-transform duration-1000
  "></div>
</button>
```

---

### **2. Deposit Button (Primary CTA)**

Make deposit the most prominent action:

```svelte
<Button
  variant="default"
  size="lg"
  class="
    bg-success hover:bg-success/90
    text-success-foreground
    font-bold text-base
    shadow-lg hover:shadow-xl
    hover:scale-105
    min-w-[140px]
  "
>
  <Wallet class="h-5 w-5" />
  Deposit
</Button>
```

---

### **3. Game Mode Cards (Landing Page)**

Large, interactive cards with hover effects:

```svelte
<!-- GameModeCard.svelte -->
<a
  href={href}
  class="
    group relative overflow-hidden
    bg-card border-2 border-white/10
    rounded-2xl p-6
    shadow-card hover:shadow-card-hover
    transition-all duration-300
    hover:scale-[1.02]
    hover:border-primary/50
  "
>
  <!-- Gradient background -->
  <div class="absolute inset-0 {gradientClass} opacity-60"></div>
  
  <!-- Content -->
  <div class="relative z-10">
    <!-- Icon -->
    <div class="mb-4 flex items-center justify-center">
      <div class="
        bg-primary/20 text-primary
        p-4 rounded-xl
        group-hover:scale-110 transition-transform
      ">
        <Icon class="h-8 w-8" />
      </div>
    </div>
    
    <!-- Title -->
    <h3 class="text-2xl font-bold mb-2 text-center">
      {title}
    </h3>
    
    <!-- Description -->
    <p class="text-muted-foreground text-sm text-center mb-4">
      {description}
    </p>
    
    <!-- Stats -->
    <div class="flex items-center justify-between pt-4 border-t border-white/10">
      <div class="text-center">
        <div class="text-xs text-muted-foreground">Active</div>
        <div class="text-lg font-bold text-primary">{activeCount}</div>
      </div>
      <div class="text-center">
        <div class="text-xs text-muted-foreground">24h Volume</div>
        <div class="text-lg font-bold">${volume}</div>
      </div>
    </div>
  </div>
  
  <!-- Hover arrow -->
  <div class="
    absolute top-4 right-4
    opacity-0 group-hover:opacity-100
    transform translate-x-2 group-hover:translate-x-0
    transition-all
  ">
    <ArrowRight class="h-6 w-6 text-primary" />
  </div>
</a>
```

---

### **4. Loading States**

All buttons need proper loading states:

```svelte
<Button
  disabled={isLoading}
  onclick={handleAction}
>
  {#if isLoading}
    <Loader2 class="h-4 w-4 animate-spin" />
  {:else}
    <Icon class="h-4 w-4" />
  {/if}
  {label}
</Button>
```

---

## 🎨 Design System Refinements

### **1. Color Tokens (Keep Current)**

Your current color system is production-ready:
```css
--background: oklch(0.22 0.015 240)      ✅
--card: oklch(0.26 0.018 240)            ✅
--border: oklch(0.96 0.003 240 / 0.15)   ✅
--primary: oklch(0.85 0.28 130)          ✅
--warning: oklch(0.78 0.16 70)           ✅ (Daily Bonus gold)
```

### **2. Typography (Keep Current)**

```css
font-family: 'Inter Variable'            ✅
font-size: 15px                          ✅
line-height: 1.6                         ✅
```

### **3. Spacing (Standardize)**

Use consistent spacing scale:
```css
Gap Small:    gap-2   (8px)
Gap Medium:   gap-4   (16px)
Gap Large:    gap-6   (24px)
Gap XL:       gap-8   (32px)

Padding Small:  p-4   (16px)
Padding Medium: p-6   (24px)
Padding Large:  p-8   (32px)
```

### **4. Border Radius (Standardize)**

```css
Small:   rounded-lg   (8px)  - badges, small buttons
Medium:  rounded-xl   (12px) - buttons, inputs
Large:   rounded-2xl  (16px) - cards
XL:      rounded-3xl  (24px) - hero cards
```

---

## 📱 Responsive Behavior

### **Desktop (1024px+)**
```
- Full header with horizontal game tabs
- Optional chat drawer (toggle via FAB)
- Wide content container (max-w-[1600px])
- 3-4 column grid layouts
```

### **Tablet (768px - 1023px)**
```
- Condensed header (hamburger menu for games)
- Chat as bottom sheet
- 2 column grid layouts
- Sticky header
```

### **Mobile (< 768px)**
```
- Minimal header (logo + icons)
- Bottom navigation bar
- Single column layouts
- Full-screen game modes
- Swipe gestures for chat/menu
```

---

## ✅ Implementation Checklist

### **Phase 1: Layout Restructure** (Week 1)

- [ ] Create new `NavTab.svelte` component
- [ ] Update `ShellHeader.svelte` with horizontal game navigation
- [ ] Modify `+layout.svelte` to remove dual sidebars
- [ ] Create new `ChatDrawer.svelte` component
- [ ] Add chat toggle FAB button
- [ ] Update `BottomNav.svelte` with new items
- [ ] Test responsive breakpoints

**Files to modify:**
- `src/lib/features/layout/ShellHeader.svelte`
- `src/routes/+layout.svelte`
- `src/lib/features/layout/ChatDrawer.svelte` (new)
- `src/lib/features/layout/BottomNav.svelte`
- `src/lib/features/layout/ui-state.svelte.ts` (add chatOpen state)

---

### **Phase 2: Component Consolidation** (Week 1-2)

- [ ] Create `UserDropdown.svelte` with deposit/withdraw
- [ ] Move Settings to user dropdown
- [ ] Move Support to footer
- [ ] Create `Footer.svelte` component
- [ ] Update all navigation links
- [ ] Remove old `SidebarLeft.svelte` and `SidebarRight.svelte`

**Files to modify:**
- `src/lib/features/layout/UserDropdown.svelte` (new)
- `src/lib/features/layout/Footer.svelte` (new)
- Delete: `src/lib/features/layout/SidebarLeft.svelte`
- Delete: `src/lib/features/layout/SidebarRight.svelte`

---

### **Phase 3: Button & CTA Enhancement** (Week 2)

- [ ] Standardize button sizes (44px minimum)
- [ ] Add loading states to all action buttons
- [ ] Enhance Daily Bonus button with shimmer
- [ ] Create prominent Deposit CTA
- [ ] Add hover effects to all interactive elements
- [ ] Ensure WCAG touch targets (44x44px)

**Files to modify:**
- `src/lib/components/ui/button/button.svelte`
- `src/lib/features/layout/ShellHeader.svelte` (Daily Bonus)
- All page components with buttons

---

### **Phase 4: Landing Page Hero** (Week 2)

- [ ] Create `GameModeCard.svelte` component
- [ ] Design landing page grid layout
- [ ] Add gradient backgrounds per game mode
- [ ] Implement hover animations
- [ ] Add real-time stats (active players, volume)
- [ ] Optimize for mobile (single column)

**Files to modify:**
- `src/routes/+page.svelte`
- `src/lib/features/home/GameModeCard.svelte` (new)

---

### **Phase 5: Settings & Support Pages** (Week 3)

- [ ] Create `/settings` page with tabs
  - Account Settings
  - Privacy & Security
  - Notifications
  - Appearance (dark mode toggle)
  - Two-Factor Auth
- [ ] Create `/support` page
  - Help articles
  - Contact form
  - Live chat widget
  - FAQ accordion
- [ ] Add breadcrumb navigation
- [ ] Ensure mobile responsiveness

**New routes:**
- `src/routes/(app)/settings/+page.svelte`
- `src/routes/(app)/support/+page.svelte`

---

### **Phase 6: Accessibility Audit** (Week 3)

- [ ] Run axe DevTools scan
- [ ] Fix all critical accessibility issues
- [ ] Ensure keyboard navigation works
- [ ] Add ARIA labels to all interactive elements
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify color contrast ratios (WCAG AA)
- [ ] Add skip navigation links

**Tools:**
- axe DevTools Chrome Extension
- WAVE Browser Extension
- Lighthouse CI

---

### **Phase 7: Performance Optimization** (Week 4)

- [ ] Lazy load chat component
- [ ] Optimize images (WebP, srcset)
- [ ] Code split by route
- [ ] Prefetch navigation links
- [ ] Minimize bundle size
- [ ] Add loading skeletons
- [ ] Implement virtual scrolling for long lists

**Metrics to target:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

---

### **Phase 8: Testing & QA** (Week 4)

- [ ] Write Playwright E2E tests for new layout
- [ ] Test navigation flows
- [ ] Test responsive breakpoints
- [ ] Test chat drawer open/close
- [ ] Test user dropdown actions
- [ ] Verify all buttons functional
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

**New tests:**
- `e2e/navigation.spec.ts`
- `e2e/layout.spec.ts`
- `e2e/chat-drawer.spec.ts`
- `e2e/responsive.spec.ts`

---

## 🚀 Deployment Strategy

### **Staging Environment**

1. Deploy to Vercel preview branch
2. Run full E2E test suite
3. Manual QA by team
4. Collect feedback from beta users
5. Iterate on issues

### **Production Rollout**

**Option A: Big Bang** (Not Recommended)
- Switch all users to new layout at once
- High risk, but faster deployment

**Option B: Phased Rollout** (Recommended)
1. **Week 1:** 10% of users see new layout
2. **Week 2:** 50% if no major issues
3. **Week 3:** 100% rollout

**Implementation:**
```typescript
// src/lib/config.ts
export const useNewLayout = () => {
  if (browser) {
    const userId = getUserId();
    const rolloutPercentage = 50; // 50% of users
    return (userId % 100) < rolloutPercentage;
  }
  return false;
};
```

**Option C: Feature Flag** (Most Flexible)
- Use environment variable or database flag
- Toggle new layout without redeployment

```typescript
// .env
PUBLIC_NEW_LAYOUT_ENABLED=true

// +layout.svelte
const useNewLayout = import.meta.env.PUBLIC_NEW_LAYOUT_ENABLED === 'true';
```

---

## 📊 Success Metrics

### **User Engagement**
- **Session Duration:** Target +20%
- **Pages per Session:** Target +30%
- **Bounce Rate:** Target -15%

### **Conversion**
- **Deposit Rate:** Target +25%
- **Daily Bonus Claims:** Target +40%
- **Game Mode Engagement:** Target +35%

### **Performance**
- **Time to Interactive:** < 3s
- **First Contentful Paint:** < 1.5s
- **Lighthouse Score:** > 90

### **Accessibility**
- **WCAG AA Compliance:** 100%
- **Keyboard Navigation:** Full support
- **Screen Reader:** No critical errors

### **User Feedback**
- **NPS Score:** Target > 70
- **Support Tickets:** Target -30%
- **User Satisfaction:** Target > 4.5/5

---

## 🛠️ Technical Stack (Confirmed)

### **Frontend**
- ✅ SvelteKit 2 + Svelte 5 (runes)
- ✅ Tailwind CSS v4
- ✅ shadcn-svelte components
- ✅ OKLCH color system
- ✅ Inter Variable font

### **Design System**
- ✅ Design tokens in `app.css`
- ✅ Consistent spacing/typography
- ✅ Accessible color contrast
- ✅ Responsive breakpoints

### **Testing**
- ✅ Vitest (unit tests)
- ✅ Playwright (E2E tests)
- ✅ TypeScript (type safety)

---

## 📚 Resources & References

### **CSGOGem Inspiration**
- Homepage hero layout
- Horizontal game navigation
- Minimal sidebar approach
- User dropdown consolidation
- Footer utility links

### **Shadcn Components to Use**
- ✅ `DropdownMenu` - User actions, notifications
- ✅ `Dialog` - Chat drawer, modals
- ✅ `Tabs` - Settings page, game filters
- ✅ `Badge` - Status indicators, counts
- ✅ `Skeleton` - Loading states
- ✅ `Accordion` - FAQ, help sections

### **Svelte 5 MCP Docs**
- Use Svelte MCP for component best practices
- Validate all runes usage ($state, $derived, $effect)
- Check for prop destructuring patterns

### **Accessibility Guidelines**
- WCAG 2.1 Level AA compliance
- ARIA best practices
- Keyboard navigation patterns
- Screen reader testing

---

## 🎯 Final Implementation Order

### **Sprint 1 (Week 1): Layout Foundation**
1. Remove dual sidebars from `+layout.svelte`
2. Add horizontal navigation to `ShellHeader.svelte`
3. Create `ChatDrawer.svelte` component
4. Update mobile `BottomNav.svelte`
5. Test responsive behavior

### **Sprint 2 (Week 2): Components**
1. Create `UserDropdown.svelte`
2. Create `Footer.svelte`
3. Update `GameModeCard.svelte`
4. Enhance buttons with loading states
5. Add Daily Bonus shimmer effect

### **Sprint 3 (Week 3): Pages**
1. Build `/settings` page
2. Build `/support` page
3. Update home page hero
4. Add breadcrumbs to utility pages
5. Optimize mobile layouts

### **Sprint 4 (Week 4): Polish & Deploy**
1. Accessibility audit & fixes
2. Performance optimization
3. Write E2E tests
4. QA testing (all browsers/devices)
5. Staging deployment
6. Production rollout (phased)

---

## ✅ Definition of Done

A feature is complete when:
- [ ] Component code written and typed
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Accessibility verified (WCAG AA)
- [ ] Unit tests written (if applicable)
- [ ] E2E test written
- [ ] Code reviewed and merged
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] QA approved

---

## 🎉 Expected Outcomes

### **User Experience**
- ✅ **Cleaner, more professional interface**
- ✅ **Faster navigation** (all games in header)
- ✅ **Less distraction** (optional chat)
- ✅ **Better mobile experience** (full-width content)
- ✅ **Easier access to utilities** (dropdown menus)

### **Business Impact**
- ✅ **Higher conversion rates** (better CTAs)
- ✅ **Increased engagement** (clearer hierarchy)
- ✅ **Reduced support load** (easier settings access)
- ✅ **Better brand perception** (professional UI)

### **Technical Debt**
- ✅ **Remove unused sidebar components**
- ✅ **Consolidate navigation logic**
- ✅ **Standardize button patterns**
- ✅ **Improve component reusability**

---

## 📞 Next Steps

1. **Review this plan** with the team
2. **Prioritize features** based on business needs
3. **Assign tasks** to developers
4. **Set sprint goals** (weekly targets)
5. **Begin Sprint 1** (layout foundation)

---

**Document Version:** 1.0  
**Last Updated:** November 4, 2025  
**Status:** Ready for Implementation ✅  
**Estimated Completion:** 4 weeks (1 month sprint)

---

## 🤝 Team Roles

- **Lead Developer:** Layout restructure, component architecture
- **UI/UX Designer:** Design review, mockups, user testing
- **QA Engineer:** Test plan, E2E tests, accessibility audit
- **Product Manager:** Prioritization, success metrics, stakeholder updates

---

**Let's build a production-ready CS2 marketplace! 🚀**
