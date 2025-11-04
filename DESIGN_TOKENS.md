# 🎨 Design Token Quick Reference

## Color Palette (OKLCH)

### Backgrounds
```css
--background: oklch(0.22 0.015 240)      /* Main app background */
--card: oklch(0.26 0.018 240)            /* Elevated surfaces */
--surface: oklch(0.26 0.018 240)         /* Panel backgrounds */
--surface-muted: oklch(0.3 0.015 240)    /* Subtle backgrounds */
```

### Text
```css
--foreground: oklch(0.96 0.003 240)           /* Primary text (white) */
--muted-foreground: oklch(0.68 0.012 240)     /* Secondary text (gray) */
```

### Borders
```css
--border: oklch(0.96 0.003 240 / 0.15)        /* Standard borders (15%) */
--border-strong: oklch(0.96 0.003 240 / 0.25) /* Emphasized borders (25%) */
--input: oklch(0.96 0.003 240 / 0.18)         /* Input field borders (18%) */
```

### Primary Colors
```css
--primary: oklch(0.85 0.28 130)               /* Bright lime green */
--primary-foreground: oklch(0.18 0.01 240)    /* Dark text on primary */
```

### Semantic Colors
```css
--success: oklch(0.7 0.18 145)                /* Green */
--warning: oklch(0.78 0.16 70)                /* Gold/Amber */
--destructive: oklch(0.6 0.25 20)             /* Red */
--info: oklch(0.65 0.18 220)                  /* Blue */
```

---

## Typography Scale

### Font Family
```css
font-family: 'Inter Variable', 'Inter', system-ui, sans-serif;
```

### Base Settings
```css
font-size: 15px;
line-height: 1.6;
font-feature-settings: 'ss01', 'cv05', 'cv11';
letter-spacing: -0.01em;
```

### Heading Scale
```css
h1 { font-size: 2.5rem; font-weight: 700; }   /* 40px */
h2 { font-size: 2rem; font-weight: 700; }     /* 32px */
h3 { font-size: 1.5rem; font-weight: 700; }   /* 24px */
h4 { font-size: 1.25rem; font-weight: 700; }  /* 20px */
h5 { font-size: 1.125rem; font-weight: 700; } /* 18px */
h6 { font-size: 1rem; font-weight: 700; }     /* 16px */
```

---

## Spacing System

### Container Padding
```css
Desktop (lg+):  px-6 py-6    /* 24px */
Tablet (md):    px-4 py-5    /* 16px / 20px */
Mobile:         px-3 py-4    /* 12px / 16px */
```

### Section Gaps
```css
space-y-6  /* 24px between major sections */
gap-6      /* 24px in grid layouts */
gap-4      /* 16px in flex layouts */
gap-2      /* 8px in compact layouts */
```

---

## Border Radius

```css
--radius-sm: 0.5rem;   /* 8px - small elements */
--radius-md: 0.75rem;  /* 12px - medium elements */
--radius-lg: 1.25rem;  /* 20px - large cards */
--radius: 0.65rem;     /* 10.4px - default */
```

### Common Usage
```css
rounded-lg   /* 0.5rem - buttons */
rounded-xl   /* 0.75rem - cards, inputs */
rounded-2xl  /* 1rem - large cards */
```

---

## Shadows

### Standard Shadows
```css
shadow-sm    /* Subtle elevation */
shadow-md    /* Default card shadow */
shadow-lg    /* Prominent elements */
shadow-xl    /* High elevation */
shadow-2xl   /* Maximum elevation */
```

### Custom Casino Shadows
```css
.shadow-card {
  box-shadow: 
    0 4px 6px -1px rgb(0 0 0 / 0.3),
    0 2px 4px -1px rgb(0 0 0 / 0.2),
    0 0 0 1px rgb(255 255 255 / 0.08);
}

.shadow-card-hover {
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.4),
    0 4px 6px -2px rgb(0 0 0 / 0.3),
    0 0 0 1px rgb(255 255 255 / 0.1);
}

.shadow-marketplace-sm {
  /* Defined in tailwind.config.ts */
}
```

---

## Button Variants

### Default (Primary Green)
```css
bg-primary text-primary-foreground
shadow-md hover:shadow-lg
border border-primary/20
hover:bg-primary/90 hover:scale-[1.02]
min-h-[44px]
```

