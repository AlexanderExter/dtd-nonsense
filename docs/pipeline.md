# DTD Pipeline

Data pipeline and content tools for **Dungeons the Dragoning 40,000: 7th Edition**.

## Installation

```bash
uv sync               # Install all dependencies
uv sync --extra dev   # Include dev tools (pytest, ruff)
```

## CLI Commands

All commands are accessible via the `dtd` entry point:

```bash
dtd --help            # List all commands
dtd --version         # Show version
```

### `dtd validate`

Validate all 12 JSON data files in `data/` against their Pydantic schemas.

```bash
dtd validate                # Validate all files
dtd validate --file races.json   # Validate a single file
dtd validate --xref         # Also run cross-file reference checks
```

**Cross-reference checks** (`--xref`):

- Class skill names exist in `skills.json`
- Class feat names exist in `feats.json` (handles `" OR "` choice entries like `"Two Weapon Fighting OR Far Shot"`)
- NPC trait references exist in `traits.json` (handles both string refs and dict refs `{ id, param }`)

### `dtd lint`

Lint markdown content for terminology, formatting, and encoding issues.

```bash
dtd lint                          # Lint all content
dtd lint --target books           # Lint only books/
dtd lint --target cleaned-references  # Lint only cleaned-references/
dtd lint --fix                    # Apply safe auto-corrections
```

**Rules enforced:**

- **Terminology**: Canonical term usage (Test not check, Armor not Armour, etc.)
- **Dice notation**: `XkY` must be in backticks
- **Formula symbols**: Use `×` and `−`, not `x` and `-`
- **Heading hierarchy**: No skipped heading levels
- **Table cells**: No empty cells (use `—` or `N/A`)
- **Encoding**: Detect UTF-8 corruption artifacts

### `dtd starlight-prep`

Inject Starlight-compatible YAML frontmatter into `cleaned-references/` files.

```bash
dtd starlight-prep              # Apply frontmatter
dtd starlight-prep --dry-run    # Preview changes without writing
```

Adds frontmatter fields: `title`, `description`, `sidebar` (order, label, badge).

### `dtd sync-check`

Compare parsed markdown content against JSON data files to detect drift.

```bash
dtd sync-check --source races     # Compare 04-Races.md ↔ races.json
dtd sync-check --source classes   # Compare 06-Classes.md ↔ classes.json
dtd sync-check --source feats     # Compare 07-Feats.md ↔ feats.json
```

## Package Structure

```
pipeline/
├── __init__.py           Project paths (PROJECT_ROOT, DATA_DIR, etc.)
├── cli.py                Click CLI entry point
├── validate.py           JSON schema validation engine
├── models/               Pydantic schemas for all 12 JSON data files
│   ├── common.py         Shared types (CharacteristicGroup, CharacteristicId, etc.)
│   ├── races.py          races.json schema
│   ├── classes.py        classes.json schema
│   ├── feats.py          feats.json schema
│   ├── skills.py         skills.json schema
│   ├── weapons.py        weapons.json schema
│   ├── equipment.py      equipment.json schema
│   ├── backgrounds.py    backgrounds.json schema
│   ├── alignments.py     alignments.json schema
│   ├── exaltations.py    exaltations.json schema
│   ├── ships.py          ships.json schema
│   ├── npc_templates.py  npc-templates.json schema
│   └── traits.py         traits.json schema
├── parsers/              Markdown → structured data extractors
│   ├── base.py           Shared parsing utilities
│   ├── races.py          04-Races.md parser
│   ├── classes.py        06-Classes.md parser
│   ├── feats.py          07-Feats.md parser
│   └── sync.py           Markdown ↔ JSON drift checker
├── linting/              Content linting rules
│   ├── terminology.py    Canonical term enforcement
│   ├── formatting.py     Heading hierarchy, tables, encoding
│   └── runner.py         Aggregates rules, handles I/O
├── starlight/            Astro/Starlight preparation
│   └── frontmatter.py    Inject/update Zod-compatible frontmatter
└── extraction/           PDF pipeline (future)
    └── (pdf_to_markdown.py)
```

## Pydantic Models as Schema Truth

The Pydantic models in `pipeline/models/` are the **single source of truth** for all JSON schemas. They are modeled from the actual JSON file structure (not the previously outdated docs). Key design decisions:

