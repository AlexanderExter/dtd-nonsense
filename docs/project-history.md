# Project History

Narrative account of the DTD tools development: what was planned, what was built, what changed, and key lessons learned.

---

## Development Phases

The project followed a phased roadmap produced from a full codebase audit in February 2026. All phases have been completed.

### Phase 0 — Foundation Cleanup

**Goal:** Eliminate technical debt blocking downstream work.

Four independent tasks, parallelizable:

| Task                         | What Was Done                                                                                                                                                                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 New Dice Module          | Replaced three independent dice implementations (core.js, dice.js, session.js) with a single `DTD.dice` namespace. Clean API: `roll()`, `calculateOutcome()`, `parseNotation()`, `formatResult()`, `compressOverflow()`. Backward-compat aliases for old callers. |
| 0.2 Format Canonicalization  | Established Character Sheet's JSON as the single canonical schema. Created `DTD.character` namespace with CRUD, validation, and legacy migration. Builder exports now produce Sheet-compatible JSON.                                                              |
| 0.3 Play Session Deprecation | Deleted `tools/play-session/` entirely. Features migrated: HP/resource tracking → Combat Tracker, full stat display → Character Sheet, dice rolling → shared `DTD.dice`.                                                                                          |
| 0.4 Shared Infra Updates     | Added `DTD.derived` namespace (stat formula functions), updated `tools/index.html` dashboard and `IMPLEMENTATION.md`.                                                                                                                                             |

### Phase 1 — Gameplay Essentials

**Goal:** Tools needed for actual play sessions.

| Tool                           | Sessions | Key Decisions                                                                                                                                                                                             |
| ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 Combat Tracker             | ~3-4     | Object literal pattern (`Tracker`). Imports from Character Sheet via `DTD.character.load()`. Hardcoded conditions/actions (no JSON — small static lists). Reference sidebar with collapsible sections.    |
| 1.2 Character Builder Revision | ~3-4     | Full rewrite in place. 11-step accordion wizard. Outputs canonical Sheet-format JSON. Priority allocation UI for 6/4/2 characteristics and 8/6/4 skills. Running XP budget with per-category breakdown.   |
| 1.3 Quick Reference            | ~1-2     | All content hardcoded (no JSON data files — avoids maintaining another sync point). Content sourced from `cleaned-references/` during development. Global search with fuzzy matching, accordion sections. |

### Phase 2 — New Tools

**Goal:** Tools for specific game subsystems.

| Tool              | Sessions | Key Decisions                                                                                                                                                                                                                                                           |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 NPC Generator | ~2-3     | Manual stat block builder (not randomizer). Auto-calculated derived stats from `DTD.derived`. Trait system with parameterized effects (Daemonic, Machine, etc.). 40+ pre-built templates from `19-Antagonists.md`. New data files: `npc-templates.json`, `traits.json`. |
| 2.2 Ship Builder  | ~4-5     | Dual-mode tool: Builder (hull + consoles + weapons + shields + crew) and Sheet (combat tracking with shield/hull HP, initiative, criticals, department actions). New data file: `ships.json`. Most complex tool in the suite.                                           |

### Phase 3 — Analysis Tools

**Goal:** Mathematical visualization for game balance.

| Tool               | Sessions | Key Decisions                                                                                                                                                                                           |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 Success Curves | ~2-3     | Monte Carlo simulation (100,000 trials) in Web Worker. Chart.js for line/bar charts. Up to 4 dice pools compared simultaneously. Presets for common pools. URL hash state sharing.                      |
| 3.2 Defense Graph  | ~3-4     | IIFE pattern (`DefGraph`). Damage pipeline waterfall, effective HP curves, hit probability analysis, armor trade-off comparisons, location heat map. Chart.js + Canvas API. Web Worker for simulations. |

### Phase 4 — Character Sheet Polish

**Goal:** Technical cleanup and quality-of-life improvements.

Completed items:

- Weapon auto-fill from datalist
- XP cost calculator integration
- Refactored to use shared `DTD.character` and `DTD.derived` APIs
- Conditions tracker removed (migrated to Combat Tracker)
- Print stylesheet audit

### Phase 5 — Python Pipeline

**Goal:** Machine-verified data integrity and Astro/Starlight migration preparation.

