# Technical Consolidation — Implementation Plan

Implementation plan for the 5-phase technical consolidation described in [External-audit.md](External-audit.md). Based on a full audit of the current codebase as of 2026-03-03.

---

## Current State Summary

| Category                         | Metric                                                  |
| -------------------------------- | ------------------------------------------------------- |
| Pipeline Python                  | 25 files, ~2,263 lines                                  |
| Pydantic models                  | 13 schema files, ~746 lines, ~45 model classes          |
| TypeScript modules (typed)       | 3 files (`core.ts`, `dice.ts`, `types.ts`), 802 lines   |
| TypeScript tools (`@ts-nocheck`) | 2 files (`sheet-app.ts`, `builder-app.ts`), 4,211 lines |
| Astro tool pages                 | 10 pages                                                |
| Web Workers                      | 2 real workers (1 external file, 1 inline Blob)         |
| JSON data                        | 12 files, ~559 KB                                       |
| Tests                            | **Zero** (empty `tests/` dir, no `.test.ts` files)      |
| CI                               | 1 workflow, 2 phases: Node.js build + Python pipeline   |

**Key finding:** No Python-specific blockers to full migration. All regex is portable, no NLP/PDF/exotic libraries. Pydantic → Zod mapping is well-understood. `python-frontmatter` → `gray-matter` (npm). Click/Rich are CLI presentation only.

---

## Phase 1 — Biome

**Goal:** Add automated linting and formatting for all TypeScript/JavaScript code.

**Prerequisites:** None.

### Tasks

| #   | Task                              | Deliverable                                                                                                                                                                                |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1 | Install Biome                     | `npm install --save-dev @biomejs/biome`                                                                                                                                                    |
| 1.2 | Create `biome.json` config        | Formatter + linter enabled. Target: `src/`, `scripts/`, `public/workers/`. Ignore `node_modules/`, `dist/`, `.astro/`. Match Astro strict tsconfig.                                        |
| 1.3 | Decide: lint `@ts-nocheck` files? | **Recommendation:** Yes — Biome can lint JS/TS syntax even with `@ts-nocheck`. Catches unused vars, import issues, formatting. Suppress Biome-specific false positives per-file if needed. |
| 1.4 | Run initial `biome check --write` | Fix all auto-fixable issues in one commit. Review manually-flagged issues.                                                                                                                 |
| 1.5 | Add npm scripts                   | `"lint": "biome check ."`, `"lint:fix": "biome check --write ."`                                                                                                                           |
| 1.6 | Wire into CI                      | Add `npx biome check .` step to `build.yml`, after `npm ci`, before `npm run build`.                                                                                                       |
| 1.7 | Update docs                       | `copilot-instructions.md`, `development-guide.md`, `architecture.md` — reference Biome, new npm scripts.                                                                                   |

### Config Notes

```jsonc
// biome.json — starting point
{
    "$schema": "https://biomejs.dev/schemas/2.0/schema.json",
    "files": {
        "include": ["src/**", "scripts/**", "public/workers/**"],
        "ignore": ["node_modules", "dist", ".astro", "src/content"],
    },
    "formatter": {
        "indentStyle": "tab",
        "indentWidth": 4,
        "lineWidth": 120,
    },
    "linter": {
        "enabled": true,
        "rules": {
            "recommended": true,
        },
    },
}
```

**Estimated effort:** 1–2 hours. Mostly config + fixing initial lint issues.

**Definition of done:** `npx biome check .` passes locally and in CI. All existing code is formatted.

---

## Phase 2 — Vitest (Phase 1: Pure Functions)

**Goal:** Unit tests for `core.ts` and `dice.ts` — the pure game logic.

**Prerequisites:** Phase 1 (Biome lints test files).

### Tasks

