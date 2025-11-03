# TopRoll Documentation

**Spec-driven development documentation for the TopRoll CS2 gambling platform.**

---

## 🎯 Core Documentation (5 Files)

Everything you need to build TopRoll:

### 1. [SPEC.md](SPEC.md) - Product Specification
**Start here.** Complete product specification with:
- Product vision & success metrics
- User personas
- Core features (auth, inventory, marketplace, pots, battles, social)
- Acceptance criteria for each feature
- Technical requirements
- Scope & roadmap
- User flows & edge cases
- Success criteria & glossary

### 2. [ARCHITECTURE.md](ARCHITECTURE.md) - Technical Architecture
System design and technical overview:
- Tech stack (SvelteKit, Svelte 5, Supabase)
- Architecture principles
- Project structure
- Database schema overview
- Authentication & authorization
- Realtime system

### 3. [API.md](API.md) - API Reference
Complete API documentation:
- Authentication endpoints (Steam OpenID)
- Battles API (create, join, list)
- Pots API (create, join, list)
- Marketplace API (list, purchase)
- Inventory & Transactions
- Provably Fair API
- WebSocket Events (Supabase Realtime)
- Error codes & rate limits

### 4. [DEVELOPMENT.md](DEVELOPMENT.md) - Developer Guide
Everything to get started:
- Quick start & setup
- Tech stack deep dive
- Project structure
- Development workflow (TDD, spec-driven)
- Coding standards (TypeScript, Svelte 5, state management)
- Testing (unit, component, E2E)
- Database migrations
- Debugging & performance
- Deployment

### 5. [DESIGN.md](DESIGN.md) - Design System
UI/UX guidelines:
- Design principles (Neo-Brutalism, gaming-focused, accessible)
- Tailwind v4 tokens (colors, typography, spacing, shadows)
- Component patterns (Button, Card, Badge, Input)
- Layout patterns (grid, flex)
- Motion & transitions
- Iconography (Lucide)
- Accessibility (keyboard, ARIA, focus states)
- Responsive design
- Best practices

---

## � Reading Order

### For Product Managers:
1. SPEC.md → API.md → DESIGN.md

### For Developers:
1. SPEC.md → ARCHITECTURE.md → DEVELOPMENT.md → API.md

### For Designers:
1. SPEC.md → DESIGN.md → ARCHITECTURE.md

### For New Team Members:
1. SPEC.md (overview) → DEVELOPMENT.md (quick start) → All others

---

## 🚀 Quick Links

- **Production URL:** https://toproll.gg (coming soon)
- **Staging:** https://staging.toproll.gg (coming soon)
- **Supabase Dashboard:** https://supabase.com/dashboard
- **GitHub:** https://github.com/w3bsuki/toproll

---

## 📝 Spec-Driven Development Workflow

1. **Read SPEC.md** - Understand feature requirements & acceptance criteria
2. **Check ARCHITECTURE.md** - Understand technical approach
3. **Write tests** - TDD approach (see DEVELOPMENT.md)
4. **Implement feature** - Follow coding standards
5. **Reference API.md** - Use correct endpoints
6. **Follow DESIGN.md** - Apply design system
7. **Document in code** - JSDoc comments
8. **Create PR** - Link to spec section

---

## �️ Documentation Philosophy

**5 Documents. No More. No Less.**

- **SPEC.md** - What we're building (product)
- **ARCHITECTURE.md** - How it's structured (tech)
- **API.md** - How to use it (integration)
- **DEVELOPMENT.md** - How to build it (workflow)
- **DESIGN.md** - How it looks (UI/UX)

All other information lives in code comments, commit messages, or PRs.

---

**Last Updated:** October 2025  
**Maintained By:** Engineering Team