| Component          | What Was Built                                                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 Schema Models  | 12 Pydantic v2 models (`pipeline/models/`) matching every JSON data file. StrictModel for tight validation, LenientModel for evolving files. Handles polymorphic types (union fields for feat subOptions, racial power options). |
| 5.2 Validation CLI | `dtd validate --xref` — schema validation + cross-reference checks (class→skill, class→feat, NPC→trait). Handles OR-choice feat entries and dict-form trait references.                                                          |
| 5.3 Content Linter | `dtd lint` — terminology enforcement, formatting rules (heading hierarchy, table cells, dice notation), encoding corruption detection, with `--fix` auto-correction.                                                             |
| 5.4 Starlight Prep | `dtd starlight-prep` — injects Zod-compatible YAML frontmatter into `cleaned-references/` for Astro content collections.                                                                                                         |
| 5.5 Sync Checker   | `dtd sync-check` — markdown↔JSON drift detection for races, classes, feats.                                                                                                                                                      |

**Status:** All 12 JSON files pass full validation. ~41 cross-ref warnings remain — all are genuine data quality issues (abbreviated feat names in classes.json, missing skills like "Craft"). Pipeline is the primary gate for data quality before the Astro migration.

### Phase 6 — Astro/Starlight Migration

**Goal:** Publish rules and tools as a static documentation site with search, navigation, and theming.

| Component               | What Was Built                                                                                                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 Scaffold            | `astro.config.mjs`, `package.json`, `tsconfig.json`, `content.config.ts` — Astro 5 + Starlight with Vercel adapter, 8 sidebar groups                                                                              |
| 6.2 Content Pipeline    | `scripts/prebuild.mjs` — copies 24 cleaned-references (lowercased), 53 book chapters, and 12 JSON data files into Astro structure                                                                                 |
| 6.3 Theme               | `custom.css` (WH40K dark/gold theme overriding Starlight CSS custom properties), `tool-components.css` _(later deleted 2026-02-25 — all tools are self-contained; see side-tracks.md § CSS Architecture Tension)_ |
| 6.4 Shared ES Modules   | ES module ports of `core.js` and `dice.js` in `src/lib/dtd/` — named exports replacing `DTD.*` global namespace                                                                                                   |
| 6.5 Tool Infrastructure | `ToolLayout.astro` wrapper, tools index dashboard, `@/` path alias for imports                                                                                                                                    |
| 6.6 Tool Ports          | **9/9 tools fully ported**: Dice Roller, Quick Reference, Success Curves, NPC Generator, Defense Graph, Combat Tracker, Ship Builder, Character Sheet, Character Builder                                          |
| 6.7 ~~Stub Pages~~      | All tools now ported — no stubs remaining                                                                                                                                                                         |
| 6.8 Infrastructure      | `README.md`, `.github/workflows/build.yml` CI, npm audit fixed (0 vulnerabilities), speed formula corrected in Quick Reference                                                                                    |
| 6.9 Git & Deployment    | History squashed (295 → 1 commit), pushed to `github.com/AlexanderExter/dtd-nonsense`, Vercel deployment pending                                                                                                  |

**Status:** Build produces ~90 pages in ~9s. Pagefind indexes 78 content pages. **9/9 tools fully ported.** Repo live on GitHub. Migration complete — see [architecture.md](architecture.md) for the current system design.

---

## Phase 7 — Technical Stabilizer + Project Lean Cleanup (2026-02-25)

**Goal:** Audit for accumulated debt, remove dead code and obsolete structure, reduce the project to its leanest form post-migration.

| Component     | What Was Done                                                                                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 Bug Fix   | Removed dead `.concat(this.data.weapons.weapons?.exotic \|\| [])` from character sheet melee datalist builder — `weapons.json` has no `exotic` key (`ranged`/`melee`/`thrown` only)     |
| 7.2 Dead Code | Removed vestigial `pagefind-ui.css` `<link>` from `ToolLayout.astro` (caused silent 404 in dev; tool pages have no Pagefind UI)                                                         |
| 7.3 Dead Code | Removed dead `.tool-card.coming-soon` CSS block from `tools/index.html` before deletion (all 9 tools were `status ready`)                                                               |
| 7.4 Data Move | Moved canonical JSON data from `tools/shared/data/` → `data/` at project root. Updated `pipeline/__init__.py` and `scripts/prebuild.mjs`. `dtd validate` passes at new location.        |
| 7.5 Deletion  | Deleted entire `tools/` directory — 32 files, ~21,800 LOC of vanilla HTML/CSS/JS. All 9 tools are live on Astro; the standalone copy served no further purpose.                         |
| 7.6 Docs      | Removed vanilla JS layer sections from `docs/architecture.md` and `docs/development-guide.md`; updated all `tools/shared/` path references across 16 files; reset `session-handover.md` |

