"""Pydantic model for weapons.json."""

from __future__ import annotations

from .common import LenientModel, StrictModel


class RangedWeapon(LenientModel):
    """A ranged weapon entry."""

    id: str
    name: str
    category: str
    type: str  # "pistol", "basic", "heavy", "thrown", "launcher"
    damage: str  # XkY notation
    damageType: str | None  # None for grenade/missile launchers (varies by ammo)
    pen: int
    rof: str  # e.g. "S/6", "S/-", "S/3/10"
    range: int | str  # Usually int; "Sx10" for thrown/compound weapons
    clip: int
    reload: str  # "Full", "2Full", "Free", etc.
    availability: str
    special: list[str]
    proficiency: list[str]
    description: str
    # Optional fields present on some entries
    notes: str | None = None


class MeleeWeapon(LenientModel):
    """A melee weapon entry."""

    id: str
    name: str
    category: str
    type: str  # "melee"
    damage: str  # XkY notation
    damageType: str
    pen: int
    availability: str
    special: list[str]
    proficiency: list[str]
    description: str
    # Optional fields present on some entries
    notes: str | None = None


class ThrownWeapon(LenientModel):
    """A thrown weapon entry (bolas, grenades, etc.)."""

    id: str
    name: str
    category: str
    type: str  # "thrown"
    damage: str  # XkY notation or "-" for non-damaging
    damageType: str | None  # None for smoke grenades, bolas
    pen: int
    range: int | str  # int (20) or formula string ("Sx3")
    availability: str
    special: list[str]
    proficiency: list[str]
    description: str


class WeaponsData(StrictModel):
    """Inner structure grouping weapons by type."""

    ranged: list[RangedWeapon]
    melee: list[MeleeWeapon]
    thrown: list[ThrownWeapon]


class WeaponsFile(StrictModel):
    """Top-level structure of weapons.json."""

    weapons: WeaponsData
    damageTypes: dict[str, str]
    qualities: dict[str, str]
