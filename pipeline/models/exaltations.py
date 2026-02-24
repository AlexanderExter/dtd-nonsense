"""Pydantic model for exaltations.json."""

from __future__ import annotations

from .common import LenientModel, Source, StrictModel


class PowerStat(StrictModel):
    """An exaltation's power stat (Blood Potency, Feral Heart, etc.)."""

    name: str
    description: str


class ResourceStat(StrictModel):
    """An exaltation's resource stat (Vitae, Rage, etc.)."""

    name: str
    formula: str
    recovery: str


class StaticPower(StrictModel):
    """A static (always-on) exaltation power."""

    name: str
    description: str


class ProgressionPower(StrictModel):
    """A power gained at a specific dot of the power stat."""

    dots: int
    name: str
    description: str


class Exaltation(LenientModel):
    """A single exaltation type."""

    id: str
    name: str
    powerStat: PowerStat | None
    resourceStat: ResourceStat | None
    description: str
    staticPowers: list[StaticPower]
    tell: str | None
    progression: list[ProgressionPower]
    source: Source


class ExaltationsFile(LenientModel):
    """Top-level structure of exaltations.json."""

    exaltations: list[Exaltation]
    resourcePointUses: list | None = None
    notes: dict | None = None
