"""Pydantic model for skills.json (includes characteristics)."""

from __future__ import annotations

from .common import CharacteristicGroup, CharacteristicId, DotRating, LenientModel, StrictModel


class Characteristic(LenientModel):
    """A characteristic (Strength, Dexterity, etc.)."""

    id: CharacteristicId
    name: str
    abbrev: str
    description: str
    specialties: list[str]
    ratings: list[DotRating]
    # Optional — only Intelligence has this
    notes: str | None = None


class Skill(StrictModel):
    """A skill entry."""

    id: str
    name: str
    characteristic: str  # CharacteristicId or "special"
    advanced: bool
    description: str
    specialties: list[str]


class SkillsFile(LenientModel):
    """Top-level structure of skills.json — contains both characteristics and skills."""

    characteristics: dict[CharacteristicGroup, list[Characteristic]]
    skills: dict[str, list[Skill]]
    skillNotes: dict | None = None
