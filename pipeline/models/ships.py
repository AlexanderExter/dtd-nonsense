"""Pydantic model for ships.json."""

from __future__ import annotations

from .common import LenientModel, StrictModel


class ConsoleSlots(StrictModel):
    """Console slot allocation for a hull."""

    arcana: int
    command: int
    engineering: int
    tactical: int
    universal: int


class WeaponSlots(StrictModel):
    """Weapon slot allocation for a hull."""

    forward: int
    rear: int


class Hull(StrictModel):
    """A ship hull."""

    id: str
    name: str
    # "class" is a Python keyword but valid JSON key — alias it
    hullClass: str | None = None
    cost: int
    crew: int
    hullStrength: int
    maneuverability: int
    acceleration: int
    speed: int
    sensors: int
    consoles: ConsoleSlots
    weapons: WeaponSlots

    class Config:
        # Allow the JSON field "class" to populate hullClass
        populate_by_name = True

    def model_post_init(self, __context: object) -> None:
        """Handle the 'class' field from JSON."""
        # Pydantic v2 doesn't auto-map unaliased 'class' to 'hullClass'
        # This is handled in the custom loader instead.


class Console(StrictModel):
    """A ship console component."""

    id: str
    name: str
    type: str
    cost: int
    effect: str


class ShipWeapon(LenientModel):
    """A ship weapon."""

    id: str
    name: str
    size: str
    material: str
    damage: str
    disruption: int
    accuracy: int
    crit: int | str
    range: int | str
    cost: int
    arc: str
    type: str


class Torpedo(LenientModel):
    """A torpedo type."""

    id: str
    name: str
    damage: str
    disruption: int
    accuracy: int
    crit: int | str
    arc: str
    range: int | str
    cost: int
    effect: str


class CriticalDamageEntry(StrictModel):
    """An entry on the ship critical damage table."""

    roll: str
    name: str
    effect: str


class Shield(LenientModel):
    """A ship shield."""

    id: str
    name: str
    type: str
    mark: int
    capacity: int
    regeneration: int
    special: str
    cost: int


class ShipsFile(LenientModel):
    """Top-level structure of ships.json."""

    holdingsBP: list[int]
    crewQualityCost: dict[str, int]
    hulls: list[Hull]
    consoles: list[Console]
    weapons: list[ShipWeapon]
    torpedoTubeCost: int
    torpedoes: list[Torpedo]
    shields: list[Shield]
    criticalDamage: list[CriticalDamageEntry]
