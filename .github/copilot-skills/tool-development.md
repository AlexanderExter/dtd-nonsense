# Tool Development

**Skill type:** Guide (web tool architecture and development)

**Triggers:** Building, modifying, or debugging web tools, shared modules, JSON data files, CSS styling, tool features, TypeScript code in the DTD toolset

---

## Ecosystem

All tools are **Astro pages** (`src/pages/tools/`) using ES module imports and `ToolLayout.astro`. Shared code lives in `src/lib/dtd/` as typed TypeScript modules: `core.ts`, `dice.ts`, `types.ts`. Large tools (character-sheet, character-builder) extract logic to `src/lib/tools/` as standalone `.ts` app modules. All 9 tools are fully migrated.

## Documentation Map

All technical documentation lives in `docs/`. Read the relevant file before starting work:

| Concern             | Read This                                                        |
| ------------------- | ---------------------------------------------------------------- |
| System architecture | [docs/architecture.md](../../docs/architecture.md)               |
| How-to recipes      | [docs/development-guide.md](../../docs/development-guide.md)     |
| JSON data schemas   | [docs/data-reference.md](../../docs/data-reference.md)           |
| core.ts API         | [docs/shared/core-js.md](../../docs/shared/core-js.md)           |
| dice.ts API         | [docs/shared/dice-js.md](../../docs/shared/dice-js.md)           |
| Per-tool specs      | [docs/tools/](../../docs/tools/) (9 spec files)                  |
| Project conventions | [docs/project-conventions.md](../../docs/project-conventions.md) |

## Tool Architecture

### File Layout

```
src/pages/tools/[name].astro     ← Astro page (HTML + <style> + <script>)
src/lib/dtd/core.ts              ← Shared: data loading, derived stats, character CRUD
src/lib/dtd/dice.ts              ← Shared: roll(), calculateOutcome(), parseNotation()
src/lib/dtd/types.ts             ← Shared: CharacterData, CharacterListEntry, etc.
src/lib/tools/sheet-app.ts       ← Large tool: Character Sheet logic (@ts-nocheck)
src/lib/tools/builder-app.ts     ← Large tool: Character Builder logic (@ts-nocheck)
src/layouts/ToolLayout.astro     ← Wrapper layout for all tool pages
src/styles/custom.css            ← WH40K theme tokens
src/styles/sheet.css             ← Per-tool CSS for large tools
src/styles/builder.css           ← Per-tool CSS for large tools
public/workers/                  ← External Web Worker files
data/                            ← Canonical JSON (12 files, copied to public/data/ at build)
```

### Standard Tool Pattern

Every tool page follows this structure:

```astro
---
import ToolLayout from "@/layouts/ToolLayout.astro";
---

<ToolLayout title="Tool Name" description="Short description">
  <!-- HTML content -->

  <style>
    /* Self-contained tool styles using CSS custom properties */
    .panel { background: var(--surface); border: 1px solid var(--border); }
  </style>

  <script>
    import { loadData, derived, character, escapeHtml } from '@/lib/dtd/core.ts';
    import { roll, calculateOutcome } from '@/lib/dtd/dice.ts';
    import type { CharacterData } from '@/lib/dtd/types.ts';

    // Tool logic here — runs as an ES module
    // DOM queries, event listeners, state management
  </script>
</ToolLayout>
```

### Import Patterns by Tool

| Tool              | Imports from core.ts                                              | Imports from dice.ts           | Pattern           |
| ----------------- | ----------------------------------------------------------------- | ------------------------------ | ----------------- |
| Character Sheet   | `loadData`, `loadAllData`, `character`, `derived`                 | `roll`                         | Extracted `.ts`   |
| Character Builder | `loadAllData`, `character`, `derived`                             | —                              | Extracted `.ts`   |
| Dice Roller       | —                                                                 | `roll`, `calculateOutcome`     | Inline `<script>` |
| Combat Tracker    | `derived`, `character`, `initAccordion`, `debounce`, `escapeHtml` | `roll`                         | Inline `<script>` |
| Quick Reference   | `loadData`                                                        | —                              | Inline `<script>` |
| NPC Generator     | `loadData`, `derived`                                             | —                              | Inline `<script>` |
| Ship Builder      | `loadData`                                                        | `roll`                         | Inline `<script>` |
| Success Curves    | —                                                                 | _(self-contained Monte Carlo)_ | Inline `<script>` |
| Defense Graph     | `derived`                                                         | —                              | Inline `<script>` |

### Large Tool Pattern (Sheet & Builder)

When a tool exceeds ~1,500 LOC, logic is extracted to `src/lib/tools/[name]-app.ts`:

```astro
<!-- Thin .astro wrapper -->
<script>
  import '@/lib/tools/sheet-app.ts';
</script>
<style is:global>
  @import '@/styles/sheet.css';
</style>
```

The extracted `.ts` files currently use `@ts-nocheck` (Phase 2 typing deferred). They contain all tool state, DOM manipulation, and event handling.

## Data Loading

### Single File

```typescript
import { loadData } from "@/lib/dtd/core.ts";

const races = await loadData<RaceData>("races.json");
```

### Multiple Files

```typescript
import { loadAllData } from "@/lib/dtd/core.ts";

const data = await loadAllData(["races.json", "exaltations.json", "skills.json", "classes.json", "feats.json", "weapons.json"]);
// Access: data.races, data.exaltations, etc.
```

`loadData()` fetches from `/data/{filename}` — files are copied from `data/` to `public/data/` by `scripts/prebuild.mjs` during build.

### JSON Wrapper Key Patterns

