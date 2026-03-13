# Session Handover

Running context for the current work session. Updated as work progresses — not a logbook.

---

## Current Branch

`session-2026-03-12` (5 commits ahead of `main`)

## Session Objective

Two-phase session: (1) Tool pruning + Preact→React/Zustand/Radix UI migration, (2) Stack health evaluation and fixes per Vercel React best practices.

## What Changed This Session

### Code Layer

| Commit | Description |
|--------|-------------|
| `97a296e` | Character sheet phase 5 + ToolLayout restore + Ariakit TabPanel fix |
| `12e0eb6` | Tool pruning — removed Dice Roller, Success Curves, Defense Graph (25 components), Web Workers, Chart.js |
| `e57d96e` | Preact→React migration — 74 components, 6 Zustand stores, 18 Radix UI primitives |
| `7a9a0d2` | Sanity-check fixes — biome.json path, 14 stale doc refs, Phase 13 history |
| `7b0bfe5` | Stack health — barrel elimination (37 files), re-render fixes (2 App files), dead code cleanup (13 edits), RHF + Knip install |

### Config Layer

- `package.json`: Added `react-hook-form`, `knip`, `"knip"` script
- `knip.json`: New — entry points, project scope, false-positive suppression
- `.github/copilot-skills/frontend-stack-advisor.md`: New skill file

### Deletions

- `src/components/react/ui/index.ts` (barrel file)
- `src/hooks/use-local-storage.ts` (unused hook)
- `src/hooks/use-worker.ts`, `src/workers/` (Web Worker infrastructure)
- 25 Preact tool components (3 removed tools)
- `src/pages/tools/index.astro`, 3 tool astro pages, 3 tool doc specs

### Dead Code Cleaned

- `useData` function removed from `use-data.ts` (only `useAllData` remains)
- `rollPool` function removed from `dice-primitives.ts`
- `AVAILABILITY` constant removed from character-sheet constants
- 9 functions un-exported (internal use only) in ship-builder + character-sheet constants

## Why It Changed

**Tool pruning:** Dice Roller, Success Curves, Defense Graph had low gameplay utility. Chart.js + Web Workers added complexity for niche analysis features. Removing them simplified the migration scope.

**React migration:** Radix UI requires React — the Preact compat shim was unnecessary overhead. Zustand replaced Preact signals for idiomatic React state management. One store per tool gives clear ownership.

**Stack health:** Barrel imports cause bundler deoptimization (Vercel best practices). Full-store destructures in ShipBuilderApp and CombatTrackerApp caused unnecessary re-renders on every state change. Dead code was identified via Knip audit.

**Alternatives rejected:** Staying on Preact (compat shim overhead), React Context + useReducer (more boilerplate than Zustand), keeping barrel (tree-shaking penalty), shadcn/ui migration (deferred — current Radix UI layer works).

## Verification

All automated checks pass:

| Check | Result |
|---|---|
| `bun test` | 182 pass, 0 fail |
| `bun run lint` | 154 files, clean |
| `bun run validate:xref` | 12/12 schemas, 0 xref warnings |
| `bun run lint:data` | 0 errors, 13 warnings, 879 info |
| `bun run sync-check` | races 16/16, classes 103/103, feats 329/329 |

## Known Issues

1. **No browser testing done** — build passes, unit tests pass, but no visual/interaction verification. This is the highest-priority gap.
2. **React Hook Form installed but not integrated** — `react-hook-form@7.71.2` is a dependency but no forms use it yet.
3. **Documentation has stale references** — see sanity-check report for specific findings (development-guide.md hooks table, astro.instructions.md component count, copilot-instructions.md tool spec count).
4. **Phase 13 history incomplete** — stack health work (commit 5) not yet documented in `project-history.md`.

## Areas of Concern

- **Zustand store isolation:** Module-level stores mean two instances of the same tool would share state. Not a problem on single-tool pages, but blocks any future dashboard/multi-tool view.
- **StarlightPage layout:** Tool pages migrated to Starlight's `StarlightPage` component — its CSS constraints (max-width, heading styles) may conflict with tool components. Untested visually.
- **Z-index stacking:** Modals, toasts, sticky headers use uncoordinated z-index values (90–1000). No semantic layer system.

## Suggested Next

1. **Fix stale documentation** — apply sanity-check findings (8 stale references across 4 files)
2. **Browser test all 6 tools** — `bun run dev`, manually verify each tool loads and functions
3. **Document stack health in project-history** — add Phase 13.6 section
4. **Z-index layer system** — define semantic tokens in `tailwind.css`, replace ad-hoc values
5. **Integrate React Hook Form** — start with Character Builder's multi-step form
