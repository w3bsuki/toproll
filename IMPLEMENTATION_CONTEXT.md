# 🎯 Stake.com Layout Refactor - Context for AI

**Use this file when starting a new chat to implement the Stake.com layout**

---

## 📋 What to Ask AI

```
I need to refactor TopRoll's layout to match Stake.com exactly.

Please read these files for context:
1. STAKE_LAYOUT_TASKS.md (task list)
2. REVISED_UI_PLAN_STAKE_PATTERN.md (implementation guide)
3. STAKE_LAYOUT_COMPARISON.md (visual reference)

Then implement Phase 1 and Phase 2 from the tasks file.
```

---

## 📁 Files AI Will Need to Read

### **Documentation** (provide these):
- `STAKE_LAYOUT_TASKS.md` - Complete task breakdown
- `REVISED_UI_PLAN_STAKE_PATTERN.md` - Code examples & patterns
- `STAKE_LAYOUT_COMPARISON.md` - Visual layouts & CSS

### **Code Files** (AI will need access):
- `src/routes/+layout.svelte` - Main layout structure
- `src/lib/features/layout/ShellHeader.svelte` - Header component
- `src/lib/features/layout/ChatPanel.svelte` - Chat messages
- `src/lib/features/layout/RainPotCard.svelte` - Rain pot widget
- `src/lib/features/layout/BottomNav.svelte` - Mobile nav
- `src/lib/features/layout/ui-state.svelte.ts` - UI state management
- `src/app.css` - Global styles & CSS variables
- `tailwind.config.ts` - Tailwind configuration

---

## 🎯 Goal Summary

Transform this:
```
[280px Left Nav] + [Content] + [320px Chat] = Current Layout
```

Into this:
```
[64px Icon Rail] + [~1450px Content] + [320px Chat] = Stake.com Layout
```

---

## ✅ Key Changes

1. **Replace** `SidebarLeft.svelte` (280px) → `IconRail.svelte` (64px)
2. **Keep** `ChatPanel.svelte` but move to `ChatSidebar.svelte` (320px)
3. **Simplify** `ShellHeader.svelte` (remove game tabs)
4. **Update** `+layout.svelte` (three-column flex)
5. **Enhance** `BottomNav.svelte` (mobile-first)

---

## 🛠️ Tech Stack

- **Framework:** SvelteKit + Svelte 5 (runes)
- **Components:** shadcn-svelte (sidebar, dropdown, dialog, etc.)
- **Styling:** Tailwind CSS v4 + OKLCH colors
- **Icons:** @lucide/svelte
- **State:** Svelte 5 $state runes

---

## 📦 Shadcn Components to Use

- `Sidebar.Root` - Icon rail with `collapsible="icon"`
- `Sidebar.Menu` / `Sidebar.MenuItem` - Navigation items
- `Sidebar.MenuButton` - Clickable nav buttons
- `Sidebar.Rail` - Hover expansion trigger
- `DropdownMenu` - User & notification menus
- `Dialog` - Mobile chat drawer
- `Button` - All action buttons
- `Input` - Search & chat input
- `Badge` - Online count, notifications

---

## 🎨 Design Tokens (Tailwind v4)

```css
/* Already in app.css */
--background: oklch(0.22 0.015 240);
--card: oklch(0.26 0.018 240);
--primary: oklch(0.85 0.28 130);
--border: oklch(0.96 0.003 240 / 0.15);

/* Need to add for sidebar */
--sidebar-background: oklch(0.20 0.015 240);
--sidebar-accent: oklch(0.96 0.003 240 / 0.05);
--sidebar-border: oklch(0.96 0.003 240 / 0.10);
```

---

## 📱 Responsive Breakpoints

- **Desktop (1024px+):** Icon rail + content + chat sidebar
- **Mobile (<1024px):** Bottom nav + content + chat FAB

---

## 🚀 Implementation Order

### **Phase 1:** Setup (30 min)
```bash
npx shadcn-svelte@latest add sidebar
```

### **Phase 2:** Icon Rail (2-3 hours)
- Create `src/lib/features/layout/IconRail.svelte`
- Use shadcn Sidebar with 64px width
- Add navigation items with icons
- Style hover expansion

### **Phase 3:** Chat Sidebar (2-3 hours)
- Create `src/lib/features/layout/ChatSidebar.svelte`
- Move ChatPanel into sidebar
- Add collapse functionality
- Style 320px fixed width

### **Phase 4:** Layout Update (1-2 hours)
- Update `src/routes/+layout.svelte`
- Three-column flex structure
- Mobile responsive logic

### **Phase 5:** Polish (1-2 hours)
- Update header
- Test all breakpoints
- Fix any styling issues

---

## ⚠️ Important Notes

### **DO:**
✅ Use shadcn-svelte components (official, maintained)
✅ Follow Svelte 5 runes patterns ($state, $derived, $props)
✅ Use OKLCH colors (already in design system)
✅ Test on mobile AND desktop
✅ Keep chat always visible on desktop

### **DON'T:**
❌ Remove chat sidebar (it drives engagement!)
❌ Use old sidebar components
❌ Mix Svelte 4 and Svelte 5 patterns
❌ Hardcode widths (use Tailwind classes)
❌ Skip accessibility (ARIA labels, keyboard nav)

---

## 🧪 Testing Checklist

After implementation, verify:
- [ ] Icon rail shows on desktop (64px)
- [ ] Icon rail hidden on mobile
- [ ] Chat sidebar shows on desktop (320px)
- [ ] Chat FAB shows on mobile
- [ ] Bottom nav shows on mobile
- [ ] Hover expansion works
- [ ] Navigation functional
- [ ] Responsive at all breakpoints
- [ ] No horizontal scroll
- [ ] Smooth transitions

---

## 📞 If Issues Arise

### Icon rail not expanding:
- Check `group-hover` classes
- Verify Tailwind JIT mode
- Check CSS specificity

### Chat overlapping content:
- Verify flex container
- Check width calculations
- Review z-index stacking

### Mobile nav not visible:
- Check z-index (should be 50)
- Verify `fixed` positioning
- Check `bottom: 0` set

---

## 🎯 Success Criteria

Layout is successful when:
1. ✅ Looks like Stake.com (icon rail + chat)
2. ✅ Content width ~1450px (up from ~920px)
3. ✅ Icon rail 64px (down from 280px)
4. ✅ Mobile has bottom nav + FAB
5. ✅ All navigation works
6. ✅ Chat always visible on desktop
7. ✅ Professional & clean appearance

---

## 💡 Quick Start Command

```
AI, please implement the Stake.com layout refactor.

Context files:
- STAKE_LAYOUT_TASKS.md
- REVISED_UI_PLAN_STAKE_PATTERN.md
- STAKE_LAYOUT_COMPARISON.md

Start with Phase 1 (install sidebar) and Phase 2 (create IconRail component).
```

---

**That's it! This file has everything AI needs to implement the refactor. 🚀**
