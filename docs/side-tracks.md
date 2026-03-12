# Side Tracks

Prioritized backlog of tech debt, deferred work, and improvement opportunities. Each item has a concrete next action.

Resolved items are removed on each review — git history preserves the full log.

**Last reviewed:** 2026-03-12

---

## Active Backlog

Items worth doing soon, priority-ordered.

### Character Sheet: IdentityTab Race Preview Still Uses `statBonuses`

**File:** `src/components/react/tools/character-sheet/tabs/IdentityTab.tsx`
**Issue:** The `charBonusOptions` was fixed (`charBonus?.options`), and `skillBonus` was fixed, but race data has no `statBonuses` property — the old conditional `{selectedRace.statBonuses && ...}` was removed during this session. Verify the race preview section shows all useful race data (languages, notes, power, size, skill bonuses).
**Next action:** Manual visual check that race selection previews display correctly.

### UI Primitives: Tool-Local Patterns Not Yet Abstracted

**Scope:** Patterns intentionally kept as tool-local implementations during the Radix UI migration:

- **× remove buttons** — All tools' inline remove/delete buttons use custom transparent styling (no `.btn` class), visually different from `CloseButton`. ~20 instances across 6 tools.
- **AccordionSection.tsx** (Quick Reference) — Controlled accordion for expand/collapse all. Uses `isOpen`/`onToggle` props. The `AccordionItem` primitive supports controlled mode but AccordionSection has additional custom styling.
- **StepAccordion.tsx** (Character Builder) — Step wizard with numbered indicators, completion badges, active step highlighting. Domain-specific enough to stay local.
- **Domain badges** — Dice outcome colors, ship console types, wound status, NPC threat levels. Use non-standard color tokens or inline style maps. ~12 instances.
- **Mode toggles / filter groups** — Ship Builder hull filters, mode selector. Complex conditional active states with domain logic.
**Next action:** No immediate action needed. If a pattern appears in 3+ tools, consider abstracting into a primitive. Track during future tool work.

### Tool CSS: Z-Index Stacking Conflicts

**Files:** Multiple components in `src/components/react/tools/`
**Issue:** Modals, toasts, sticky headers, and popups use uncoordinated z-index values (90–1000). ConditionPicker uses inline `zIndex: 1000`, ImportModal uses `z-[200]`, toasts use `z-[100]`–`z-[250]`, headers use `z-[100]`. Elements can appear above or behind each other unexpectedly.
**Next action:** Define a semantic z-index layer system in `tailwind.css` `@theme` block (e.g., `--z-sticky: 100`, `--z-modal: 300`, `--z-toast: 400`, `--z-popup: 500`). Replace all ad-hoc values.

### Tool CSS: ConditionPicker Viewport Overflow

**File:** `src/components/react/tools/combat-tracker/ConditionPicker.tsx`
**Issue:** Popup positioned with `position: fixed` using only `anchorRect.bottom + 4` and `anchorRect.left`. No viewport boundary checks — can render off-screen on small viewports or near page edges. Uses inline styles instead of Tailwind utilities.
**Next action:** Add viewport boundary checks (flip above anchor if too close to bottom, clamp left/right to viewport). Refactor inline styles to Tailwind utilities where possible.

---

## Investigation

Items needing research or design decisions before action.

### Zustand Store Isolation

**Issue:** All tool state lives in Zustand stores at module level. Two instances of the same tool component on one page would share state. Not a problem today (single-tool pages) but blocks any future dashboard or multi-tool view.
**Next action:** If a dashboard becomes a priority, evaluate scoped store providers or component-instance stores. No action needed until then.

### No Runtime/Browser Testing

**Issue:** Build and unit tests pass, but no visual or interaction verification exists. CSS fidelity from Tailwind migration is inferred, not observed.
**Next action:** Manual: run `bun run dev` and test each tool in a browser, focusing on Combat Tracker (modals/popups) and tools with sticky sidebars. Automated: evaluate Playwright or similar only if manual testing reveals critical issues.

### StarlightPage Migration: Tool Layout Regression Risk

**Issue:** All 6 tool pages were migrated from a custom `ToolLayout.astro` to Starlight's `StarlightPage` component (2026-03-12). Starlight's content area applies its own CSS (max-width constraints, heading styles, table styles) that may conflict with tool components. Modals need proper z-index stacking above Starlight chrome.
**Next action:** Visually verify every tool page in a browser. Check: (1) modals/popups appear above the Starlight sidebar/header, (2) print styles still work for NPC/Ship tools, (3) sticky headers in CharacterManager don't conflict with Starlight's sticky header.

### Zod v4 Upgrade Blocked by Astro

