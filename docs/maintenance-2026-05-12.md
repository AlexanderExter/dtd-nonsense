# Maintenance Briefing — 2026-05-12

## Executive Summary

22 dependencies upgraded across all tiers — including 3 major version bumps (TypeScript 5→6, knip 5→6, ts-morph 27→28). 1 stale security override removed (svgo). 6 unused type exports cleaned up. 1 content lint bug fixed. 5 new biome violations from ultracite 7.7.0 resolved. Starlight v0.39 breaking sidebar API migrated. All 325 tests pass, all validators clean, production build succeeds.

## Config Changes

| Config File | Change | Rationale |
|-------------|--------|-----------|
| `tsconfig.json` | Removed `baseUrl`, added `types: ["bun"]`, changed paths to `"@/*": ["./src/*"]` | TypeScript 6.0 deprecated `baseUrl` and defaults `types` to `[]`. Paths adjusted to use relative prefix. |
| `biome.json` | Updated `$schema` to `2.4.15` | Schema must match installed Biome CLI version |
| `knip.json` | Updated `$schema` from `knip@5` to `knip@6` | Knip v6 major version |
| `astro.config.mjs` | Changed sidebar `autogenerate` with `label` to nested `items` array | Starlight v0.39 removed the autogenerate+label shorthand |

## Upgrade Manifest

| Package | From | To | Bump | Tier | Notes |
|---------|------|----|------|------|-------|
| `typescript` | ^5.9.3 | ^6.0.3 | major | Toolchain | Bridge release before TS7 (Go port). New defaults for `strict`, `types`, `baseUrl`. |
| `ts-morph` | ^27.0.2 | ^28.0.0 | major | Toolchain | Follows TS6 |
| `knip` | ^5.88.0 | ^6.13.1 | major | Toolchain | Replaced TS backend with oxc-parser. 2-4x faster. Found 6 unused exports. |
| `@biomejs/biome` | 2.4.7 | 2.4.15 | patch | Toolchain | |
| `ultracite` | ^7.3.2 | ^7.7.0 | minor | Toolchain | New rules: `noSubstr`, `useConsistentArrowReturn`, `noUselessCatchBinding` |
| `dependency-cruiser` | ^17.3.9 | ^17.4.0 | minor | Toolchain | |
| `rumdl` | ^0.1.53 | ^0.1.91 | patch | Toolchain | |
| `@types/bun` | ^1.3.10 | ^1.3.13 | patch | Toolchain | |
| `@types/jsdom` | ^28.0.0 | ^28.0.3 | patch | Toolchain | |
| `astro` | ^6.0.5 | ^6.3.1 | minor | Framework | |
| `@astrojs/starlight` | ^0.38.1 | ^0.39.2 | minor | Framework | Breaking: removed autogenerate+label sidebar shorthand |
| `@astrojs/react` | ^5.0.0 | ^5.0.4 | patch | Framework | |
| `@astrojs/vercel` | ^10.0.1 | ^10.0.6 | patch | Framework | |
| `@astrojs/check` | ^0.9.8 | ^0.9.9 | patch | Framework | |
| `react` | ^19.2.4 | ^19.2.6 | patch | Utility | |
| `react-dom` | ^19.2.4 | ^19.2.6 | patch | Utility | |
| `tailwindcss` | ^4.2.1 | ^4.3.0 | minor | Utility | |
| `@tailwindcss/vite` | ^4.2.1 | ^4.3.0 | minor | Utility | |
| `tailwind-merge` | ^3.5.0 | ^3.6.0 | minor | Utility | |
| `jsdom` | ^29.0.0 | ^29.1.1 | minor | Utility | |
| `zod` | ^4.3.6 | ^4.4.3 | minor | Utility | |
| `zustand` | ^5.0.12 | ^5.0.13 | patch | Utility | |

## Actionable Intelligence

