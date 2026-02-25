# Side Tracks

Observations, suspicions, and minor items noticed during work that weren't in scope.

---

## CSS Architecture Tension

The project has **three CSS layers** that don't compose cleanly:

1. **Starlight theme** (`src/styles/custom.css`) — WH40K dark/gold theme for doc pages, loaded via `customCss` in astro.config.mjs
2. **Tool components** (`src/styles/tool-components.css`) — shared component classes (`.dtd-tool .btn`, `.card`, `.stat-row`, etc.) intended for tool pages
3. **Per-tool inline styles** — each `.astro` tool page has its own `<style>` block with comprehensive CSS

Layer 2 was originally `tools/shared/css/tool-components.css` loaded via `<link>` in vanilla HTML. In Astro, it needs to either be:
- A global import in ToolLayout (currently broken due to scoping)
- Inlined into each tool page that needs it
- Deleted in favor of each tool being fully self-contained

The newly ported tools (this session) are all self-contained — they don't depend on layer 2. The two pre-ported tools (dice-roller, quick-reference) also appear self-contained. This suggests **deleting tool-components.css** might be the cleanest path forward, but it needs verification against character-sheet and character-builder when they're ported.

---

## core.js Export Surface Area

`src/lib/dtd/core.js` exports **30+ symbols** including utility functions (`debounce`, `escapeHtml`, `showNotification`), data loading (`loadData`), character CRUD, derived stat calculations, and UI helpers (`initAccordion`). This is a "god module" — fine for now but will be hard to maintain if the project grows.

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
1. `tools/shared/data/*.json` — canonical source, 12 files
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

- **debt**: CSS Architecture Tension (above) is now fully resolved — all 9 tools are self-contained. `tool-components.css` can be safely deleted. *Context*: Sheet and builder both bring their own CSS via `src/styles/sheet.css` and `src/styles/builder.css`, neither references tool-components.css classes.

- **debt**: Triple module stack — vanilla `tools/shared/js/core.js`, ES module `src/lib/dtd/core.js`, and now tool-specific copies `src/lib/tools/sheet-app.js` / `builder-app.js`. The tool copies will drift from originals. *Context*: Copy+edit was the only viable approach after generate-from-scratch failed 3 times. But it creates a maintenance surface.

- **investigation**: Sheet's exotic weapons display — open-questions entry #55 documents a real bug where exotic weapons never render in the character sheet's combat tab. Both `tools/character-sheet/sheet.js` and `src/lib/tools/sheet-app.js` contain this bug identically. *Context*: `this.data.weapons.weapons?.exotic` accesses a key that doesn't exist in the JSON structure.

- **refactor**: Sheet and builder persistence reconciliation — the sheet has its own `getDefaultChar()`, `mergeDefaults()`, and data migration logic that overlaps with `character.*` in core.js. The builder uses core.js's API. Unifying would reduce duplicate default character shapes and migration paths, but risks breaking save compatibility. *Context*: Deliberately deferred during porting to avoid risk.

- **optimization**: Sheet's `body` CSS selectors — sheet.css may contain selectors targeting `body` directly, which could interfere with ToolLayout styles. Needs visual testing to confirm. *Context*: Noticed during code review but not tested in browser.