**Status:** Project is at its leanest post-migration form. `data/` is the single JSON source. `src/pages/tools/` is the single tool deployment. No dual-stack maintenance surface.

---

## Phase 8 — Technical Stabilization (2026-03-03)

**Goal:** Eliminate latent bugs, dead code, and stale documentation accumulated during the Astro migration and TypeScript conversion.

| Component              | What Was Done                                                                                                                                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.1 Dead Code Removal  | Removed 11 unused exports across `core.ts` (6), `dice.ts` (2), and `pipeline/models/common.py` (3). Also removed 3 unused CSS classes and 1 unused Python constant.                                                                                                                                   |
| 8.2 Bug Fixes          | Fixed `character.save()` not registering new characters in the list (one-time creation bug). Fixed Blob Worker URL memory leak in defense-graph. Fixed workers not terminated on page unload (defense-graph, success-curves). Fixed pipeline Unicode crash on Windows (Rich library cp1252 encoding). |
| 8.3 Import Cleanup     | Converted all `.js` → `.ts` import extensions across 9+ source files — leftover from Phase 7's TypeScript rename that the bundler silently resolved.                                                                                                                                                  |
| 8.4 Dependency Cleanup | Removed unused `sharp` and `@astrojs/check` packages. Resolved all 6 npm audit vulnerabilities down to 0.                                                                                                                                                                                             |
| 8.5 Documentation      | Rewrote `core-js.md` and `dice-js.md` from actual TypeScript source. Updated all 9 tool docs for Astro file paths. Fixed stale `DTD.*` global references across `architecture.md`, dev guide, data reference, and tool-development skill.                                                             |
| 8.6 Prebuild Fix       | Removed duplicate prebuild invocation in build script — was running twice due to both an explicit call and an npm lifecycle hook.                                                                                                                                                                     |

**Branch:** `technical-stabilizer`, 12 commits.

**Status:** All latent bugs from the migration resolved. Documentation fully aligned with current TypeScript source. Zero npm audit issues. No dead code remaining in shared modules.

---

## Phase 9 — Python-to-TypeScript Pipeline Consolidation (2026-03-04)

**Goal:** Eliminate the dual Python/TypeScript stack by porting all pipeline functionality to TypeScript and deleting the Python pipeline.

| Component                | What Was Done                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 9.1 Pipeline Port        | All pipeline commands ported to TypeScript: `scripts/validate.ts`, `scripts/lint.ts`, `scripts/sync-check.ts`. Starlight frontmatter injection folded into `scripts/prebuild.mjs`.               |
| 9.2 Schema Migration     | Pydantic models in `pipeline/models/` replaced by Zod schemas in `src/lib/dtd/schemas/` (already existed; now the sole source of truth).                                                         |
| 9.3 Python Deletion      | Deleted `pipeline/` directory, `pyproject.toml`, and `uv.lock`. Removed all `uv`, `ruff`, and Python dependencies.                                                                               |
| 9.4 Documentation Update | Updated all docs (`pipeline.md`, `architecture.md`, `project-conventions.md`, `development-guide.md`, `data-reference.md`, `copilot-instructions.md`, etc.) to reference TypeScript equivalents. |

**Status:** Project is now a single-stack TypeScript/Node project. No Python dependencies remain. All validation, linting, and sync checking runs via `npm run` scripts.

---

## Phase 10 — Dice Logic Deduplication & Final Stabilization (2026-03-04)

**Goal:** Eliminate silent divergence risk by extracting shared dice primitives into canonical source, and finalize Python artifact cleanup.

| Component                    | What Was Done                                                                                                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10.1 Dice Primitives Extract | Created `src/lib/dtd/dice-primitives.ts` — canonical source for `rollOneDie()`, `compressOverflow()`, `rollPool()` explosion/overflow logic. Reduced duplication between `dice.ts` and worker file. |
| 10.2 Dice Module Refactor    | Updated `src/lib/dtd/dice.ts` to import core primitives from `dice-primitives.ts`. Public API unchanged; internal deduplication complete. 51 lines of code reduction.                               |
| 10.3 Worker Maintenance Spec | Updated `public/workers/dice-common.js` header to mark as "DERIVED copy" with explicit sync requirement. Clear maintenance rule in `docs/side-tracks.md`.                                           |
| 10.4 Python Artifact Cleanup | Deleted `.venv/` and `.ruff_cache/` directories. Removed Python ignore patterns from `.gitignore` (3 patterns removed).                                                                             |
| 10.5 Documentation Coherence | Updated `docs/shared/dice-js.md` "Modification Checklist" to reference `dice-primitives.ts`. Updated `docs/architecture.md` module listing to include primitives.                                   |

