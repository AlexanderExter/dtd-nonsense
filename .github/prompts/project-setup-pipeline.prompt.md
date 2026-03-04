````prompt
# Python Pipeline Setup for Content Projects

> **⚠️ HISTORICAL REFERENCE** — This project migrated from Python to TypeScript in Phase 3 (2026-03-03).
> The Python pipeline described here no longer exists. This file is retained as a generic reference
> for setting up Python/Pydantic pipelines in other projects. For the current TypeScript pipeline,
> see `docs/pipeline.md`.

Reusable lessons for bootstrapping a Python support pipeline alongside a non-Python project (e.g., vanilla JS tools, static sites, markdown content). Learned from building a Pydantic validation + linting + migration-prep pipeline for a TTRPG documentation project.

---

## When You Need This

You have a project that is **not primarily Python** but would benefit from:
- **Schema validation** for JSON/YAML data files
- **Content linting** for markdown or other text
- **Data transformation** (migration prep, frontmatter injection, format conversion)
- **Sync checking** between content sources and derived data

The pipeline lives alongside the main project, not inside it. It's a development tool, not a runtime dependency.

---

## Recommended Stack

| Component       | Choice            | Why                                                                                 |
| --------------- | ----------------- | ----------------------------------------------------------------------------------- |
| Package manager | `uv`              | Fast, handles Python versions, deterministic lockfile, no global install pollution   |
| Build backend   | `hatchling`       | Minimal config, works with `uv`, supports `[project.scripts]` entry points          |
| Schema models   | Pydantic v2       | Typed JSON validation with excellent error messages; `model_json_schema()` for free  |
| CLI framework   | Click             | Composable commands, built-in `--help`, easy to extend                              |
| Output          | Rich              | Beautiful terminal tables and formatting (with caveats — see pitfalls)              |
| Linting (Python)| Ruff              | Fast, replaces flake8+isort+black for the pipeline's own code                       |
| Tests           | pytest            | Standard, nothing exotic needed for validation/linting tests                        |

### pyproject.toml Skeleton

```toml
[project]
name = "your-pipeline"
version = "0.1.0"
requires-python = ">=3.12"

dependencies = [
    "pydantic>=2.10",
    "click>=8.1",
    "rich>=13.0",
]

[project.scripts]
your-cli = "pipeline.cli:main"    # entry point

[project.optional-dependencies]
dev = ["pytest>=8.0", "ruff>=0.9"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

### Bootstrap Commands

```powershell
uv init --no-readme        # Creates pyproject.toml
uv add pydantic click rich # Core deps
uv add --dev pytest ruff   # Dev deps
uv sync                    # Install everything
uv run your-cli --help     # Verify CLI works
```

---

## Architecture Patterns

### Package Layout

```
pipeline/
├── __init__.py          # Path constants (PROJECT_ROOT, DATA_DIR, etc.)
├── cli.py               # Click CLI — thin dispatcher, imports on demand
├── validate.py          # Validation engine
├── models/
│   ├── __init__.py      # Model registry: { "file.json": (ModelClass, is_bare_array) }
│   ├── common.py        # Shared base models, enums, type aliases
│   └── *.py             # One file per JSON data file
└── linting/
    ├── runner.py         # Orchestrator: collect files → run checks → report → optionally fix
    ├── terminology.py    # Term replacement rules + dice notation checks
    └── formatting.py     # Heading hierarchy, table cells, encoding corruption
```

### Key Design Decisions

**Model the real data, not the docs.** Documentation gets stale. Always derive schemas from actual JSON file inspection:
```python
import json
data = json.loads(Path("data/file.json").read_text(encoding="utf-8"))
# Inspect actual shapes, field types, nullable fields, polymorphic entries
```

**Two strictness levels.** Use `extra="forbid"` (StrictModel) by default — it catches typos and rogue fields immediately. Use `extra="allow"` (LenientModel) for files that are still evolving, so you don't block work.

**Lazy imports in CLI.** Keep `cli.py` fast by importing heavy modules (Pydantic, validation logic) inside each Click command function, not at the top of the file.

**Registry pattern for models:**
```python
FILE_MODELS: dict[str, tuple[type, bool]] = {
    "races.json": (RacesFile, False),       # False = wrapped object
    "traits.json": (Trait, True),            # True = bare array
}
```

**Auto-fix architecture.** Give every lint issue a `suggestion` field. The fix runner filters by rule name and applies in reverse line order (bottom-up) to preserve line numbers:
```python
fixable = [i for i in issues if i.suggestion and i.rule in SAFE_RULES]
for issue in sorted(fixable, key=lambda i: (i.line, i.column), reverse=True):
    # Replace at exact column position
