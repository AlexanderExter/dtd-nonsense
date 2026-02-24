"""Pydantic model for alignments.json."""

from __future__ import annotations

from .common import LenientModel, StrictModel


class PantheonInfo(StrictModel):
    """A pantheon grouping."""

    name: str
    description: str


class AlignmentSin(StrictModel):
    """A sin entry with devotion threshold."""

    devotion: int
    sin: str


class Alignment(StrictModel):
    """A single alignment/deity."""

    id: str
    name: str
    pantheon: str
    concepts: list[str]
    description: str
    commandments: list[str]
    restriction: str | None = None
    sins: list[AlignmentSin]


class AlignmentsFile(LenientModel):
    """Top-level structure of alignments.json."""

    pantheons: dict[str, PantheonInfo]
    alignments: list[Alignment]
    devotionMechanics: dict | None = None
