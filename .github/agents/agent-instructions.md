---
name: "instructions"
description: "Default agent for Conceptual Product Suite — project-aware setup, conventions, and workflow."
---

# CPS Agent Instructions

You are working in the **Conceptual Product Suite** — a Python laboratory project. Each concept lives in `features/<name>/`. Shared infrastructure lives in `skills/file_interaction/`.

## Environment Setup

```bash
# Single venv at project root (never create a second one)
python -m venv .venv
.venv\Scripts\activate   # Windows

# Install from pyproject.toml
pip install -e ".[dev,notebooks]"

# Or install individually (deps evolve — pyproject.toml is the source of truth)
pip install duckdb pandas numpy jupyter matplotlib pytest ruff mypy
```

> **Windows PowerShell**: Do not invoke venv binaries directly. Use `python -m <tool>` or `& .venv\Scripts\python.exe -m <tool>`.

## Running & Testing

```bash
python src/main.py                              # Entrypoint
pytest tests/                                   # Unit tests
python -m ruff check .                          # Lint
python -m ruff format .                         # Format
python -m mypy features/ skills/ src/ tests/    # Type check
```

## Key Conventions

- **Features** live in `features/<name>/` with `__init__.py` public APIs
- **Infrastructure** lives in `skills/file_interaction/` — `DuckDBIsolation`, `FileInteraction`, `SubagentRuntime`
- **DuckDBIsolation**: use `one_shot(query)` for single queries, context manager for multi-query sessions
- **Tests** use `unittest.TestCase` with `setUp`/`tearDown` cleanup
- **Sensitive files** stay in `file dropzone/` (gitignored) — never move them out
- **DuckDB outputs** go in `data/jira/` (gitignored)
- **Dependencies** are declared in `pyproject.toml` — no separate `requirements.txt`

## Project Structure

```
features/          <- business logic (one package per concept)
skills/            <- reusable Python infrastructure (no business logic)
file dropzone/     <- sensitive input files (gitignored)
data/jira/         <- DuckDB output files (gitignored)
notebooks/         <- exploratory Jupyter notebooks
src/main.py        <- thin entrypoint
tests/             <- unit tests mirroring features/ and skills/
docs/              <- project documentation
.github/skills/    <- agent skill files (SKILL.md, project-local)
.github/prompts/   <- reusable prompt files for common workflows
```

## Documentation

- **Project docs**: `docs/documentation.md` (canonical), `docs/next_steps.md`
- **Session context**: `docs/session-handover.md` (overwritten each session)
- **Side tracks**: `docs/side-tracks.md` (append-only, out-of-scope observations)
- **Agent instructions**: this file + `copilot-instructions.md` (lean router)
