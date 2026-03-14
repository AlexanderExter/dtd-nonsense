# DTD Pipeline

TypeScript pipeline scripts for data validation, content linting, and sync checking in **Dungeons the Dragoning 40,000: 7th Edition**.

## CLI Commands

All commands run via npm scripts (backed by `bun`):

| Script                  | Command                              | Purpose                                             |
| ----------------------- | ------------------------------------ | --------------------------------------------------- |
| `bun run validate`      | `bun run scripts/validate.ts`        | Validate all 12 JSON data files against Zod schemas |
| `bun run lint:data`     | `bun run scripts/lint.ts`            | Lint markdown for terminology, formatting, encoding |
| `bun run sync-check`    | `bun run scripts/sync-check.ts`      | Detect drift between markdown and JSON data         |
| `bun run knip`          | `knip`                               | Dead code detection: unused files, exports, types   |
| `bun run check:deps`    | `depcruise --validate ...`           | Enforce architectural import boundaries             |
| `bun run check:structure` | `bun run scripts/check-structure.ts` | Verify TS structural conventions (stores, barrel, named exports) |
| `bun run test:coverage` | `bun test --coverage`                | Text coverage summary (local-only, no CI threshold) |
| `bun run test:coverage:lcov` | `bun test --coverage --coverage-reporter=lcov` | lcov report for tooling integration |

