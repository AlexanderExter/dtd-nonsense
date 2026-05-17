# Architecture TODO

Items identified during the 2026-05-16 polish session. All four have been addressed.

---

## ✅ 1. Ship Builder Immer Migration

**Completed** — All 72 `updateShip` call sites across 10 files converted from spread-return to Immer draft mutation pattern.

## ✅ 2. Store `gameData` Typing

**Completed** — Both character-builder and character-sheet stores now use `GameDataResult<[...]>` instead of `Record<string, any>`. Unsafe `as Record<string, any>` casts removed from App components.

## ✅ 3. Tailwind Arbitrary Value Cleanup

**Completed** — Added `@theme` tokens (`--spacing-2xs`, `--tracking-tight-px`, `--tracking-wide-px`, `--font-size-tool-base`, `--container-*`, `--breakpoint-tool-*`) and replaced ~150 high-frequency arbitrary values across all tool components. Remaining arbitrary values are legitimate one-offs (specific widths, calc expressions).

## ✅ 4. Type Holes in Game Data Parameters

**Partially addressed** — Removed `as any[]` casts and unnecessary `: any` callback annotations from builder and sheet steps/components. Store typing flows through to consumers. Some helper functions in `constants.ts` still use `any` for parameters where the actual data access patterns don't match schema types (pre-existing data mismatch, not a typing issue).
