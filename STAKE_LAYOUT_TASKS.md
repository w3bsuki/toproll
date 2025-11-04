# 🎯 Stake.com Layout Implementation Tasks

**Goal:** Copy Stake.com's exact layout using shadcn-svelte components  
**Timeline:** 5-7 days  
**Status:** Ready to start

---

## ✅ Phase 1: Setup & Installation (Day 1)

### Task 1.1: Install Shadcn Sidebar Component
```bash
npx shadcn-svelte@latest add sidebar
```
- [ ] Run installation command
- [ ] Verify component files in `src/lib/components/ui/sidebar/`
- [ ] Check CSS variables added to `app.css`

### Task 1.2: Verify Dependencies
```bash
# Check these are installed:
- @lucide/svelte (icons)
- shadcn-svelte (components)
- tailwindcss v4 (styling)
```
- [ ] All dependencies present
- [ ] No version conflicts

---

## 🎨 Phase 2: Create Icon Rail Component (Day 1-2)

### Task 2.1: Create IconRail.svelte
**File:** `src/lib/features/layout/IconRail.svelte`

**Requirements:**
- [ ] Use shadcn `Sidebar.Root` with `collapsible="icon"`
- [ ] 64px width when collapsed
- [ ] Expands on hover to show labels
- [ ] Active state highlighting
- [ ] Icons from @lucide/svelte
- [ ] Full height (top to bottom)

**Navigation Items:**
```typescript
Primary (top):
- Home (/)
- Cases (/cases)
- Battles (/battles)
- Community Pots (/pots)
- Marketplace (/marketplace)
- Upgrader (/upgrader)

Secondary (bottom):
- Leaderboard (/leaderboard)
- Support (/support)
```

### Task 2.2: Style Icon Rail
- [ ] Dark background (`oklch(0.20 0.015 240)`)
- [ ] Border right (`border-border/50`)
- [ ] Active item: primary accent + left border
- [ ] Hover: subtle background change
- [ ] Smooth transitions (200ms)

### Task 2.3: Test Icon Rail
- [ ] Hover expansion works
- [ ] Active state correct
- [ ] Navigation functional
- [ ] Responsive (hidden on mobile)

---

## 💬 Phase 3: Create Chat Sidebar Component (Day 2-3)

### Task 3.1: Create ChatSidebar.svelte
**File:** `src/lib/features/layout/ChatSidebar.svelte`

**Structure:**
```svelte
<aside class="w-[320px] border-l flex flex-col h-full">
  <!-- Header (48px) -->
  <div class="h-12">
    <MessageCircle icon />
    <h2>Live Chat</h2>
    <Badge>248 online</Badge>
    <Button collapse />
  </div>
  
  <!-- Messages (flex-1, scrollable) -->
  <div class="flex-1 overflow-y-auto">
    <ChatPanel />
  </div>
  
  <!-- Rain Pot (fixed height) -->
  <div class="p-4">
    <RainPotCard />
  </div>
  
  <!-- Input (60px) -->
  <div class="h-15">
    <Input placeholder="Type a message..." />
    <Button send />
  </div>
</aside>
```

### Task 3.2: Update ChatPanel.svelte
- [ ] Remove unnecessary wrapper
- [ ] Ensure messages auto-scroll
- [ ] Add message timestamps
- [ ] Style user avatars (32px rounded)

### Task 3.3: Style Chat Sidebar
- [ ] Background: `oklch(0.23 0.015 240)`
- [ ] Border left: `border-border/50`
- [ ] Header border bottom
- [ ] Input border top
- [ ] Smooth scrolling

### Task 3.4: Add Collapse Functionality
- [ ] Toggle button in header
- [ ] Save state to localStorage
- [ ] Animate collapse/expand
- [ ] Update ui-state.svelte.ts

---

## 📐 Phase 4: Update Layout Structure (Day 2-3)

### Task 4.1: Update +layout.svelte
**File:** `src/routes/+layout.svelte`

**New Structure:**
```svelte
<Sidebar.Provider>
  <div class="flex h-screen overflow-hidden">
    
    <!-- Icon Rail (Desktop Only) -->
    {#if !isMobile}
      <IconRail />
    {/if}
    
    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <ShellHeader />
      <main class="flex-1 overflow-y-auto">
        <div class="container mx-auto px-6 py-8 max-w-[1400px]">
          {@render children()}
        </div>
      </main>
      
      {#if isMobile}
        <BottomNav />
      {/if}
    </div>
    
    <!-- Chat Sidebar (Desktop Only) -->
    {#if !isMobile && ui.chatOpen}
      <ChatSidebar />
    {/if}
  </div>
  
  <!-- Mobile Chat FAB + Drawer -->
  {#if isMobile}
    <ChatFAB />
    <ChatDrawer />
  {/if}
</Sidebar.Provider>
```

