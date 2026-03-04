# External Audit — Technical Consolidation

This document records the findings and approved scope from the Phase 0 audit of the DTD Nonsense codebase (2026-03-03). It is the source document from which [implementation-plan.md](implementation-plan.md) was derived.

## What Was Approved

| Item                               | Decision                                                             |
| ---------------------------------- | -------------------------------------------------------------------- |
| Biome                              | Approved                                                             |
| Vitest                             | Approved                                                             |
| Bun pipeline consolidation         | Approved — replaces Python if full coverage is achievable            |
| Type bridge automation             | Collapses into Bun consolidation via Zod — not a separate workstream |
| Phase 2 TypeScript (`@ts-nocheck`) | Approved — last phase, after all others stabilize                    |

---

## Phases

## Phases are ordered by upstream/downstream dependency. Consider prerequises and downstream impact when scheduling. Phases can be worked on in parallel if their dependencies are met.

### Phase 1 — Biome

**What:** Add Biome as the TypeScript/JavaScript linter and formatter for the Node.js side of the project.
**Why:** The Python side has `ruff`. TypeScript has nothing. 187KB of tool code (plus all Astro pages, shared modules, and scripts) is modified by agents with zero automated quality checks.

**Scope:**

- Install Biome, configure `biome.json`
- Wire `biome check` into the GitHub Actions Node.js CI job
- Add `npm run lint` script pointing to Biome
- Update `copilot-instructions.md` and `development-guide.md` to reference the linter
- Decide: formatter-only or formatter + linter. Recommend both.

**Prerequisites:** None. Fully independent.

**Downstream:** Sets the code quality baseline. All subsequent phases produce code that runs through Biome. Must be in place before Phase 2 and Phase 3 output anything significant.

**CI change:** Add `biome check .` step to existing Node.js job. No new jobs.

---

### Phase 2 — Vitest (Phase 1: pure functions)

**What:** Add Vitest and write unit tests for `core.ts` and `dice.ts`.
**Why:** These are pure functions implementing game logic — exactly where LLM agents introduce subtle rule-misinterpretation bugs with no detector. They are the easiest possible testing target.

**Scope:**

- Install Vitest (integrates with Vite/Astro natively, no separate config needed)
- Write `src/lib/dtd/core.test.ts` and `src/lib/dtd/dice.test.ts`
- Cover: dice rolling outcomes, character stat derivation, edge cases
- Wire `vitest run` into CI (Node.js job, runs after build)
- Add `npm run test` script

**Prerequisites:** Phase 1 (Biome lints test files too).

**Downstream:** Provides the regression safety net required before Phase 3 (Bun migration) touches game logic. Also partial prerequisite for Phase 4 (broader test coverage requires Phase 3 to be stable first).

**Not in scope here:** Testing `sheet-app.ts` or `builder-app.ts` — those are blocked by Phase 5 (`@ts-nocheck` removal). That is Vitest Phase 2 and is tracked under Phase 5.

**CI change:** Add `npm run test` step to Node.js job.

---

### Phase 3 — Bun Pipeline Consolidation

**What:** Replace the Python/uv runtime with Bun-native TypeScript scripts. Eliminate the second runtime entirely.
**Why:** Python's current role is providing a CLI (`uv run dtd <cmd>`) that LLM agents invoke for validation, linting, and content prep. Bun scripts do the same thing with: no runtime switch, no uv, TypeScript that agents can read and modify, and a single lock file.

**This is the largest change in the plan.** It touches CI, documentation, agent instructions, and removes an entire runtime.

#### Pre-Migration Audit (required first step)

Before committing to full migration, audit `pipeline/parsers/` (5 files). Determine whether any parser contains logic that is genuinely Python-specific (e.g. complex regex, third-party Python NLP, PDF parsing). If yes, that parser stays in Python and the migration scope reduces accordingly. All other modules are straightforward ports.

#### Migration Map

| Python command                       | Replacement                          | Location                                        |
| ------------------------------------ | ------------------------------------ | ----------------------------------------------- |
| `uv run dtd validate`                | `bun run scripts/validate.ts`        | Zod schemas validate 12 JSON files              |
| `uv run dtd lint`                    | `bun run scripts/lint.ts`            | Terminology rules from `project-conventions.md` |
| `uv run dtd starlight-prep`          | Fold into `scripts/prebuild.mjs`     | Already handles file ops                        |
| `uv run dtd sync-check`              | `bun run scripts/sync-check.ts`      | Simple TS script                                |
| Pydantic models (`pipeline/models/`) | Zod schemas (`src/lib/dtd/schemas/`) | One schema per data file                        |

Document any Python-specific logic that cannot be ported. If there are blockers to full migration, update the plan and scope accordingly.