| #   | Task                             | Deliverable                                                                                                                                                                                                           |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Install Vitest                   | `npm install --save-dev vitest`                                                                                                                                                                                       |
| 2.2 | Configure Vitest                 | Add to `package.json` or `vite.config.ts`. Vitest integrates with Astro's Vite — may need a minimal config. Test file pattern: `**/*.test.ts`.                                                                        |
| 2.3 | Write `src/lib/dtd/dice.test.ts` | Test cases for: `roll()` with various pool sizes, `parseNotation()` edge cases, `calculateOutcome()` with known inputs, exploding d10 behavior (mock `Math.random`), overflow compression.                            |
| 2.4 | Write `src/lib/dtd/core.test.ts` | Test cases for: all 7 `derived.*` calculators (Static Defense, HP, etc.), `character.validate()` migration logic, `character.DEFAULTS` shape integrity, `loadData()` with mocked fetch, `debounce()`, `escapeHtml()`. |
| 2.5 | Add npm script                   | `"test": "vitest run"`, `"test:watch": "vitest"`                                                                                                                                                                      |
| 2.6 | Wire into CI                     | Add `npm run test` step to `build.yml`, after build step.                                                                                                                                                             |
| 2.7 | Update docs                      | `development-guide.md` — testing conventions, how to add tests.                                                                                                                                                       |

### Test Strategy for dice.ts

The dice system is the highest-value test target. Key behaviors:

- **Exploding d10s**: When a die rolls 10, it re-rolls and adds (with overflow compression)
- **Overflow compression**: Values > 10 become `10 + (overflow ÷ 2)`, stacking
- **Keep highest**: Roll X dice, keep Y highest → `XkY` notation
- **Static bonuses**: `5k3+2` adds 2 to the kept total

Mock `Math.random` to provide deterministic sequences. Test both the random API surface and known input→output pairs.

### Test Strategy for core.ts

Derived stats are pure functions of character data. The formulas are documented in `project-conventions.md`:

- `Static Defense = (Dex + Wis) ÷ 2 + size modifier`
- `Hit Points = (Con + Wil) × 2`
- etc.

Create a minimal `CharacterData` fixture. Test each `derived.*` function against hand-calculated expected values. Test edge cases: 0 values, max values, missing optional fields.

**Estimated effort:** 3–5 hours. Writing the tests is the bulk of the work.

**Definition of done:** `npm run test` passes. CI runs tests. Coverage on `dice.ts` and `core.ts` ≥ 80%.

---

## Phase 3 — Bun Pipeline Consolidation

**Goal:** Replace Python pipeline with TypeScript/Bun. Remove the second runtime entirely.

**Prerequisites:** Phase 1 (Biome), Phase 2 (Vitest safety net).

**This is the largest phase.** Broken into sub-phases.

### 3A: Pre-Migration Audit (completed)

**Result:** No blockers. All Python code is portable:

| Python Module              | Lines | Port Difficulty | Notes                                                                                                       |
| -------------------------- | ----: | --------------- | ----------------------------------------------------------------------------------------------------------- |
| Pydantic models (12 files) |   746 | Medium          | 45 model classes → Zod schemas. `field_validator` → `.refine()`, `ConfigDict(extra="forbid")` → `.strict()` |
| `validate.py`              |   191 | Low             | Load JSON + validate with schemas + xref check                                                              |
| `linting/terminology.py`   |   159 | Low             | Regex patterns, fully portable                                                                              |
| `linting/formatting.py`    |   119 | Low             | Regex patterns for heading/table/encoding checks                                                            |
| `linting/runner.py`        |   162 | Low             | File discovery + orchestration. Rich output → console.log                                                   |
| `starlight/frontmatter.py` |   255 | Low             | YAML frontmatter injection. `python-frontmatter` → `gray-matter` (npm)                                      |
| `parsers/` (5 files)       |   389 | Low             | Regex markdown parsing, all portable                                                                        |
| `cli.py`                   |   142 | Remove          | Not needed — Bun scripts invoked directly                                                                   |

### 3B: Zod Schemas

| #    | Task                                   | Deliverable                                                                                                                                                                      |
| ---- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3B.1 | Install Zod                            | `npm install zod`                                                                                                                                                                |
| 3B.2 | Create `src/lib/dtd/schemas/common.ts` | Port `models/common.py`: `StrictModel` base → Zod `.strict()`, `DotRating`, `SkillRef`, `ClassFeatEntry`, literal unions for `Source`, `CharacteristicId`, `CharacteristicGroup` |
| 3B.3 | Port all 12 model files                | One `.ts` per JSON file in `src/lib/dtd/schemas/`. Each exports the Zod schema + inferred TS type. Match every Pydantic field, validator, and constraint.                        |
| 3B.4 | Create `src/lib/dtd/schemas/index.ts`  | Registry mapping filenames → schemas (replaces `models/__init__.py`)                                                                                                             |
| 3B.5 | Reconcile `types.ts`                   | Replace hand-written interfaces with `z.infer<>` re-exports. Keep `types.ts` as the public API — it becomes a re-export file. Verify all import sites still work.                |
| 3B.6 | Validate all 12 JSON files             | Script or test that loads each JSON and `.parse()`s against its Zod schema. Must pass before proceeding.                                                                         |

