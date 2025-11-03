# TopRoll Design System

**Version:** 1.0  
**Last Updated:** October 2025

---

## Design Principles

### 1. Neo-Brutalism First
- Bold, high-contrast colors
- Thick borders (4-8px)
- Hard shadows, no blur
- Playful, energetic aesthetic
- Geometric shapes

### 2. Gaming-Focused
- Fast, responsive interactions
- Clear visual hierarchy
- Immediate feedback
- Excitement through motion
- Competitive edge

### 3. Accessibility
- WCAG 2.1 AA minimum
- Keyboard navigation
- Screen reader support
- Color-blind safe palettes
- Clear focus states

### 4. Performance
- 60 FPS animations
- No layout shift
- Optimized images
- Lazy loading
- Fast page loads

---

## Tailwind v4 Tokens

### Colors

```css
/* Brand Colors */
@theme {
  --color-primary: #10b981;       /* Emerald 500 - primary actions */
  --color-secondary: #f59e0b;     /* Amber 500 - accents, rewards */
  --color-accent: #8b5cf6;        /* Violet 500 - premium features */
  
  /* Neutrals */
  --color-background: #0f172a;    /* Slate 900 - main background */
  --color-surface: #1e293b;       /* Slate 800 - cards, panels */
  --color-border: #334155;        /* Slate 700 - borders */
  --color-text: #f1f5f9;          /* Slate 100 - body text */
  --color-muted: #94a3b8;         /* Slate 400 - secondary text */
  
  /* Semantic */
  --color-success: #10b981;       /* Emerald 500 */
  --color-error: #ef4444;         /* Red 500 */
  --color-warning: #f59e0b;       /* Amber 500 */
  --color-info: #3b82f6;          /* Blue 500 */
  
  /* Item Rarity */
  --color-common: #94a3b8;        /* Slate 400 */
  --color-uncommon: #10b981;      /* Emerald 500 */
  --color-rare: #3b82f6;          /* Blue 500 */
  --color-epic: #8b5cf6;          /* Violet 500 */
  --color-legendary: #f59e0b;     /* Amber 500 */
  --color-mythical: #ec4899;      /* Pink 500 */
}
```

### Typography

```css
@theme {
  /* Font Families */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-black: 900;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing

```css
@theme {
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
}
```

### Borders & Shadows

```css
@theme {
  /* Border Widths */
  --border-none: 0;
  --border-thin: 2px;
  --border-default: 4px;
  --border-thick: 6px;
  --border-heavy: 8px;
  
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-full: 9999px;
  
  /* Shadows (Neo-Brutalism - no blur) */
  --shadow-sm: 2px 2px 0 0 rgb(0 0 0);
  --shadow-md: 4px 4px 0 0 rgb(0 0 0);
  --shadow-lg: 6px 6px 0 0 rgb(0 0 0);
  --shadow-xl: 8px 8px 0 0 rgb(0 0 0);
  
  /* Colored Shadows */
  --shadow-primary: 4px 4px 0 0 var(--color-primary);
  --shadow-secondary: 4px 4px 0 0 var(--color-secondary);
  --shadow-accent: 4px 4px 0 0 var(--color-accent);
}
```

---

## Component Patterns

### Button

```svelte
<script lang="ts">
  type Props = {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onclick?: () => void;
    children?: import('svelte').Snippet;
  };
  
  let { variant = 'primary', size = 'md', disabled = false, onclick, children }: Props = $props();
  
  const baseClasses = 'font-bold border-4 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none';
  
  const variantClasses = {
    primary: 'bg-primary text-slate-900 border-slate-900 shadow-md hover:shadow-lg',
    secondary: 'bg-secondary text-slate-900 border-slate-900 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-slate-100 border-slate-700 hover:bg-slate-800'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
</script>

<button 
  class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]}"
  {disabled}
  {onclick}
>
  {@render children?.()}
