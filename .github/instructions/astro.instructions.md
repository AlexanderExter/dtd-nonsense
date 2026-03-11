---
description: "Astro/Starlight development standards for DTD Nonsense"
applyTo: "**/*.astro, **/*.ts, **/*.js"
---

# Astro Development Standards — DTD Nonsense

This project uses **Astro 5.x + Starlight** for a static documentation site with interactive tool pages. All tools use **Preact Islands** (`@astrojs/preact` with compat mode) hydrated via `client:load`.

## Architecture

- **Static output only** — no SSR, no API routes, no middleware
- **Starlight** handles all rules/content pages via Content Collections
- **Tool pages** (`src/pages/tools/*.astro`) use `ToolLayout.astro` — standalone HTML pages outside Starlight
- **Preact Islands** — all tools use `client:load` directives for interactive components
- **Tailwind CSS v4** — `@theme` tokens in `src/styles/tailwind.css` as design token source of truth
- **No View Transitions / ClientRouter** — standard page navigation

## File Structure

```
src/
  pages/tools/       ← .astro tool pages (each mounts a Preact island via client:load)
  layouts/           ← ToolLayout.astro (standalone HTML shell; bridges Tailwind tokens → short var(--name) aliases)
  components/
    preact/
      tools/         ← Preact island components for all 9 tools (97 components)
      shared/        ← Shared Preact components across tools
  hooks/             ← Custom Preact hooks (use-data, use-local-storage, use-worker)
  lib/dtd/           ← Shared ES modules: core.ts (barrel), character.ts, data.ts, derived.ts, dice.ts, dice-primitives.ts, types.ts
  workers/           ← TypeScript ESM Web Workers (simulation-worker.ts, defense-worker.ts)
  styles/            ← custom.css (Starlight theme), tailwind.css (Tailwind v4 @theme tokens)
  content.config.ts  ← Content Collection definitions
```

## Conventions

### Tool Pages

- Each tool’s `.astro` page mounts a root Preact component via `client:load`
- Preact components live in `src/components/preact/tools/{tool-name}/`
- Root component is `*App.tsx` (e.g., `DiceRollerApp.tsx`)
- Import shared logic from `@/lib/dtd/core.ts` and `@/lib/dtd/dice.ts`
- Load JSON data via `useData()` / `useAllData()` hooks from `@/hooks/use-data`
- State management: `@preact/signals` with module-level signals pattern
- Use **named exports only** — no default exports
- Use `class` attribute (not `className`) in Preact JSX
- All `<button>` elements need `type="button"`
- Use `@/` path aliases for imports outside the component directory
- Use `./` relative imports within the component directory

### CSS

- **Tailwind v4**: `src/styles/tailwind.css` — `@theme` block is the single source of truth for design tokens; `@layer components` defines `.panel` and `.btn` family
- **Starlight theme**: `src/styles/custom.css` — WH40K dark/gold design tokens for docs pages
- **All tool styling**: Tailwind utility classes in JSX — no `<style>` blocks, no `@apply`
- **Print styles**: Minimal `@media print` blocks in `.astro` pages where needed
- **Conditional classes**: `.filter(Boolean).join(" ")` pattern for dynamic class lists
- **Dynamic values**: `style={{}}` only for runtime-computed values (percentages, Chart.js colors)

### TypeScript

- `tsconfig.json` extends `astro/tsconfigs/strict`
- Path alias: `@/*` → `src/*`
- All `.ts` files are fully typed — zero TS errors across the codebase

### Content Pipeline

- Content Collections defined in `src/content.config.ts` using Content Layer API with `glob()` loader
- `scripts/prebuild.mjs` copies `cleaned-references/` → `src/content/docs/rules/` and `data/` → `public/data/` at build time
- Generated content dirs are gitignored — never edit files in `src/content/docs/rules/` or `public/data/`
- Starlight frontmatter is injected during prebuild by `scripts/prebuild.mjs` (gray-matter)

### Web Workers

- Place worker scripts in `src/workers/` as `.ts` files
- Instantiate with `new Worker(new URL("../../workers/name.ts", import.meta.url), { type: "module" })` — Vite bundles them as ESM
- Workers use **relative imports only** (e.g., `../lib/dtd/dice-primitives.ts`) — the `@/` alias does not resolve inside worker bundles
- Do **not** put workers in `public/workers/` — they cannot import TypeScript from there

### Biome (Linter/Formatter)

- Config: `biome.json`. Covers `src/**` and `scripts/**`
- **Check**: `npm run lint` — reports errors/warnings
- **Auto-fix**: `npm run lint:fix` — fixes all fixable violations in one pass. Use this for bulk formatting fixes instead of manual file edits.
- CI runs `biome ci .` (no writes). Failures block build.
- Run `npm run lint:fix` to auto-fix all fixable violations in one pass

### Build

- `npm run build` triggers prebuild hook → Astro build → Vercel static output
- `npm run dev` for local dev server
- CI runs in `.github/workflows/build.yml`
