"""Sync checker — compares parsed markdown against JSON data files."""

from __future__ import annotations

import json
from pathlib import Path

from rich.console import Console
from rich.table import Table

from pipeline import CLEANED_REFS_DIR, DATA_DIR

console = Console()

# Map of source type → (markdown file, json file, name extraction)
SYNC_SOURCES = {
    "races": ("04-Races.md", "races.json"),
    "classes": ("06-Classes.md", "classes.json"),
    "feats": ("07-Feats.md", "feats.json"),
}


def check_sync(
    source: str,
    refs_dir: Path | None = None,
    data_dir: Path | None = None,
) -> None:
    """Compare markdown content against JSON data for a given source type."""
    refs = refs_dir or CLEANED_REFS_DIR
    data = data_dir or DATA_DIR

    if source not in SYNC_SOURCES:
        console.print(f"[red]Unknown source type: {source}[/red]")
        console.print(f"Available: {', '.join(SYNC_SOURCES.keys())}")
        return

    md_file, json_file = SYNC_SOURCES[source]
    md_path = refs / md_file
    json_path = data / json_file

    if not md_path.exists():
        console.print(f"[red]Markdown file not found: {md_path}[/red]")
        return
    if not json_path.exists():
        console.print(f"[red]JSON file not found: {json_path}[/red]")
        return

    md_content = md_path.read_text(encoding="utf-8")
    json_data = json.loads(json_path.read_text(encoding="utf-8"))

    # Extract names from markdown
    md_names = _extract_names_from_markdown(source, md_content)

    # Extract names from JSON
    json_names = _extract_names_from_json(source, json_data)

    # Compare
    md_set = set(md_names)
    json_set = set(json_names)

    only_md = sorted(md_set - json_set)
    only_json = sorted(json_set - md_set)
    matched = sorted(md_set & json_set)

    table = Table(title=f"Sync Check: {source}")
    table.add_column("Status", justify="center")
    table.add_column("Name")
    table.add_column("Source")

    for name in only_md:
        table.add_row("[yellow]+ new[/yellow]", name, "markdown only")
    for name in only_json:
        table.add_row("[red]- missing[/red]", name, "JSON only")

    console.print(table)
    console.print(f"\n[bold]Summary:[/bold] {len(matched)} matched, {len(only_md)} in markdown only, {len(only_json)} in JSON only")

    if not only_md and not only_json:
        console.print("[green]✓ Markdown and JSON are in sync (by name).[/green]")


def _extract_names_from_markdown(source: str, content: str) -> list[str]:
    """Extract entity names from markdown using the appropriate parser."""
    if source == "races":
        from pipeline.parsers.races import parse_races

        return [r.name for r in parse_races(content)]
    if source == "classes":
        from pipeline.parsers.classes import parse_classes

        return [c.name for c in parse_classes(content)]
    if source == "feats":
        from pipeline.parsers.feats import parse_feats

        return [f.name for f in parse_feats(content)]
    return []


def _extract_names_from_json(source: str, data: dict | list) -> list[str]:
    """Extract entity names from JSON data."""
    if source == "races":
        return [r["name"] for r in data.get("races", [])]
    if source == "classes":
        return [c["name"] for c in data.get("classes", [])]
    if source == "feats":
        return [f["name"] for f in data.get("feats", [])]
    return []
