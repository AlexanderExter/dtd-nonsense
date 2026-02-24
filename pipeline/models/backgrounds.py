"""Pydantic model for backgrounds.json."""

from __future__ import annotations

from .common import LenientModel, StrictModel


class BackgroundRating(StrictModel):
    """A dot-level effect for a background."""

    dots: int
    effect: str


class Background(StrictModel):
    """A background type (Allies, Artifact, Backing, etc.)."""

    id: str
    name: str
    description: str
    ratings: list[BackgroundRating]


class BackgroundsFile(LenientModel):
    """Top-level structure of backgrounds.json."""

    backgrounds: list[Background]
    notes: dict | None = None
