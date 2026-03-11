# Tool Development

**Skill type:** Guide (web tool architecture and development)

**Triggers:** Building, modifying, or debugging web tools, shared modules, JSON data files, CSS styling, tool features, TypeScript code in the DTD toolset

---

## Ecosystem

All tools are **Preact Islands** mounted by Astro pages (`src/pages/tools/`) via `client:load` into `ToolLayout.astro`. Each tool's components live in `src/components/preact/tools/{tool-name}/` with a root `*App.tsx` entry point. Shared code lives in `src/lib/dtd/` as typed TypeScript modules: `core.ts`, `dice.ts`, `types.ts`. Custom hooks in `src/hooks/` handle data loading, localStorage, Web Workers, and debouncing.

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

```text
src/pages/tools/[name].astro               ← Astro page (mounts Preact island via client:load)
src/components/preact/tools/[name]/         ← Preact components for each tool
  [Name]App.tsx                             ← Root component (entry point)
  *.tsx                                     ← Sub-components
src/hooks/                                  ← Custom Preact hooks
  use-data.ts                               ← useData() / useAllData() for JSON loading
  use-local-storage.ts                      ← useLocalStorage() for persistence
  use-worker.ts                             ← useWorker() for Web Worker communication
src/lib/dtd/core.ts                         ← Shared: data loading, derived stats, character CRUD
src/lib/dtd/dice.ts                         ← Shared: roll(), calculateOutcome(), parseNotation()
src/lib/dtd/dice-primitives.ts              ← Canonical dice algorithms (used by dice.ts and workers)
src/lib/dtd/types.ts                        ← Shared: CharacterData, CharacterListEntry, etc.
src/workers/                                ← TypeScript ESM Web Workers (bundled by Vite)
src/layouts/ToolLayout.astro                ← Wrapper layout (bridges Tailwind tokens → var(--name) aliases)
src/styles/custom.css                       ← WH40K Starlight theme tokens
src/styles/tailwind.css                     ← Tailwind v4 @theme tokens (design token source of truth)
data/                                       ← Canonical JSON (validated by Zod schemas, copied to public/data/ at build)
```

### Standard Tool Pattern

Every tool page follows this structure:

```astro
---
import ToolLayout from "@/layouts/ToolLayout.astro";
import { DiceRollerApp } from "@/components/preact/tools/dice-roller/DiceRollerApp";
---

<ToolLayout title="Tool Name" description="Short description">
  <DiceRollerApp client:load />
</ToolLayout>
```

### Preact Component Pattern

```tsx
import { signal } from "@preact/signals";
import { useAllData } from "@/hooks/use-data";

// Module-level signals for state management
const someState = signal<string>("");

export function ToolApp() {
  const { data, loading, error } = useAllData(["races.json", "skills.json"]);

  if (loading.value) return <div class="loading">Loading...</div>;
  if (error.value) return <div class="error">{error.value}</div>;

  return <div class="tool-app">...</div>;
}
```

Key conventions:

- **Module-level signals** — state lives outside the component for persistence across renders
- **`class` not `className`** — Preact with compat supports both, but we use `class`
- **Named exports only** — no default exports
- **All `<button>` need `type="button"`** — prevents form submission behavior
- **Tailwind utilities** for styling — use utility classes, fall back to `var(--name)` CSS variables from ToolLayout

### Import Patterns by Tool

| Tool              | Components | Data Sources | Uses Workers? |
| ----------------- | ---------- | ------------ | ------------- |
| Dice Roller       | 6          | None         | No            |
| Quick Reference   | 13         | Multiple     | No            |
| Success Curves    | 9          | None         | Yes           |
| Defense Graph     | 10         | None         | Yes           |
| Combat Tracker    | 9          | Weapons      | No            |
| NPC Generator     | 12         | Multiple     | No            |
| Ship Builder      | 12         | Ships        | No            |
| Character Builder | 18         | All          | No            |
| Character Sheet   | 16         | All          | No            |

## Data Loading

In Preact components, use the custom hooks from `src/hooks/use-data.ts`:

### Single File

