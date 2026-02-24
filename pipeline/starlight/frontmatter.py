"""Inject Starlight-compatible YAML frontmatter into cleaned-references.

Starlight content collections expect YAML frontmatter with fields like:
  title, description, sidebar (label, order, badge), tableOfContents, template.

This module maps the 24 cleaned-references files to a frontmatter schema,
derives order from the numeric file prefix, and injects/updates frontmatter.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import frontmatter
from rich.console import Console
from rich.table import Table

from pipeline import CLEANED_REFS_DIR

console = Console()

# ---------------------------------------------------------------------------
# Metadata registry — maps filename patterns to descriptions and groups
# ---------------------------------------------------------------------------

CONTENT_METADATA: dict[str, dict[str, str]] = {
    "01-Core-Rules.md": {
        "title": "Core Rules",
        "description": "Dice system, Tests, Raises, and Checks",
        "group": "Rules",
    },
    "02-Char-Creation.md": {
        "title": "Character Creation",
        "description": "9-step character creation process",
        "group": "Character",
    },
    "03-Characteristics-Skills.md": {
        "title": "Characteristics & Skills",
        "description": "9 characteristics and full skill list",
        "group": "Character",
    },
    "04-Races.md": {
        "title": "Races",
        "description": "16 playable races with traits, bonuses, and racial powers",
        "group": "Character",
    },
    "05-Exaltations.md": {
        "title": "Exaltations",
        "description": "Supernatural types — Vampire, Werewolf, and more",
        "group": "Character",
    },
    "06-Classes.md": {
        "title": "Classes",
        "description": "50+ classes with progression tracks and feat tables",
        "group": "Character",
    },
    "07-Feats.md": {
        "title": "Feats, Assets & Hindrances",
        "description": "Complete feat list with effects and prerequisites",
        "group": "Character",
    },
    "08-Backgrounds.md": {
        "title": "Backgrounds",
        "description": "Background dots — Allies, Wealth, Holdings, and more",
        "group": "Character",
    },
    "09-Alignments.md": {
        "title": "Alignments",
        "description": "Pantheons, devotion mechanics, and sin tables",
        "group": "Character",
    },
    "10-Equipment.md": {
        "title": "Equipment",
        "description": "Weapons, armor, gear, and starting packages",
        "group": "Equipment",
    },
    "11-Magic.md": {
        "title": "Magic",
        "description": "Sorcery system and spell schools",
        "group": "Powers",
    },
    "12-Sword-Schools.md": {
        "title": "Sword Schools",
        "description": "9 melee combat disciplines",
        "group": "Powers",
    },
    "13-Gun-Kata.md": {
        "title": "Gun Kata",
        "description": "6 ranged combat disciplines",
        "group": "Powers",
    },
    "14-Combat.md": {
        "title": "Combat",
        "description": "Combat rules, action economy, and initiative",
        "group": "Rules",
    },
    "15-Social-Combat.md": {
        "title": "Social Combat",
        "description": "Social interaction mechanics",
        "group": "Rules",
    },
    "16-Conditions.md": {
        "title": "Conditions",
        "description": "Status effects and their mechanical impact",
        "group": "Rules",
    },
    "17-Vehicles.md": {
        "title": "Vehicles",
        "description": "Vehicle rules and combat",
        "group": "Advanced",
    },
    "18-Ships.md": {
        "title": "Ships",
        "description": "Spelljammer-style space vessels",
        "group": "Advanced",
    },
    "19-Antagonists.md": {
        "title": "Antagonists",
        "description": "NPC creation and 40+ stat blocks",
        "group": "Storytelling",
    },
    "20-Artifacts.md": {
        "title": "Artifacts",
        "description": "Magical items and their properties",
        "group": "Equipment",
    },
    "21-Advanced-Rules.md": {
        "title": "Advanced Rules",
        "description": "Optional and supplemental rules",
        "group": "Advanced",
    },
    "22-SM-Reference.md": {
        "title": "Story Master Reference",
        "description": "Story Master tools and guidelines",
        "group": "Storytelling",
    },
    "23-Setting-Lore.md": {
        "title": "Setting & Lore",
        "description": "The Great Wheel, crystal spheres, and factions",
        "group": "Storytelling",
    },
    "99-Appendix-Archive.md": {
        "title": "Appendix & Errata",
        "description": "Errata and archived content — supersedes earlier files",
        "group": "Reference",
    },
}


@dataclass
class PrepResult:
    """Result of preparing a single file."""

    filename: str
    action: str  # "added", "updated", "unchanged", "skipped"
    frontmatter: dict[str, object] | None = None


def _extract_order(filename: str) -> int:
    """Extract numeric order from filename prefix (e.g., '04-Races.md' → 4)."""
    match = re.match(r"^(\d+)", filename)
    return int(match.group(1)) if match else 999


def _build_frontmatter(filename: str) -> dict[str, object]:
    """Build the Starlight frontmatter dict for a given file."""
    meta = CONTENT_METADATA.get(filename, {})
    order = _extract_order(filename)

    fm: dict[str, object] = {
        "title": meta.get("title", filename.replace(".md", "").split("-", 1)[-1]),
        "description": meta.get("description", ""),
        "sidebar": {
            "order": order,
            "label": meta.get("title", filename),
        },
    }

    # Add badge for errata
    if filename == "99-Appendix-Archive.md":
        fm["sidebar"] = {
            "order": order,
            "label": "Errata",
            "badge": {"text": "Errata", "variant": "caution"},
        }

    return fm


def prepare_starlight_frontmatter(
    dry_run: bool = False,
    source_dir: Path | None = None,
) -> list[PrepResult]:
    """Inject or update Starlight frontmatter in cleaned-references files."""
    target_dir = source_dir or CLEANED_REFS_DIR
    results: list[PrepResult] = []

    md_files = sorted(target_dir.glob("*.md"))
    if not md_files:
        console.print(f"[yellow]No markdown files found in {target_dir}[/yellow]")
        return results

    for filepath in md_files:
        filename = filepath.name

        if filename not in CONTENT_METADATA:
            results.append(PrepResult(filename=filename, action="skipped"))
            continue

        target_fm = _build_frontmatter(filename)
        content = filepath.read_text(encoding="utf-8")
        post = frontmatter.loads(content)

        # Check if frontmatter already matches
        existing = dict(post.metadata) if post.metadata else {}
        if existing == target_fm:
            results.append(PrepResult(filename=filename, action="unchanged", frontmatter=target_fm))
            continue

        action = "updated" if existing else "added"

        if not dry_run:
            post.metadata = target_fm
            filepath.write_text(frontmatter.dumps(post), encoding="utf-8")

        results.append(PrepResult(filename=filename, action=action, frontmatter=target_fm))

    # Display results
    table = Table(title="Starlight Frontmatter Prep" + (" (dry run)" if dry_run else ""))
    table.add_column("File", style="cyan")
    table.add_column("Action", justify="center")
    table.add_column("Title")

    for r in results:
        action_style = {
            "added": "[green]added[/green]",
            "updated": "[yellow]updated[/yellow]",
            "unchanged": "[dim]unchanged[/dim]",
            "skipped": "[dim]skipped[/dim]",
        }
        title = r.frontmatter.get("title", "") if r.frontmatter else ""
        table.add_row(r.filename, action_style.get(r.action, r.action), str(title))

    console.print(table)

    added = sum(1 for r in results if r.action == "added")
    updated = sum(1 for r in results if r.action == "updated")
    if dry_run:
        console.print(f"\n[dim]Dry run: {added} would be added, {updated} would be updated[/dim]")
    else:
        console.print(f"\n[green]{added} added, {updated} updated[/green]")

    return results
