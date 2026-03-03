"""Shared types and base models used across DTD data schemas."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict

# ---------------------------------------------------------------------------
# Reusable constrained types
# ---------------------------------------------------------------------------

Source = Literal["book1", "book2"]

CharacteristicId = Literal[
    "strength",
    "dexterity",
    "constitution",
    "charisma",
    "fellowship",
    "composure",
    "intelligence",
    "wisdom",
    "willpower",
]

CharacteristicGroup = Literal["physical", "social", "mental"]


# ---------------------------------------------------------------------------
# Shared sub-models
# ---------------------------------------------------------------------------


class StrictModel(BaseModel):
    """Base model with strict config — forbids unknown fields."""

    model_config = ConfigDict(extra="forbid")


class LenientModel(BaseModel):
    """Base model that allows extra fields for forward-compatibility."""

    model_config = ConfigDict(extra="allow")


class DotRating(StrictModel):
    """A dot-level description (1-5 scale)."""

    dots: int
    label: str
    description: str


class SkillRef(StrictModel):
    """A reference to a skill with dot rating (used in NPC templates)."""

    name: str
    dots: int


class SkillBonusEntry(LenientModel):
    """A skill bonus entry as used in races.

    Human has extra fields: count, description.
    """

    skill: str
    value: int
    count: int | None = None
    description: str | None = None


class ClassFeatEntry(StrictModel):
    """A feat entry within a class definition."""

    name: str
    type: Literal["mandatory", "optional", "mandatory-choice", "optional-choice"]
