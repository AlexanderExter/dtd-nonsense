"""DTD Pipeline CLI — entry point for all pipeline commands.

Usage:
    dtd validate          Validate all JSON data files against Pydantic schemas
    dtd validate --xref   Also run cross-file reference checks
    dtd lint              Lint markdown content for terminology and formatting
    dtd starlight-prep    Inject Starlight-compatible frontmatter
"""

from __future__ import annotations

import io
import sys
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from pipeline import DATA_DIR

# Force UTF-8 output so Rich's Unicode symbols (✓, ✗, ⚠, →) don't crash
# on Windows terminals using cp1252 / legacy code pages.
_utf8_stdout = io.TextIOWrapper(
    sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True
)
console = Console(file=_utf8_stdout)


@click.group()
@click.version_option(version="0.1.0", prog_name="dtd")
def main() -> None:
    """DTD Pipeline — data validation, content linting, and build tools."""


# ---------------------------------------------------------------------------
# dtd validate
# ---------------------------------------------------------------------------


@main.command()
@click.option("--xref", is_flag=True, help="Run cross-file reference checks too")
@click.option("--file", "filename", default=None, help="Validate a single file only")
@click.option("--data-dir", type=click.Path(exists=True, path_type=Path), default=None)
def validate(xref: bool, filename: str | None, data_dir: Path | None) -> None:
    """Validate JSON data files against Pydantic schemas."""
    from pipeline.validate import cross_reference_check, validate_all, validate_file

    target_dir = data_dir or DATA_DIR

    results = [validate_file(filename, target_dir)] if filename else validate_all(target_dir)

    # Display results table
    table = Table(title="Schema Validation", show_lines=False)
    table.add_column("File", style="cyan", no_wrap=True)
    table.add_column("Status", justify="center")
    table.add_column("Records", justify="right")
    table.add_column("Errors", style="red")

    all_ok = True
    for r in results:
        status = "[green]✓[/green]" if r.ok else "[red]✗[/red]"
        error_text = "\n".join(r.errors[:5]) if r.errors else ""
        if len(r.errors) > 5:
            error_text += f"\n  ... and {len(r.errors) - 5} more"
        table.add_row(r.file, status, str(r.record_count) if r.ok else "—", error_text)
        if not r.ok:
            all_ok = False

    console.print(table)

    # Cross-reference checks
    if xref:
        console.print("\n[bold]Cross-reference checks:[/bold]")
        issues = cross_reference_check(target_dir)
        if issues:
            for issue in issues:
                console.print(f"  [yellow]⚠[/yellow] {issue}")
            all_ok = False
        else:
            console.print("  [green]✓[/green] All cross-references valid")

    # Summary
    passed = sum(1 for r in results if r.ok)
    total = len(results)
    if all_ok:
        console.print(f"\n[green bold]All {total} files validated successfully.[/green bold]")
    else:
        console.print(f"\n[red bold]{total - passed}/{total} files failed validation.[/red bold]")
        raise SystemExit(1)


# ---------------------------------------------------------------------------
# dtd lint
# ---------------------------------------------------------------------------


@main.command()
@click.option(
    "--target",
    type=click.Choice(["books", "cleaned-references", "all"]),
    default="all",
    help="Which content directory to lint",
)
@click.option("--fix", is_flag=True, help="Apply safe auto-corrections")
def lint(target: str, fix: bool) -> None:
    """Lint markdown content for terminology and formatting issues."""
    from pipeline.linting.runner import run_linter

    run_linter(target=target, fix=fix)


# ---------------------------------------------------------------------------
# dtd starlight-prep
# ---------------------------------------------------------------------------


@main.command("starlight-prep")
@click.option("--dry-run", is_flag=True, help="Show changes without writing files")
def starlight_prep(dry_run: bool) -> None:
    """Inject Starlight-compatible YAML frontmatter into cleaned-references."""
    from pipeline.starlight.frontmatter import prepare_starlight_frontmatter

    prepare_starlight_frontmatter(dry_run=dry_run)


# ---------------------------------------------------------------------------
# dtd sync-check
# ---------------------------------------------------------------------------


@main.command("sync-check")
@click.option("--source", default="races", help="Which content type to check (races, classes, feats)")
def sync_check(source: str) -> None:
    """Compare cleaned-references markdown against JSON data for drift."""
    from pipeline.parsers.sync import check_sync

    check_sync(source=source)


if __name__ == "__main__":
    main()