**Issue:** Zod v4 passes `bun run check` but fails `bun run build` — Astro 5.x internally creates Zod v3 schema objects that crash through the v4 parse engine (`undefined._zod`).
**Blocker:** `zod-to-json-schema` ecosystem coordination. Resolved when Astro upgrades to Zod v4 natively (likely Astro 6.0).
**Next action:** Monitor Astro changelog. When Astro 6.0 ships, bump `zod` — project schemas require zero code changes.

### Starlight 0.37 Features

**Source:** Upgrade briefing 2026-03-09
**Opportunities:**

- Expressive Code syntax highlighting themes — could customize in `astro.config.mjs`
- Improved sidebar group collapsing — review sidebar config for UX improvements
**Next action:** Evaluate during a future polish pass. Low priority.

---

## Dependency Override Lifecycle

Active `package.json` overrides that should be removed when upstream fixes land.

| Override | Why | Remove When |
|----------|-----|-------------|
| `"svgo": "^4.0.1"` | Patches DoS via DOCTYPE entity expansion (GHSA-xpqw-6gx7-v673) introduced by `astro@5.18` | `bun pm ls svgo` shows `4.0.1+` without "overridden" marker |
| `"path-to-regexp": "^8.0.0"` | Fixes ReDoS in `@vercel/routing-utils` (via `@astrojs/vercel`) | `@vercel/routing-utils` ships `path-to-regexp >= 8.0.0` natively |

---

## Test Coverage Gaps

### Hooks — 0 Tests

| Hook | Functions | Complexity | Priority |
|------|-----------|-----------|----------|
| `use-local-storage.ts` | `useLocalStorage<T>()` | Low — needs localStorage mock + signal tracking | **High** (most isolated) |
| `use-data.ts` | `useData<T>()`, `useAllData()` | Medium — needs fetch mock | **Medium** |

### Browser APIs — Untestable Without jsdom

`character.exportJSON()` and `character.importJSON()` use Blob/File APIs. Can't unit test with bun:test. Would need jsdom or browser test harness.

### Component Layer — 72 Components, 0 Tests

Would require `@testing-library/react` dependency. Not justified until specific component bugs emerge.

---

## Data Quality

### Lint Baseline

`bun run lint:data` produces **0 errors, 12 warnings, 881 info** across 101 markdown files.

- **Info messages** (881): Editorial suggestions — dice notation formatting (619), empty table cells (262). Not errors.
- **Warnings** (12): 3 heading hierarchy skips (source structure), 9 terminology (7 in project-conventions.md "Not This" column + 2 meta-references in docs — all intentional).
- **Baseline date:** 2026-03-12

---

## Tech Stack Validation

**Context:** The tech stack was assembled incrementally by AI agents, not deliberately designed. Some configuration may be suboptimal or cargo-culted.

### Items Audited (2026-03-11)

| Config | Status | Notes |
|--------|--------|-------|
| `biome.json` | ✅ Clean | Supervised review completed; tailwind directives, HTML support, per-directory overrides |
| `.gitattributes` | ✅ Clean | LF enforcement added 2026-03-09 (resolves CRLF/Biome conflict) |
| `.gitignore` | ✅ Clean | Covers generated content, lockfile, caches, source PDFs |
| `tsconfig.json` | ✅ Reasonable | Extends `astro/tsconfigs/strict`, `jsx: react-jsx`, `jsxImportSource: react`, `moduleDetection: force` |
| `astro.config.mjs` | ✅ Clean | Static output, Vercel adapter, React, Tailwind vite plugin |
| `bunfig.toml` | ✅ Minimal | Shell + test config only |
| `package.json` `engines` | ⚠️ Removed | Was `>=20 <22` — Vercel controls Node version, not us. Constraint removed. |

### Remaining Concerns

- `tsconfig.json` has `noFallthroughCasesInSwitch: true` but no `noUncheckedIndexedAccess` — could catch undefined-access bugs in data handling code. Evaluate adding it.
- No `.nvmrc` or `.node-version` file — CI uses `actions/setup-node` with `node-version: 20`, Vercel auto-detects. If Node version drift causes issues, add a pinning file.

---

## Someday / Maybe

Low-priority items or ideas that don't justify current effort.

- **CI lean-ness audit**: CI runs Biome lint + tests + validation + content lint + full Astro build. Consider whether the full Astro build is necessary on every push, or only on PRs to main.
- **Component count tracking**: True count is 97 .tsx files across 9 tools (as of 2026-03-11). The side-tracks previously said 115, architecture said ~100. Now aligned.
- **`vitest` stale reference**: The dependency upgrade briefing (2026-03-09) mentions `vitest@4.0.18` in its pinning decisions, but the project uses `bun:test`. vitest is not in `package.json`. The reference is either from an earlier project state or an error in the briefing. No action needed — just noting the discrepancy.
