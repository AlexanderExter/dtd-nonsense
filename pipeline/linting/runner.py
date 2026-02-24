"""Linting runner — aggregates all linting rules and handles I/O."""

from __future__ import annotations

from pathlib import Path

from rich.console import Console
from rich.table import Table

from pipeline import BOOKS_DIR, CLEANED_REFS_DIR
from pipeline.linting.formatting import (
    check_empty_table_cells,
    check_encoding_markers,
    check_heading_hierarchy,
)
from pipeline.linting.terminology import (
    LintIssue,
    Severity,
    check_dice_notation,
    check_formula_symbols,
    check_terminology,
)

console = Console()


def _collect_markdown_files(target: str) -> list[Path]:
    """Gather markdown files based on target selector."""
    files: list[Path] = []

    if target in ("books", "all"):
        for md in sorted(BOOKS_DIR.rglob("*.md")):
            files.append(md)

    if target in ("cleaned-references", "all"):
        for md in sorted(CLEANED_REFS_DIR.glob("*.md")):
            files.append(md)

    return files


def _run_checks(filepath: Path) -> list[LintIssue]:
    """Run all lint checks against a single file."""
    content = filepath.read_text(encoding="utf-8")
    lines = content.splitlines()
    rel_path = str(filepath)

    issues: list[LintIssue] = []
    issues.extend(check_terminology(rel_path, lines))
    issues.extend(check_dice_notation(rel_path, lines))
    issues.extend(check_formula_symbols(rel_path, lines))
    issues.extend(check_heading_hierarchy(rel_path, lines))
    issues.extend(check_empty_table_cells(rel_path, lines))
    issues.extend(check_encoding_markers(rel_path, content))

    return issues


def _apply_fixes(filepath: Path, issues: list[LintIssue]) -> int:
    """Apply safe auto-corrections and return the count of fixes applied.

    Only applies fixes for rules where we have high confidence:
    - terminology replacements with exact suggestions
    - dice-notation backtick wrapping
    """
    fixable = [i for i in issues if i.suggestion and i.rule in ("terminology", "dice-notation")]
    if not fixable:
        return 0

    content = filepath.read_text(encoding="utf-8")
    lines = content.splitlines()
    fixes_applied = 0

    # Apply fixes in reverse order (bottom-up) to preserve line numbers
    for issue in sorted(fixable, key=lambda i: (i.line, i.column), reverse=True):
        line_idx = issue.line - 1
        if line_idx < len(lines):
            line = lines[line_idx]
            # Find the exact match at the expected column
            col = issue.column - 1
            # Extract the problematic term from the message
            old_term = issue.message.split("'")[1]
            if line[col : col + len(old_term)] == old_term and issue.suggestion:
                lines[line_idx] = line[:col] + issue.suggestion + line[col + len(old_term) :]
                fixes_applied += 1

    if fixes_applied > 0:
        filepath.write_text("\n".join(lines) + "\n", encoding="utf-8")

    return fixes_applied


def run_linter(target: str, fix: bool = False) -> None:
    """Execute the full linting pipeline."""
    files = _collect_markdown_files(target)
    if not files:
        console.print(f"[yellow]No markdown files found for target '{target}'[/yellow]")
        return

    console.print(f"Linting {len(files)} markdown files...\n")

    all_issues: list[LintIssue] = []
    total_fixes = 0

    for filepath in files:
        issues = _run_checks(filepath)
        if issues:
            all_issues.extend(issues)
            if fix:
                fixed = _apply_fixes(filepath, issues)
                total_fixes += fixed

    if not all_issues:
        console.print("[green bold]No issues found![/green bold]")
        return

    # Group by file for display
    by_file: dict[str, list[LintIssue]] = {}
    for issue in all_issues:
        by_file.setdefault(issue.file, []).append(issue)

    # Summary table
    table = Table(title="Lint Results", show_lines=False)
    table.add_column("File", style="cyan")
    table.add_column("Errors", justify="right", style="red")
    table.add_column("Warnings", justify="right", style="yellow")
    table.add_column("Info", justify="right", style="blue")

    for filepath_str, issues in sorted(by_file.items()):
        errors = sum(1 for i in issues if i.severity == Severity.ERROR)
        warnings = sum(1 for i in issues if i.severity == Severity.WARNING)
        infos = sum(1 for i in issues if i.severity == Severity.INFO)
        # Shorten path for display
        display_path = filepath_str.split("DTD Nonsense\\")[-1] if "DTD Nonsense\\" in filepath_str else filepath_str
        table.add_row(display_path, str(errors), str(warnings), str(infos))

    console.print(table)

    # Detail listing (first 20 issues)
    console.print(f"\n[bold]Details (showing first 20 of {len(all_issues)}):[/bold]")
    for issue in all_issues[:20]:
        display_path = issue.file.split("DTD Nonsense\\")[-1] if "DTD Nonsense\\" in issue.file else issue.file
        sev_color = {"error": "red", "warning": "yellow", "info": "blue"}[issue.severity.value]
        console.print(
            f"  [{sev_color}]{issue.severity.value:>7}[/{sev_color}] "
            f"{display_path}:{issue.line}:{issue.column} "
            f"[dim]({issue.rule})[/dim] {issue.message}"
        )

    # Summary line
    errors = sum(1 for i in all_issues if i.severity == Severity.ERROR)
    warnings = sum(1 for i in all_issues if i.severity == Severity.WARNING)
    infos = sum(1 for i in all_issues if i.severity == Severity.INFO)
    console.print(f"\n[bold]{len(all_issues)} issues:[/bold] {errors} errors, {warnings} warnings, {infos} info")

    if fix and total_fixes > 0:
        console.print(f"[green]{total_fixes} auto-fixes applied.[/green]")
    elif fix:
        console.print("[dim]No auto-fixable issues found.[/dim]")

    if errors > 0:
        raise SystemExit(1)