Most JSON files nest data under a top-level key matching the filename. You must drill into the wrapper:

| File                 | Access Pattern                                       | Notes                              |
| -------------------- | ---------------------------------------------------- | ---------------------------------- |
| `races.json`         | `data.races.races` → array                           | Wrapper key `races`                |
| `classes.json`       | `data.classes.tracks` → dict                         | Wrapper key `tracks`               |
| `feats.json`         | `data.feats.feats` → array                           | Wrapper key `feats`                |
| `weapons.json`       | `data.weapons.weapons.melee` / `.ranged` / `.thrown` | Nested under `weapons.weapons`     |
| `skills.json`        | `data.skills.skills` → dict of group → array         | Nested groups                      |
| `npc-templates.json` | `loadData(...)` → bare array                         | No wrapper key                     |
| `traits.json`        | `loadData(...)` → bare array                         | No wrapper key                     |
| `ships.json`         | `data.hulls`, `data.consoles`, `data.weapons`        | Direct top-level keys (no wrapper) |

## Critical Pitfalls

These have each caused real bugs. Memorize them:

1. **`@ts-nocheck` files need careful typing** — `sheet-app.ts` and `builder-app.ts` have `@ts-nocheck` at line 1. TypeScript won't catch errors in these files. When editing them, manually verify DOM element types, null checks, and API signatures. Don't trust the lack of red squiggles.

2. **Chart.js must be dynamically imported** — Chart.js is too large for static bundling and causes SSR issues. Always use:

    ```typescript
    const { Chart, registerables } = await import("chart.js");
    Chart.register(...registerables);
    ```

    Never use `import Chart from 'chart.js'` at the top level.

3. **Web Workers can't import ES modules** — Workers in `public/workers/` run outside Vite's module system. They must self-contain all logic or use `importScripts()` for external dependencies. Don't use `import` statements inside worker files.

4. **CSS `display` overrides `hidden`** — Never set `display: flex` (or similar) on elements using the HTML `hidden` attribute for toggle. Use class-based toggling instead (`.open { display: flex }`).

5. **Astro `<style>` scoping eats `@import`** — A bare `<style>@import "file.css";</style>` in a layout is scoped by default. Astro hashes every imported selector, so rules never match slotted child content. Use `<style is:global>` for shared imports, or keep tool styles self-contained in each page's `<style>` block.

6. **localStorage keys use tool-specific prefixes** — Character Sheet uses `dtd_sheet_{id}` / `dtd_sheet_list`. Combat Tracker uses `dtd_encounter_{id}`. Never change existing key names (breaks user data). See [docs/architecture.md](../../docs/architecture.md#persistence-conventions) for the full key table.

7. **Always grep all tool files when refactoring shared modules** — Changes to `core.ts`, `dice.ts`, or `types.ts` can break any of the 9 tool pages plus `sheet-app.ts` and `builder-app.ts`. Search `src/pages/tools/` and `src/lib/tools/` for all callers before modifying exports.

8. **Tool spec docs drift from implementations** — `docs/tools/*.md` files list dependencies, data sources, and features that may not match reality. In the March 2026 audit, 6 of 9 spec files had wrong imports, fabricated features, or incorrect data sources. When editing a tool or its spec, always verify against the actual `.astro`/`.ts` source. Never trust spec docs as ground truth for what a tool actually imports or does.

## Adding a New Tool

1. Create `src/pages/tools/[tool-name].astro` using the standard pattern above
2. Import shared functions from `@/lib/dtd/core.ts` and `@/lib/dtd/dice.ts`
3. Use CSS custom properties from `ToolLayout.astro` (see CSS Conventions below)
4. Add a card to `src/pages/tools/index.astro` (the tool dashboard)
5. Create documentation in `docs/tools/[tool-name].md`

Full recipe with prerequisites, commands, and build verification: [docs/development-guide.md](../../docs/development-guide.md#adding-a-new-tool).

## CSS Conventions

All tools inherit CSS custom properties from `ToolLayout.astro` and `src/styles/custom.css`:

```css
var(--bg)                /* Page background */
var(--surface)           /* Card / panel backgrounds */
var(--text)              /* Primary text */
var(--text-dim)          /* Secondary text */
var(--accent)            /* Gold accent color */
var(--border)            /* Border color */
var(--space-sm/md/lg/xl) /* Spacing scale */
var(--radius)            /* Border radius */
var(--success)           /* Green status */
var(--warning)           /* Orange status */
```

Dark theme with gold accents. Cards use `var(--surface)` backgrounds with `var(--border)` borders and `var(--radius)` rounding.

## Data Sync Rule

JSON data in `data/` must stay in sync with `cleaned-references/`. Before editing any JSON data file:

1. Check [docs/data-reference.md](../../docs/data-reference.md) for the schema
2. Verify changes match the corresponding cleaned-reference content
3. Update the data-reference doc if you change the schema

Pipeline validation: `npm run validate` checks all 12 JSON files against Zod schemas in `src/lib/dtd/schemas/`.

## When Editing Affects Rules

If a tool change touches game mechanics (formulas, stat calculations, race/class data), also verify consistency with:

- The relevant `cleaned-references/` file
- [docs/project-conventions.md](../../docs/project-conventions.md) formula table
- `src/lib/dtd/core.ts` `derived` stat implementations

## Convention References

- **Git workflow, terminology, formulas:** [docs/project-conventions.md](../../docs/project-conventions.md)
- **Build commands, testing checklist:** [docs/development-guide.md](../../docs/development-guide.md)
- **Full architecture and data flow:** [docs/architecture.md](../../docs/architecture.md)