**Status:** Code stable. 187/187 tests pass. No regressions detected. Python fully removed from project. Dice logic canonical source established with explicit maintenance contract.

---

## Phase 11 — Technical Stabilization & Session Automation (2026-03-09)

**Goal:** Resolve accumulated tech debt, fix data quality issues, and replace repetitive agent git ceremony with deterministic scripts.

| Component                        | What Was Done                                                                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11.1 Biome Auto-fix              | Resolved all 44 Biome lint errors across 44 files via `biome check --write`.                                                                                          |
| 11.2 Xref Warnings               | Fixed all 41 cross-reference warnings in `classes.json` (skill/feat name corrections).                                                                                |
| 11.3 Character Defaults (W4)     | Aligned default character shapes between `character.ts` and sheet app module (later migrated to Preact in Phase 12).                                                  |
| 11.4 Documentation Cleanup       | Deleted stale `implementation-plan.md` and `External-audit.md`. Removed Playwright/E2E references. Added anti-drift pitfall to conventions. Removed hardcoded counts. |
| 11.5 Verification Infrastructure | Added `bun run check` (tests → lint → validate+xref → content lint). Updated CI to run `validate:xref`.                                                               |
| 11.6 Session Lifecycle Scripts   | Created `session-start.mjs`, `session-end.mjs`, `session-status.mjs` — deterministic branch management + squash-merge. Added `bun run prepare` for hook installation. |
| 11.7 Pre-commit Hook             | `.githooks/pre-commit` runs `bun run check` before every commit. Installed via `git config core.hooksPath .githooks`.                                                 |

**Status:** All checks pass (187 tests, 12/12 schemas, 0 xref warnings, 0 lint errors). Session automation replaces manual git ceremony.

---

## Phase 12 — Preact + Tailwind CSS v4 Migration (2026-03-10)

**Goal:** Migrate all 9 interactive tools from vanilla TypeScript DOM manipulation to Preact Islands with `@preact/signals` state management and Tailwind CSS v4 utility styling.

| Component                       | What Was Done                                                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.0 Foundation                 | Added `@astrojs/preact` (compat mode), `@preact/signals`, `@tailwindcss/vite`, `@astrojs/starlight-tailwind`. Updated `astro.config.mjs`, `tsconfig.json`, `biome.json`.                       |
| 12.1 Shared Infrastructure      | Created 4 custom hooks: `use-data.ts` (JSON loading), `use-local-storage.ts` (persistence), `use-worker.ts` (Web Workers), `use-debounce.ts` (input debouncing).                               |
| 12.2 Dice Roller                | First Preact tool — 6 components. Proof-of-concept for the island pattern.                                                                                                                     |
| 12.3 Data Display Tools         | Quick Reference (13 components), Success Curves (9), Defense Graph (10) — read-only or analysis tools.                                                                                         |
| 12.4 Stateful Tools             | Combat Tracker (9 components), NPC Generator (12), Ship Builder (12) — tools with persistent state and complex UI.                                                                             |
| 12.5 Complex Tools              | Character Builder (18 components), Character Sheet (16) — the two largest tools with multi-tab UIs and full character CRUD.                                                                    |
| 12.6 CSS Token Bridge           | Tailwind `@theme` tokens in `src/styles/tailwind.css` as single source of truth. `ToolLayout.astro` bridges tokens → short `var(--name)` aliases.                                              |
| 12.7 Documentation              | Updated `architecture.md`, `development-guide.md`, `astro.instructions.md`, `copilot-instructions.md`. Created `preact-implementation-plan.md`.                                                |

**Totals:** 105 Preact components across 9 tools, 4 custom hooks, 12 commits on the `preact-tailwind` branch.

**Decisions:**

| Decision              | Choice                             | Rationale                                                                               |
| --------------------- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| Hydration directive   | `client:load` for all tools        | Tools are interactive immediately — no benefit to deferred hydration                     |
| State management      | Module-level `@preact/signals`     | Simpler than context providers; persistent across re-renders; works with Astro islands   |
| CSS strategy          | Tailwind utilities + token bridge  | Single source of truth for design tokens; utilities reduce CSS volume                    |
| Preact mode           | Compat (`preact/compat`)           | Enables React library compatibility if needed; no performance penalty                    |

**Status:** All automated checks pass (0 errors, 19 warnings, 187 tests, 89 pages). Manual browser testing of all 9 tools still pending.

---

## Phase 13 — Tool Pruning + React Migration (2026-03-12)

