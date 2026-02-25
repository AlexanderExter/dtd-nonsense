# Side Tracks

Observations, suspicions, and minor items noticed during work that weren't in scope.

---

## CSS Architecture Tension — Resolved

The project originally had **three CSS layers** that didn't compose cleanly:

1. **Starlight theme** (`src/styles/custom.css`) — WH40K dark/gold theme for doc pages, loaded via `customCss` in astro.config.mjs
2. **Tool components** (`src/styles/tool-components.css`) — shared component classes (`.dtd-tool .btn`, `.card`, `.stat-row`, etc.) intended for tool pages
3. **Per-tool inline styles** — each `.astro` tool page has its own `<style>` block with comprehensive CSS

**Resolution (2026-02-25):** All 9 tools are self-contained. `tool-components.css` was deleted and its import removed from `ToolLayout.astro`. Sheet and builder bring their own CSS via `src/styles/sheet.css` and `src/styles/builder.css`.

---

## core.js Export Surface Area

`src/lib/dtd/core.js` exports **~13 top-level symbols** including utility functions (`debounce`, `escapeHtml`), data loading (`loadData`, `loadAllData`), character CRUD (`character.*`), derived stat calculations (`derived.*`), and UI helpers (`initAccordion`). This is a "god module" — fine for now but will be hard to maintain if the project grows.

A future refactor could split into:

- `util.js` — debounce, escape, notification
- `data.js` — loadData, JSON paths
- `character.js` — CRUD, derived stats
- `ui.js` — accordion, tabs

Not urgent. Only matters if more contributors join.

---

## Web Worker Divergence

Two tools use Web Workers with different patterns:

- **success-curves**: External file (`/workers/simulation-worker.js`)
- **defense-graph**: Inline Blob Worker (worker source as string template)

Both work but the Blob Worker approach is fragile — the worker source code is a JS string inside the main script, which means no syntax highlighting, no linting, and harder to debug. Consider standardizing on external worker files in `public/workers/`.

---

## JSON Data Duplication

Tool JSON data exists in three places:

1. `data/*.json` — canonical source, 12 files
2. `public/data/*.json` — copies for Astro (created by `prebuild.mjs`)
3. Pipeline models (`pipeline/models/`) — Pydantic schemas that validate #1

