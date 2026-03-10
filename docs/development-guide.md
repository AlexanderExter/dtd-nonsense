# Development Guide

Conventions and patterns for contributing to the DTD tools. Covers code patterns, git workflow, game-term standards, and testing.

---

## Git Workflow

See [project-conventions.md](project-conventions.md#git-workflow) for the full git workflow, branch naming, and editing policy.

---

## Creating a Preact Tool

All 9 tools use the **Preact Islands** pattern. To add a new tool:

### 1. Create Component Directory

```
src/components/preact/tools/{tool-name}/
├── constants.ts          # Types, helpers, tool-specific constants
├── {ToolName}App.tsx     # Root component (signals, data loading, layout)
├── SomeTab.tsx           # Tab/section components
├── AnotherTab.tsx
└── shared/               # Shared sub-components (optional)
    └── SomeWidget.tsx
```

### 2. Define State with Module-Level Signals

In `{ToolName}App.tsx`:

```typescript
import { signal, computed } from "@preact/signals";
import { useAllData } from "@/hooks/use-data";

// Module-level signals — shared across all components
export const items = signal<Item[]>([]);
export const selectedId = signal<string | null>(null);
export const selectedItem = computed(() =>
  items.value.find(i => i.id === selectedId.value) ?? null
);

export function addItem(item: Item) {
  items.value = [...items.value, item];
}

export function ToolNameApp() {
  const { data, loading, error } = useAllData(["skills.json", "races.json"]);
  // ...
}
```

### 3. Create the Astro Page

```astro
---
import ToolLayout from "@/layouts/ToolLayout.astro";
import { ToolNameApp } from "@/components/preact/tools/{tool-name}/{ToolName}App";
---

<ToolLayout title="Tool Name" description="...">
  <ToolNameApp client:load />
  <style is:global>
    /* Tool-specific CSS overrides */
  </style>
</ToolLayout>
```

### 4. Key Conventions

- Use `class` not `className` (Preact)
- All `<button>` elements need `type="button"`
- **Named exports only** — no default exports
- Use `@/` path aliases for imports outside the component directory
- Use `./` relative imports within the component directory
- Module-level signals for state, `computed` for derived data
- `useAllData` hook from `@/hooks/use-data` for loading JSON game data
- `useLocalStorage` hook from `@/hooks/use-local-storage` for persistence
- `useWorker` hook from `@/hooks/use-worker` for Web Worker communication

### 5. Available Hooks

| Hook                 | Source                          | Purpose                                         |
| -------------------- | ------------------------------- | ----------------------------------------------- |
| `useData`            | `@/hooks/use-data`              | Load a single JSON data file                    |
| `useAllData`         | `@/hooks/use-data`              | Load multiple JSON data files in parallel        |
| `useLocalStorage`    | `@/hooks/use-local-storage`     | Persist signal state to localStorage            |
| `useWorker`          | `@/hooks/use-worker`            | Communicate with Web Workers                    |
| `useDebouncedSignal` | `@/hooks/use-debounce`          | Debounced signal for search/filter inputs       |

### 6. Documentation

- Create `docs/tools/[tool-name].md`
- Add a card to `src/pages/tools/index.astro` with a `status` badge

---

## Astro Development Workflow

### Prerequisites

- Node 20+ and npm

### Commands

| Command                  | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| `npm run dev`            | Start Astro dev server with hot reload              |
| `npm run build`          | Full build: prebuild → astro build                  |
| `npm run preview`        | Preview production build locally                    |
| `npm run lint`           | Check JS/TS/CSS with Biome                          |
| `npm run lint:fix`       | Auto-fix Biome lint issues                          |
| `npm run test`           | Run Vitest unit tests                               |
| `npm run test:watch`     | Run Vitest in watch mode                            |
| `npm run validate`       | Validate JSON data against Zod schemas              |
| `npm run validate:xref`  | Validate + cross-reference checks                   |
| `npm run lint:data`      | Lint markdown for terminology, formatting, encoding |
| `npm run sync-check`     | Detect drift between markdown and JSON data         |
| `npm run check`          | Run everything: tests → lint → validate → lint:data |
| `npm run session:start`  | Create/switch to session branch + baseline check    |
| `npm run session:end`    | Squash-merge session branch to main + cleanup       |
| `npm run session:status` | Quick git state report (branch, dirty/clean)        |

### Build Pipeline

```
node scripts/prebuild.mjs     ← Copies: cleaned-refs → rules, books → books, JSON → public/data, injects frontmatter
        ↓
astro build                   ← Builds static pages + Pagefind search index
```

`npm run build` runs both steps. Starlight frontmatter injection is handled automatically by `prebuild.mjs`.

---

## Adding a New JSON Data File

1. Create `data/newdata.json`
2. Add to `loadAllData()` call in the tool's init:

```typescript
import { loadAllData } from "@/lib/dtd/core.ts";
const data = await loadAllData(['newdata.json', ...]);
```

3. Store in tool state: `this.state.data.newdata = data.newdata`
4. Document the schema in `docs/data-reference.md`

---

## Adding a Character Field

1. Add default value to `character.DEFAULTS` in `core.ts`
2. Add UI for the field in the Character Sheet
3. The field automatically serializes via `JSON.stringify(state.character)`
4. Update `character.validate()` if migrating from old formats
5. If the Builder also needs this field, add it to the relevant wizard step

---

## Adding a Shared ES Module

1. Create `src/lib/dtd/module.ts` as a named-export ES module:

```typescript
export function myFunction() {
    // ...
}
```

2. Import in consuming tool scripts:

```typescript
import { myFunction } from "@/lib/dtd/module.ts";
```

3. Document the API in `docs/shared/`

---

## Refactoring Shared Modules

See [project-conventions.md](project-conventions.md#refactoring-shared-modules) for the 3-step refactoring safety checklist.

---

## CSS Conventions

### File Organization

- **Large tools** (character-sheet, character-builder) use separate `.css` files in `src/styles/` imported via `<style is:global>@import`
- **Small tools** use inline `<style>` blocks in the `.astro` file (scoped or `is:global` as needed)
- **ToolLayout.astro** declares `:root` CSS custom properties for the standalone HTML shell
- **Starlight theme** lives in `src/styles/custom.css`

### Custom Properties

Use CSS custom properties defined in `ToolLayout.astro` and `src/styles/custom.css`:

```css
var(--bg)                /* Page background */
var(--surface)           /* Card / panel backgrounds */
var(--text)              /* Primary text */
var(--text-dim)          /* Secondary text */
var(--text-muted)        /* Tertiary text */
var(--accent)            /* Gold accent */
var(--border)            /* Border color */
var(--space-sm/md/lg/xl) /* Spacing scale */
var(--radius)            /* Border radius */
```

**Hidden attribute caveat:** Never set an explicit `display` value (e.g., `display: flex`) on an element that uses the HTML `hidden` attribute for visibility toggling. CSS `display` overrides `hidden`'s implicit `display: none`, making the element permanently visible. Instead, use `display: none` as the default and toggle with a class (e.g., `.open { display: flex }`).

**Empty-state guards:** Features that depend on data from another tool (e.g., importing characters) must check preconditions before opening modals. If no data exists, show a lightweight toast instead of an empty modal.

---

## Game Term Conventions

See [project-conventions.md](project-conventions.md#dtd-conventions) for standardized terms, capitalized game terms, pronouns, and dice notation.

---

## Formula Quick Reference

See [project-conventions.md](project-conventions.md#formula-quick-reference) for the complete formula table.

---

## Unit Tests

Unit tests use **Vitest** (config in `vitest.config.ts`). Test files live alongside their source modules using the `*.test.ts` pattern:

| Test File                              | Covers                                                    |
| -------------------------------------- | --------------------------------------------------------- |
| `src/lib/dtd/core.test.ts`             | derived stats, character CRUD, migration, data loading    |
| `src/lib/dtd/dice.test.ts`             | parseNotation, calculateOutcome, roll (exploding, rank-0) |
| `src/lib/dtd/schemas.test.ts`          | Schema validation + rejection tests                       |
| `scripts/__tests__/validate.test.ts`   | Validate script unit tests                                |
| `scripts/__tests__/lint.test.ts`       | Lint script unit tests                                    |
| `scripts/__tests__/sync-check.test.ts` | Sync-check script unit tests                              |

Run with:

```bash
npm run test          # single run
npm run test:watch    # re-run on file changes
```

### CI Pipeline Order

GitHub Actions runs the following steps on every push/PR:

```
Biome lint  →  Vitest tests  →  Zod validate  →  Content lint  →  Astro build
```

Corresponds to separate CI steps: `npx biome ci .` → `npm run test` → `npm run validate` → `npm run lint:data` → `npm run build`.

All steps must pass for a PR to be merge-ready.

---

## Testing Checklist

Per-tool verification before merge:

1. **Data loading** — check browser console for 404s on JSON files
2. **Formula accuracy** — spot-check 3+ examples against book formulas
3. **Import/export round-trip** — export → import → compare (no data loss)
4. **Responsive layout** — test at 1920px, 1366px, 768px, 375px
5. **Print output** — meaningful and readable
6. **Persistence** — save, reload page, data persists
7. **Cross-tool** — Sheet export → other tool import (via canonical format)
8. **Astro build** — `npm run build` succeeds with 0 errors
9. **Pipeline** — `npm run validate` passes (all files)

### Dice Module Verification

- Exploding 10s produce values >10
- `10k10` cap enforced; `12k6` → `10k7`; `11k11` → `10k10+10`
- Rank-0: always returns 0–9 (10 counts as 0, no explosion)
- Modifier applied after keep-and-sum
- 100K-roll simulation: mean of `5k3` ≈ 19.5

---

## PowerShell Warning

See [project-conventions.md](project-conventions.md#powershell-encoding) for the full warning on PowerShell encoding corruption.