```tsx
import { useData } from "@/hooks/use-data";

function MyComponent() {
  const { data, loading, error } = useData<RaceData>("races.json");
  if (loading.value) return <div>Loading...</div>;
  // data.value is the parsed JSON
}
```

### Multiple Files

```tsx
import { useAllData } from "@/hooks/use-data";

function MyComponent() {
  const { data, loading, error } = useAllData(["races.json", "exaltations.json", "skills.json"]);
  if (loading.value) return <div>Loading...</div>;
  // data.value.races, data.value.exaltations, etc.
}
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

1. **Module-level signals share state globally** — All tool state is in module-level `signal()` declarations. Two instances of the same component would share state. This is fine on single-tool pages but would break in a multi-tool dashboard.

2. **Chart.js must be dynamically imported** — Chart.js is too large for static bundling and causes SSR issues. Always use:

    ```typescript
    const { Chart, registerables } = await import("chart.js");
    Chart.register(...registerables);
    ```

    Never use `import Chart from 'chart.js'` at the top level.

3. **Web Workers use ESM and live in `src/workers/`** — Workers are TypeScript files in `src/workers/` bundled by Vite via `new Worker(new URL('../../workers/worker-name.ts', import.meta.url), { type: 'module' })`. They import from `src/lib/dtd/` using relative paths (not the `@/` alias — it doesn't resolve in worker bundles). Do **not** put workers in `public/workers/` — that directory no longer exists.

4. **Use `class` not `className` in Preact JSX** — Preact with compat supports both, but this project uses `class` consistently. Mixing causes inconsistency.

5. **Astro `<style>` scoping eats `@import`** — A bare `<style>@import "file.css";</style>` in a layout is scoped by default. Astro hashes every imported selector, so rules never match slotted child content. Use `<style is:global>` for shared imports.

6. **localStorage keys use tool-specific prefixes** — Character Sheet uses `dtd_sheet_{id}` / `dtd_sheet_list`. Combat Tracker uses `dtd_encounter_{id}`. Never change existing key names (breaks user data). See [docs/architecture.md](../../docs/architecture.md#persistence-conventions) for the full key table.

7. **Always grep all tool components when refactoring shared modules** — Changes to `core.ts`, `dice.ts`, `types.ts`, or hooks can break any of the 9 tools. Search `src/components/preact/tools/` and `src/pages/tools/` for all callers before modifying exports.

8. **Tool spec docs drift from implementations** — `docs/tools/*.md` files list dependencies, data sources, and features that may not match reality. Always verify against the actual `.tsx` source when editing a tool. The code is ground truth, not the spec doc.

9. **Post-migration audit: grep for raw patterns** — After migrating components to shared UI primitives, grep the entire tool directory for the old pattern (e.g., `"btn`, `role="tablist"`, raw `<dialog>`) to catch duplicates and stragglers. Components with multiple render branches (e.g., mobile vs desktop, collapsed vs expanded) often have duplicate UI that the first pass misses.

## Adding a New Tool

1. Create `src/components/preact/tools/[tool-name]/[ToolName]App.tsx` — root Preact component with named export
2. Create `src/pages/tools/[tool-name].astro` — imports and mounts the component via `client:load`
3. Import shared logic from `@/lib/dtd/core.ts`, hooks from `@/hooks/`
4. Use Tailwind utilities for styling; fall back to `var(--name)` CSS variables from `ToolLayout.astro`
5. Add a card to `src/pages/tools/index.astro` (the tool dashboard)
6. Create documentation in `docs/tools/[tool-name].md`

Full recipe with prerequisites, commands, and build verification: [docs/development-guide.md](../../docs/development-guide.md#adding-a-new-tool).

## CSS Conventions

Tools use **Tailwind CSS v4** utility classes. Design tokens are defined in `src/styles/tailwind.css` `@theme` block and bridged to short `var(--name)` aliases in `ToolLayout.astro`:

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

Prefer Tailwind utilities in JSX (e.g., `class="bg-surface border border-border rounded-md p-4"`). Use `var(--name)` for complex or dynamic styles that can't be expressed as utilities.

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
