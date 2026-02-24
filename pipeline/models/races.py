"""Pydantic model for races.json."""

from __future__ import annotations

from pydantic import field_validator

from .common import LenientModel, SkillBonusEntry, Source, StrictModel


class CharBonusChoice(StrictModel):
    """Characteristic bonus with choice options."""

    options: list[str]
    description: str


class RacialPowerOption(StrictModel):
    """A structured option within a racial power (e.g. Dryad choices)."""

    name: str
    description: str


class RacialPower(LenientModel):
    """A racial power with name and description.

    Most races have no options. Some (e.g. Dryad) have structured
    option objects with name + description.
    """

    name: str
    description: str
    options: list[str | RacialPowerOption] | None = None


class Race(LenientModel):
    """A playable race.

    Some races have an extra 'notes' field (e.g. Halfling).
    """

    id: str
    name: str
    size: int
    languages: list[str]
    charBonus: CharBonusChoice
    skillBonus: list[SkillBonusEntry]
    power: RacialPower
    source: Source
    notes: str | None = None

    @field_validator("size")
    @classmethod
    def size_in_range(cls, v: int) -> int:
        if not 1 <= v <= 7:
            msg = f"Size must be 1-7, got {v}"
            raise ValueError(msg)
        return v


class RacesFile(StrictModel):
    """Top-level structure of races.json."""

    races: list[Race]
