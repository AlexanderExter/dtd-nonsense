# DTD Pipeline

TypeScript pipeline scripts for data validation, content linting, and sync checking in **Dungeons the Dragoning 40,000: 7th Edition**.

## CLI Commands

All commands run via npm scripts (backed by `bun`):

| Script               | Command                         | Purpose                                             |
| -------------------- | ------------------------------- | --------------------------------------------------- |
| `bun run validate`   | `bun run scripts/validate.ts`   | Validate all 12 JSON data files against Zod schemas |
| `bun run lint:data`  | `bun run scripts/lint.ts`       | Lint markdown for terminology, formatting, encoding |
| `bun run sync-check` | `bun run scripts/sync-check.ts` | Detect drift between markdown and JSON data         |
| `bun run knip`       | `knip`                          | Dead code detection: unused files, exports, types   |

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

Knip runs as the final step in `bun run check` and in CI. New unused exports or files will fail the check.

## Script Structure

```text
scripts/
├── validate.ts       JSON schema validation engine (Zod-based)
├── lint.ts           Markdown content linting (terminology, formatting, encoding)
├── sync-check.ts     Markdown ↔ JSON drift checker (races, classes, feats parsers)
└── prebuild.mjs      Copies content into Astro structure, injects Starlight frontmatter

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
