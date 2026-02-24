"""Class parser — extracts structured class data from cleaned-references/06-Classes.md."""

from __future__ import annotations

from dataclasses import dataclass

from .base import extract_bold_field_full_line, extract_pipe_table, extract_sections


@dataclass
class ParsedClass:
    """Class data extracted from markdown."""

    name: str
    level: int | None
    prerequisites: str | None
    characteristics: list[str]
    skills: list[str]
    feats: list[dict[str, str]]
    completion_bonus: str | None
    suggested_exits: list[str]


def parse_classes(content: str) -> list[ParsedClass]:
    """Parse 06-Classes.md into structured class data."""
    sections = extract_sections(content, target_level=2)
    classes: list[ParsedClass] = []

    # Skip non-class sections
    skip_patterns = {
        "Class Rules",
        "Free Study",
        "Leveling Procedure",
        "Class Tracks",
        "Level 1 Classes",
        "Level 2 Classes",
        "Level 3 Classes",
        "Level 4 Classes",
        "Level 5 Classes",
        "Standalone Classes",
    }

    for section in sections:
        if section.heading in skip_patterns:
            continue
        # Skip track headings (end with "Track")
        if section.heading.endswith("Track"):
            continue

        # Extract level
        level_str = extract_bold_field_full_line(section.content, "Level")
        level = int(level_str) if level_str and level_str.isdigit() else None

        # Extract prerequisites
        prereqs = extract_bold_field_full_line(section.content, "Prerequisites")

        # Extract characteristics
        chars_str = extract_bold_field_full_line(section.content, "Characteristics")
        characteristics = [c.strip() for c in chars_str.split(",")] if chars_str else []

        # Extract skills
        skills_str = extract_bold_field_full_line(section.content, "Skills")
        skills = [s.strip() for s in skills_str.split(",")] if skills_str else []

        # Extract feat table
        feats = extract_pipe_table(section.content)

        # Completion bonus
        bonus = extract_bold_field_full_line(section.content, "Bonus for Completion")
        if not bonus:
            bonus = extract_bold_field_full_line(section.content, "Completion Bonus")

        # Suggested exits
        exits_str = extract_bold_field_full_line(section.content, "Suggested Exits")
        exits = [e.strip() for e in exits_str.split(",")] if exits_str else []

        classes.append(
            ParsedClass(
                name=section.heading,
                level=level,
                prerequisites=prereqs,
                characteristics=characteristics,
                skills=skills,
                feats=feats,
                completion_bonus=bonus,
                suggested_exits=exits,
            )
        )

    return classes
