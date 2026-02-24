"""Pydantic model for classes.json."""

from __future__ import annotations

from pydantic import field_validator

from .common import ClassFeatEntry, StrictModel


class ClassesMetadata(StrictModel):
    """Metadata block at the top of classes.json."""

    description: str
    version: str
    levelsComplete: list[int]
    levelsPending: list[int]


class TrackInfo(StrictModel):
    """A class track showing L1→L5 progression."""

    name: str
    classes: list[str]


class GameClass(StrictModel):
    """A single class entry."""

    id: str
    name: str
    level: int
    track: str | None
    prerequisites: str
    characteristics: list[str]
    skills: list[str]
    feats: list[ClassFeatEntry]
    swordSchools: list[str]
    magicSchools: list[str]
    gunKata: list[str]
    completionBonus: str
    suggestedExits: list[str]

    @field_validator("level")
    @classmethod
    def level_in_range(cls, v: int) -> int:
        if not 1 <= v <= 5:
            msg = f"Level must be 1-5, got {v}"
            raise ValueError(msg)
        return v


class ClassesFile(StrictModel):
    """Top-level structure of classes.json."""

    metadata: ClassesMetadata
    tracks: dict[str, TrackInfo]
    classes: list[GameClass]
