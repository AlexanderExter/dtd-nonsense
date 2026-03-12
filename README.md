# Dungeons the Dragoning 40,000: 7th Edition

Rulebook reference and web-based play tools for _Dungeons the Dragoning 40,000: 7th Edition_ — a TTRPG blending Warhammer 40K aesthetics with D&D and World of Darkness mechanics.

The original source PDFs are hard to read and harder to reference at the table. This project transforms them into a searchable, corrected documentation site with interactive tools — so players and Story Masters can spend less time hunting for rules and more time playing the game.

**Live site:** [dtd-nonsense.vercel.app](https://dtd-nonsense.vercel.app)

---

## What's Here

- **Full Rulebook** — Searchable, cross-referenced rules from both source books
- **6 Play Tools** — Character builder, character sheet, combat tracker, NPC generator, and more
- **TypeScript Pipeline** — Validation, linting, and sync checks for data and content

### Tools

| Tool              | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| Quick Reference   | Searchable index of conditions, actions, modifiers, and common rules         |
| Character Builder | Guided 11-step wizard with priority allocation and XP tracking               |
| Character Sheet   | Freeform sheet with auto-calculated derived stats and JSON export            |
| Combat Tracker    | Initiative management, HP tracking, condition toggles, character import      |
| NPC Generator     | Stat block builder with templates, traits, and Markdown export               |
| Ship Builder      | Spelljammer ship configuration with hull, consoles, weapons, and combat mode |

---

## Getting Started

### Prerequisites

- **Node.js 20+** (required)

### Build

```bash
bun install
bun run build     # runs prebuild + astro build
```

### Development

```bash
bun run dev       # starts Astro dev server at localhost:4321
```

### Data & Content Checks

```bash
bun run validate   # validate JSON data against Zod schemas
bun run lint:data  # lint markdown terminology/formatting conventions
bun run sync-check # detect drift between markdown and JSON data
```

---

## Project Structure

```text
books/                 Source rulebook chapters (2 books, per-chapter split)
cleaned-references/    Condensed rules reference (merged by topic, 24 files)
data/                  12 canonical JSON data files (validated by Zod schemas)
src/                   Astro source
  pages/tools/         6 Astro tool pages (standalone, outside Starlight)
  components/react/    React island components (~72 across 6 tools)
  hooks/               Custom React hooks (use-data, use-local-storage)
  lib/dtd/             Typed ES modules: core.ts, dice.ts, types.ts
  layouts/             ToolLayout.astro (tool page shell)
  styles/              WH40K theme CSS + Tailwind v4 @theme tokens
scripts/               TypeScript pipeline scripts (validate, lint, sync-check, prebuild)
docs/                  Technical documentation and conventions
```

---

## Tech Stack

- **[Astro](https://astro.build) + [Starlight](https://starlight.astro.build)** — Static documentation site
- **[React](https://react.dev) Islands** — 6 interactive tools with Zustand state management
- **[Tailwind CSS v4](https://tailwindcss.com)** — Utility-first styling with `@theme` design tokens
- **[Pagefind](https://pagefind.app)** — Full-text search across all rules content
- **TypeScript + Zod + tsx** — Data/content validation pipeline
- **Vercel** — Static hosting and deployment

---

_This is a fan-made project. All game content belongs to its respective creators._