**Schema porting order** (low → high complexity):

1. `traits.ts` (1 model, 18 lines)
2. `skills.ts` (2 models, 37 lines)
3. `backgrounds.ts` (2 models, 28 lines)
4. `equipment.ts` (3 models, 28 lines)
5. `alignments.ts` (4 models, 40 lines)
6. `exaltations.ts` (6 models, 57 lines)
7. `classes.ts` (4 models, 57 lines — has `field_validator`)
8. `feats.ts` (3 models, 59 lines — `Literal` union, complex optional fields)
9. `races.ts` (5 models, 64 lines — `field_validator`, union types)
10. `npc-templates.ts` (6 models, 76 lines — union types)
11. `weapons.ts` (5 models, 78 lines — 3 weapon subtypes)
12. `ships.ts` (9 models, 126 lines — `model_post_init`, most complex)

### 3C: Pipeline Scripts

| #    | Task                                              | Deliverable                                                                                                                                                                                                              |
| ---- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3C.1 | Write `scripts/validate.ts`                       | Load 12 JSON files, parse against Zod schemas, report errors. Support `--xref` flag for cross-reference checks. Use Bun's native file I/O.                                                                               |
| 3C.2 | Write `scripts/lint.ts`                           | Port terminology rules (7 regex patterns), dice notation backtick checker, formula symbol checker, heading hierarchy checker, encoding corruption detector. Read markdown files from `books/` and `cleaned-references/`. |
| 3C.3 | Write `scripts/sync-check.ts`                     | Port markdown parsers (`base.py`, `classes.py`, `feats.py`, `races.py`) and sync comparison logic. Compare parsed markdown names against JSON data.                                                                      |
| 3C.4 | Fold `starlight-prep` into `scripts/prebuild.mjs` | Move frontmatter injection logic into the existing prebuild script. Use `gray-matter` (install as dependency). The prebuild already copies files — add frontmatter injection to the copy step.                           |

### 3D: Web Worker Standardization

| #    | Task                                | Deliverable                                                                                                                                                                                                                                                           |
| ---- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3D.1 | Extract defense-graph inline worker | Move `getWorkerSource()` blob content → `public/workers/defense-worker.js`. Update `defense-graph.astro` to use `new Worker("/workers/defense-worker.js")`.                                                                                                           |
| 3D.2 | Convert workers to TypeScript       | `simulation-worker.js` → `simulation-worker.ts`, `defense-worker.js` → `defense-worker.ts`. Configure Bun/Vite to compile workers.                                                                                                                                    |
| 3D.3 | Address dice logic duplication (W3) | The 3 copies of dice logic (`dice.ts`, both workers) should import from a shared source. Options: (a) workers import `dice.ts` if build supports it, (b) shared logic in a `/workers/dice-common.ts` that both workers and `dice.ts` use. Evaluate build constraints. |

### 3E: Cleanup and CI

| #    | Task                          | Deliverable                                                                                                                                                                                   |
| ---- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3E.1 | Remove Python pipeline        | Delete `pipeline/`, `pyproject.toml`, `uv.lock`, `tests/__init__.py` (empty), `.venv/` from `.gitignore` if present.                                                                          |
| 3E.2 | Update `package.json` scripts | Add: `"validate": "bun run scripts/validate.ts"`, `"lint:data": "bun run scripts/lint.ts"`, `"sync-check": "bun run scripts/sync-check.ts"`.                                                  |
| 3E.3 | Update CI                     | Remove Python job from `build.yml`. Add Bun setup step + `bun run validate`, `bun run lint:data` to Node.js job.                                                                              |
| 3E.4 | Update all documentation      | `copilot-instructions.md` (remove all `uv run dtd` references, add Bun equivalents), `development-guide.md`, `pipeline.md` (rewrite or archive), `architecture.md`, `project-conventions.md`. |
| 3E.5 | Update agent prompts          | Search for all files referencing `uv run dtd` and update to Bun equivalents.                                                                                                                  |

