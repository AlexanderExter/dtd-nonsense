# Tool Development

**Skill type:** Guide (web tool architecture and development)

**Triggers:** Building, modifying, or debugging web tools, shared modules, JSON data files, CSS styling, tool features, TypeScript code in the DTD toolset

---

## Ecosystem

All tools are **React Islands** mounted by Astro pages (`src/pages/tools/`) via `client:only="react"` into `ToolLayout.astro`. Each tool's components live in `src/components/react/tools/{tool-name}/` with a root `*App.tsx` entry point. Shared code lives in `src/lib/dtd/` as typed TypeScript modules: `core.ts`, `dice.ts`, `types.ts`. Custom hooks in `src/hooks/` handle data loading, localStorage, Web Workers, and debouncing.

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
src/pages/tools/[name].astro               ← Astro page (mounts React island via client:only="react")
src/components/react/tools/[name]/         ← React components for each tool
  [Name]App.tsx                             ← Root component (entry point)
  *.tsx                                     ← Sub-components
src/hooks/                                  ← Custom React hooks
  use-data.ts                               ← useData() / useAllData() for JSON loading
  use-local-storage.ts                      ← useLocalStorage() for persistence
src/lib/dtd/core.ts                         ← Shared: data loading, derived stats, character CRUD
src/lib/dtd/dice.ts                         ← Shared: roll(), calculateOutcome(), parseNotation()
src/lib/dtd/dice-primitives.ts              ← Canonical dice algorithms (used by dice.ts)
src/lib/dtd/types.ts                        ← Shared: CharacterData, CharacterListEntry, etc.
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
import { QuickReferenceApp } from "@/components/react/tools/quick-reference/QuickReferenceApp";
---

<ToolLayout title="Tool Name" description="Short description">
  <QuickReferenceApp client:only="react" />
</ToolLayout>
```

> **Never use `StarlightPage` for tool pages.** `StarlightPage` wraps content in the Starlight sidebar and header, turning a tool into a documentation page. All tool pages use `ToolLayout.astro` exclusively. See Critical Pitfall #11.

### React Component Pattern

```tsx
import { create } from "zustand";
import { useAllData } from "@/hooks/use-data";

// Zustand store for tool state (co-located as store.ts)
const useToolStore = create<{ someState: string; setSomeState: (v: string) => void }>((set) => ({
  someState: "",
  setSomeState: (v) => set({ someState: v }),
}));