Session lifecycle scripts (`session:start`, `session:end`, `session:status`) and the pre-commit hook are documented in [project-conventions.md](project-conventions.md#git-workflow) — they manage git workflow, not data pipelines.

### `bun run upgrade:recon`

Gather dependency ground truth for the upgrade prompt. Outputs a JSON manifest to stdout (machine-readable) and an ANSI-colored summary to stderr (human-readable).

```bash
bun run upgrade:recon
```

**Data gathered:**

- Outdated packages (current/wanted/latest, bump type, pin status, tier classification)
- Dependency tree health (`bun pm ls` problems, unmet peer deps)
- Security audit (vulnerability severity counts and advisories)
- Override staleness (whether each `package.json` override is still needed)
- Framework compatibility (Starlight/Vercel adapter peer dep ranges, migration guide URLs)
- Engine requirements (whether major bumps need a higher Node version)
- Tool availability (ncu, Bun, Node/npm versions)

Used by the `dependency-upgrade` prompt (`.github/prompts/dependency-upgrade.prompt.md`) as the ground-truth input for automated upgrade sessions.

### `bun run validate`

Validate all 12 JSON data files in `data/` against their Zod schemas.

```bash
bun run validate                              # Validate all files
bun run scripts/validate.ts --xref            # Also run cross-file reference checks
```

**Cross-reference checks** (`--xref`):

- Class skill names exist in `skills.json`
- Class feat names exist in `feats.json` (handles `" OR "` choice entries like `"Two Weapon Fighting OR Far Shot"`)
- NPC trait references exist in `traits.json` (handles both string refs and dict refs `{ id, param }`)

### `bun run lint:data`

Lint markdown content for terminology, formatting, and encoding issues.

```bash
bun run lint:data                             # Lint all content
```

**Rules enforced:**

- **Terminology**: Canonical term usage (Test not check, Armor not Armour, etc.)
- **Dice notation**: `XkY` must be in backticks
- **Formula symbols**: Use `×` and `−`, not `x` and `-`
- **Heading hierarchy**: No skipped heading levels
- **Table cells**: No empty cells (use `—` or `N/A`)
- **Encoding**: Detect UTF-8 corruption artifacts

### `bun run sync-check`

Compare parsed markdown content against JSON data files to detect drift.

```bash
bun run sync-check                            # Run all sync comparisons
```

Compares: `04-Races.mdx` ↔ `races.json`, `06-Classes.mdx` ↔ `classes.json`, `07-Feats.mdx` ↔ `feats.json`.

### `bun run knip`

Detect unused files, exports, types, and dependencies across the project.

```bash
bun run knip                                  # Run dead code detection
```

**Configuration:** `knip.json` at project root defines entry points, project scope, and false-positive suppression:

- **Entry points:** `src/pages/**/*.astro`, `scripts/*.{ts,mjs}`
- **Project scope:** `src/**/*.{ts,tsx,astro}`, `scripts/**/*.{ts,mjs}`
- **Ignored modules:** `src/lib/dtd/schemas/**` (loaded dynamically via string keys)
- **Ignored dependencies:** `@astrojs/check`, `@astrojs/starlight-tailwind`, `tailwindcss`, `react-hook-form` (consumed via CSS `@import`, Vite plugins, or framework integrations — not direct JS imports)

Knip runs as the second-to-last step in `bun run check`. New unused exports or files will fail the check.

### `bun run check:deps`

Enforce architectural import boundaries using [dependency-cruiser](https://github.com/sverweij/dependency-cruiser).

```bash
bun run check:deps
```

**Configuration:** `.dependency-cruiser.cjs` at the project root. Rules are split into two groups:

- **Default rules** (auto-generated): circular dependencies, orphan detection, deprecated modules, unresolvable imports, dev-dep mixing.
- **Project-specific rules** — encoding the tool-island architecture:

| Rule | Description |
| ---- | ----------- |
| `no-ui-to-tools` | `src/components/react/ui/` must not import from `src/components/react/tools/` |
| `no-cross-tool-imports` | Tool A may not import from Tool B — each tool is an independent React island |
| `scripts-no-components` | `scripts/` may not import from `src/components/` |
| `no-lib-imports-react` | `src/lib/dtd/` must not import `react` or `react-dom` — stays DOM-free |

**Scope:** Scans `src/components`, `src/lib`, `src/hooks`, and `scripts/` (skips `.astro` pages and generated files).

**Agent use:** `depcruise --validate --output-type err ...` exits 0 on clean, 1 on violations. `--output-type json` gives machine-readable output.

**Configuration notes — required for TypeScript + Bun + Astro projects:**

The default generated config needs four adjustments before it runs cleanly on this stack. These are already applied in `.dependency-cruiser.cjs`:

| Fix | Why |
| --- | --- |
| `tsPreCompilationDeps: true` | `import type` is invisible by default — type-only modules (e.g. `types.ts`) appear as orphans even when used across 30+ files |
| Exclude `^astro:` and `^bun:` from `not-to-unresolvable` + `no-non-package-json` | Virtual module specifiers resolved at runtime — not on-disk packages, not in `package.json` |
| Add `*App.tsx` to the `no-orphans` allowlist | Tool entry points are imported by `.astro` pages which dep-cruiser cannot parse |
| Add `[.]test[.]` and `^scripts/` to the `no-orphans` allowlist | Entry points for `bun:test` runner and `bun run` direct invocation — no JS importer |

If you add a new virtual module scheme (e.g. a Vite plugin that introduces `virtual:foo`) or a new script entry point, add it to the corresponding exclusion.

### `bun run check:structure`

Verify TypeScript structural conventions using [ts-morph](https://ts-morph.com/) (TypeScript Compiler API wrapper).

```bash
bun run check:structure
bun run check:structure --json    # machine-readable JSON output
```

**Script:** `scripts/check-structure.ts` — three sequential checks:

| Check | Rule | Files |
| ----- | ---- | ----- |
| **Store Conventions** | Every `store.ts` must export a `use*Store` function | `src/components/react/tools/*/store.ts` |
| **Barrel Export Completeness** | `core.ts` must re-export `./character.ts`, `./data.ts`, `./derived.ts` | `src/lib/dtd/core.ts` |
| **Named Exports Only** | No `export default` in components or lib | `src/components/react/**/*.tsx`, `src/lib/dtd/**/*.ts` |

**Agent use:** Exits 0 on all pass, 1 on any failure. `--json` flag emits `{ passed: bool, checks: CheckResult[] }` for programmatic consumption.

**Extending:** Add new check functions that receive the `ts-morph` `Project` instance and return a `CheckResult`. Append to the `results` array in the runner section.

## Script Structure

```text
scripts/
├── validate.ts          JSON schema validation engine (Zod-based)
├── lint.ts              Markdown content linting (terminology, formatting, encoding)
├── sync-check.ts        Markdown ↔ JSON drift checker (races, classes, feats parsers)
├── check-structure.ts   ts-morph structural convention checks (store names, barrel, named exports)
├── prebuild.mjs         Copies content into Astro structure, injects Starlight frontmatter
└── codemods/            One-off jscodeshift transforms (committed for review, deleted post-merge)

src/lib/dtd/schemas/  Zod schemas for all 12 JSON data files
├── common.ts         Shared types (CharacteristicGroup, CharacteristicId, etc.)
├── index.ts          Schema registry — maps filenames to validation schemas
├── races.ts          races.json schema
├── classes.ts        classes.json schema
├── feats.ts          feats.json schema
├── skills.ts         skills.json schema
├── weapons.ts        weapons.json schema
├── equipment.ts      equipment.json schema
├── backgrounds.ts    backgrounds.json schema
├── alignments.ts     alignments.json schema
├── exaltations.ts    exaltations.json schema
├── ships.ts          ships.json schema
├── npc-templates.ts  npc-templates.json schema
└── traits.ts         traits.json schema
```

## Zod Schemas as Schema Truth

The Zod schemas in `src/lib/dtd/schemas/` are the **single source of truth** for all JSON data schemas. They replaced the former Pydantic models in `pipeline/models/` (deleted). Key design decisions:

- **Strict parsing** (most files): Unknown fields cause validation failure
- **Bare arrays**: `npc-templates.json` and `traits.json` are JSON arrays, not objects — handled via `isBareArray` flag in the schema registry
- **Union types for polymorphic data**: Several fields accept multiple shapes — `subOptions: list | dict` (feats), `options: string[] | RacialPowerOption[]` (racial powers), `traits: string[] | NpcTraitRef[]` (NPC templates)
- **`weapons.json` three-category split**: Schema has `ranged`, `melee`, and `thrown` lists plus top-level `damageTypes` and `qualities` dicts
- **`ships.json` full coverage**: Models `torpedoTubeCost`, `criticalDamage` table, torpedo `accuracy`/`crit`/`arc`/`effect` fields, and integer `Shield.mark`

### Validation Status

All 12 JSON data files pass schema validation. Cross-reference checks produce warnings for genuine data quality issues (abbreviated feat names in `classes.json` like "Weapon Prof" instead of "Weapon Proficiency", and missing skills like "Craft", "Brawling", "Intimidate") — these are real data gaps, not checker bugs.

> **Exit code behavior:** `bun run scripts/validate.ts --xref` exits with code 1 if any cross-ref warnings exist. For CI, use `bun run validate` (exits 0 when schemas pass) and run `--xref` as an informational step that's allowed to fail.

### CI Integration

The CI workflow (`.github/workflows/build.yml`) runs the TypeScript pipeline on every push and PR:

```yaml
- run: bunx biome ci .                    # Biome JS/TS/CSS lint — must pass
- run: bun test                           # bun:test unit tests — must pass
- run: bun run scripts/validate.ts --xref # Zod schema + xref check — must pass
- run: bun run scripts/lint.ts            # Terminology/formatting — must pass
- run: bun run knip                       # Dead code detection — must pass
- run: bun run build                      # Astro build — must pass
```

## Conventions

- Pipeline scripts **may write files** when version-controlled, tested, and review-gated
- Ad-hoc scripts remain forbidden per project conventions
- All file I/O uses UTF-8 encoding explicitly
- Never use PowerShell `Set-Content` for non-ASCII output

## Roadmap

| Priority | Item                              | Status  | Notes                                                                       |
| -------- | --------------------------------- | ------- | --------------------------------------------------------------------------- |
| Done     | Astro/Starlight migration         | —       | Complete — all 6 tools ported, site live on Vercel                          |
| Done     | Python → TypeScript consolidation | —       | Pipeline fully ported to TypeScript; Python pipeline deleted                |
| Done     | Preact → React migration          | —       | 74 components, 6 Zustand stores, 18 Radix UI primitives (Phase 13)         |
| Done     | Stack health fixes                | —       | Barrel elimination, re-render fixes, dead code cleanup, RHF + Knip install  |
| Done     | MDX conversion                    | —       | 76 content files (.md→.mdx), pipeline scripts updated, docs updated         |
| High     | shadcn/ui migration               | Planned | Big-bang swap of 18 Radix UI hand-rolled primitives → shadcn/ui components  |
| Medium   | Expand sync checker               | Planned | Add weapons, exaltations, skills parsers (currently: races, classes, feats) |
| Lower    | Auto-generate `data-reference.md` | Planned | From Zod schema introspection — eliminate manual schema docs                |