**Goal:** Remove underused analysis tools, then migrate the remaining 6 tools from Preact/Signals/Ariakit to React/Zustand/Radix UI for better ecosystem support and component quality.

| Component                       | What Was Done                                                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13.0 Tool Pruning               | Removed Dice Roller (6 components), Success Curve Analyzer (9), Defense Graph Simulator (10). Deleted Web Worker infrastructure (`src/workers/`, `use-worker.ts`, `use-debounce.ts`). Removed Chart.js dependency. Deleted tool hub page (`src/pages/tools/index.astro`) and tool docs. |
| 13.1 Framework Swap             | Replaced `@astrojs/preact` → `@astrojs/react`, `@preact/signals` → `zustand`, `@ariakit/react` → `radix-ui`. Updated `astro.config.mjs`, `tsconfig.json`, `package.json`.                     |
| 13.2 State Management           | Created 6 Zustand stores (one per tool) replacing module-level signals. Stores use Zustand with localStorage for persistence where needed.                                                      |
| 13.3 UI Primitives              | Rewired 18 shared UI primitives from Ariakit to Radix UI (Accordion, Combobox, Dialog, Select, Tabs, Tooltip). Added `Toast.tsx` (ephemeral notifications via `useSyncExternalStore`).          |
| 13.4 Component Migration        | Migrated 74 tool components across 6 tools from Preact JSX to React JSX. Signals → Zustand selectors, `class` → `class` (preserved for Astro), Ariakit props → Radix API.                     |
| 13.5 Documentation              | Updated `architecture.md`, `development-guide.md`, `copilot-instructions.md`, `astro.instructions.md`. Removed `preact-implementation-plan.md`.                                                |
| 13.6 Stack Health               | Eliminated UI barrel file (`ui/index.ts`), rewrote 37 consumer imports to direct paths. Fixed Zustand re-renders in ShipBuilderApp + CombatTrackerApp (full-store destructure → individual selectors). Removed dead code: `useData`, `rollPool`, `useLocalStorage` hook, `AVAILABILITY` constant. Un-exported 9 internal-only functions. Installed `react-hook-form` (not yet integrated) and `knip` (dead code analyzer) with config. |

**Totals:** 216 files changed (5,824 insertions, 8,816 deletions). 74 React tool components + 18 UI primitives across 6 tools. 6 Zustand stores. 5 commits on `session-2026-03-12`.

**Decisions:**

| Decision                | Choice                             | Rationale                                                                                  |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Preact → React          | React 19 + `@astrojs/react`       | Radix UI requires React; Preact compat mode was an unnecessary shim layer                  |
| Signals → Zustand       | Zustand 5 stores (one per tool)    | Zustand is React-native, supports selectors, doesn't need Preact-specific signal bindings  |
| Ariakit → Radix UI      | `radix-ui` (unified package)       | Broader community adoption, better docs, unstyled primitives work well with Tailwind        |
| Tool pruning scope      | Remove Dice Roller, Success Curves, Defense Graph | Low gameplay utility; Chart.js + Web Worker dependencies added complexity for niche features |
| Toast pattern           | `useSyncExternalStore` (not Zustand) | Global ephemeral channel — fits event-emitter pattern better than persistent store           |

**Status:** All automated checks pass (0 errors, 13 warnings, 182 tests). Manual browser testing of all 6 tools still pending.

---

## Phase 14 — MDX Conversion + Knip Integration (2026-03-12–13)

**Goal:** Convert all content files to MDX (prerequisite for shadcn component embedding), integrate knip into the automated pipeline, and clean up dead code.

| Component                       | What Was Done                                                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 14.1 MDX Conversion             | Renamed 76 content files from `.md` → `.mdx` across `books/` and `cleaned-references/`. Updated pipeline scripts (`prebuild.mjs`, `sync-check.ts`, `lint.ts`) to handle `.mdx` extension. Updated all doc references from `.md` to `.mdx`. |
| 14.2 Editorial Direction Pivot  | Shifted project philosophy from "preserve the source" to "build on the source" (`docs/product-vision.md`). Source material is now treated as inspiration, not scripture. |
| 14.3 Knip Integration           | Added `knip` to `bun run check` pipeline and CI workflow (`.github/workflows/build.yml`). Configured `knip.json` with framework false-positive suppressions (Astro content.config.ts, schema files). |
| 14.4 Dead Code Cleanup          | Deleted 8 unused UI components (Combobox, FormGroup, Menu, NumberInput, Panel, PresetGroup, Select, Tooltip). Removed 2 dead exports (`TabPanel`, `dismissToast`). Un-exported 17 internal-only types. |
| 14.5 Documentation              | Updated `pipeline.md` (knip docs, CI listing), `project-conventions.md` (knip in pipeline table), `copilot-instructions.md` (check description). Added devserver verification to prompt files. |

