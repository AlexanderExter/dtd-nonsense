# Dungeons the Dragoning 40,000: 7th Edition

Rulebook reference and web-based play tools for *Dungeons the Dragoning 40,000: 7th Edition* — a TTRPG blending Warhammer 40K aesthetics with D&D and World of Darkness mechanics.

**Live site:** [dtd-nonsense.vercel.app](https://dtd-nonsense.vercel.app)

---

## What's Here

- **Full Rulebook** — Searchable, cross-referenced rules from both source books
- **9 Play Tools** — Character builder, dice roller, combat tracker, NPC generator, and more
- **Python Pipeline** — Validation, linting, and content processing for the data layer

### Tools

| Tool | Description |
|------|-------------|
| Dice Roller | XkY dice pools with exploding d10s, overflow compression, raise/check calculation |
| Quick Reference | Searchable index of conditions, actions, modifiers, and common rules |
| Character Builder | Guided 11-step wizard with priority allocation and XP tracking |
| Character Sheet | Freeform sheet with auto-calculated derived stats and JSON export |
| Combat Tracker | Initiative management, HP tracking, condition toggles, character import |
| NPC Generator | Stat block builder with templates, traits, and Markdown export |
| Ship Builder | Spelljammer ship configuration with hull, consoles, weapons, and combat mode |
| Success Curves | Monte Carlo probability analysis for XkY dice pools vs target numbers |
| Defense Graph | Damage mitigation visualization across the full defense pipeline |

---

## Getting Started

### Prerequisites

- **Node.js 20+** (required)
- **Python 3.12+** with [uv](https://docs.astral.sh/uv/) (optional — for pipeline tools)

### Build

```bash
npm install
npm run build     # runs prebuild + astro build
```

### Development

```bash
npm run dev       # starts Astro dev server at localhost:4321
```

### Pipeline (optional)

```bash
uv run dtd validate       # validate JSON data against Pydantic schemas
uv run dtd validate --xref  # also check cross-file references
uv run dtd lint           # lint markdown for terminology and formatting
uv run dtd starlight-prep # inject Starlight frontmatter into cleaned-references
uv run dtd sync-check     # detect drift between markdown and JSON data
```

---

## Project Structure

```
books/                 Source rulebook chapters (2 books, per-chapter split)
cleaned-references/    Condensed rules reference (merged by topic, 24 files)
tools/                 Original vanilla JS tools + shared data/CSS/JS
  shared/data/         12 JSON data files (canonical source)
src/                   Astro source
  pages/tools/         Tool pages (standalone, outside Starlight)
  lib/dtd/             ES module ports of core.js and dice.js
  layouts/             ToolLayout.astro
  styles/              WH40K theme CSS
pipeline/              Python validation, linting, content processing
docs/                  Technical documentation and conventions
```

---

## Tech Stack

- **[Astro](https://astro.build) + [Starlight](https://starlight.astro.build)** — Static documentation site
- **Vanilla JavaScript** — All tools are client-side, no framework dependencies
- **Chart.js** — Probability curves and defense graphs
- **[Pagefind](https://pagefind.app)** — Full-text search across all rules content
- **Python + Pydantic** — Data validation pipeline
- **Vercel** — Static hosting and deployment

---

*This is a fan-made project. All game content belongs to its respective creators.*