### Outline
```css
border-2 border-border
bg-surface shadow-sm
hover:bg-accent hover:border-accent
```

### Secondary
```css
bg-secondary text-secondary-foreground
shadow-md hover:shadow-lg
border border-secondary/20
```

### Ghost
```css
hover:bg-accent/50
hover:text-accent-foreground
```

### Sizes
```css
sm:  h-9 px-3.5        /* 36px height */
default: h-11 px-5     /* 44px height - WCAG minimum */
lg:  h-14 px-7         /* 56px height */
icon: size-11          /* 44x44px square */
```

---

## Card Gradients

### Game Mode Gradients
```css
.gradient-cases {
  background: 
    radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.4), transparent 70%),
    radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.3), transparent 60%),
    oklch(0.28 0.025 160);  /* Green tint */
}

.gradient-battles {
  background:
    radial-gradient(circle at 25% 30%, rgba(239, 68, 68, 0.4), transparent 70%),
    radial-gradient(circle at 75% 70%, rgba(249, 115, 22, 0.35), transparent 60%),
    oklch(0.28 0.025 30);   /* Red tint */
}

.gradient-pots {
  background:
    radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.5), transparent 70%),
    radial-gradient(circle at 80% 40%, rgba(245, 158, 11, 0.4), transparent 60%),
    oklch(0.3 0.03 70);     /* Gold tint */
}
```

### Pot Status Gradients
```css
/* Open - Green */
oklch(0.32 0.04 160)

/* Locked - Gold */
oklch(0.35 0.05 70)

/* Settling - Red */
oklch(0.32 0.04 30)

/* Settled - Purple */
oklch(0.32 0.04 300)
```

---

## Animation Utilities

### Transitions
```css
transition-colors    /* Color changes */
transition-all       /* All properties */
transition-transform /* Transforms only */
```

### Durations
```css
duration-subtle: 150ms   /* Quick feedback */
duration-default: 220ms  /* Standard */
duration-accent: 280ms   /* Emphasized */
```

### Timing Functions
```css
cubic-bezier(0.32, 0.72, 0, 1)  /* market-ease */
```

### Common Animations
```css
hover:scale-[1.02]           /* Subtle lift */
animate-pulse-slow           /* Slow pulse */
animate-fade-in              /* Fade entrance */
animate-slide-up             /* Slide entrance */
```

---

## Layout Dimensions

### Sidebar Widths
```css
Chat (left):     320px
Rain Pot (right): 300px (xl+ only)
```

### Header Height
```css
--shell-header-height: 72px
```

### Content Container
```css
max-width: 1600px
margin: 0 auto
```

### Breakpoints
```css
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

---

## Accessibility

### Touch Targets
```css
min-h-[44px]     /* Minimum button height */
min-w-[44px]     /* Minimum button width */
touch-target     /* Utility class for 44x44 minimum */
```

### Focus Rings
```css
focus-visible:ring-2
focus-visible:ring-primary
focus-visible:ring-offset-2
focus-visible:outline-none
```

### Contrast Ratios
```css
Text (normal):   4.5:1 minimum
Text (large):    3.0:1 minimum
UI components:   3.0:1 minimum
```

---

## Quick Copy-Paste Classes

### Card
```html
<div class="bg-card border-2 border-white/10 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6">
```

### Button (Primary)
```html
<button class="bg-primary text-primary-foreground h-11 px-5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
```

### Daily Bonus Button
```html
<button class="h-11 px-4 rounded-xl font-extrabold shadow-lg hover:shadow-xl hover:scale-105 transition-all" style="background: linear-gradient(135deg, oklch(0.78 0.16 70), oklch(0.72 0.14 60)); color: oklch(0.2 0.01 70);">
```

### Input Field
```html
<input class="bg-surface border-2 border-input rounded-xl px-4 h-11 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all">
```

---

## Common Patterns

### Section Header
```html
<div class="space-y-2 mb-6">
  <h2 class="text-3xl font-bold">Section Title</h2>
  <p class="text-muted-foreground">Description text</p>
</div>
```

### Grid Layout
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
```

### Flex Container
```html
<div class="flex items-center justify-between gap-4">
  <!-- Content -->
</div>
```

---

**Last Updated:** 2025-11-04  
**Version:** 1.0  
**Status:** Production Ready ✅