**Totals:** 76 files renamed, 8 files deleted, knip integrated as pipeline gate. Test count: 182 → 182 (no test changes).

**Decisions:**

| Decision                | Choice                             | Rationale                                                                                  |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| MDX conversion scope    | All content files at once          | Consistent tooling; avoids mixed `.md`/`.mdx` in same directories                          |
| Dead UI component fate  | Delete pre-migration               | shadcn/ui migration will replace all primitives; deleting now reduces scope and confusion    |
| Knip pipeline position  | Last step in `bun run check`       | Least likely to block other checks; dead code is lowest-severity gate                       |

---

## Phase 15 — shadcn/ui Foundation + Game Component Migration (2026-03-18)

**Goal:** Establish shadcn infrastructure and migrate all raw HTML form elements across all 6 tools to consistent, themed wrapper components.

| Component                       | What Was Done                                                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15.1 shadcn Foundation          | Installed `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`. Created `cn()` utility at `src/lib/utils.ts`. Added `components.json` for shadcn CLI (new-york style, no RSC). |
| 15.2 CSS Variable Bridge        | Added CSS variable mapping layer connecting shadcn semantic variables (e.g., `--input`, `--ring`) to existing WH40K design tokens in `src/styles/tailwind.css`. |
| 15.3 shadcn Primitives          | Installed 10 shadcn primitives: Input, Select, Checkbox, Separator, Table, Label, Card, Dialog, Tooltip, Textarea. |
| 15.4 Game Wrapper Components    | Created domain-specific wrappers: `GameInput`, `GameSelect`, `GameCheckbox`, `GameTextarea` with compact styling (py-0.5, px-1, text-[0.82rem]) appropriate for dense tabletop data entry. |
| 15.5 Tool Migration             | Migrated all 6 tools from raw `<input>`, `<select>`, `<textarea>`, `<input type="checkbox">` to Game* wrapper components. Consistent theming across all form elements. |
| 15.6 Pipeline Updates           | Added `check:deps` (dependency-cruiser) and `check:structure` (ts-morph) to `bun run check` and CI. Both pass clean on the current codebase. |

**Totals:** 10 shadcn primitives installed, 4 Game* wrapper components created, all 6 tools migrated to new form components. Pipeline expanded with 2 additional structural checks. Test count: 182 → 324 (new store and app tests).

**Decisions:**

| Decision                | Choice                             | Rationale                                                                                  |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Wrapper vs. direct use  | Game* wrappers over raw shadcn     | Compact sizing and WH40K theming applied once; tools import wrappers, not raw primitives    |
| Migration scope         | Form elements only                 | Lowest risk, highest visual impact. Modal/Accordion/Tabs/Toast migration deferred.          |
| CSS variable strategy   | Bridge layer, not replacement      | Map shadcn vars to existing WH40K tokens rather than rewriting the design system             |

---

## Decision Log

Key architectural and design decisions made during development:

