# Design System Audit — April 2024

## Summary

- Replaced legacy Tailwind palette classes (e.g., `bg-blue-500`, `text-gray-400`) with semantic design token utilities defined in `src/app.css` and `tailwind.config.ts`.
- Normalised box shadows to the `shadow-marketplace-*` tokens, removing bespoke `shadow-[...]` declarations.
- Updated Steam authentication flows to persist sessions in Supabase and aligned UI affordances with the design language.

## Updated Components & Views

| Area                        | Key Changes                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| Authentication              | Added secure Steam session handling, Supabase profile sync, and logout endpoint.           |
| Home hero, rails, and grids | Tokenised typography and backgrounds, replaced ad-hoc gradients with token-based variants. |
| Case experiences            | Tokenised rarity styling, CTA buttons, and overlays for roulette and case-opening views.   |
| Shell & drawers             | Adopted token shadows, overlay colours, and badge styles for consistent chrome.            |

## Token Usage Guidelines

- **Backgrounds:** Prefer `bg-surface`, `bg-card`, or accent tokens (`bg-primary`, `bg-accent`) with opacity modifiers for emphasis states.
- **Text:** Use semantic foreground tokens (`text-foreground`, `text-muted-foreground`, `text-success`, etc.) rather than grey ramps.
- **Shadows:** Stick to `shadow-marketplace-sm`, `shadow-marketplace-md`, and `shadow-marketplace-lg` for elevations.
- **Gradients:** Reference design tokens via `oklch(var(--token)/opacity)` inside arbitrary value utilities when custom gradients are required.

## Outstanding Considerations

- Components that still rely on third-party utility classes (e.g., DaisyUI `card`, `btn`) should be refactored into native token-based primitives during the next design pass.
- When introducing new rarity or status styles, extend the semantic token map in `tailwind.config.ts` rather than hard-coding palette values.
