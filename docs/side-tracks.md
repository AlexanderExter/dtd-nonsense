# Side Tracks

Tracked tech debt, deferred work, and future improvements. Grouped by theme, roughly priority-ordered within each group.

Items logged here during stabilization passes, code reviews, and work sessions. Resolved items are removed — see git history for the full log.

---

## TypeScript Migration

### Phase 2: Tool Module Refactor

Break up the monolithic tool apps (`sheet-app.ts`, `builder-app.ts`) into logical sub-modules to reduce maintenance burden and enable per-module typing. Each tool gets the same split pattern:

- `src/lib/tools/sheet/state.ts` — character state and persistence (wraps `character.*` from core.ts)
- `src/lib/tools/sheet/calc.ts` — derived stat calculations and XP budget
- `src/lib/tools/sheet/render.ts` — DOM rendering functions (panels, weapon rows, etc.)
- `src/lib/tools/sheet/events.ts` — event handler registration

Once split, remove `// @ts-nocheck` and add proper `HTMLInputElement` / `HTMLSelectElement` casts. Pre-condition: browser testing confirms the current port is fully functional.

Also covers: resolving the persistence duplication between `sheet-app.ts` (`getDefaultChar`, `mergeDefaults`) and `core.ts` (`character.DEFAULTS`, `character.validate`). See **W4** below for specific field-level drift.

### Phase 3: Reactivity Layer

Open consideration — depends on Phase 2 outcome. If the module refactor still leaves DOM manipulation feeling painful, consider a lightweight reactivity layer:

- **Preact** (`@astrojs/preact`, 7KB) — identical React API, zero extra config, Astro island-compatible. Best fit for reactive components without ecosystem commitment.
- **React** (`@astrojs/react`) — worth it only if shadcn/Radix library is a confirmed target or React-familiar contributors are expected.
- **No framework** — if Phase 2's module split makes vanilla TS clean enough, skip entirely. This is a real outcome worth evaluating before committing.

Start with the dice roller (smallest tool) as a proof-of-concept island before migrating sheet/builder.

---

## Infrastructure & Tooling

### L1b: dtd lint docs/ Coverage

`run_linter()` supports any target path but CI only runs `dtd lint` (defaults to `books/` and `cleaned-references/`). The `docs/` prose is completely unscanned. Adding `docs/` as a target would catch terminology drift in technical documentation.

### L1c: dtd validate --xref in CI

41 known xref warnings exist (see **xref Warnings** in Data Quality). Adding `--xref` to CI requires a baseline suppression file so new warnings are treated as failures without blocking on pre-existing ones.

### L1d: ESLint or Biome for JS/TS

21K+ LOC of vanilla JS/TS has zero static analysis. Biome is zero-config and fast — straightforward to add. Would catch type coercion bugs, unused variables, and import issues.

### L1e: Vitest for src/lib/dtd/\*.ts

No JavaScript unit tests exist anywhere in the project. `tests/` contains only `__init__.py`. CI uses the Astro build as a smoke test. Vitest would cover `dice.ts`, `core.ts`, and the ES module ports.

### L1f: mypy or pyright in CI

Python pipeline has no type checking beyond ruff's basic checks. Not urgent given the codebase is small and well-typed, but a natural next step once tests exist.

### A5: CI Skips --xref and sync-check

`build.yml` runs `dtd validate` but not `dtd validate --xref` or `dtd sync-check`. The 41 known xref warnings are pre-existing data gaps, not regressions. Adding these commands to CI requires the baseline suppression mechanism described in **L1c**.

### Import Extension Convention

Both `.ts` and extensionless imports work in Vite's dev server and Astro's build. The codebase currently mixes both styles. Pick one convention and enforce it — either always use `.ts` extensions or always omit them.

---

## Code Quality

### W3: Dice Logic in Three Independent Copies

The same overflow compression + exploding d10 algorithm is implemented in three places:

1. `src/lib/dtd/dice.ts` — ES module, used by builder and sheet
2. `public/workers/simulation-worker.js` — external worker file, used by success-curves
3. `src/pages/tools/defense-graph.astro` (inside `getWorkerSource()`) — inline blob worker string

The three copies are currently consistent but can diverge silently. A rule change to the overflow formula requires three synchronized edits with no lint or test to catch drift. The defense-graph blob worker should be extracted to a file in `public/workers/` to match the success-curves pattern.

### W4: Divergent Default Character Shapes

`core.ts` `character.DEFAULTS` and `sheet-app.ts` `getDefaultChar()` define parallel but non-identical default character structures:

| Field               | `core.ts DEFAULTS` | `sheet-app getDefaultChar()` |
| ------------------- | ------------------ | ---------------------------- |
| `characteristics.*` | `2` (each)         | `1` (each)                   |
| `trickShots`        | `[]`               | absent                       |
| `backgroundNotes`   | absent             | `{}` (legacy shape)          |
| `devotion`          | `6`                | `0`                          |
| `sanctioned`        | `false`            | `true`                       |

Characters created by the sheet start with characteristics at 1; characters created via core.ts start at 2. When `sheet-app.ts`'s `mergeDefaults()` processes a core.ts character (or vice versa), the differing starting values and missing/extra keys can produce unexpected saves. Resolution is part of the Phase 2 persistence reconciliation.

### core.ts Export Surface Area

`src/lib/dtd/core.ts` exports ~13 top-level symbols including utility functions (`debounce`, `escapeHtml`), data loading (`loadData`, `loadAllData`), character CRUD (`character.*`), derived stat calculations (`derived.*`), and UI helpers (`initAccordion`). This is a "god module" — fine for now but will be hard to maintain if the project grows. A future refactor could split into `util.ts`, `data.ts`, `character.ts`, and `ui.ts`.

### sheet.css Body CSS Selectors

`sheet.css` may contain selectors targeting `body` directly, which could interfere with `ToolLayout.astro` styles. Needs visual testing in-browser to confirm whether the selectors cause layout issues on the deployed site.

---

## Data Quality

### xref Warnings (41 Known)

`npx tsx scripts/validate.ts --xref` produces 41 warnings. These are real data gaps in the JSON files, not bugs — abbreviated feat names in `classes.json` that don't match canonical names in `feats.json`, and skill references in templates that aren't in `skills.json`. The tools work fine with approximate names, but the data should be corrected eventually.

### Lint Info Messages (880)

`npm run lint:data` produces 880 "info" level messages — mostly directional quotes vs straight quotes, en/em dash suggestions, and minor formatting preferences. These are editorial suggestions, not errors. The 8 warnings are worth reviewing individually.

---

## Future Work

### Favicon / OG Image

No custom favicon or OpenGraph social sharing image. Starlight defaults are in use. Low priority until the site has a public audience.

### Performance Audit

No Lighthouse or Core Web Vitals audit has been performed. Should be done before any public launch or promotional push.

### Product Vision

Needs a first product-owner session to define target audience, success metrics, and feature priorities. See `docs/product-vision.md` for the placeholder.
