"""Pydantic model for npc-templates.json."""

from __future__ import annotations

from .common import LenientModel, SkillRef, StrictModel


class NpcCharacteristics(StrictModel):
    """The 9 characteristics for an NPC."""

    strength: int
    dexterity: int
    constitution: int
    charisma: int
    fellowship: int
    composure: int
    intelligence: int
    wisdom: int
    willpower: int


class NpcArmor(LenientModel):
    """Armor equipped by an NPC."""

    name: str
    ap: int | None = None
    locations: list[str] | None = None


class NpcWeapon(LenientModel):
    """An inline weapon definition for an NPC."""

    name: str
    type: str  # "melee" or "ranged"
    damage: str
    damageType: str
    pen: int
    special: str | list[str] = ""
    # Ranged-only optional fields
    range: int | None = None
    rof: str | None = None
    clip: int | None = None
    reload: str | None = None


class NpcTraitRef(LenientModel):
    """A trait reference — can be a string or a dict with id + param."""

    id: str
    param: str | int | None = None


class NpcAbility(LenientModel):
    """A special ability — can be a string or a dict with name + description."""

    name: str
    description: str


class NpcTemplate(LenientModel):
    """A single NPC template. Note: uses kebab-case IDs unlike most other files."""

    id: str
    name: str
    category: str
    level: int
    size: int
    speed: int
    characteristics: NpcCharacteristics
    skills: list[SkillRef]
    feats: list[str]
    traits: list[str | NpcTraitRef]
    armor: list[NpcArmor]
    weapons: list[NpcWeapon]
    abilities: list[str | NpcAbility]
    gear: list[str]