```

---

## Hard-Won Pitfalls

### PowerShell 5.1 Encoding

**The #1 most dangerous pitfall on Windows.** PowerShell 5.1 (the default on Windows) uses CP1252, not UTF-8. Any file operation that round-trips through PowerShell can silently corrupt Unicode characters.

- **NEVER** use `Set-Content` for non-ASCII files — it converts UTF-8 to CP1252
- **NEVER** pipe Rich output through PowerShell's `Select-Object`, `Out-String`, etc. — Rich uses Unicode arrows/box-drawing characters that crash in CP1252
- **ALWAYS** use `encoding="utf-8"` explicitly in all Python file I/O
- If you must use PowerShell I/O: `Set-Content file.md -Encoding utf8`

This also means: files that detect encoding corruption (`\xc3\x97` patterns) must use Unicode escape sequences (`\u00c3\u0097`), not raw bytes — or the detector file itself gets corrupted.

### Pydantic Union Types

Real-world data is messy. Expect polymorphic fields:
```python
# A field that's sometimes a list of strings, sometimes a list of objects
options: list[str | RacialPowerOption] | None = None

# A field that's sometimes a list, sometimes a dict
subOptions: list[dict] | dict[str, str] | None = None
```

Pydantic v2 handles discriminated unions well, but be explicit about every shape you accept.

### Cross-Reference Checking

When validating references across files (e.g., "class X references feat Y — does Y exist?"):
- **String refs may have parameters:** `"Fear (3)"` → strip `" ("` suffix before lookup
- **Dict refs exist:** `{"id": "fear", "param": 3}` → check `isinstance` before calling `.split()`
- **Choice entries:** `"Feat A OR Feat B"` — split on `" OR "`, check each alternative
- **Abbreviated names:** `"Weapon Prof (Basic)"` vs `"Weapon Proficiency (Basic)"` — match base name, not full name

### Rich Console + PowerShell Piping

Rich crashes when its Unicode output is piped through PowerShell cmdlets. Run Rich-based CLI commands directly, never through pipes:
```powershell
# BAD — crashes with UnicodeEncodeError on CP1252 terminal
uv run dtd validate | Select-Object -First 20

# GOOD — run directly
uv run dtd validate
```

---

## CLI Design

Use Click groups with lazy imports for fast startup:

```python
@click.group()
def main():
    """Your pipeline CLI."""

@main.command()
@click.option("--xref", is_flag=True)
def validate(xref):
    from pipeline.validate import validate_all  # lazy import
    results = validate_all()
    # ... display with Rich tables

@main.command()
@click.option("--fix", is_flag=True)
def lint(target, fix):
    from pipeline.linting.runner import run_linter
    run_linter(target=target, fix=fix)
```

### Exit Code Strategy

Decide upfront how to handle warnings vs errors:
- **Schema validation failures** → exit code 1 (hard fail)
- **Cross-reference warnings** → exit code 1 (surprising in CI — consider making this configurable)
- **Lint issues** → exit code 0 (informational), or 1 if errors exist

For CI, you may want `validate` (must pass) separate from `validate --xref` (informational, `continue-on-error: true`).

---

## Integration with Non-Python Project

The pipeline is a **peer** of the main project, not a parent:

```
project-root/
├── tools/              # Main project (JS, HTML, CSS)
│   └── shared/data/    # JSON files the pipeline validates
├── pipeline/           # Python package
├── pyproject.toml      # Python config (does NOT interfere with JS)
├── uv.lock             # Deterministic Python deps
└── .venv/              # Ignored, local only
```

Key principles:
- **No Python at runtime.** The pipeline is a dev tool. Production artifacts (HTML, JS, JSON) never import Python.
- **JSON is the interface.** Pydantic models validate the same JSON files that JS tools consume. The models must match actual file shapes, not documentation.
- **Pipeline scripts may write files** — but only when the scripts themselves are version-controlled, tested, and review-gated. Ad-hoc scripts remain banned.

---

## Recommended First Commands

Build these in order — each one is independently useful:

1. **`validate`** — schema validation. Highest value for lowest effort. Catches typos, missing fields, type mismatches immediately.
2. **`lint`** — content linting. Terminology enforcement, formatting consistency, encoding corruption detection.
3. **Domain-specific commands** — frontmatter injection, sync checking, schema export — add as needed for your workflow.

Each command should work in isolation. Don't create dependencies between commands unless necessary.

````