- **`StrictModel`** (most files): `extra="forbid"` — catches unknown fields immediately
- **`LenientModel`** (complex/evolving files): `extra="allow"` — forward-compatible
- **Bare arrays**: `npc-templates.json` and `traits.json` are JSON arrays, not objects — handled via `TypeAdapter(list[Model])`
- **`ships.json` "class" field**: Python reserved word — pre-processed to `hullClass` before validation
- **Union types for polymorphic data**: Several fields accept multiple shapes — `subOptions: list[dict] | dict[str, str]` (feats), `options: list[str | RacialPowerOption]` (racial powers), `traits: list[str | NpcTraitRef]` (NPC templates)
- **`weapons.json` three-category split**: `WeaponsData` has `ranged`, `melee`, and `thrown` lists plus top-level `damageTypes` and `qualities` dicts
- **`ships.json` full coverage**: Models `torpedoTubeCost`, `criticalDamage` table, torpedo `accuracy`/`crit`/`arc`/`effect` fields, and integer `Shield.mark`

### Validation Status

All 12 JSON data files pass schema validation. Cross-reference checks produce warnings for genuine data quality issues (abbreviated feat names in `classes.json` like "Weapon Prof" instead of "Weapon Proficiency", and missing skills like "Craft", "Brawling", "Intimidate") — these are real data gaps, not checker bugs.

> **Exit code behavior:** `dtd validate --xref` exits with code 1 if any cross-ref warnings exist. For CI, use `dtd validate` (exits 0 when schemas pass) and run `--xref` as an informational step that's allowed to fail.

### CI Integration

The CI workflow (`.github/workflows/build.yml`) runs the full Python pipeline on every push and PR:

```yaml
- run: uv run ruff check . # Python lint — must pass
- run: uv run dtd validate # Schema check — must pass
- run: uv run dtd lint # Terminology/formatting — must pass
```

### Ruff Configuration

Ruff is configured in `pyproject.toml` with these intentional suppressions:

| Rule                    | Scope                             | Reason                                                                      |
| ----------------------- | --------------------------------- | --------------------------------------------------------------------------- |
| N815 (camelCase)        | `pipeline/models/*.py`            | Pydantic field names match JSON keys — renaming would break serialization   |
| RUF001/RUF002 (Unicode) | `pipeline/linting/terminology.py` | Terminology patterns use `×` (multiplication) and `−` (minus) intentionally |

Line length is set to **120** characters (bumped from default 100 to accommodate Rich formatting strings and Pydantic model definitions).

Do not "fix" the suppressed rules — the camelCase names are load-bearing for JSON round-trip, and the Unicode symbols match the project's [formula conventions](project-conventions.md#formula-symbols).

### Astro/Starlight Support

The pipeline directly supports the Astro + Starlight site (migration complete — all 9 tools ported):

- **Frontmatter injection** (`dtd starlight-prep`): Adds Starlight-compatible YAML frontmatter to `cleaned-references/` files — already applied to all 24 files
- **Content linting** (`dtd lint`): Enforces terminology and formatting consistency before content enters Starlight
- **Drift detection** (`dtd sync-check`): Catches markdown↔JSON divergence before migration snapshot
- **Schema export** (`dtd schema-export`, planned): Pydantic models → JSON Schema files, convertible to Zod via `json-schema-to-zod` for Starlight content collections

## Conventions

- Pipeline scripts **may write files** when version-controlled, tested, and review-gated
- Ad-hoc scripts remain forbidden per project conventions
- All file I/O uses `encoding="utf-8"` explicitly
- Never use PowerShell `Set-Content` for non-ASCII output
- **Auto-fix extensibility:** Any lint rule that provides a `suggestion` with deterministic, non-destructive semantics can be added to the safe-fix set in `_apply_fixes()` (`runner.py`). Currently safe: `terminology`, `dice-notation`. To add a new rule: ensure it populates `suggestion` on every `LintIssue`, then add the rule name to the `SAFE_RULES` tuple in the fixable filter.

## Roadmap

| Priority | Item                              | Status  | Notes                                                                       |
| -------- | --------------------------------- | ------- | --------------------------------------------------------------------------- |
| Done     | Astro/Starlight migration         | —       | Complete — all 9 tools ported, site live on Vercel                          |
| Medium   | `dtd schema-export` command       | Planned | Pydantic → JSON Schema → Zod for Starlight content collections              |
| Medium   | Expand sync checker               | Planned | Add weapons, exaltations, skills parsers (currently: races, classes, feats) |
| Lower    | Auto-generate `data-reference.md` | Planned | From Pydantic model introspection — eliminate manual schema docs            |