| Decision                   | Chosen                                                                          | Alternatives Considered                                                      | Rationale                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical character format | Character Sheet's JSON shape                                                    | New unified format; adapter layer                                            | Sheet was the most mature tool; adapting others to it was less work than designing a third format                                         |
| Play Session future        | Deprecate entirely                                                              | Rebuild; merge into Sheet as "play mode"                                     | Features split cleanly between Combat Tracker and Sheet                                                                                   |
| Tech stack                 | ~~Stay vanilla JS~~ → ~~Preact Islands (Phase 12)~~ → React + Zustand (Phase 13) | TypeScript; React/Vue; stay on Preact                                        | Vanilla JS → Preact for reactive UI → React for Radix UI ecosystem and broader library support                                           |
| Dice consolidation         | New `DTD.dice` module replacing all three                                       | Consolidate into `dice.js`; merge into `core.js`                             | Clean break with backward-compat aliases was least disruptive                                                                             |
| Analysis tools             | Standalone pages in tools hub                                                   | Extend Dice Roller; combined analysis page                                   | Clean separation of concerns; each tool is self-contained                                                                                 |
| Ship Sheet                 | Separate tool                                                                   | Section inside Character Sheet                                               | Ship mechanics are fundamentally different from character mechanics                                                                       |
| NPC Generator depth        | Stat block builder (manual input + derived calcs)                               | Full randomizer; template picker only                                        | SM needs control over values; auto-calc handles the tedious math                                                                          |
| Quick Reference content    | Hardcoded in JS                                                                 | Separate JSON data file                                                      | Avoids another sync point; content is static and small                                                                                    |
| Priority ordering          | Foundation → Essentials → New → Analysis                                        | Gameplay first; new tools first; parallel                                    | Foundation work unblocked everything; essentials needed for playtesting                                                                   |
| Pipeline language          | Python (Pydantic v2 + Click)                                                    | JS/Node; manual checks                                                       | Pydantic gives typed schema validation for free; Python ecosystem excels at data pipelines                                                |
| Schema strictness          | StrictModel default, LenientModel for evolving                                  | All lenient; all strict                                                      | Strict catches regressions immediately; lenient on ships/NPCs allows forward-compat additions                                             |
| Pipeline scripts exception | Allowed in `pipeline/` when tested + review-gated                               | No scripts ever; full script freedom                                         | Version-controlled pipeline scripts are predictable; ad-hoc scripts remain banned                                                         |
| Astro + Starlight          | Static site with Vercel deploy                                                  | GitHub Pages; Docusaurus; keep vanilla only                                  | Starlight gives search, theming, sidebar nav for free; Vercel has zero-config Astro support                                               |
| ES module ports            | Manual port in `src/lib/dtd/`                                                   | Auto-generate; shared code as npm package                                    | Manual port is straightforward; only 2 files (core.js, dice.js) to keep in sync                                                           |
| Large tool porting         | ~~Copy+edit~~ → React component decomposition (Phase 12↓13)                     | Generate entire `.astro` file from scratch; inline all JS/CSS in single file | Original copy+edit → Preact Islands → React Islands; each tool decomposed into 6–18 focused components                                     |
| Sheet persistence          | Keep sheet's own localStorage CRUD                                              | Refactor to use `character.*` from core.js                                   | Sheet has its own migration logic and save format that differs from core.js. Unifying risks breaking save compatibility.                  |
| Preact → React (Phase 13)  | React 19 + `@astrojs/react`                                                    | Stay on Preact compat; wait for Preact X                                     | Radix UI requires React; compat shim was unnecessary overhead                                                                             |
| State management (Phase 13)| Zustand stores (one per tool)                                                   | Keep signals; React Context + useReducer; Jotai                              | Zustand is React-native with minimal API; per-tool stores give clear ownership                                                            |
| UI primitives (Phase 13)   | Radix UI (unstyled)                                                             | Headless UI; keep Ariakit; build from scratch                                | Broadest React ecosystem adoption; unstyled primitives compose naturally with Tailwind                                                     |
| Tool pruning (Phase 13)    | Remove Dice Roller, Success Curves, Defense Graph                               | Keep all; deprecate in UI only                                               | Low gameplay utility; Chart.js + Web Worker deps added complexity for niche analysis features                                              |
| Content format (Phase 14)  | MDX for all content files                                                       | Keep `.md`; selective `.mdx` conversion                                      | MDX enables JSX component embedding; consistent extension avoids mixed-format confusion                                                    |
| Editorial approach (Phase 14) | "Build on the source" (inspiration, not scripture)                           | "Preserve the source" (canonicity requirement)                               | Freed editorial team to improve and adapt content rather than being bound to exact source wording                                          |
| UI component wrappers (Phase 15) | Game* prefixed wrappers over shadcn primitives                             | Direct shadcn imports; styled Radix primitives                               | Compact sizing and WH40K theming applied once in wrappers; tools import Game* components instead of configuring each usage                 |
| CSS variable strategy (Phase 15) | Bridge layer mapping shadcn vars to WH40K tokens                           | Replace design system; dual token sets                                       | Preserves existing WH40K theming while enabling shadcn component compatibility without a rewrite                                           |

---

## Critical Problems Found and Resolved

### Three Independent Dice Implementations

**Discovery:** Codebase audit found three separate, incompatible dice implementations:

| Location     | Function                                   | Used By             |
| ------------ | ------------------------------------------ | ------------------- |
| `core.js`    | `DTD.rollXkY(roll, keep)`                  | Nothing (dead code) |
| `dice.js`    | `DTD.dice.rollKeepHighest(num, keep, mod)` | Dice Roller only    |
| `session.js` | `rollKeepHighest(num, keep)`               | Play Session only   |

**Resolution:** Single `DTD.dice` namespace with unified API. Old functions removed. Backward-compat aliases (`rollKeepHighest`, `formatRollResult`) preserved for any residual callers.

### Character Format Incompatibility