### Task 4.2: Update ui-state.svelte.ts
- [ ] Add `chatOpen` state (default: true)
- [ ] Add `toggleChat()` method
- [ ] Load/save from localStorage
- [ ] Add mobile detection

### Task 4.3: Test Layout Structure
- [ ] Three columns render correctly
- [ ] Icon rail on left (64px)
- [ ] Chat on right (320px)
- [ ] Content fills middle
- [ ] No horizontal scroll

---

## 📱 Phase 5: Mobile Implementation (Day 3)

### Task 5.1: Update BottomNav.svelte
**Items:**
- [ ] Home (/)
- [ ] Cases (/cases)
- [ ] Battles (/battles)
- [ ] Pots (/pots)
- [ ] Profile (/profile)

**Style:**
- [ ] Fixed bottom
- [ ] 5 equal columns
- [ ] Active state (primary color)
- [ ] Icons + labels
- [ ] Safe area padding

### Task 5.2: Create Mobile Chat FAB
- [ ] Fixed position (bottom-right)
- [ ] Circular button (56px)
- [ ] Primary background
- [ ] Message icon
- [ ] Badge for unread count
- [ ] Above bottom nav (z-index: 50)

### Task 5.3: Update ChatDrawer.svelte
- [ ] Use shadcn Dialog component
- [ ] Slide from bottom
- [ ] 80% viewport height
- [ ] Full width
- [ ] Smooth animation

### Task 5.4: Test Mobile Layout
- [ ] Bottom nav visible
- [ ] Icon rail hidden
- [ ] Chat sidebar hidden
- [ ] FAB button works
- [ ] Drawer opens/closes
- [ ] No layout shifts

---

## 🎨 Phase 6: Header Simplification (Day 3-4)

### Task 6.1: Update ShellHeader.svelte
**Remove:**
- [ ] ❌ Game navigation tabs (moved to icon rail)
- [ ] ❌ Logo on desktop (icon rail has it)
- [ ] ❌ Sidebar toggle button

**Keep:**
- [ ] ✅ Search bar (centered, max-width: 600px)
- [ ] ✅ Notifications dropdown
- [ ] ✅ Daily Bonus button (gold gradient)
- [ ] ✅ User dropdown (with deposit/withdraw)

**Mobile:**
- [ ] Show logo on mobile
- [ ] Hamburger menu (if needed)
- [ ] Compact user menu

### Task 6.2: Update UserDropdown
**Quick Actions Section:**
```svelte
<div class="p-3 space-y-2">
  <Button variant="default" class="w-full bg-success">
    💰 Deposit
  </Button>
  <Button variant="outline" class="w-full">
    💸 Withdraw
  </Button>
</div>
```

**Menu Items:**
- [ ] Profile
- [ ] Inventory (with badge)
- [ ] Transactions
- [ ] Settings
- [ ] Sign Out (destructive color)

### Task 6.3: Test Header
- [ ] Search works
- [ ] Notifications open
- [ ] Daily bonus clickable
- [ ] User dropdown functional
- [ ] Mobile responsive

---

## 🧹 Phase 7: Cleanup Old Components (Day 4)

### Task 7.1: Delete Unused Files
- [ ] Delete `src/lib/features/layout/SidebarLeft.svelte`
- [ ] Delete `src/lib/features/layout/SidebarRight.svelte`
- [ ] Delete any old sidebar styles

### Task 7.2: Update Imports
- [ ] Find all imports of old components
- [ ] Replace with new components
- [ ] Check no broken references

### Task 7.3: Update index.ts
**File:** `src/lib/features/layout/index.ts`
```typescript
export { default as IconRail } from './IconRail.svelte';
export { default as ChatSidebar } from './ChatSidebar.svelte';
export { default as ShellHeader } from './ShellHeader.svelte';
export { default as ChatPanel } from './ChatPanel.svelte';
export { default as RainPotCard } from './RainPotCard.svelte';
export { default as BottomNav } from './BottomNav.svelte';
export { default as ChatDrawer } from './ChatDrawer.svelte';
```

---

## 🎨 Phase 8: Styling & Polish (Day 4-5)

### Task 8.1: Update CSS Variables
**File:** `src/app.css`