export function ToolApp() {
  const { data, loading, error } = useAllData(["races.json", "skills.json"]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return <div className="tool-app">...</div>;
}
```

Key conventions:

- **Zustand stores** — one store per tool, co-located as `store.ts`; components use `useXStore(s => s.field)` selectors
- **`className`** — React requires `className`
- **Named exports only** — no default exports
- **All `<button>` need `type="button"`** — prevents form submission behavior
- **Tailwind utilities** for styling — use utility classes, fall back to `var(--name)` CSS variables from ToolLayout

### Import Patterns by Tool

| Tool              | Components | Data Sources | Uses Workers? |
| ----------------- | ---------- | ------------ | ------------- |
| Quick Reference   | 12         | Multiple     | No            |
| Combat Tracker    | 8          | Weapons      | No            |
| NPC Generator     | 11         | Multiple     | No            |
| Ship Builder      | 11         | Ships        | No            |
| Character Builder | 17         | All          | No            |
| Character Sheet   | 15         | All          | No            |

## Data Loading

In React components, use the custom hooks from `src/hooks/use-data.ts`:

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

1. **Zustand stores share state per-tool** — Each tool has its own Zustand store (`store.ts`). Components in the same tool share state via the store. This is fine on single-tool pages but would need scoping in a multi-tool dashboard.

2. **Use `className` not `class` in React JSX** — React requires `className` for CSS class attributes. Use `htmlFor` instead of `for` on labels.

3. **Astro `<style>` scoping eats `@import`** — A bare `<style>@import "file.css";</style>` in a layout is scoped by default. Astro hashes every imported selector, so rules never match slotted child content. Use `<style is:global>` for shared imports.

4. **localStorage keys use tool-specific prefixes** — Character Sheet uses `dtd_sheet_{id}` / `dtd_sheet_list`. Combat Tracker uses `dtd_encounter_{id}`. Never change existing key names (breaks user data). See [docs/architecture.md](../../docs/architecture.md#persistence-conventions) for the full key table.

5. **Always grep all tool components when refactoring shared modules** — Changes to `core.ts`, `dice.ts`, `types.ts`, or hooks can break any of the 6 tools. Search `src/components/react/tools/` and `src/pages/tools/` for all callers before modifying exports.

6. **Tool spec docs drift from implementations** — `docs/tools/*.md` files list dependencies, data sources, and features that may not match reality. Always verify against the actual `.tsx` source when editing a tool. The code is ground truth, not the spec doc.

7. **Post-migration audit: grep for raw patterns** — After migrating components to shared UI primitives, grep the entire tool directory for the old pattern (e.g., `"btn`, `role="tablist"`, raw `<dialog>`) to catch duplicates and stragglers. Components with multiple render branches (e.g., mobile vs desktop, collapsed vs expanded) often have duplicate UI that the first pass misses.

8. **Use Radix UI `Tabs` with conditional rendering for tab panels** — Use `<Tabs>` from `@/components/react/ui` for the accessible tab bar. For tab panel content, use conditional rendering:

    ```tsx
    // CORRECT — conditional rendering
    {activeTab === "identity" && <IdentityTab />}
    {activeTab === "stats" && <StatsTab />}
    ```

    This ensures only the active tab's content is rendered.

9. **Tool pages must use `ToolLayout.astro` — never `StarlightPage`** — `StarlightPage` wraps content in Starlight's sidebar + header chrome. Tool pages are standalone full-viewport experiences and must use `ToolLayout.astro` only. Using `StarlightPage` for tools causes them to render inside the documentation sidebar with no escape — a regression that requires a full pass to undo. If you see a tool page importing from `@astrojs/starlight/components`, that is a bug.

## Adding a New Tool

1. Create `src/components/react/tools/[tool-name]/[ToolName]App.tsx` — root React component with named export
2. Create `src/components/react/tools/[tool-name]/store.ts` — Zustand store for tool state
3. Create `src/pages/tools/[tool-name].astro` — imports and mounts the component via `client:only="react"` using `ToolLayout.astro` (not `StarlightPage`)
4. Import shared logic from `@/lib/dtd/core.ts`, hooks from `@/hooks/`
5. Use Tailwind utilities for styling; fall back to `var(--name)` CSS variables from `ToolLayout.astro`
6. Add a sidebar entry to `astro.config.mjs` under the `Play Tools` group with `attrs: { target: "_blank", rel: "noopener" }` — tools are standalone pages and must open in a new tab
7. Create documentation in `docs/tools/[tool-name].md`

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

Pipeline validation: `bun run validate` checks all 12 JSON files against Zod schemas in `src/lib/dtd/schemas/`.

## When Editing Affects Rules

If a tool change touches game mechanics (formulas, stat calculations, race/class data), also verify consistency with:

- The relevant `cleaned-references/` file
- [docs/project-conventions.md](../../docs/project-conventions.md) formula table
- `src/lib/dtd/core.ts` `derived` stat implementations

## Code Transformation Tools

Two tools are available for programmatic code analysis and transformation:

### ts-morph (installed — `import { Project } from "ts-morph"`)

**ts-morph** wraps the TypeScript Compiler API. It gives agents type-aware code intelligence: query types, find all usages, verify exports, and rewrite source files with full type resolution.

**Reference implementation:** `scripts/check-structure.ts` — three structural checks using the `Project` API. Study this before writing new ts-morph scripts.

Common agent tasks with ts-morph:

- **Impact analysis before refactoring:** Find all callers of a function across the codebase before changing its signature
- **Structural verification:** Check that conventions hold (e.g., every store exports `use*Store`, no default exports)
- **Type-aware migrations:** Find all usages of a type and update them when the type changes
- **API surface checks:** Verify that barrel exports in `core.ts` match documented API

```typescript
import { Project } from "ts-morph";
import * as path from "node:path";

const ROOT = process.cwd();
const project = new Project({
  tsConfigFilePath: path.join(ROOT, "tsconfig.json"),
  skipAddingFilesFromTsConfig: true,
});
const files = project.addSourceFilesAtPaths("src/lib/dtd/**/*.ts");
// ... analyze or transform files
```

Add new checks to `scripts/check-structure.ts` by writing a `checkXxx(project: Project): CheckResult` function and appending it to the `results` array.

### jscodeshift (bunx on-demand — no install)

**jscodeshift** is a syntax-based code transformation tool for bulk rewrites across many files. Best for renaming APIs, migrating import paths, and structural refactors where format preservation matters.

```powershell
bun x jscodeshift -t scripts/codemods/my-transform.ts src/
```

- Write transforms to `scripts/codemods/` — commit them alongside the changes, delete post-merge
- Dry-run first: `bun x jscodeshift --dry -t scripts/codemods/my-transform.ts src/`
- Always verify with `bun run check` after applying
- **Does not need type information** — for type-aware operations, use ts-morph instead
- Full guide: [docs/development-guide.md](../../docs/development-guide.md#bulk-code-migrations-jscodeshift)

## Convention References

- **Git workflow, terminology, formulas:** [docs/project-conventions.md](../../docs/project-conventions.md)
- **Build commands, testing checklist:** [docs/development-guide.md](../../docs/development-guide.md)
- **Full architecture and data flow:** [docs/architecture.md](../../docs/architecture.md)