**Discovery:** Builder and Character Sheet produced incompatible JSON:

| Field       | Builder Format                   | Sheet Format                                    |
| ----------- | -------------------------------- | ----------------------------------------------- |
| Race        | `{ race: { id, name, size } }`   | `{ race: "eldarin" }`                           |
| Backgrounds | `{ backgrounds: { allies: 2 } }` | `{ backgrounds: [{ name, dots, notes }] }`      |
| Feats       | `{ feats: ["featId"] }`          | `{ feats: [{ name, notes }] }`                  |
| Weapons     | `{ weapons: [...] }` (merged)    | `{ meleeWeapons: [...], rangedWeapons: [...] }` |

**Resolution:** `DTD.character._migrateIfNeeded()` auto-detects old Builder format and converts on import. Builder rewritten to produce canonical format natively.

### Code Pattern Inconsistency

**Discovery:** Four different code patterns across four tools:

| Tool              | Pattern                       | Events                          |
| ----------------- | ----------------------------- | ------------------------------- |
| Character Sheet   | Object literal (`Sheet = {}`) | Delegated on `.tab-panels`      |
| Character Builder | IIFE (`(function(){})()`)     | Mixed inline + delegated        |
| Play Session      | Loose functions               | Inline `onclick` on `window`    |
| Dice Roller       | Loose functions               | DOM element caching + listeners |

**Resolution:** All new tools follow the object literal pattern with delegated events. Builder was rewritten to match. Play Session was deprecated. Dice Roller kept its pattern (functional but isolated).

---

## Lessons Learned

Lessons from these phases are now codified in [project-conventions.md](project-conventions.md) — see the "Hard-Won Pitfalls" and "D:TD Conventions" sections. Historical context for each lesson is preserved in the Critical Problems section above.

Notable game-rules lessons not captured elsewhere:

- **NPC stat blocks may use simplified values** rather than strict formula calculations. Don't force-correct book stat blocks to match formulas.
- **Halfling SD uses a unique variant formula** (`10 + Dex × 6 − Size × 2`) — must be handled as a special case wherever SD is calculated.

---

## Tool Inventory: Before and After

### Before (Audit, Feb 2026)

| Tool              | LoC    | Status           | Quality                     |
| ----------------- | ------ | ---------------- | --------------------------- |
| Character Sheet   | ~4,028 | Active (Primary) | Polished — production-ready |
| Character Builder | ~3,153 | Legacy           | Functional but superseded   |
| Play Session      | ~2,181 | _(deprecated)_   | Removed in Phase 0          |
| Dice Roller       | ~853   | Active           | Polished — fully functional |
| Combat Tracker    | ~85    | Stub             | Placeholder only            |
| NPC Generator     | ~85    | Stub             | Placeholder only            |
| Quick Reference   | ~85    | Stub             | Placeholder only            |
| Ship Builder      | ~85    | Stub             | Placeholder only            |

### After (All Phases Complete)

| Tool                    | Status           | Description                                                        |
| ----------------------- | ---------------- | ------------------------------------------------------------------ |
| Character Sheet         | Active (Primary) | Freeform editable, multi-char CRUD, JSON import/export, print      |
| Character Builder       | Active           | 11-step wizard, priority allocation, XP tracking, canonical export |
| Combat Tracker          | Active           | Initiative, round tracking, HP/resource/conditions, reference bar  |
| Quick Reference         | Active           | Searchable actions, conditions, modifiers, formulas, schools       |
| NPC Stat Block Builder  | Active           | Auto-derived stats, trait system, 40+ templates, markdown copy     |
| Ship Builder            | Active           | Builder + Sheet modes, hull/console/weapon config, combat tracking |

_Dice Roller, Success Curve Analyzer, and Defense Graph Simulator were removed in Phase 13 (tool pruning + React migration)._

### New Shared Infrastructure

| Component        | Description                                                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DTD.dice`       | Unified dice module: `roll()`, `calculateOutcome()`, `parseNotation()`, `formatResult()`, `compressOverflow()`                                                              |
| `DTD.character`  | Character CRUD: `createDefault()`, `validate()`, `save()`, `load()`, `list()`, `remove()`, `exportJSON()`, `importJSON()`                                                   |
| `DTD.derived`    | Stat formulas: `calculateSD()`, `calculateHP()`, `calculateMentalDefense()`, `calculateResolve()`, `calculateInitiativeBase()`, `calculateSpeed()`, `calculateResilience()` |
| 3 new data files | `npc-templates.json`, `traits.json`, `ships.json`                                                                                                                           |
