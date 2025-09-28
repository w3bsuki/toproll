# TopRoll Marketplace Design System

## Palette (OKLCH)

| Token              | Value                    | Usage                               |
| ------------------ | ------------------------ | ----------------------------------- |
| `--background`     | `oklch(18.8% 0.018 255)` | Global page background              |
| `--foreground`     | `oklch(95.2% 0.014 255)` | Primary text                        |
| `--surface`        | `oklch(23.5% 0.022 255)` | Elevated shells (cards, drawers)    |
| `--surface-muted`  | `oklch(27.5% 0.026 255)` | Secondary panels, muted chips       |
| `--surface-accent` | `oklch(34% 0.045 252)`   | Active tabs, highlighted states     |
| `--primary`        | `oklch(62.5% 0.2 254)`   | Primary CTAs, brand accents         |
| `--secondary`      | `oklch(55% 0.13 202)`    | Secondary CTAs, informational chips |
| `--accent`         | `oklch(68% 0.19 210)`    | Status ribbons, highlights          |
| `--success`        | `oklch(63% 0.17 152)`    | Positive feedback                   |
| `--info`           | `oklch(66% 0.16 232)`    | Neutral informational banners       |
| `--warning`        | `oklch(78% 0.17 95)`     | Risk warnings                       |
| `--destructive`    | `oklch(56% 0.22 25)`     | Errors, destructive actions         |
| `--border`         | `oklch(32% 0.022 255)`   | Default border strokes              |
| `--border-strong`  | `oklch(40% 0.026 255)`   | Emphasised dividers                 |

> All palette entries map to Tailwind semantic tokens (e.g. `bg-primary`, `text-warning-foreground`). Reference `tailwind.config.ts` for the complete token map.

## Typography Scale

| Role          | Tailwind utilities                                  | Notes                             |
| ------------- | --------------------------------------------------- | --------------------------------- |
| Hero heading  | `text-4xl md:text-5xl font-semibold tracking-tight` | Used on `/` hero headline         |
| Section title | `text-2xl font-semibold`                            | Section anchors for catalog/lists |
| Card title    | `text-lg font-semibold`                             | Primary card headings             |
| Body base     | `text-sm text-muted-foreground`                     | Descriptive copy, secondary text  |
| Meta label    | `text-xs uppercase tracking-wide`                   | Status chips, stat captions       |

Fonts: Inter Variable via Tailwind `font-sans`. Enable font features `ss01`, `cv05`, `cv11` globally.

## Components

- **Button** (`<Button>`): variants `default`, `secondary`, `outline`, `ghost`, `destructive`. Hover only adjusts fill/border—no lift or glow.
- **Card** (`<Card>` et al.): standardised padding (`px-6 py-5`), border `border-border/60`, subtle `shadow-marketplace-sm` with color-only hover change.
- **Tabs**: use `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`. Active trigger uses `bg-surface-accent` with accent text.
- **Badge**: uppercase, rounded, uses semantic variants (default/outline/success/warning/info/destructive).
- **Alert**: five tones (default, success, info, warning, destructive). No gradients.
- **Sheet**: minimal overlay for drawers (chat mobile). Accepts `side="right" | "left" | "bottom"`.
- **DropdownMenu**: lightweight context menu; closes on outside click.

## Hover & Interaction Guidelines

- Use color shifts or border emphasis only (e.g. `hover:border-primary/60`).
- Avoid transforms, glows, or blurs on hover. Shadows may deepen slightly (`shadow-marketplace-sm` → `shadow-marketplace-md`).
- Focus states rely on `focus-visible:ring-ring/60` with `ring-offset-background`.

## Tailwind v4 Practices

- Theme tokens live in `src/app.css` via `:root` custom properties and map to Tailwind in `tailwind.config.ts`.
- Prefer semantic utilities (`bg-card`, `text-muted-foreground`) over hard-coded colors.
- Custom shadows registered as `shadow-marketplace-sm|md|lg`.
- Avoid legacy DaisyUI classes. Compose with shadcn-style Svelte components for consistency.

## Component Examples

```svelte
<Button class="gap-2">
	<Package class="h-4 w-4" />
	Open case
</Button>

<Card>
	<CardHeader>
		<CardTitle>Market depth</CardTitle>
		<CardDescription>24h liquidity coverage</CardDescription>
	</CardHeader>
	<CardContent class="space-y-2">
		<p class="text-muted-foreground text-sm">Total payout</p>
		<p class="text-foreground text-2xl font-semibold">$128,440</p>
	</CardContent>
</Card>
```

## Hover Behaviour Quick Reference

| Component        | Idle                                     | Hover                                    |
| ---------------- | ---------------------------------------- | ---------------------------------------- |
| Button (default) | `bg-primary text-primary-foreground`     | `bg-primary/90 border-primary/80`        |
| Card             | `shadow-marketplace-sm border-border/60` | `shadow-marketplace-md border-border/80` |
| Tabs trigger     | `text-muted-foreground`                  | Active state only (`bg-surface-accent`)  |
