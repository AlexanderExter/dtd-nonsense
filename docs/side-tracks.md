# Side Tracks

Tracked tech debt, deferred work, and future improvements. Grouped by theme, roughly priority-ordered within each group.

Items logged here during stabilization passes, code reviews, and work sessions. Resolved items are removed — see git history for the full log.

---

## TypeScript Migration

### Phase 2: Tool Module Refactor

Break up the monolithic tool apps (`sheet-app.ts`, `builder-app.ts`) into logical sub-modules to reduce maintenance burden and enable per-module typing.

**Revised approach (2026-03-03):** The implementation plan originally proposed splitting each tool into `state.ts`, `calc.ts`, `render.ts`, `events.ts` sub-modules. After analysis, the revised recommendation is a **type-in-place** strategy — fix TypeScript errors directly in the existing files first, then evaluate whether a module split is still warranted. This avoids a risky structural refactor before Playwright E2E tests exist to catch regressions.

**Current status:** `@ts-nocheck` removed from `sheet-app.ts` (614 TS errors exposed, unfixed). `builder-app.ts` still has `@ts-nocheck` (~422 errors hidden). Phase 5 of the implementation plan covers the actual error fixing.

Also covers: resolving the persistence duplication between `sheet-app.ts` (`getDefaultChar`, `mergeDefaults`) and `core.ts` (`character.DEFAULTS`, `character.validate`). See **W4** below for specific field-level drift.

### Phase 3: Reactivity Layer

Open consideration — depends on Phase 2 outcome. If the module refactor still leaves DOM manipulation feeling painful, consider a lightweight reactivity layer:

- **Preact** (`@astrojs/preact`, 7KB) — identical React API, zero extra config, Astro island-compatible. Best fit for reactive components without ecosystem commitment.
- **React** (`@astrojs/react`) — worth it only if shadcn/Radix library is a confirmed target or React-familiar contributors are expected.
- **No framework** — if Phase 2's module split makes vanilla TS clean enough, skip entirely. This is a real outcome worth evaluating before committing.

Start with the dice roller (smallest tool) as a proof-of-concept island before migrating sheet/builder.

---

## Infrastructure & Tooling

### L1b: lint:data docs/ Coverage

`scripts/lint.ts` supports target paths, but CI currently runs `npm run lint:data` with default scope (`books/` and `cleaned-references/`). The `docs/` prose is unscanned. Adding `docs/` as a target would catch terminology drift in technical documentation.

### L1c: validate --xref in CI

41 known xref warnings exist (see **xref Warnings** in Data Quality). Adding cross-reference validation to CI requires a baseline suppression file so new warnings are treated as failures without blocking on pre-existing ones.

### A5: CI Skips --xref and sync-check

`build.yml` runs `npm run validate` and `npm run lint:data` but not cross-reference validation mode or `npm run sync-check`. The known xref warnings are pre-existing data gaps, not regressions. Adding those checks to CI requires the baseline suppression mechanism described in **L1c**.

### Import Extension Convention

Both `.ts` and extensionless imports work in Vite's dev server and Astro's build. The codebase currently mixes both styles. Pick one convention and enforce it — either always use `.ts` extensions or always omit them.

### Bun Migration

Pipeline scripts currently run via `npx tsx`. The implementation plan originally called for Bun as the TypeScript runner (Open Question #2: "Commit to Bun, we will revert the branch if it proves unworkable"), but the executing agent used tsx instead. Commit `1429809` confirms scripts work with both `npx tsx` and `bun run`. Bun offers faster cold starts and native TypeScript execution, but tsx is proven stable in CI. Revisit if Bun's CI story matures or if script execution time becomes a bottleneck.

---

## Code Quality

### W3: Dice Logic Centralized

**Status:** ✅ Resolved (2026-03-04)

The same dice rolling logic (overflow compression + exploding d10s) was previously implemented in two independent places:

1. `src/lib/dtd/dice.ts` — ES module, used by builder and sheet
2. `public/workers/dice-common.js` — external worker file, used by success-curves

**Solution:** Extracted core primitives into `src/lib/dtd/dice-primitives.ts` as the **canonical source**:

- `rollOneDie()` — single d10 with explosion
- `compressOverflow()` — overflow compression formula
- `rollPool()` — full pool rolling

Now:

- `dice.ts` imports primitives from `dice-primitives.ts`
- `dice-common.js` is explicitly marked as derived; must be kept in sync manually
- Defense-graph blob worker (extracted separately in Phase 3D) contains its own independent logic; marked for future care

**Maintenance rule:** Any change to the D:TD dice formula requires synchronized updates to ALL THREE locations (dice-primitives.ts, dice.ts imports, dice-common.js).

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