**Add sidebar tokens:**
```css
:root {
  /* Existing tokens... */
  
  /* Sidebar tokens */
  --sidebar-background: oklch(0.20 0.015 240);
  --sidebar-foreground: oklch(0.95 0.010 240);
  --sidebar-primary: oklch(0.85 0.28 130);
  --sidebar-primary-foreground: oklch(0.10 0.005 240);
  --sidebar-accent: oklch(0.96 0.003 240 / 0.05);
  --sidebar-accent-foreground: oklch(0.85 0.28 130);
  --sidebar-border: oklch(0.96 0.003 240 / 0.10);
  --sidebar-ring: oklch(0.85 0.28 130);
}
```

### Task 8.2: Verify Tailwind Config
**File:** `tailwind.config.ts`

- [ ] Sidebar colors in theme
- [ ] Animation utilities
- [ ] Container max-width settings

### Task 8.3: Test All Breakpoints
- [ ] 1920px (desktop large)
- [ ] 1440px (desktop medium)
- [ ] 1280px (desktop small)
- [ ] 1024px (tablet landscape)
- [ ] 768px (tablet portrait)
- [ ] 375px (mobile)

### Task 8.4: Polish Interactions
- [ ] Hover states smooth
- [ ] Active states clear
- [ ] Focus states accessible
- [ ] Transitions consistent (200-300ms)
- [ ] Loading states where needed

---

## 🧪 Phase 9: Testing (Day 5)

### Task 9.1: Manual Testing
- [ ] All navigation links work
- [ ] Icon rail hover expansion
- [ ] Chat sidebar collapse/expand
- [ ] Mobile bottom nav
- [ ] Chat FAB and drawer
- [ ] Search functionality
- [ ] User dropdown actions

### Task 9.2: Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Color contrast ratios (WCAG AA)

### Task 9.3: Performance Testing
- [ ] No layout shifts (CLS)
- [ ] Fast initial load
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Efficient re-renders

### Task 9.4: Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## 🚀 Phase 10: Deployment (Day 6-7)

### Task 10.1: Create Feature Branch
```bash
git checkout -b feature/stake-layout-refactor
```

### Task 10.2: Commit Changes
```bash
git add .
git commit -m "feat: implement Stake.com layout with icon rail and chat sidebar"
```

### Task 10.3: Deploy to Staging
- [ ] Push to staging branch
- [ ] Run build checks
- [ ] Test on staging URL
- [ ] Get team feedback

### Task 10.4: Production Deployment
- [ ] Merge to main
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Check analytics

---

## 📊 Success Metrics

### Quantitative Goals:
- [ ] Content width: ~1450px (vs current ~920px)
- [ ] Icon rail: 64px (vs current 280px sidebar)
- [ ] Chat visible: 100% of time on desktop
- [ ] Mobile performance: < 3s load time

### Qualitative Goals:
- [ ] Matches Stake.com appearance
- [ ] Professional & clean
- [ ] Easy navigation
- [ ] High user satisfaction

---

## 🆘 Troubleshooting

### Issue: Icon rail not expanding on hover
- Check CSS: `group-hover:w-[200px]`
- Verify Tailwind JIT mode enabled
- Check z-index stacking

### Issue: Chat sidebar overlapping content
- Check flex container structure
- Verify width calculations
- Check responsive breakpoints

### Issue: Mobile bottom nav not visible
- Check z-index (should be 50)
- Verify fixed positioning
- Check safe area padding

### Issue: Sidebar animations janky
- Add `will-change: width`
- Use transform instead of width
- Check for forced reflows

---

## 📚 Context Files for Next Chat

When asking AI to implement this, provide these files:
1. ✅ `STAKE_LAYOUT_TASKS.md` (this file)
2. ✅ `REVISED_UI_PLAN_STAKE_PATTERN.md` (detailed guide)
3. ✅ `STAKE_LAYOUT_COMPARISON.md` (visual reference)

AI will need access to:
- `src/routes/+layout.svelte`
- `src/lib/features/layout/ShellHeader.svelte`
- `src/lib/features/layout/ChatPanel.svelte`
- `src/lib/features/layout/RainPotCard.svelte`
- `src/lib/features/layout/BottomNav.svelte`
- `src/lib/features/layout/ui-state.svelte.ts`
- `src/app.css`
- `tailwind.config.ts`

---

## ✅ Task Completion Tracking

**Day 1:** [ ] Phase 1, [ ] Phase 2  
**Day 2:** [ ] Phase 3, [ ] Phase 4  
**Day 3:** [ ] Phase 5, [ ] Phase 6  
**Day 4:** [ ] Phase 7, [ ] Phase 8  
**Day 5:** [ ] Phase 9  
**Day 6-7:** [ ] Phase 10  

---

**Ready to build? Start with Phase 1! 🚀**