The copy step (#1 → #2) runs during `npm run build` via `prebuild.mjs`. If someone modifies `public/data/` directly, changes would be overwritten on next build. No guard exists for this.

---

## xref Warnings (41 known)

`uv run dtd validate --xref` produces 41 warnings. These are **real data gaps**, not bugs:

- Abbreviated feat names in `classes.json` that don't match canonical names in `feats.json`
- Skill references in templates that aren't in `skills.json`

These are pre-existing and documented in the baseline. They should be resolved eventually by fixing the JSON data, but they're cosmetic — the tools work fine with approximate names.

---

## Lint Info Messages (880)

`uv run dtd lint` produces 880 "info" level messages. These are mostly:

- Directional quotes vs straight quotes
- En/em dash suggestions
- Minor formatting preferences

These are editorial suggestions, not errors. The 8 warnings are worth reviewing individually.

---

## [2026-02-25] — Character Sheet & Builder Porting

- **debt**: CSS Architecture Tension (above) is now fully resolved and `tool-components.css` has been deleted. See section header for details.

- **debt**: Dual module stack — `src/lib/dtd/core.js` (ES module) and tool-specific copies `src/lib/tools/sheet-app.js` / `builder-app.js`. The tool copies will drift from the ES module versions. _Context_: Copy+edit was the only viable approach after generate-from-scratch failed 3 times.

- ~~**investigation**: Sheet's exotic weapons display~~ **FIXED (2026-02-25 technical-stabilizer)** — Both `tools/character-sheet/sheet.js` and `src/lib/tools/sheet-app.js` had `.concat(this.data.weapons.weapons?.exotic || [])` in the melee weapons datalist builder. `weapons.json` has no `exotic` key (only `ranged`/`melee`/`thrown`). The dead concat was removed from both files.

- **refactor**: Sheet and builder persistence reconciliation — the sheet has its own `getDefaultChar()`, `mergeDefaults()`, and data migration logic that overlaps with `character.*` in core.js. The builder uses core.js's API. Unifying would reduce duplicate default character shapes and migration paths, but risks breaking save compatibility. _Context_: Deliberately deferred during porting to avoid risk.

- **optimization**: Sheet's `body` CSS selectors — sheet.css may contain selectors targeting `body` directly, which could interfere with ToolLayout styles. Needs visual testing to confirm. _Context_: Noticed during code review but not tested in browser.

---

## [2026-02-25] — Technical Stabilizer Pass (Acknowledged Tech Debt)

Items reviewed and accepted as-is during the stabilizer pass. No action needed unless the project scope changes.

- **A4 — No JavaScript unit tests**: `tests/` contains only `tests/__init__.py`. No unit tests exist for any JS module (`core.js`, `dice.js`, ES module ports) or `prebuild.mjs`. CI uses the Astro build as a smoke test only. _Recommended future tool_: Vitest for `src/lib/dtd/` modules.
- **A5 — CI skips `--xref` and `sync-check`**: `build.yml` runs `dtd validate` but not `dtd validate --xref` or `dtd sync-check`. The 41 known xref warnings are pre-existing data gaps, not regressions — adding `--xref` to CI would require a baseline suppression mechanism to avoid treating known warnings as failures.
- **C3 — No ESLint/Biome for vanilla tools**: `tools/**/*.js` has no configured static analysis (21K+ LOC). Accepted as intentional per architecture rationale. Straightforward to add if the tools grow.
- **F2 — Shared module docs may lag ES module ports**: `docs/shared/core-js.md` and `dice-js.md` describe the shared module APIs but were not updated during the `port-sheet-builder` porting session. Verify export lists match after browser testing confirms the port is equivalent to the originals.

---

## [2026-02-25] — Codebase Review Findings

Items found during a full codebase review. Ordered roughly by severity.

---

### B1 — `prebuild.mjs` Runs Twice on `npm run build`

`package.json` has both:

```json
"build": "node scripts/prebuild.mjs && astro build",
"prebuild": "node scripts/prebuild.mjs",
```

npm automatically runs a `prebuild` lifecycle hook before `build`. Since the `build` script also calls `node scripts/prebuild.mjs` explicitly, running `npm run build` invokes `prebuild.mjs` **twice**: once via the lifecycle hook, once from the build command. The second run is redundant and doubles I/O on every build.

**Fix:** Either change `build` to `astro build` only (relying on the lifecycle hook), or rename `prebuild` to something that isn't a reserved npm lifecycle name (e.g., `copy-content`).

---

### B2 — `calculateDerivedStats()` Ignores Halfling Racial Variant

`src/lib/dtd/core.js:98` calls:

```js
staticDefense: derived.calculateSD(c.dexterity, c.wisdom, size),
```

`calculateSD` accepts an `isHalfling` fourth parameter that switches to the `10 + Dex × 6 − Size × 2` formula, but `calculateDerivedStats()` never passes it. Any code that calls the aggregate helper will silently compute the wrong SD for Halflings. Both `builder-app.js` and `sheet-app.js` avoid this by calling `derived.calculateSD()` directly with the flag — but `calculateDerivedStats()` is part of the public API surface and may be called by future tools or tests.

---

### B3 — `character.save()` Does Not Register New Characters in the List

`src/lib/dtd/core.js:276–288`:

```js
save(id, data) {
  localStorage.setItem(this.STORAGE_PREFIX + id, JSON.stringify(data));
  const list = this.list();
  const entry = list.find((c) => c.id === id);
  if (entry) {           // ← only updates; never inserts
    entry.name = data.name || "Unnamed";
    localStorage.setItem(this.STORAGE_LIST_KEY, JSON.stringify(list));
  }
}
```

If a character's ID is not already in the list (e.g., on first save), the character data is written to storage but never added to `dtd_sheet_list`. It becomes orphaned — persisted but invisible to `character.list()` and unreachable from the UI.

`builder-app.js` works around this at `src/lib/tools/builder-app.js:1630–1633` with a manual pre-save list push, but this makes the `character.save()` API surprising. The fix belongs in `save()` itself: if the id is absent from the list, push it.

---

### W1 — Blob Worker URL Leak in `defense-graph.astro`

`src/pages/tools/defense-graph.astro:722–723`:

```js
const blob = new Blob([getWorkerSource()], { type: 'application/javascript' });
worker = new Worker(URL.createObjectURL(blob));
```

The object URL returned by `createObjectURL` is never revoked. Each page load holds a live blob URL in the browser's memory for the entire session. Compare: `core.js:exportJSON()` correctly calls `URL.revokeObjectURL(url)` immediately after the anchor click.

**Fix:** Call `URL.revokeObjectURL(blobUrl)` after the Worker constructor returns. The URL only needs to exist long enough for the browser to start the worker.

---

### W2 — Web Workers Not Terminated on Page Unload

Neither `success-curves.astro` nor `defense-graph.astro` calls `worker.terminate()` when the page is unloaded. Browsers usually GC workers with the page, but explicit cleanup is good practice and prevents issues in SPA-style navigation scenarios where Astro's View Transitions may be added later.

**Fix:** Add a `window.addEventListener('beforeunload', () => worker?.terminate())` guard in both tools.

---

### W3 — Dice Logic in Three Independent Copies

The same overflow compression + exploding d10 algorithm is implemented in:

1. `src/lib/dtd/dice.js` — ES module, used by builder and sheet
2. `public/workers/simulation-worker.js` — external worker file, used by success-curves
3. `src/pages/tools/defense-graph.astro` (inside `getWorkerSource()`) — inline blob worker string

The three copies are currently consistent but can diverge silently. A rule change to the overflow formula (e.g., rounding behavior) requires three synchronized edits with no lint or test to catch drift.

The existing `public/workers/simulation-worker.js` pattern is the right model. The defense-graph blob worker should be extracted to a file in `public/workers/` (see also the pre-existing **Web Worker Divergence** entry above).

---

### W4 — Divergent Default Character Shapes Between `core.js` and `sheet-app.js`

`core.js` `character.DEFAULTS` and `sheet-app.js` `getDefaultChar()` are parallel but not identical:

| Field | `core.js DEFAULTS` | `sheet-app getDefaultChar()` |
|---|---|---|
| `characteristics.*` | `2` (each) | `1` (each) |
| `trickShots` | `[]` | absent |
| `backgroundNotes` | absent | `{}` (legacy shape) |
| `devotion` | `6` | `0` |
| `sanctioned` | `false` | `true` |

Characters created by the sheet will have characteristics starting at 1; characters created by core.js will start at 2. When sheet-app's `mergeDefaults()` processes a core.js character (or vice versa), the differing starting values and missing/extra keys can produce unexpected saves. This is the pre-existing "Sheet and builder persistence reconciliation" debt — logging here for completeness and to capture the specific field-level drift discovered.

---

### B4 — CI: `uv sync --dev` Does Not Install Dev Extras — **FIXED**

`.github/workflows/build.yml` was running:

```yaml
- run: uv sync --dev
- run: uv run ruff check .
```

`--dev` in uv refers to `[dependency-groups].dev` (PEP 735). The project defines its dev tools under `[project.optional-dependencies].dev` (PEP 508 extras). These are separate concepts — `--dev` never installs from the extras section.

Result: after `uv sync --dev`, ruff (and pytest) are not present in the virtual environment. `uv run ruff check .` then fails with a binary-not-found error, blocking every CI run.

**Fixed:** changed `uv sync --dev` → `uv sync --extra dev` in `build.yml`.

Note: the underlying ambiguity (`--dev` silently being a no-op when there are no `[dependency-groups]` defined) is a pyproject.toml structure issue. A future cleanup option is to migrate dev tools to `[dependency-groups]` (uv-native), which makes `--dev` work as expected and removes the need for `--extra dev` in CI.

---

### L1 — Linting Coverage Todos

Outstanding gaps in linting/static-analysis scaffolding, collected as of 2026-02-25.

| # | What | Priority | Notes |
|---|---|---|---|
| L1a | Migrate `[project.optional-dependencies].dev` → `[dependency-groups]` | Low | Makes `uv sync --dev` work idiomatically; removes need for `--extra dev` in CI. One-line pyproject.toml restructure + lock refresh. |
| L1b | Add `dtd lint docs/` coverage | Low | `run_linter()` supports any target path but CI only runs `dtd lint` (defaults to books + cleaned-refs). `docs/` prose is unscanned. |
| L1c | Add `dtd validate --xref` to CI | Medium | 41 known xref warnings exist (see **xref Warnings** section). Needs a baseline suppression file so CI treats new warnings as failures without blocking on pre-existing ones. |
| L1d | Add ESLint or Biome for `tools/**/*.js` | Low | 21K+ LOC of vanilla JS has zero static analysis (C3). Biome is zero-config and fast; straightforward to add. |
| L1e | Add Vitest for `src/lib/dtd/*.js` | Low | No JS unit tests exist (A4). Vitest would cover `dice.js`, `core.js`, and the ES module ports. |
| L1f | Add mypy or pyright to CI | Low | Python pipeline has no type checking beyond ruff's basic checks. Not urgent given the codebase is small and well-typed, but a natural next step once tests exist. |

---

### I1 — Melee Datalist Filter Has Redundant Condition

`src/lib/tools/sheet-app.js:144–145`:

```js
const melee = (this.data.weapons.weapons?.melee || [])
    .filter(w => w.type === 'melee' || !w.range);
```

Items fetched from `weapons.weapons.melee` are melee by definition (the data structure already partitions by category). The secondary filter `|| !w.range` is redundant against the existing data and could accidentally include future weapon entries that lack a `range` field but aren't melee (e.g., a placeholder row). Removing the filter entirely, or using `w.type === 'melee'` alone, is cleaner.
