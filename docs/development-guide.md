# Development Guide

Conventions and patterns for contributing to the DTD tools. Covers code patterns, git workflow, game-term standards, and testing.

---

## Git Workflow

See [project-conventions.md](project-conventions.md#git-workflow) for the full git workflow, branch naming, and editing policy.

---

## Creating a React Tool

All 6 tools use the **React Islands** pattern. To add a new tool:

### 1. Create Component Directory

```text
src/components/react/tools/{tool-name}/
├── constants.ts          # Types, helpers, tool-specific constants
├── store.ts              # Zustand store for tool state
├── {ToolName}App.tsx     # Root component (data loading, layout)
├── SomeTab.tsx           # Tab/section components
├── AnotherTab.tsx
└── shared/               # Shared sub-components (optional)
    └── SomeWidget.tsx
```

### 2. Define State with a Zustand Store

In `store.ts`:

```typescript
import { create } from "zustand";

interface ToolState {
  items: Item[];
  selectedId: string | null;
  setItems: (items: Item[]) => void;
  setSelectedId: (id: string | null) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  items: [],
  selectedId: null,
  setItems: (items) => set({ items }),
  setSelectedId: (id) => set({ selectedId: id }),
}));
```

In components:

```typescript
const items = useToolStore((s) => s.items);
const setItems = useToolStore((s) => s.setItems);
```

### 3. Create the Astro Page

```astro
---
import ToolLayout from "@/layouts/ToolLayout.astro";
import { ToolNameApp } from "@/components/react/tools/{tool-name}/{ToolName}App";
---

<ToolLayout title="Tool Name" description="...">
  <ToolNameApp client:only="react" />
</ToolLayout>
```

### 4. Key Conventions

- Use `className` (React)
- All `<button>` elements need `type="button"`
- **Named exports only** — no default exports
- Use `@/` path aliases for imports outside the component directory
- Use `./` relative imports within the component directory
- Zustand stores for state (one per tool, co-located as `store.ts`)
- `useAllData` hook from `@/hooks/use-data` for loading JSON game data

### 5. Available Hooks

| Hook                 | Source                          | Purpose                                         |
| -------------------- | ------------------------------- | ----------------------------------------------- |
| `useAllData`         | `@/hooks/use-data`              | Load multiple JSON data files in parallel        |

### 6. Documentation

- Create `docs/tools/[tool-name].md`

---

## Astro Development Workflow

### Prerequisites

- Bun 1.x+

### Commands

| Command                  | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| `bun run dev`            | Start Astro dev server with hot reload              |
| `bun run build`          | Full build: prebuild → astro build                  |
| `bun run preview`        | Preview production build locally                    |
| `bun run lint`           | Check JS/TS/CSS with Biome                          |
| `bun run lint:fix`       | Auto-fix Biome lint issues                          |
| `bun run test`           | Run Bun unit tests (bun:test)                       |
| `bun run test:watch`     | Run Bun tests in watch mode                         |
| `bun run validate`       | Validate JSON data against Zod schemas              |
| `bun run validate:xref`  | Validate + cross-reference checks                   |
| `bun run lint:data`      | Lint markdown for terminology, formatting, encoding |
| `bun run sync-check`     | Detect drift between markdown and JSON data         |
| `bun run check`          | Run everything: tests → lint → validate → lint:data |
| `bun run session:start`  | Create/switch to session branch + baseline check    |
| `bun run session:end`    | Squash-merge session branch to main + cleanup       |
| `bun run session:status` | Quick git state report (branch, dirty/clean)        |

### Build Pipeline

```text
bun run scripts/prebuild.mjs  ← Copies: cleaned-refs → rules, books → books, JSON → public/data, injects frontmatter
        ↓
astro build                   ← Builds static pages + Pagefind search index
```

`bun run build` runs both steps. Starlight frontmatter injection is handled automatically by `prebuild.mjs`.

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

## Bulk Code Migrations (jscodeshift)

**jscodeshift** is an AST-based code transformation tool for JavaScript/TypeScript. It rewrites source files structurally — not with text find-and-replace — preserving formatting for unmodified code (via `recast`).

**Not installed as a devDependency — use via `bun x` on demand:**

```powershell
bun x jscodeshift -t scripts/codemods/my-transform.ts src/
```

### When to use

- Renaming an API that appears in 10+ components (e.g., renaming a hook, changing a function signature)
- Migrating import paths after a module refactor
- Applying a structural pattern change across all tool components simultaneously
- Any refactor where manual find-and-replace risks being incomplete or inconsistent

### Workflow

1. Create `scripts/codemods/my-transform.ts` — write the jscodeshift transform
2. Run a dry-run first: `bun x jscodeshift --dry -t scripts/codemods/my-transform.ts src/`
3. Apply: `bun x jscodeshift -t scripts/codemods/my-transform.ts src/`
4. Verify: `bun run check` must pass green
5. Commit the transform file alongside the code changes (for reviewability)
6. Delete the transform after the PR merges (it's ephemeral)

### Format preservation note

jscodeshift uses `recast` internally, which reprints only the AST nodes you modified and copies everything else verbatim. This minimizes diff noise compared to formatters that reprint the entire file.

### vs ts-morph

- **Use jscodeshift** for bulk syntax rewrites (rename, restructure, migrate imports) where clean diffs matter.
- **Use ts-morph** (installed) for type-aware analysis and pipeline scripts that need semantic information. See `scripts/check-structure.ts` as the reference implementation.

---

## Using UI Primitives

All tools share a set of **18 UI primitive components** in `src/components/react/ui/`. Import from the barrel:

```tsx
import { Button, Badge, Modal, Toast, showToast } from "@/components/react/ui";
```

**Never import `radix-ui` directly** — use the UI layer wrappers instead.

### When to Use Primitives vs Raw HTML

| Need | Use | Example |
|------|-----|---------|
| Any styled button | `<Button>` | `<Button variant="primary" onClick={save}>Save</Button>` |
| Add-item action | `<AddButton>` | `<AddButton label="Weapon" onClick={add} />` |
| Section title | `<SectionHeading>` | `<SectionHeading>Equipment</SectionHeading>` |
| Status indicator | `<Badge>` | `<Badge variant="success">Active</Badge>` |
| Popup / modal | `<Modal>` or `<Popover>` | `<Modal open={isOpen} onClose={close} title="Import">` |
| Tab navigation | `<Tabs>` + `<TabPanel>` | See Tabs API in [ui/README.md](../src/components/react/ui/README.md) |
| Toast message | `showToast()` + `<Toast />` | `showToast("Saved!")` anywhere; mount `<Toast />` once in root |
| Dropdown select | `<Select>` | `<Select value={v} onChange={set} options={opts} />` |

### Patterns to Keep Tool-Local

- Inline × remove buttons (transparent style, not `.btn`)
- Domain-specific color badges (dice outcomes, ship consoles)
- Complex toggle/filter groups with domain logic
- Step wizards and controlled accordions with expand/collapse all

See [src/components/react/ui/README.md](../src/components/react/ui/README.md) for the full API reference.

---

## CSS Conventions

### Tailwind v4 Utility-First

All tool pages use **Tailwind CSS v4** utility classes directly in JSX. No hand-written `<style>` blocks.

- **Design tokens**: `src/styles/tailwind.css` `@theme` block — colors, spacing, radii, fonts, animations
- **Reusable patterns**: `src/styles/tailwind.css` `@layer components` — `.panel`, `.btn` family
- **Starlight theme**: `src/styles/custom.css` — WH40K dark/gold for docs pages
- **Print styles**: Minimal `@media print` blocks in individual `.astro` files where needed

### Class Patterns

```tsx
// Static classes
<div class="bg-surface border border-border rounded-md p-lg">

// Conditional classes
<div class={[
  "flex items-center p-sm rounded-sm",
  isActive && "border-accent bg-accent-bg",
  isDisabled && "opacity-50 cursor-not-allowed",
].filter(Boolean).join(" ")}>

// Dynamic runtime values (inline style — only for values computed at runtime)
style={{ width: `${percent}%` }}
```

### Rules

- Use `className` — React convention
- No `@apply` — defeats utility-first purpose
- No `<style>` blocks in components — all styling via Tailwind utilities
- `style={{}}` only for dynamic runtime values (percentages, canvas)
- Color/badge mappings use typed `Record<string, string>` lookup constants
- Responsive: `max-[Npx]:` for custom breakpoints, `max-md:` / `max-sm:` for standard

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

Unit tests use **bun:test** (Bun's built-in Jest-compatible runner; config in `bunfig.toml`). The test infrastructure includes:

- **DOM environment**: jsdom 28, configured in `src/test-setup.ts` (preloaded via `bunfig.toml`)
- **React testing**: `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom` matchers
- **Coverage**: `bun test --coverage` (native text output), local-only (no CI enforcement)

### Test File Locations

Tests are co-located with their source using the `*.test.ts(x)` pattern:

| Test Layer | Files | Covers |
| --- | --- | --- |
| **Core logic** | `src/lib/dtd/core.test.ts` | Derived stats, character CRUD, migration, data loading |
| **Core logic** | `src/lib/dtd/dice.test.ts` | parseNotation, calculateOutcome, roll (exploding, rank-0) |
| **Core logic** | `src/lib/dtd/schemas.test.ts` | Schema validation + rejection tests |
| **Pipeline** | `scripts/__tests__/validate.test.ts` | Validate script unit tests |
| **Pipeline** | `scripts/__tests__/lint.test.ts` | Lint script unit tests |
| **Pipeline** | `scripts/__tests__/sync-check.test.ts` | Sync-check script unit tests |
| **Pipeline** | `scripts/__tests__/check-structure.test.ts` | Structural convention checks (ts-morph) |
| **Zustand stores** | `src/components/react/tools/*/store.test.ts` | All 6 tool stores (setters, updaters, factories) |
| **UI primitives** | `src/components/react/ui/__tests__/*.test.tsx` | Accordion, Modal, Tabs, Toast |
| **App components** | `src/components/react/tools/*/*.test.tsx` | Each tool's root App component (loading/error/render states) |

### Commands

```bash
bun run test               # single run (all tests)
bun run test:watch         # re-run on file changes
bun run test:coverage      # text coverage summary
bun run test:coverage:lcov # lcov report for tooling
```

### Shared Test Utilities

| Utility | Location | Purpose |
| --- | --- | --- |
| `installMockLocalStorage()` | `src/lib/dtd/__test-utils__/mock-local-storage.ts` | Replaces `globalThis.localStorage`, returns cleanup |
| `installMockFetch(dataMap)` | `src/lib/dtd/__test-utils__/mock-fetch.ts` | URL-matching fetch mock, returns cleanup |
| `mockDice(...values)` | `src/lib/dtd/__test-utils__/mock-dice.ts` | Deterministic d10 rolls via Math.random mock |
| `MOCK_GAME_DATA` | `src/components/react/__test-utils__/mock-game-data.ts` | Minimal game data fixtures |
| `renderWithCleanup(ui)` | `src/components/react/__test-utils__/render-with-store.ts` | React render wrapper with cleanup |

### Writing a Store Test

```ts
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createDefaultX, useXStore } from "./store";

beforeEach(() => {
  useXStore.setState({ /* initial state */ });
});
afterEach(() => { useXStore.setState({ /* reset */ }); });

it("sets field", () => {
  useXStore.getState().setField("value");
  expect(useXStore.getState().field).toBe("value");
});
```

### Writing a Component Test

```tsx
import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";

// Mock data hooks to control loading/error/data states
let mockHook = () => ({ data: null, loading: true, error: null });
mock.module("@/hooks/use-data", () => ({ useAllData: () => mockHook() }));
const { MyApp } = await import("./MyApp");

afterEach(() => cleanup());

it("shows loading", () => {
  render(<MyApp />);
  expect(screen.getByText(/Loading/)).toBeTruthy();
});
```

### CI Pipeline Order

GitHub Actions runs the following steps on every push/PR:

```text
Biome lint  →  Bun tests  →  Zod validate  →  Content lint  →  Astro build
```

Corresponds to separate CI steps: `bunx biome ci .` → `bun test` → `bun run scripts/validate.ts --xref` → `bun run scripts/lint.ts` → `bun run build`.

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
8. **Astro build** — `bun run build` succeeds with 0 errors
9. **Pipeline** — `bun run validate` passes (all files)

### Dice Module Verification

- Exploding 10s produce values >10
- `10k10` cap enforced; `12k6` → `10k7`; `11k11` → `10k10+10`
- Rank-0: always returns 0–9 (10 counts as 0, no explosion)
- Modifier applied after keep-and-sum
- 100K-roll simulation: mean of `5k3` ≈ 19.5

---

## Tailwind CSS Conventions

Decisions established during the Tailwind v4 migration. Follow these when writing or modifying tool components.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Attribute name | `className` | React convention, shorter, matches HTML |
| Dynamic classes | Template literals or array `.filter(Boolean).join(" ")` | Simple, no extra dependency |
| Custom properties | Keep for truly dynamic values only | Chart colors, runtime percentages, animation targets |
| `@apply` usage | **Never** | Defeats utility-first; creates hidden coupling |
| Component styles | Tailwind utilities on every element | No `<style>` blocks in React components |
| Animations | Tailwind `animate-*` + custom `@keyframes` in `tailwind.css` | `slideIn`, `pulse`, tool-specific animations |

### Patterns That Must Stay as Inline Styles

```tsx
// Dynamic runtime percentages
style={{ width: `${hpPercent}%` }}

// Color swatches
style={{ background: STATUS_COLORS[status] }}
```

### Conditional Class Pattern

```tsx
// Simple boolean
<div class={`flex ${isActive ? "border-accent" : "border-transparent"}`}>

// Multiple conditions
<div class={[
  "flex items-center p-sm rounded-sm",
  isKept && "bg-accent text-bg",
  isDropped && "opacity-40 line-through",
  isExploded && "border-gold animate-pulse-once",
].filter(Boolean).join(" ")}>
```

---

## PowerShell Warning

See [project-conventions.md](project-conventions.md#powershell-encoding) for the full warning on PowerShell encoding corruption.
