# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Design tokens & shell layout

The application shell is driven by a shared design token system declared in `tailwind.config.ts` and `src/app.css`. Colors, spacing, typography, radii, shadows, and z-index layers are surfaced as CSS variables (e.g. `--space-lg`, `--color-primary`) and mapped to Tailwind utilities (`p-lg`, `bg-primary`, `shadow-elevated-sm`). New components should prefer these tokens over hard-coded values to ensure consistency between light and dark themes.

Desktop layouts use a sticky left sidebar (`min-width: 280px`), a top header sized by `--size-header`, and a two-column content grid that keeps the chat composer visible without additional scrolling. Mobile layouts hide the sidebar, rely on the bottom navigation, and respect safe-area insets for sticky controls.
