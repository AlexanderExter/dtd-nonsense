"""Formatting linter rules — heading hierarchy, tables, encoding."""

from __future__ import annotations

import re

from .terminology import LintIssue, Severity


def check_heading_hierarchy(filepath: str, lines: list[str]) -> list[LintIssue]:
    """Check that heading levels don't skip (e.g., H1 → H3 without H2)."""
    issues: list[LintIssue] = []
    last_level = 0
    in_code_block = False
    in_frontmatter = False
    frontmatter_count = 0

    for line_num, line in enumerate(lines, start=1):
        stripped = line.strip()

        # Track frontmatter
        if stripped == "---":
            frontmatter_count += 1
            in_frontmatter = frontmatter_count == 1
            if frontmatter_count == 2:
                in_frontmatter = False
            continue
        if in_frontmatter:
            continue

        if stripped.startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        heading_match = re.match(r"^(#{1,6})\s", line)
        if heading_match:
            level = len(heading_match.group(1))
            if last_level > 0 and level > last_level + 1:
                issues.append(
                    LintIssue(
                        file=filepath,
                        line=line_num,
                        column=1,
                        severity=Severity.WARNING,
                        rule="heading-hierarchy",
                        message=f"Heading level skipped: H{last_level} → H{level} (expected H{last_level + 1})",
                    )
                )
            last_level = level

    return issues


def check_empty_table_cells(filepath: str, lines: list[str]) -> list[LintIssue]:
    """Check for empty cells in markdown tables (should use '—' or 'N/A')."""
    issues: list[LintIssue] = []
    in_code_block = False

    for line_num, line in enumerate(lines, start=1):
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        # Skip separator rows
        if re.match(r"^\|[\s\-:|]+\|$", stripped):
            continue

        # Check table rows
        if stripped.startswith("|") and stripped.endswith("|"):
            cells = stripped.split("|")[1:-1]  # Drop first/last empty from split
            for col_idx, cell in enumerate(cells):
                if cell.strip() == "":
                    issues.append(
                        LintIssue(
                            file=filepath,
                            line=line_num,
                            column=1,
                            severity=Severity.INFO,
                            rule="empty-table-cell",
                            message=f"Empty table cell in column {col_idx + 1} — use '—' or 'N/A'",
                            suggestion="—",
                        )
                    )

    return issues


def check_encoding_markers(filepath: str, content: str) -> list[LintIssue]:
    """Check for common encoding corruption markers."""
    issues: list[LintIssue] = []
    # Common CP1252 → UTF-8 corruption artifacts
    # Using explicit \u escapes to prevent editor/encoding corruption of pattern strings
    corruption_patterns = [
        (re.compile("\u00c3\u2014"), "Likely corrupted '\u00d7' (multiplication sign) \u2014 possible encoding issue"),
        (re.compile("\u00e2\u20ac\u201d"), "Likely corrupted '\u2014' (em-dash)"),
        (re.compile("\u00e2\u20ac\u2122"), "Likely corrupted '\u2019' (right single quote)"),
        (re.compile("\u00c2\u00bd"), "Likely corrupted '\u00bd' (one-half)"),
    ]

    for line_num, line in enumerate(content.splitlines(), start=1):
        for pattern, message in corruption_patterns:
            for match in pattern.finditer(line):
                issues.append(
                    LintIssue(
                        file=filepath,
                        line=line_num,
                        column=match.start() + 1,
                        severity=Severity.ERROR,
                        rule="encoding",
                        message=message,
                    )
                )

    return issues
