"""Base utilities for parsing structured markdown content."""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class ParsedSection:
    """A section of markdown content extracted by heading."""

    heading: str
    level: int
    content: str
    line_start: int


def extract_sections(text: str, target_level: int = 2) -> list[ParsedSection]:
    """Split markdown into sections at the given heading level.

    Args:
        text: Full markdown content.
        target_level: Heading level to split on (2 = ##, 3 = ###, etc.)

    Returns:
        List of ParsedSection, each containing the heading text
        and the content until the next heading at the same or higher level.
    """
    pattern = re.compile(rf"^({'#' * target_level})\s+(.+)$", re.MULTILINE)
    sections: list[ParsedSection] = []
    matches = list(pattern.finditer(text))

    for i, match in enumerate(matches):
        heading = match.group(2).strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start:end].strip()
        line_num = text[: match.start()].count("\n") + 1

        sections.append(
            ParsedSection(
                heading=heading,
                level=target_level,
                content=content,
                line_start=line_num,
            )
        )

    return sections


def extract_bold_field(content: str, field_name: str) -> str | None:
    """Extract the value of a **Field Name:** pattern from content.

    Example: '**Size:** 5 | **Languages:** Trade' → '5 | **Languages:** Trade'
    for field_name='Size', returns '5'.
    """
    pattern = re.compile(rf"\*\*{re.escape(field_name)}:\*\*\s*(.+?)(?:\s*\||\s*$)", re.MULTILINE)
    match = pattern.search(content)
    return match.group(1).strip() if match else None


def extract_bold_field_full_line(content: str, field_name: str) -> str | None:
    """Extract the full line value after a **Field Name:** pattern."""
    pattern = re.compile(rf"\*\*{re.escape(field_name)}:\*\*\s*(.+)$", re.MULTILINE)
    match = pattern.search(content)
    return match.group(1).strip() if match else None


def extract_pipe_table(content: str) -> list[dict[str, str]]:
    """Extract a pipe-delimited markdown table into a list of dicts.

    Expects format:
        | Header1 | Header2 |
        | --- | --- |
        | val1 | val2 |

    Returns list of {header: value} dicts.
    """
    lines = content.splitlines()
    table_lines = [ln.strip() for ln in lines if ln.strip().startswith("|") and ln.strip().endswith("|")]

    if len(table_lines) < 3:
        return []

    # Parse header
    headers = [cell.strip() for cell in table_lines[0].split("|")[1:-1]]

    # Skip separator row (index 1)
    rows: list[dict[str, str]] = []
    for line in table_lines[2:]:
        cells = [cell.strip() for cell in line.split("|")[1:-1]]
        if len(cells) == len(headers):
            rows.append(dict(zip(headers, cells, strict=False)))

    return rows
