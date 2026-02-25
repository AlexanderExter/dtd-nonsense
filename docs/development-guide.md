# Development Guide

Conventions and patterns for contributing to the DTD tools. Covers code patterns, git workflow, game-term standards, and testing.

---

## Git Workflow

See [project-conventions.md](project-conventions.md#git-workflow) for the full git workflow, branch naming, and editing policy.

---

## Adding a New Tool

### Astro Pages (src/pages/tools/)

1. Create `src/pages/tools/[tool-name].astro`
2. Import `ToolLayout` and wrap content:

```astro
---
import ToolLayout from "@/layouts/ToolLayout.astro";
---

<ToolLayout title="Tool Name" description="...">
  <!-- HTML content -->
  <style> /* tool styles */ </style>
  <script> /* tool logic with ES module imports */ </script>
</ToolLayout>
```

3. Convert `DTD.*` global calls → ES module imports:

```javascript
import { loadData, derived, escapeHtml } from "@/lib/dtd/core.js";
import { roll, parseNotation } from "@/lib/dtd/dice.js";
```

4. For Chart.js: `const { Chart } = await import('chart.js/auto');`
5. For Web Workers: use `new Worker(new URL('./worker.js', import.meta.url))` or inline Blob
6. Create documentation in `docs/tools/[tool-name].md`
7. Add a card to `src/pages/tools/index.astro` with a `status` badge

---

## Astro Development Workflow

### Prerequisites

- Node 20+ and npm
- Python 3.12+ with `uv` (for pipeline)

### Commands

| Command                     | Purpose                                                                     |
| --------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`               | Start Astro dev server with hot reload                                      |
| `npm run build`             | Full build: prebuild → astro build (89 pages)                               |
| `npm run preview`           | Preview production build locally                                            |
| `uv run dtd starlight-prep` | Inject Starlight frontmatter (run once or after cleaning references change) |

### Build Pipeline

```
uv run dtd starlight-prep     ← Run once: adds YAML frontmatter to cleaned-references/
        ↓
node scripts/prebuild.mjs     ← Copies: cleaned-refs → rules, books → books, JSON → public/data
        ↓
astro build                   ← Builds 89 static pages + Pagefind search index
```

`npm run build` runs the last two steps. The `starlight-prep` step is a prerequisite that only needs re-running when `cleaned-references/` files are edited.

---

## Adding a New JSON Data File

1. Create `data/newdata.json`
2. Add to `loadAllData()` call in the tool's init:

```javascript
import { loadAllData } from "@/lib/dtd/core.js";
const data = await loadAllData(['newdata.json', ...]);
```

3. Store in tool state: `this.state.data.newdata = data.newdata`
4. Document the schema in `docs/data-reference.md`

---

## Adding a Character Field

1. Add default value to `DTD.character.DEFAULTS` in `core.js`
2. Add UI for the field in the Character Sheet
3. The field automatically serializes via `JSON.stringify(state.character)`
4. Update `DTD.character._migrateIfNeeded()` if migrating from old formats
5. If the Builder also needs this field, add it to the relevant wizard step

---

## Adding a Shared ES Module

1. Create `src/lib/dtd/module.js` as a named-export ES module:

```javascript
export function myFunction() {
    // ...
}
```

2. Import in consuming tool scripts:

```javascript
import { myFunction } from "@/lib/dtd/module.js";
```

3. Document the API in `docs/shared/`

---

## Refactoring Shared Modules

See [project-conventions.md](project-conventions.md#refactoring-shared-modules) for the 3-step refactoring safety checklist.

---

## CSS Conventions

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

## Testing Checklist

Per-tool verification before merge:

1. **Data loading** — check browser console for 404s on JSON files
2. **Formula accuracy** — spot-check 3+ examples against book formulas
3. **Import/export round-trip** — export → import → compare (no data loss)
4. **Responsive layout** — test at 1920px, 1366px, 768px, 375px
5. **Print output** — meaningful and readable
6. **Persistence** — save, reload page, data persists
7. **Cross-tool** — Sheet export → other tool import (via canonical format)
8. **Astro build** — `npm run build` succeeds with 0 errors (89+ pages)
9. **Pipeline** — `uv run dtd validate` passes (12/12 files)

### Dice Module Verification

- Exploding 10s produce values >10
- `10k10` cap enforced; `12k6` → `10k7`; `11k11` → `10k10+10`
- Rank-0: always returns 0–9 (10 counts as 0, no explosion)
- Modifier applied after keep-and-sum
- 100K-roll simulation: mean of `5k3` ≈ 19.5

---

## PowerShell Warning

See [project-conventions.md](project-conventions.md#powershell-encoding) for the full warning on PowerShell encoding corruption.
