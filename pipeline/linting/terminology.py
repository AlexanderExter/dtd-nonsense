"""Terminology rules for DTD content linting.

Encodes the canonical terminology table from docs/project-conventions.md.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum


class Severity(Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


@dataclass
class LintIssue:
    """A single issue found by a linter."""

    file: str
    line: int
    column: int
    severity: Severity
    rule: str
    message: str
    suggestion: str | None = None


# ---------------------------------------------------------------------------
# Terminology rules
# ---------------------------------------------------------------------------

# Simple wrong→right replacements (case-sensitive where noted)
TERM_REPLACEMENTS: list[tuple[re.Pattern[str], str, str]] = [
    # Wrong terms → canonical
    (re.compile(r"\bArmour\b"), "Armor", "Use American English spelling 'Armor'"),
    (re.compile(r"\bPersuade\b"), "Persuasion", "Canonical skill name is 'Persuasion'"),
    (re.compile(r"\bPerformance\b"), "Performer", "Canonical skill name is 'Performer'"),
    (re.compile(r"\bBallistic\b(?!s)"), "Ballistics", "Canonical skill name is 'Ballistics'"),
    (re.compile(r"\bFate Points?\b"), "Hero Points", "D:TD uses 'Hero Points', not 'Fate Points'"),
    (re.compile(r"\bDifficulty Class\b"), "Target Number", "D:TD uses 'Target Number' (TN), not 'Difficulty Class'"),
    (re.compile(r"\b(?<!\w)DC\b(?!\w)"), "TN", "D:TD uses 'TN', not 'DC'"),
]

# Terms that must be capitalized when used as game terms
MUST_CAPITALIZE: list[str] = [
    "Test",
    "Hero",
    "Story Master",
    "Target Number",
    "Raises",
    "Checks",
    "Static Defense",
    "Mental Defense",
    "Hit Points",
    "Hero Points",
    "Resource Points",
    "Resolve Points",
]


def check_terminology(filepath: str, lines: list[str]) -> list[LintIssue]:
    """Check for incorrect terminology usage."""
    issues: list[LintIssue] = []

    for line_num, line in enumerate(lines, start=1):
        # Skip YAML frontmatter
        if line.strip() == "---":
            continue

        # Skip code blocks
        if line.strip().startswith("```"):
            continue

        # Simple replacements
        for pattern, replacement, reason in TERM_REPLACEMENTS:
            for match in pattern.finditer(line):
                issues.append(
                    LintIssue(
                        file=filepath,
                        line=line_num,
                        column=match.start() + 1,
                        severity=Severity.WARNING,
                        rule="terminology",
                        message=f"'{match.group()}' → '{replacement}': {reason}",
                        suggestion=replacement,
                    )
                )

    return issues


def check_dice_notation(filepath: str, lines: list[str]) -> list[LintIssue]:
    """Check that dice notation (XkY) is wrapped in backticks."""
    issues: list[LintIssue] = []
    dice_pattern = re.compile(r"(?<!`)\b(\d+k\d+)\b(?!`)")

    in_code_block = False
    for line_num, line in enumerate(lines, start=1):
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        for match in dice_pattern.finditer(line):
            # Don't flag if already in inline code
            before = line[: match.start()]
            if before.count("`") % 2 == 1:
                continue
            issues.append(
                LintIssue(
                    file=filepath,
                    line=line_num,
                    column=match.start() + 1,
                    severity=Severity.INFO,
                    rule="dice-notation",
                    message=f"Dice notation '{match.group()}' should be in backticks: `{match.group()}`",
                    suggestion=f"`{match.group()}`",
                )
            )

    return issues


def check_formula_symbols(filepath: str, lines: list[str]) -> list[LintIssue]:
    """Check that formulas use × and − instead of x and -."""
    issues: list[LintIssue] = []

    # Only check lines that look like formulas (contain = or multiple math operators)
    formula_indicators = re.compile(r"(?:Static Defense|Hit Points|Mental Defense|Speed|Resilience|Initiative)")

    in_code_block = False
    for line_num, line in enumerate(lines, start=1):
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        if formula_indicators.search(line):
            # Check for lowercase x used as multiplication
            for match in re.finditer(r"(?<=\d)\s*x\s*(?=\d)", line):
                issues.append(
                    LintIssue(
                        file=filepath,
                        line=line_num,
                        column=match.start() + 1,
                        severity=Severity.WARNING,
                        rule="formula-symbol",
                        message="Use '×' (multiplication sign) instead of 'x' in formulas",
                        suggestion="×",
                    )
                )

    return issues
