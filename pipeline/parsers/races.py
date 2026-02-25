"""Race parser — extracts structured race data from cleaned-references/04-Races.md."""

from __future__ import annotations

import re
from dataclasses import dataclass

from .base import extract_bold_field, extract_sections


@dataclass
class ParsedRace:
    """Race data extracted from markdown."""

    name: str
    size: int | None
    languages: list[str]
    char_bonus: str | None
    skill_bonus: str | None
    power_name: str | None
    power_description: str | None


def parse_races(content: str) -> list[ParsedRace]:
    """Parse 04-Races.md into structured race data."""
    sections = extract_sections(content, target_level=2)
    races: list[ParsedRace] = []

    # Skip non-race sections (overview, summary tables, etc.)
    skip_headings = {
        "Racial Traits Overview",
        "Summary Table",
        "Racial Traits Summary",
    }

    for section in sections:
        if section.heading in skip_headings:
            continue

        # Extract fields using bold-label patterns
        size_str = extract_bold_field(section.content, "Size")
        size = int(size_str) if size_str and size_str.isdigit() else None

        lang_str = extract_bold_field(section.content, "Languages")
        languages = [lang.strip() for lang in lang_str.split(",")] if lang_str else []

        char_bonus = extract_bold_field(section.content, "Characteristic Modifiers")
        if not char_bonus:
            char_bonus = extract_bold_field(section.content, "Characteristic Bonus")

        skill_bonus = extract_bold_field(section.content, "Skill Bonus")
        if not skill_bonus:
            skill_bonus = extract_bold_field(section.content, "Skill Bonuses")

        # Racial power: look for **Racial Power:** or a bullet with **Power Name:**
        power_name = None
        power_desc = None
        power_match = re.search(
            r"\*\*(?:Racial Power|Power):\*\*\s*\n-\s*\*\*(.+?):\*\*\s*(.+?)(?=\n\n|\n-|\Z)",
            section.content,
            re.DOTALL,
        )
        if power_match:
            power_name = power_match.group(1).strip()
            power_desc = power_match.group(2).strip()
        else:
            # Simpler format: **Racial Power:** description
            simple = re.search(
                r"\*\*Racial Power:\*\*\s*(.+?)(?=\n\n|\Z)",
                section.content,
                re.DOTALL,
            )
            if simple:
                power_desc = simple.group(1).strip()

        races.append(
            ParsedRace(
                name=section.heading,
                size=size,
                languages=languages,
                char_bonus=char_bonus,
                skill_bonus=skill_bonus,
                power_name=power_name,
                power_description=power_desc,
            )
        )

    return races
