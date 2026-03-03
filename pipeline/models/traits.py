"""Pydantic model for traits.json."""

from __future__ import annotations

from .common import LenientModel


class Trait(LenientModel):
    """An NPC trait with optional parameters."""

    id: str
    name: str
    parameterized: bool
    effect: str
    derivedEffects: dict[str, str]
    # Optional — only present when parameterized=True
    paramLabel: str | None = None
    paramType: str | None = None
