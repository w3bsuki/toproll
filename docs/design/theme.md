# TopRoll Marketplace Theme Tokens

This document tracks the primitives that power the shell UI. Values map to the CSS custom properties defined in `src/app.css` and surfaced through Tailwind in `tailwind.config.ts`.

## Typography

- `--font-size-xs` → `text-xs`
- `--font-size-sm` → `text-sm`
- `--font-size-base` → `text-base`
- `--font-size-lg` → `text-lg`
- `--font-size-xl` → `text-xl`
- `--font-size-2xl` → `text-2xl`
- `--font-size-3xl` → `text-3xl`
- `--font-size-4xl` → `text-4xl`
- `--font-size-5xl` → `text-5xl`

Line height pairs follow the same naming (e.g. `--font-line-4xl`). Use these for hero headlines and marquee stats to keep rhythm tight on dark backgrounds.

## Spacing

Spacing tokens sit on an 8px-friendly scale:

- `--space-3xs` (4px)
- `--space-2xs` (6px)
- `--space-xs` (8px)
- `--space-sm` (12px)
- `--space-md` (16px)
- `--space-lg` (24px)
- `--space-xl` (32px)
- `--space-2xl` (40px)
- `--space-3xl` (48px)

## Radii & Elevation

- Radius tokens `--radius-xs` through `--radius-2xl` cover components from pills to full-surface panels.
- Shadows `--shadow-sm`, `--shadow-md`, `--shadow-lg` map to `shadow-elevated-*` utilities for the card stack hierarchy.

## Color Roles

- Background layers: `--color-background`, `--color-surface`, `--color-surface-raised`, `--color-surface-subdued`
- Foregrounds: `--color-foreground`, `--color-muted`, `--color-on-muted`
- Accent & status: `--color-primary`, `--color-accent-*`, `--color-success`, `--color-warning`, `--color-danger`
- Structure: `--color-border`, `--color-border-strong`, `--color-input`, `--color-ring`

Blend gradients with `oklch(var(--color-primary) / opacity)` or `--color-accent-*` values to stay within the approved blues/purples palette.
