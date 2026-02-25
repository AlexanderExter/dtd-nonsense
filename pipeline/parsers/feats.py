"""Feat parser — extracts structured feat data from cleaned-references/07-Feats.md."""

from __future__ import annotations

import re
from dataclasses import dataclass

from .base import extract_sections


@dataclass
class ParsedFeat:
    """Feat data extracted from markdown."""

    name: str
    category: str | None
    effect: str | None
    multiple_allowed: bool
    groups: list[str] | None
    prerequisites: str | None


def parse_feats(content: str) -> list[ParsedFeat]:
    """Parse 07-Feats.md into structured feat data.

    This is a best-effort parser — feat descriptions use varied formatting.
    """
    feats: list[ParsedFeat] = []
    current_category: str | None = None

    # Track which H2 section we're in for category mapping
    category_map = {
        "General Feats": "general",
        "Racial Feats": "racial",
        "Supplementary Feats": "supplementary",
        "Assets": "assets",
        "Exalted Assets": "exaltedAssets",
        "Hindrances": "hindrances",
    }

    sections = extract_sections(content, target_level=2)

    for section in sections:
        if section.heading in category_map:
            current_category = category_map[section.heading]
            continue

        # Skip non-feat sections
        if section.heading in ("Feat Groups", "Feat Summary Table", "Feat Descriptions"):
            continue

    # Also try parsing **Feat Name** bold-header patterns within sections
    # This handles the flat list format
    current_category = None

    for line_num, line in enumerate(content.splitlines()):
        # Track H2 headings for category
        h2_match = re.match(r"^##\s+(.+)$", line)
        if h2_match:
            heading = h2_match.group(1).strip()
            if heading in category_map:
                current_category = category_map[heading]
            continue

        # Match **Feat Name** or **Feat Name\***
        bold_match = re.match(r"^\*\*(.+?)(\\\*)?\*\*\s*$", line)
        if bold_match:
            name = bold_match.group(1).strip()
            multiple = bold_match.group(2) is not None

            # Look ahead for description and groups
            remaining_lines = content.splitlines()[line_num + 1 :]
            description_parts: list[str] = []
            groups: list[str] | None = None
            prereqs: str | None = None

            for next_line in remaining_lines:
                if next_line.strip() == "" and description_parts:
                    break
                if next_line.strip().startswith("**"):
                    break
                if next_line.strip().startswith("_Groups:"):
                    groups_str = next_line.strip().strip("_").replace("Groups:", "").strip()
                    groups = [g.strip() for g in groups_str.split(",")]
                    continue
                if next_line.strip().startswith("_Prerequisites:"):
                    prereqs = next_line.strip().strip("_").replace("Prerequisites:", "").strip()
                    continue
                if next_line.strip():
                    description_parts.append(next_line.strip())

            feats.append(
                ParsedFeat(
                    name=name,
                    category=current_category,
                    effect=" ".join(description_parts) if description_parts else None,
                    multiple_allowed=multiple,
                    groups=groups,
                    prerequisites=prereqs,
                )
            )

    return feats
