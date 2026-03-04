# Session Handover

> **Date:** 2026-03-04
> **Branch:** `session-2026-03-04` (pending commit — 10 modified files from sanity check fixes)
> **Prior session:** PR #8 merged `session-2026-03-03-consolidation` → `main` (Phases 1–4 complete)
> **Objective:** Post-merge sanity check audit + fix all stale references

---

## What Changed (This Session)

### Sanity Check Audit

Ran the full `.github/prompts/sanity-check.prompt.md` audit against the post-merge state. Found **18 stale references** across documentation, prompts, and open questions — remnants of the Python-to-TypeScript migration that weren't caught during the consolidation.

### Fixes Applied (18/18)

**Prompt files (5 findings):**
- `sanity-check.prompt.md` — Python→TypeScript references updated (uv→npm, Pydantic→Zod, pipeline table)
- `self-improvement-loop.prompt.md` — Removed pyproject.toml, added biome.json/vitest.config.ts
- `project-setup-pipeline.prompt.md` — Added "HISTORICAL REFERENCE" notice (file describes defunct Python pipeline)

**Documentation (10 findings):**
- `architecture.md` — 128→187 tests, @ts-nocheck count fix, lib/dtd sub-modules listed, tech stack updated
- `development-guide.md` — 128→187 tests, test file table expanded (2→6 files), CI pipeline description corrected
- `copilot-instructions.md` — lib/dtd tree + Vitest description updated
- `astro.instructions.md` — lib/dtd tree updated

**Open questions (2 findings):**
- `open-questions.md` entries 46-47 — `terminology.py`→`scripts/lint.ts`

**Side tracks (3 findings + 1 new entry):**
- Removed "core.ts Export Surface Area" section (split already done in commit `5e2fde7`)
- Updated W3 from "Three Copies" to "Two Copies" (defense-worker.js extracted in Phase 3D)
- Updated Phase 2 "Tool Module Refactor" with revised type-in-place approach
- Added "Bun Migration" side-track (plan said Bun, execution used tsx — decision: **resolved in stabilization pass, Bun now the runtime**)

### Bun vs tsx Decision

**Resolved in technical stabilization pass (2026-03-04).** Pipeline scripts now run via `bun run`. `tsx` removed from devDependencies. CI updated with `oven-sh/setup-bun@v2`. See `package.json` and `.github/workflows/build.yml`.

---

## Current State

| Metric | Value |
|--------|-------|
| Tests | 187 passing (6 test files) |
| Biome | 0 errors, 27 warnings, 45 infos (CRLF format "errors" are Windows-only, pass on Ubuntu CI) |
| JSON validation | 12/12 files pass |
| Content lint | 0 errors, 19 warnings, 883 info |
| Build | 89 pages built successfully |
| Python | Fully removed |
| `@ts-nocheck` | `sheet-app.ts` — removed, 614 TS errors exposed (unfixed) |
| `@ts-nocheck` | `builder-app.ts` — still present (~422 errors hidden) |

### Key Baselines

- `npm run validate` → 12/12 pass, 0 errors
- `npm run lint:data` → 0 errors, 19 warnings, 883 info (not "2 warnings" as previously reported — the linter now scans `books/` in addition to `cleaned-references/`)
- `npm run sync-check` → 277 matched, 8 md-only, 52 json-only
- `npm run build` → 89 pages, 0 errors
- `npm run test` → 187 tests passing
- `npx tsc --noEmit` → 614 errors in sheet-app.ts + 1 in core.test.ts

---

## Phase 5 Status (Unchanged)

### Error Scope

| File | TS Errors | Lines | `@ts-nocheck` |
|------|-----------|-------|---------------|
| `sheet-app.ts` | ~614 | 2,662 | Removed |
| `builder-app.ts` | ~422 | 1,825 | Present |
| **Total** | **~1,036** | **4,487** | |

### Error Patterns (90%+ mechanical)

| Pattern | ~Count | Fix |
|---------|--------|-----|
| `getElementById` returns `HTMLElement \| null` | ~200 | `as HTMLInputElement` or null-guard |
| `querySelector` returns `Element \| null` | ~100 | Same |
| Implicit `any` parameters in callbacks | ~150 | Add `: Event`, `: string`, etc. |
| Property access on `any`-typed objects | ~100 | Add interface or inline type |
| Object method `this` typing | ~50 | Explicit `this` parameter or class conversion |

**Recommended approach:** Type-in-place (fix errors without splitting). Module split deferred until Playwright E2E tests exist.

---

## Suggested Next Steps

1. **Phase 5: Fix 614 TS errors in `sheet-app.ts`** — Mechanical type fixes, ~4–6 hours estimated. Start with TS2531 null checks (209 errors, most repetitive).
2. **Phase 5: Fix ~422 TS errors in `builder-app.ts`** — Remove `@ts-nocheck`, apply same patterns.
3. **Phase 4.3: Tool module tests** — Depends on Phase 5. Defer to same session.
4. **Side tracks to consider:** Bun migration, lint:data docs/ coverage, import extension convention.
