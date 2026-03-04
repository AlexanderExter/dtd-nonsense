# DTD Pipeline

TypeScript pipeline scripts for data validation, content linting, and sync checking in **Dungeons the Dragoning 40,000: 7th Edition**.

## CLI Commands

All commands run via npm scripts (backed by `bun`):

| Script               | Command                         | Purpose                                             |
| -------------------- | ------------------------------- | --------------------------------------------------- |
| `npm run validate`   | `bun run scripts/validate.ts`   | Validate all 12 JSON data files against Zod schemas |
| `npm run lint:data`  | `bun run scripts/lint.ts`       | Lint markdown for terminology, formatting, encoding |
| `npm run sync-check` | `bun run scripts/sync-check.ts` | Detect drift between markdown and JSON data         |

### `npm run validate`

Validate all 12 JSON data files in `data/` against their Zod schemas.

```bash
npm run validate                              # Validate all files
bun run scripts/validate.ts --xref            # Also run cross-file reference checks
```

**Cross-reference checks** (`--xref`):

- Class skill names exist in `skills.json`
- Class feat names exist in `feats.json` (handles `" OR "` choice entries like `"Two Weapon Fighting OR Far Shot"`)
- NPC trait references exist in `traits.json` (handles both string refs and dict refs `{ id, param }`)

### `npm run lint:data`

Lint markdown content for terminology, formatting, and encoding issues.

```bash
npm run lint:data                             # Lint all content
```

**Rules enforced:**

- **Terminology**: Canonical term usage (Test not check, Armor not Armour, etc.)
- **Dice notation**: `XkY` must be in backticks
- **Formula symbols**: Use `×` and `−`, not `x` and `-`
- **Heading hierarchy**: No skipped heading levels
- **Table cells**: No empty cells (use `—` or `N/A`)
- **Encoding**: Detect UTF-8 corruption artifacts

### `npm run sync-check`

Compare parsed markdown content against JSON data files to detect drift.

```bash
npm run sync-check                            # Run all sync comparisons
```

Compares: `04-Races.md` ↔ `races.json`, `06-Classes.md` ↔ `classes.json`, `07-Feats.md` ↔ `feats.json`.

## Script Structure

```
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

> **Exit code behavior:** `bun run scripts/validate.ts --xref` exits with code 1 if any cross-ref warnings exist. For CI, use `npm run validate` (exits 0 when schemas pass) and run `--xref` as an informational step that's allowed to fail.

### CI Integration

The CI workflow (`.github/workflows/build.yml`) runs the TypeScript pipeline on every push and PR:

```yaml
- run: npm run lint # Biome JS/TS/CSS lint — must pass
- run: npm run test # Vitest unit tests — must pass
- run: npm run validate # Zod schema check — must pass
- run: npm run lint:data # Terminology/formatting — must pass
- run: npm run build # Astro build — must pass
```

## Conventions

- Pipeline scripts **may write files** when version-controlled, tested, and review-gated
- Ad-hoc scripts remain forbidden per project conventions
- All file I/O uses UTF-8 encoding explicitly
- Never use PowerShell `Set-Content` for non-ASCII output

## Roadmap

| Priority | Item                              | Status  | Notes                                                                       |
| -------- | --------------------------------- | ------- | --------------------------------------------------------------------------- |
| Done     | Astro/Starlight migration         | —       | Complete — all 9 tools ported, site live on Vercel                          |
| Done     | Python → TypeScript consolidation | —       | Pipeline fully ported to TypeScript; Python pipeline deleted                |
| Medium   | Expand sync checker               | Planned | Add weapons, exaltations, skills parsers (currently: races, classes, feats) |
| Lower    | Auto-generate `data-reference.md` | Planned | From Zod schema introspection — eliminate manual schema docs                |
