"""Pydantic model for feats.json."""

from __future__ import annotations

from typing import Literal

from .common import LenientModel, StrictModel


class FeatsMetadata(StrictModel):
    """Metadata block at the top of feats.json."""

    description: str
    version: str
    sectionsComplete: list[str]
    sectionsPending: list[str]


FeatCategory = Literal[
    "general",
    "racial",
    "supplementary",
    "asset",
    "exaltedAsset",
    "hindrance",
]


class Feat(LenientModel):
    """A single feat, asset, or hindrance.

    Optional fields present on subsets of feats:
    - raceRestriction: racial feats limited to a specific race
    - exaltationRestriction: exalted assets limited to a specific exaltation
    - creationOnly: assets/hindrances only available at character creation
    - bonusXP: hindrances that grant bonus XP
    - subOptions: feats with nested choice options (e.g. Wizard Tradition)
    """

    id: str
    name: str
    category: FeatCategory
    effect: str
    details: str
    multipleAllowed: bool
    groups: list[str] | None
    prerequisites: str | None
    raceRestriction: str | None = None
    exaltationRestriction: str | None = None
    creationOnly: bool | None = None
    bonusXP: int | None = None
    subOptions: list[dict] | dict[str, str] | None = None


class FeatsFile(StrictModel):
    """Top-level structure of feats.json."""

    metadata: FeatsMetadata
    feats: list[Feat]
