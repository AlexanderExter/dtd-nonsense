# Session Handover

Running context for the current work session. **Overwritten each session** — not a cumulative log.

---

## Current Branch

`session-2026-03-20` (from `main`)

## Session Objective

Two-phase session: (1) self-driven maintenance pass, (2) user-directed architecture docs update and ultracite integration.

## What Changed

### Phase 1: Maintenance Pass

| Commit | Description |
|--------|-------------|
| `4493737` | Auto-fix Biome import ordering and formatting (10 violations) |
| `34c962e` | Modal accessibility — VisuallyHidden fallback title, suppress empty description warning |
| `993b541` | Docs: rewrite stale session-handover, fix side-tracks, update pipeline.md CI steps |
| `7e55219` | Docs: add Phase 14 (MDX + knip) and Phase 15 (shadcn foundation) to project-history.md |

### Phase 2: User-Directed Work

| Commit | Description |
|--------|-------------|
| `46be9ff` | Docs: comprehensive architecture.md update — fix stale migration section, accurate 25-component UI inventory |
| `01ce563` | Feat: integrate ultracite as Biome config preset — ~200+ curated rules, Tailwind class sorting, auto-fix ~80 files |
| (pending) | Docs: update architecture.md, copilot-instructions.md, side-tracks.md, and session-handover.md for ultracite |

### Ultracite Integration Details

- **What:** Biome config now extends `ultracite/biome/{core,react,astro}` presets instead of standalone `recommended: true`
- **New rules enabled:** `useSortedClasses` (Tailwind class sorting), `useOptionalChain`, `useAtIndex`, `useCollapsedIf`, `useNumberNamespace`, `useSortedAttributes`, `useSortedProperties`, `useSortedInterfaceMembers`, comprehensive a11y and CSS rules
- **Rules suppressed:** ~25 rules overridden to `off` for codebase compatibility (e.g., `noForEach`, `noBarrelFile`, `noNamespaceImport`, `useFilenamingConvention`, `useBlockStatements`)
- **Auto-fixes applied:** ~80 source files + 12 JSON data files (tabs → 2-space indent from Biome formatter)
- **Manual fix:** Collapsed nested if in CharacteristicsStep.tsx (`useCollapsedIf`)

### Documentation Updates

- `docs/architecture.md`: Biome description now mentions ultracite presets; Phase 15 component inventory (25 components in 3 tiers)
- `.github/copilot-instructions.md`: Biome toolchain entry updated to mention ultracite
- `docs/side-tracks.md`: Removed resolved "Add Knip to CI" entry (knip already in `bun run check` and CI), cleaned orphaned next-action
- `docs/session-handover.md`: Full rewrite for this session

## Verification

| Check | Result |
|---|---|
| `bun run check` | Pass (324 tests, 0 lint errors, 0 knip issues) |
| `bun run validate` | 12/12 pass |
| `bun run sync-check` | 329 matched, 0 drift |
| `bun run knip` | 0 issues |
| `bun run check:deps` | 0 violations |
| `bun run check:structure` | 3/3 checks pass |

## Current Project State

### Stack

- **6 tools**: Character Builder, Character Sheet, Combat Tracker, NPC Generator, Quick Reference, Ship Builder
- **324 unit tests** across 23 test files (0 failures)
- **25 UI components** in `src/components/react/ui/` (10 shadcn primitives, 4 Game* wrappers, 11 custom)
- **12 JSON data files**, all validated by Zod schemas
- **76 MDX content files** across `books/` and `cleaned-references/`
- **Biome + ultracite**: ~200+ curated lint rules via `ultracite/biome/{core,react,astro}` presets

### Recent History

| Session | Key Changes |
|---------|-------------|
| 2026-03-12 | Phase 14: MDX conversion (76 files), knip integration into check/CI |
| 2026-03-13 | Two squash merges — content & tooling refinements |
| 2026-03-18 | Phase 15: shadcn foundation — cn() utility, 10 shadcn primitives, Game* wrappers, CSS variable bridge |
| 2026-03-20 | Maintenance pass, architecture.md rewrite, ultracite integration |

## Known Issues

1. **No browser testing since MDX conversion** — visual verification still pending
2. **shadcn/ui migration incomplete** — foundation done (Phase 15), remaining hand-rolled Radix primitives (Modal, Accordion, Tabs, Toast, CloseButton) not yet swapped
3. **React Hook Form installed but unused** — `react-hook-form@7.71.2` in deps
4. **Dependency overrides active** — `svgo` and `path-to-regexp` overrides for security patches (see side-tracks.md)

## Suggested Next

1. **Visual browser testing** — run `bun run dev`, verify all 6 tools and content pages
2. **Continue shadcn migration** — swap remaining hand-rolled Radix primitives to shadcn/ui
3. **Extend check:deps and check:structure** — add `no-hooks-to-lib-reverse` rule and `*App.tsx` export naming check (see side-tracks.md)
4. **Review ultracite rule overrides** — some disabled rules may be worth enabling incrementally