</button>
```

### Card

```svelte
<script lang="ts">
  type Props = {
    hover?: boolean;
    children?: import('svelte').Snippet;
  };
  
  let { hover = false, children }: Props = $props();
</script>

<div class="
  bg-surface border-4 border-slate-700 
  {hover ? 'shadow-md hover:shadow-lg transition-shadow' : ''}
">
  {@render children?.()}
</div>
```

### Badge

```svelte
<script lang="ts">
  type Props = {
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
    children?: import('svelte').Snippet;
  };
  
  let { rarity = 'common', children }: Props = $props();
  
  const rarityColors = {
    common: 'bg-slate-400 text-slate-900',
    uncommon: 'bg-emerald-500 text-slate-900',
    rare: 'bg-blue-500 text-white',
    epic: 'bg-violet-500 text-white',
    legendary: 'bg-amber-500 text-slate-900',
    mythical: 'bg-pink-500 text-white'
  };
</script>

<span class="
  inline-flex items-center px-2 py-0.5 
  text-xs font-bold uppercase
  border-2 border-slate-900
  {rarityColors[rarity]}
">
  {@render children?.()}
</span>
```

### Input

```svelte
<script lang="ts">
  type Props = {
    value: string;
    placeholder?: string;
    disabled?: boolean;
  };
  
  let { value = $bindable(), placeholder, disabled = false }: Props = $props();
</script>

<input 
  bind:value
  {placeholder}
  {disabled}
  class="
    w-full px-4 py-2
    bg-slate-800 text-slate-100
    border-4 border-slate-700
    focus:border-primary focus:outline-none
    placeholder:text-slate-500
    disabled:opacity-50 disabled:cursor-not-allowed
  "
/>
```

---

## Layout

### Page Structure

```svelte
<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import { Navbar } from '$lib/components/layout';
  import { Toaster } from '$lib/components/ui';
  
  let { children } = $props();
</script>

<div class="min-h-screen bg-background text-text">
  <Navbar />
  
  <main class="container mx-auto px-4 py-8">
    {@render children()}
  </main>
  
  <Toaster />
