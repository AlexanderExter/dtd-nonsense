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

| Component               | What Was Built                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6.1 Scaffold            | `astro.config.mjs`, `package.json`, `tsconfig.json`, `content.config.ts` — Astro 5 + Starlight with Vercel adapter, 8 sidebar groups                                     |
| 6.2 Content Pipeline    | `scripts/prebuild.mjs` — copies 24 cleaned-references (lowercased), 53 book chapters, and 12 JSON data files into Astro structure                                        |
| 6.3 Theme               | `custom.css` (WH40K dark/gold theme overriding Starlight CSS custom properties), `tool-components.css`                                                                   |
| 6.4 Shared ES Modules   | ES module ports of `core.js` and `dice.js` in `src/lib/dtd/` — named exports replacing `DTD.*` global namespace                                                          |
| 6.5 Tool Infrastructure | `ToolLayout.astro` wrapper, tools index dashboard, `@/` path alias for imports                                                                                           |
| 6.6 Tool Ports          | **9/9 tools fully ported**: Dice Roller, Quick Reference, Success Curves, NPC Generator, Defense Graph, Combat Tracker, Ship Builder, Character Sheet, Character Builder |
| 6.7 ~~Stub Pages~~      | All tools now ported — no stubs remaining                                                                                                                                |
| 6.8 Infrastructure      | `README.md`, `.github/workflows/build.yml` CI, npm audit fixed (0 vulnerabilities), speed formula corrected in Quick Reference                                           |
| 6.9 Git & Deployment    | History squashed (295 → 1 commit), pushed to `github.com/AlexanderExter/dtd-nonsense`, Vercel deployment pending                                                         |

**Status:** Build produces 89 pages in ~9s. Pagefind indexes 78 content pages. **9/9 tools fully ported.** Repo live on GitHub. See [astro-migration-roadmap.md](astro-migration-roadmap.md) for remaining work and [session-handover.md](session-handover.md) for detailed session notes.

---

## Decision Log

Key architectural and design decisions made during development:

| Decision                   | Chosen                                                                          | Alternatives Considered                                                      | Rationale                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical character format | Character Sheet's JSON shape                                                    | New unified format; adapter layer                                            | Sheet was the most mature tool; adapting others to it was less work than designing a third format                                         |
| Play Session future        | Deprecate entirely                                                              | Rebuild; merge into Sheet as "play mode"                                     | Features split cleanly between Combat Tracker and Sheet                                                                                   |
| Tech stack                 | Stay vanilla JS                                                                 | TypeScript; React/Vue                                                        | Zero build step; project value is in rules correctness, not engineering sophistication                                                    |
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
| Large tool porting         | Copy+edit: JS in `src/lib/tools/`, CSS in `src/styles/`, small `.astro` wrapper | Generate entire `.astro` file from scratch; inline all JS/CSS in single file | Prior attempts to generate 4000+ LOC .astro files failed repeatedly. Copy+edit required only 4–24 mechanical find-replace edits per file. |
| Sheet persistence          | Keep sheet's own localStorage CRUD                                              | Refactor to use `character.*` from core.js                                   | Sheet has its own migration logic and save format that differs from core.js. Unifying risks breaking save compatibility.                  |

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
| Dice Roller             | Active           | XkY with overflow, TN tracking, raises/checks, history             |
| Combat Tracker          | Active           | Initiative, round tracking, HP/resource/conditions, reference bar  |
| Quick Reference         | Active           | Searchable actions, conditions, modifiers, formulas, schools       |
| NPC Stat Block Builder  | Active           | Auto-derived stats, trait system, 40+ templates, markdown copy     |
| Ship Builder            | Active           | Builder + Sheet modes, hull/console/weapon config, combat tracking |
| Success Curve Analyzer  | Active           | Monte Carlo probability visualization, 4-pool comparison           |
| Defense Graph Simulator | Active           | Damage pipeline waterfall, HP curves, armor trade-offs, heat maps  |

### New Shared Infrastructure

| Component        | Description                                                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DTD.dice`       | Unified dice module: `roll()`, `calculateOutcome()`, `parseNotation()`, `formatResult()`, `compressOverflow()`                                                              |
| `DTD.character`  | Character CRUD: `createDefault()`, `validate()`, `save()`, `load()`, `list()`, `remove()`, `exportJSON()`, `importJSON()`                                                   |
| `DTD.derived`    | Stat formulas: `calculateSD()`, `calculateHP()`, `calculateMentalDefense()`, `calculateResolve()`, `calculateInitiativeBase()`, `calculateSpeed()`, `calculateResilience()` |
| 3 new data files | `npc-templates.json`, `traits.json`, `ships.json`                                                                                                                           |