### Estimated Effort

| Sub-phase                      | Est. Hours |
| ------------------------------ | ---------: |
| 3B: Zod schemas (12 files)     |       6–10 |
| 3C: Pipeline scripts (4 files) |        4–6 |
| 3D: Web workers (3 tasks)      |        2–3 |
| 3E: Cleanup and CI             |        2–3 |
| **Total**                      |  **14–22** |

### Risk: Bun Compatibility

Bun must run in CI (GitHub Actions). `oven-sh/setup-bun` action is well-maintained. Bun must also be installable for local dev. If Bun proves problematic, the scripts work with Node.js + `tsx` as a fallback (Zod schemas and Vitest don't depend on Bun-specific APIs).

**Definition of done:** `bun run validate` and `bun run lint:data` pass locally and in CI. Python runtime fully removed. All 12 JSON files validate against Zod schemas. All documentation updated.

---

## Phase 4 — Vitest (Phase 2: Broader Coverage)

**Goal:** Expand test coverage beyond pure functions.

**Prerequisites:** Phase 3 (Zod schemas stable), Phase 5 (partial — some `@ts-nocheck` resolved).

### Tasks

| #   | Task                          | Deliverable                                                                                                                                   |
| --- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | Test Zod schemas              | Validate all 12 JSON files in a test suite. Test schema rejection of malformed data.                                                          |
| 4.2 | Test pipeline scripts         | Unit tests for lint rules, sync-check parsers.                                                                                                |
| 4.3 | Test newly typed tool modules | As Phase 5 splits `sheet-app.ts` and `builder-app.ts` into sub-modules, add tests for `calc.ts` (derived stats) and `state.ts` (persistence). |

### Deferred: Playwright E2E

The original audit mentioned E2E tests for the 9 interactive tools. This is high-value but high-effort. **Recommendation:** Defer Playwright to a separate initiative after Phase 5 stabilizes. The Vitest unit tests for Zod schemas, pipeline scripts, and tool sub-modules provide sufficient regression coverage for the consolidation phases.

**Estimated effort:** 4–6 hours (unit tests only, excluding Playwright).

---

## Phase 5 — `@ts-nocheck` Removal

**Goal:** Full type safety across the codebase.

**Prerequisites:** All previous phases complete.

### Pre-Work: core.ts God Module Split

Before touching the tool files, split `core.ts` (428 lines, 13 exports) into focused modules:

| New Module                 | From core.ts      | Exports                                                                      |
| -------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| `src/lib/dtd/util.ts`      | Utility functions | `debounce()`, `escapeHtml()`                                                 |
| `src/lib/dtd/data.ts`      | Data loading      | `loadData()`, `loadAllData()`                                                |
| `src/lib/dtd/character.ts` | Character CRUD    | `character.*` (DEFAULTS, validate, save, load, export, import, list, remove) |
| `src/lib/dtd/derived.ts`   | Stat calculations | `derived.*` (7 calculators)                                                  |
| `src/lib/dtd/ui.ts`        | UI helpers        | `initAccordion()`                                                            |
| `src/lib/dtd/core.ts`      | Re-export barrel  | Re-exports all of the above for backward compatibility                       |

### Tool Module Split

Follow the pattern from [side-tracks.md](side-tracks.md):

**sheet-app.ts (2,536 lines) →**

- `src/lib/tools/sheet/state.ts` — character state and persistence
- `src/lib/tools/sheet/calc.ts` — derived stat calculations, XP budget
- `src/lib/tools/sheet/render.ts` — DOM rendering functions
- `src/lib/tools/sheet/events.ts` — event handler registration
- `src/lib/tools/sheet/index.ts` — initialization entry point

**builder-app.ts (1,675 lines) →**

- `src/lib/tools/builder/state.ts` — builder state, class selection
- `src/lib/tools/builder/calc.ts` — XP calculations, level tracking
- `src/lib/tools/builder/render.ts` — DOM rendering
- `src/lib/tools/builder/events.ts` — event handlers
- `src/lib/tools/builder/index.ts` — initialization entry point

### Type Fixing Strategy

1. Remove `@ts-nocheck` from one sub-module at a time
2. Fix TypeScript errors — primarily `getElementById` return types needing casts (`as HTMLInputElement`, etc.)
3. Run Vitest after each sub-module to verify behavior preservation
4. Reconcile W4 (divergent default character shapes) during `state.ts` typing — make `sheet/state.ts` delegate to `character.ts` DEFAULTS
5. Commit after each sub-module is clean

**Estimated effort:** 8–16 hours. The split itself is mechanical but the type fixing requires careful per-element DOM casting.

**Definition of done:** Zero `@ts-nocheck` directives. `tsc --noEmit` passes. All Vitest tests pass. W4 default character shape divergence resolved.

---

## Dependency Map

```
Phase 1: Biome ──────────────────────────────────────┐
    │                                                 │
    └── Phase 2: Vitest Phase 1 (pure functions)      │
            │                                         │
            └── Phase 3: Bun Consolidation ───────────┤
                    │         + Zod + Web Workers      │
                    │                                  │
                    ├── Phase 5: @ts-nocheck Removal ──┤
                    │        (core.ts split + tool     │
                    │         module split + typing)   │
                    │                                  │
                    └── Phase 4: Vitest Phase 2 ◄──────┘
                         (broader coverage, tests
                          newly-typed modules)
```

Phases 1 and 2 can begin immediately and run in parallel.
Phase 3 requires both 1 and 2.
Phase 5 requires Phase 3.
Phase 4 overlaps with Phase 5 — tests are written as modules are typed.

---

## Execution Strategy

### Recommended Session Ordering

| Session   | Phases                       | Est. Hours | Notes                                  |
| --------- | ---------------------------- | ---------: | -------------------------------------- |
| S1        | 1 (Biome)                    |        1–2 | Quick win. Sets quality baseline.      |
| S2        | 2 (Vitest Phase 1)           |        3–5 | Can start same day as S1.              |
| S3        | 3B (Zod schemas)             |       6–10 | Largest single task. Do alone.         |
| S4        | 3C + 3D (scripts + workers)  |        4–6 | After schemas are validated.           |
| S5        | 3E (cleanup + CI)            |        2–3 | Removes Python. Update all docs.       |
| S6        | 5 pre-work (core.ts split)   |        2–3 | Enables Phase 5 main work.             |
| S7        | 5 main (tool split + typing) |       6–12 | Largest effort. Multiple sub-sessions. |
| S8        | 4 (expanded tests)           |        4–6 | Runs alongside Phase 5.                |
| **Total** |                              |  **28–47** |                                        |

### Git Strategy

Each session gets its own branch (`session-YYYY-MM-DD`). Each phase gets at least one PR. Phase 3 may warrant multiple PRs (schemas, scripts, cleanup).

### CI Checkpoints

Every phase's PR must pass CI before merge. Phase-specific CI additions:

| Phase | New CI Step                                                     |
| ----- | --------------------------------------------------------------- |
| 1     | `npx biome check .`                                             |
| 2     | `npm run test`                                                  |
| 3     | Replace Python job with `bun run validate`, `bun run lint:data` |
| 4     | (Covered by Phase 2 test step)                                  |
| 5     | `tsc --noEmit` (if not already run by Astro build)              |

---

## Open Questions for PM Decision

1. **Biome indent style:** Tabs (current implied by some files) or spaces? Recommend tabs to match `tsconfig.json` extending `astro/tsconfigs/strict`. Tabs
2. **Bun vs tsx fallback:** If Bun causes CI issues, fall back to `npx tsx scripts/validate.ts`? Or commit to Bun? Commit to Bun, we will revert the branch if it proves unworkable.
3. **Playwright timing:** Defer E2E tests to post-Phase-5, or scope a minimal smoke test earlier? Do not implement playwright, too many moving parts.
4. **gray-matter dependency:** Adding a runtime dependency for frontmatter injection. Acceptable, or inline the YAML parsing? acceptable and desired, well mantained dependencies an libraries help. This is a best practice that should be used everywhere when possible and reasonable.
5. **`docs/` lint coverage (L1b from side-tracks):** Add `docs/` to the lint target during Phase 3C, or defer? 3C