- **TypeScript 7.0 Beta** is available. TS6 is explicitly a bridge release. When TS7 stabilizes (Go-based compiler, parallel type checking), consider early adoption for massive build speed improvements.
- **Tailwind CSS 4.3** — check changelog for new utilities worth adopting.
- **Zod 4.4** — check for new schema features.
- **Knip v6** uses oxc-parser instead of TypeScript — 2-4x faster analysis. The `classMembers` issue type was dropped (not used here).

## Dead Code Removed

- 6 interfaces had unnecessary `export` keywords removed (knip v6 detection):
  - `ActionBudget` (combat-tracker/constants.ts)
  - `Torpedo`, `Shield`, `CombatState` (ship-builder/constants.ts)
  - `Characteristics`, `TechniqueEntry` (lib/dtd/types.ts)
- All were only used as property types within their own file definitions.

## Resolution Log

| Issue | Resolution |
|-------|------------|
| TS6 `baseUrl` deprecation | Removed `baseUrl`, prefixed paths with `./` |
| TS6 `types` default change | Added `"types": ["bun"]` to tsconfig |
| Starlight v0.39 sidebar API | Migrated `autogenerate` with `label` to nested `items` arrays |
| `noSubstr` (3 violations) | Changed `substring`/`substr` to `slice` in prebuild.mjs and constants.ts |
| `useConsistentArrowReturn` | Auto-fixed: simplified arrow function in FeaturesTab.tsx |
| `noUselessCatchBinding` | Removed unused `_e` catch binding in character.ts |
| Content lint false positive | Fixed `BlockTracker` to only treat `---` as frontmatter at file start, not horizontal rules mid-file |

## Security

- **0 vulnerabilities** — same as baseline.
- **svgo override removed** — astro@6.3.1 now ships `svgo ^4.0.1` natively, so the DoS override (GHSA-xpqw-6gx7-v673) is no longer needed.
- **path-to-regexp override retained** — `@vercel/routing-utils@5.3.3` still ships `path-to-regexp@6.1.0`. Override to `^8.0.0` remains necessary for ReDoS protection.

## CI Changes

No CI workflow changes needed — all action versions (checkout@v4, setup-bun@v2, setup-node@v4) are current. Node version sourced from `.nvmrc` (22).

## Lockfile Decision

`bun.lock` remains committed with `merge=binary` strategy in `.gitattributes`. Correct for an application with Vercel deployment.

## Pinning Decisions

- `@biomejs/biome` remains exact-pinned (2.4.15) — formatter/linter behavior must be deterministic across dev machines and CI.
- All other packages use caret ranges — appropriate for an application where patch/minor updates are safe.

## Tree Health

- All peer dependencies satisfied.
- No extraneous packages.
- Engine requirement unchanged: `node ^22.12.0`.
- 923 packages in node_modules (post-upgrade).

## Dev Server Verification

- Dev server started successfully on port 4322 (Astro v6.3.1).
- Routes tested: `/` (landing page), `/rules/01-core-rules/`, `/tools/character-builder/`, `/tools/combat-tracker/`.
- All pages rendered correctly with full content, navigation, and interactive elements.
- No console errors. Expected favicon.svg/favicon.ico 404s from Starlight route pattern (cosmetic, not functional).

## IDE Diagnostics

- **1 finding (false positive, unchanged from baseline):** CSS inline style warning in `Popover.tsx` line 45. The component uses inline `style` for dynamic `position: fixed` + `top`/`left` calculated from `anchorRect`. This cannot be expressed as Tailwind utilities or external CSS — inline style is the correct approach for runtime-computed positioning.

## Recommendations

- **Prepare for TypeScript 7.0.** TS6 is the bridge release. When TS7 reaches RC, adopt it for the Go-based compiler with parallel type checking. The `--stableTypeOrdering` flag in TS6 can help preview TS7's type ordering behavior.
- **Review biome.json overrides.** Several rules are disabled (`noForEach`, `noExplicitAny`, `noNonNullAssertion`, etc.). As the codebase matures, consider re-enabling incrementally — especially `noExplicitAny` outside test files.
- **Monitor `@vercel/routing-utils`** for a release that ships `path-to-regexp ^8`. When that happens, remove the last override.