</div>
```

### Grid Layout

```svelte
<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {#each items as item}
    <ItemCard {item} />
  {/each}
</div>
```

### Flex Layout

```svelte
<!-- Centered content -->
<div class="flex items-center justify-center min-h-screen">
  <div class="max-w-md w-full">
    <LoginForm />
  </div>
</div>
```

---

## Motion

### Principles
- **Purposeful:** Every animation has a reason
- **Fast:** 150-300ms for most interactions
- **Smooth:** 60 FPS minimum
- **Feedback:** Immediate visual response

### Transitions

```svelte
<script>
  import { fade, scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  
  let visible = $state(true);
</script>

{#if visible}
  <!-- Fade in/out -->
  <div transition:fade={{ duration: 200 }}>
    Content
  </div>
  
  <!-- Scale with elastic -->
  <div 
    in:scale={{ duration: 300, start: 0.8, easing: elasticOut }}
    out:scale={{ duration: 200 }}
  >
    Item
  </div>
{/if}
```

### Hover Effects

```svelte
<button class="
  transition-all duration-200
  hover:scale-105 hover:shadow-lg
  active:scale-95 active:shadow-sm
">
  Click me
</button>
```

### Loading States

```svelte
<script>
  let loading = $state(false);
</script>

<button disabled={loading} class="relative">
  <span class:opacity-0={loading}>
    Submit
  </span>
  
  {#if loading}
    <span class="absolute inset-0 flex items-center justify-center">
      <span class="animate-spin">⏳</span>
    </span>
  {/if}
</button>
```

---

## Iconography

### Icon Library
Use **Lucide Svelte** for consistent icons:

```svelte
<script>
  import { Swords, TrendingUp, Award } from 'lucide-svelte';
</script>

<Swords class="w-5 h-5" />
<TrendingUp class="w-5 h-5 text-success" />
<Award class="w-5 h-5 text-secondary" />
```

### Icon Sizes

```css
/* Tailwind classes */
.icon-xs { width: 1rem; height: 1rem; }    /* 16px */
.icon-sm { width: 1.25rem; height: 1.25rem; } /* 20px */
.icon-md { width: 1.5rem; height: 1.5rem; }  /* 24px */
.icon-lg { width: 2rem; height: 2rem; }      /* 32px */
.icon-xl { width: 2.5rem; height: 2.5rem; }  /* 40px */
```

---

## Accessibility

### Keyboard Navigation

```svelte
<script>
  let items = $state([...]);
  let focusedIndex = $state(0);
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, 0);
    } else if (e.key === 'Enter') {
      selectItem(items[focusedIndex]);
    }
  }
</script>

<div role="listbox" tabindex="0" onkeydown={handleKeydown}>
  {#each items as item, i}
    <div 
      role="option" 
      aria-selected={i === focusedIndex}
      class:ring-2={i === focusedIndex}
    >
      {item.name}
    </div>
  {/each}
</div>
```

### ARIA Labels

```svelte
<!-- Descriptive labels -->
<button aria-label="Close modal" onclick={close}>
  ✕
</button>

<!-- Screen reader text -->
<span class="sr-only">Loading...</span>
<span aria-hidden="true">⏳</span>

<!-- Form accessibility -->
<label for="username">Username</label>
<input 
  id="username" 
  aria-required="true"
  aria-describedby="username-error"
/>
<span id="username-error" role="alert">
  Username must be 3-20 characters
</span>
```

### Focus States

```css
/* Always visible focus rings */
.focus-visible:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .border { border-width: 4px; }
  .shadow-md { box-shadow: 8px 8px 0 0 rgb(0 0 0); }
}
```

---

## Responsive Design

### Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile-First Patterns

```svelte
<!-- Stack on mobile, grid on desktop -->
<div class="
  flex flex-col space-y-4
  md:grid md:grid-cols-2 md:gap-4 md:space-y-0
  lg:grid-cols-3
">
  {#each items as item}
    <ItemCard {item} />
  {/each}
</div>

<!-- Hide on mobile, show on desktop -->
<aside class="hidden lg:block">
  <Sidebar />
</aside>

<!-- Show on mobile, hide on desktop -->
<button class="lg:hidden">
  Menu
</button>
```

---

## Dark Mode

**TopRoll uses dark mode only.** No light mode toggle needed.

---

## Best Practices

### ✅ DO

- Use semantic color names (`--color-success` not `--color-green`)
- Follow 8px spacing grid (multiples of 8: 8, 16, 24, 32...)
- Add hover/focus states to all interactive elements
- Use consistent border widths (4px default)
- Add ARIA labels to icon-only buttons
- Test with keyboard navigation
- Use Tailwind classes, avoid inline styles
- Keep component variants minimal (2-3 max)

### ❌ DON'T

- Don't use `px` values outside spacing scale
- Don't blur shadows (use hard shadows only)
- Don't animate more than 2 properties at once
- Don't use `!important` (fix specificity instead)
- Don't nest more than 3 levels in markup
- Don't forget `:disabled` states
- Don't use `any` in component props
- Don't skip mobile testing

---

## Component Library

**shadcn-svelte** provides base components. Customize using Tailwind:

```svelte
<script>
  import { Button } from '$lib/components/ui/button';
</script>

<Button variant="default" size="lg" class="shadow-primary">
  Custom Style
</Button>
```

See `src/lib/components/ui/` for all available components.

---

## Figma Resources

**(Coming Soon)**

- Design tokens as Figma styles
- Component library
- Icon library
- User flow diagrams

---

## Resources

- **Tailwind v4:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev
- **shadcn-svelte:** https://www.shadcn-svelte.com
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Neo-Brutalism:** https://hype4.academy/articles/design/neo-brutalism-in-web-design

---

**Document Owner:** Design Team  
**Review Cadence:** Quarterly  
**Questions:** Ask in #design Discord