#### Zod as the New Single Source of Truth

Pydantic models and `src/lib/dtd/types.ts` are currently maintained separately. With Zod:

- Zod schemas **are** the TypeScript types (`z.infer<typeof Schema>`)
- No separate `types.ts` to drift
- Validation and type inference from the same declaration
- `types.ts` becomes a re-export file pointing to inferred Zod types

This makes the type bridge problem disappear — it is not a separate workstream.

#### Scope

- Write Zod schemas for all 12 JSON data files under `src/lib/dtd/schemas/`
- Write `scripts/validate.ts`, `scripts/lint.ts`, `scripts/sync-check.ts`
- Fold `starlight-prep` into `scripts/prebuild.mjs`
- Update `package.json` with `bun run` script equivalents
- Remove: `pipeline/`, `pyproject.toml`, `uv.lock`
- Update CI: remove Python job entirely, add Bun script steps to Node.js job
- Update all agent-facing documentation: `copilot-instructions.md`, `development-guide.md`, `pipeline.md` (replace or archive), `architecture.md`
- Update `project-conventions.md` command references
- Update all 6 prompts that reference `uv run dtd`

#### Web Worker Standardization (bundle into Phase 3)

Two tools use Web Workers with inconsistent patterns (tracked in `side-tracks.md`):

- `success-curves`: external file (`/workers/simulation-worker.js`) — **this is the right pattern**
- `defense-graph`: inline Blob Worker — fragile, no linting, no syntax highlighting

During Phase 3, standardize both on external files in `public/workers/` and migrate `simulation-worker.js` → `simulation-worker.ts` (the only remaining `.js` in `src/`).

**Prerequisites:** Phase 1 (Biome), Phase 2 (Vitest safety net for game logic before touching validators).

**CI change:** Remove Python job. Add `bun run validate`, `bun run lint` to Node.js job. Update Node.js job to install Bun.

---

### Phase 4 — Vitest (Phase 2: broader coverage + Playwright)

**What:** Expand test coverage beyond pure functions. Add E2E tests for the 9 interactive tools.
**Why:** After Phase 3, the data pipeline is TypeScript and Zod-validated. After Phase 5 (partial), some tool code will be typed.

**Scope:**

- Vitest: expand coverage to newly typed areas from Phase 5 progress

**Prerequisites:** Phase 3 (stable Zod schemas, data pipeline settled), Phase 5 (partial — at minimum some `@ts-nocheck` resolved).

**Note:** This phase and Phase 5 will overlap in practice. They are separate in the plan for clarity.

---

### Phase 5 — Phase 2 TypeScript (`@ts-nocheck` Removal)

**What:** Remove `@ts-nocheck` from `sheet-app.ts` (112KB) and `builder-app.ts` (75KB) and achieve full type safety across the codebase.
**Why:** These two files represent the majority of the tool codebase and are currently unchecked by TypeScript. Every agent edit is a blind edit.

**This is the largest lift in the plan.** These files are large, complex, and likely have accumulated implicit type assumptions that will surface as errors once checking is enabled.

**Recommended approach:**

1. Enable `@ts-nocheck` removal on one file at a time
2. Fix errors in passes, not all at once
3. Use Vitest (Phase 2) to verify behavior is preserved after each pass
4. The `core.ts` god module split (tracked in `side-tracks.md`) should happen during or before this phase — splitting into `util.ts`, `data.ts`, `character.ts`, `ui.ts` makes these large files easier to reason about and reduces LLM context load per edit

**Prerequisites:** All previous phases. Biome (catches new errors), Vitest Phase 1+2 (regression detection), Phase 3 complete (Zod types available), stable codebase with no in-flight migrations.

---

## Dependency Map

```
Phase 1: Biome
    └── Phase 2: Vitest Phase 1 (pure functions)
            └── Phase 3: Bun Consolidation + Zod + Web Workers
                    ├── Phase 4: Vitest Phase 2
                    └── Phase 5: @ts-nocheck Removal
                            └── Phase 4: (completes here)
```

Phases 1 and 2 can begin immediately and in parallel with each other. Phase 3 requires both. Phases 4 and 5 require Phase 3 and partially depend on each other.

---

## Additional Gaps Identified

These items were identified in the audit but are not in the approved plan. Flagged for PM decision.

### CI Explicitness (implicit in plan, worth stating)

Every phase includes a CI change. The current CI has two jobs: Node.js build and Python pipeline. After Phase 3, the Python job is gone. Each phase's CI wiring must be verified — a phase is not complete until its checks run in CI.

---

## Out of Scope for This Plan

- Content editing, rules parsing, open questions
- Favicon / OG image
