---
description: "Astro/Starlight development standards for DTD Nonsense"
applyTo: "**/*.astro, **/*.ts, **/*.js"
---

# Astro Development Standards — DTD Nonsense

This project uses **Astro 5.x + Starlight** for a static documentation site with interactive tool pages. All tools use **React Islands** (`@astrojs/react`) hydrated via `client:only="react"`.

## Architecture

- **Static output only** — no SSR, no API routes, no middleware
- **Starlight** handles all rules/content pages via Content Collections
- **Tool pages** (`src/pages/tools/*.astro`) use `ToolLayout.astro` — standalone HTML pages outside Starlight
- **React Islands** — all tools use `client:only="react"` directives for interactive components
- **Tailwind CSS v4** — `@theme` tokens in `src/styles/tailwind.css` as design token source of truth
- **No View Transitions / ClientRouter** — standard page navigation

## File Structure

```
src/
  pages/tools/       ← .astro tool pages (each mounts a React island via client:only)
  layouts/           ← ToolLayout.astro (standalone HTML shell; bridges Tailwind tokens → short var(--name) aliases)
  components/
    react/
      tools/         ← React island components for all 6 tools (74 components)
      ui/            ← Shared UI primitives (18 components) — Radix UI + Tailwind wrappers
      shared/        ← Shared React components across tools
  hooks/             ← Custom React hooks (use-data)
  lib/dtd/           ← Shared ES modules: core.ts (barrel), character.ts, data.ts, derived.ts, dice.ts, dice-primitives.ts, types.ts
  styles/            ← custom.css (Starlight theme), tailwind.css (Tailwind v4 @theme tokens)
  content.config.ts  ← Content Collection definitions
```

## Conventions

### Tool Pages

- Each tool's `.astro` page mounts a root React component via `client:only="react"`
- React components live in `src/components/react/tools/{tool-name}/`
- Root component is `*App.tsx` (e.g., `QuickReferenceApp.tsx`)
- Import shared logic from `@/lib/dtd/core.ts` and `@/lib/dtd/dice.ts`
- Import UI primitives from `@/components/react/ui/ComponentName` (e.g., `@/components/react/ui/Button`) — direct imports, no barrel; never import `radix-ui` directly
- Load JSON data via `useAllData()` hook from `@/hooks/use-data`
- State management: **Zustand** stores — one store per tool, co-located as `store.ts`
- Use **named exports only** — no default exports
- Use `className` attribute in React JSX
- All `<button>` elements need `type="button"`
- Use `@/` path aliases for imports outside the component directory
- Use `./` relative imports within the component directory

### CSS

- **Tailwind v4**: `src/styles/tailwind.css` — `@theme` block is the single source of truth for design tokens; `@layer components` defines `.panel` and `.btn` family
- **Starlight theme**: `src/styles/custom.css` — WH40K dark/gold design tokens for docs pages
- **All tool styling**: Tailwind utility classes in JSX — no `<style>` blocks, no `@apply`
- **Print styles**: Minimal `@media print` blocks in `.astro` pages where needed
- **Conditional classes**: `.filter(Boolean).join(" ")` pattern for dynamic class lists
- **Dynamic values**: `style={{}}` only for runtime-computed values (percentages)

### TypeScript

- `tsconfig.json` extends `astro/tsconfigs/strict`
- Path alias: `@/*` → `src/*`
- All `.ts` files are fully typed — zero TS errors across the codebase

### Content Pipeline

- Content Collections defined in `src/content.config.ts` using Content Layer API with `glob()` loader
- `scripts/prebuild.mjs` copies `cleaned-references/` → `src/content/docs/rules/` and `data/` → `public/data/` at build time
- Generated content dirs are gitignored — never edit files in `src/content/docs/rules/` or `public/data/`
- Starlight frontmatter is injected during prebuild by `scripts/prebuild.mjs` (gray-matter)

### Biome (Linter/Formatter)

- Config: `biome.json`. Covers `src/**` and `scripts/**`
- **Check**: `bun run lint` — reports errors/warnings
- **Auto-fix**: `bun run lint:fix` — fixes all fixable violations in one pass. Use this for bulk formatting fixes instead of manual file edits.
- CI runs `biome ci .` (no writes). Failures block build.
- Run `bun run lint:fix` to auto-fix all fixable violations in one pass

### Build

- `bun run build` triggers prebuild hook → Astro build → Vercel static output
- `bun run dev` for local dev server
- CI runs in `.github/workflows/build.yml`
