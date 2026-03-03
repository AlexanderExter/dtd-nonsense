---
description: "Astro/Starlight development standards for DTD Nonsense"
applyTo: "**/*.astro, **/*.ts, **/*.js"
---

# Astro Development Standards — DTD Nonsense

This project uses **Astro 5.x + Starlight** for a static documentation site with interactive tool pages. No React/Vue/Svelte — all interactivity is vanilla TypeScript in `<script>` blocks.

## Architecture

- **Static output only** — no SSR, no API routes, no middleware
- **Starlight** handles all rules/content pages via Content Collections
- **Tool pages** (`src/pages/tools/*.astro`) use `ToolLayout.astro` — standalone HTML pages outside Starlight
- **No client directives** (`client:load`, etc.) — tools use plain `<script>` tags, not Islands
- **No View Transitions / ClientRouter** — standard page navigation

## File Structure

```
src/
  pages/tools/       ← .astro tool pages (each is self-contained)
  layouts/           ← ToolLayout.astro (standalone HTML shell for tools)
  components/        ← Head.astro (Starlight override for analytics)
  lib/dtd/           ← Shared ES modules: core.ts, dice.ts, types.ts
  lib/tools/         ← Large tool scripts: sheet-app.ts, builder-app.ts
  styles/            ← custom.css (Starlight theme), sheet.css, builder.css
  content.config.ts  ← Content Collection definitions
```

## Conventions

### Tool Pages

- Each tool is a single `.astro` file with HTML template + `<script>` block
- Import shared logic from `@/lib/dtd/core.ts` and `@/lib/dtd/dice.ts`
- Load JSON data at runtime via `loadData()` / `loadAllData()` (fetches from `/data/`)
- Small tools: inline script in the `.astro` file
- Large tools (sheet, builder): separate `.ts` file in `src/lib/tools/`, imported by the page

### CSS

- **Starlight theme**: `src/styles/custom.css` — WH40K dark/gold design tokens
- **Large tool CSS**: separate files (`sheet.css`, `builder.css`) imported via `<style is:global>@import`
- **Small tool CSS**: inline `<style>` blocks in the `.astro` file (scoped or global as needed)
- **ToolLayout.astro**: declares `:root` CSS custom properties for the standalone HTML shell

### TypeScript

- `tsconfig.json` extends `astro/tsconfigs/strict`
- Path alias: `@/*` → `src/*`
- `sheet-app.ts` and `builder-app.ts` have `@ts-nocheck` — intentional, deferred to Phase 2 module refactor
- All other `.ts` files should be fully typed

### Content Pipeline

- Content Collections defined in `src/content.config.ts` using Content Layer API with `glob()` loader
- `scripts/prebuild.mjs` copies `cleaned-references/` → `src/content/docs/rules/` and `data/` → `public/data/` at build time
- Generated content dirs are gitignored — never edit files in `src/content/docs/rules/` or `public/data/`
- Starlight frontmatter injected by `uv run dtd starlight-prep`

### Build

- `npm run build` triggers prebuild hook → Astro build → Vercel static output
- `npm run dev` for local dev server
- CI runs in `.github/workflows/build.yml`
