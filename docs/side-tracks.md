# Side Tracks

Tracked tech debt, deferred work, and future improvements. Grouped by theme, roughly priority-ordered within each group.

Items logged here during stabilization passes, code reviews, and work sessions. Resolved items are removed — see git history for the full log.

---

## TypeScript Migration

### Phase 2: Tool Module Refactor

Break up the monolithic tool apps (`sheet-app.ts`, `builder-app.ts`) into logical sub-modules to reduce maintenance burden and enable per-module typing.

**Revised approach (2026-03-03):** The implementation plan originally proposed splitting each tool into `state.ts`, `calc.ts`, `render.ts`, `events.ts` sub-modules. After analysis, the revised recommendation is a **type-in-place** strategy — fix TypeScript errors directly in the existing files first, then evaluate whether a module split is still warranted. Testing is manual — verify tool behavior before and after changes.

**Current status:** `@ts-nocheck` removed from `sheet-app.ts` (614 TS errors exposed, unfixed). `builder-app.ts` still has `@ts-nocheck` (~422 errors hidden).

`sheet-app.ts` still has its own `getDefaultChar()` / `mergeDefaults()` rather than delegating to `character.DEFAULTS`. Values are now aligned, but the structural duplication remains — resolve during this phase.

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

### A5: CI Skips sync-check

`build.yml` now runs `npm run validate:xref` (xref added 2026-03-09) and `npm run lint:data`, but not `npm run sync-check`. Sync-check could be added to CI to catch markdown↔JSON drift on every push.

---

## Data Quality

### Lint Info Messages (884)

`npm run lint:data` produces 884 "info" level messages — mostly directional quotes vs straight quotes, en/em dash suggestions, and minor formatting preferences. These are editorial suggestions, not errors. The 19 warnings are worth reviewing individually.

> **Baseline note (2026-03-09):** Counts increased from 880→884 info and 8→19 warnings when lint scope expanded to include `books/` alongside `cleaned-references/`.

---

## Future Work

### Favicon / OG Image

### Session Script Robustness

`session-end.mjs` builds its squash commit message by shell-escaping double quotes in commit messages. If any commit message contains backticks, `$`, or other shell metacharacters, the `git commit -m "..."` invocation could break. Consider using `--file` with a temp file for the commit message instead of inline `-m`. Low priority — only matters for exceptional commit messages.
