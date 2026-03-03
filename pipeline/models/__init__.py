"""Pydantic models for DTD JSON data schemas.

Each module mirrors one JSON file in data/.
The *File model is the top-level schema for that file.
"""

from .alignments import AlignmentsFile
from .backgrounds import BackgroundsFile
from .classes import ClassesFile
from .equipment import EquipmentFile
from .exaltations import ExaltationsFile
from .feats import FeatsFile
from .npc_templates import NpcTemplate
from .races import RacesFile
from .ships import ShipsFile
from .skills import SkillsFile
from .traits import Trait
from .weapons import WeaponsFile

# Registry: JSON filename → (model class, is_bare_array)
# is_bare_array=True means the file is a JSON array, not an object.
FILE_MODELS: dict[str, tuple[type, bool]] = {
    "races.json": (RacesFile, False),
    "classes.json": (ClassesFile, False),
    "feats.json": (FeatsFile, False),
    "skills.json": (SkillsFile, False),
    "weapons.json": (WeaponsFile, False),
    "equipment.json": (EquipmentFile, False),
    "backgrounds.json": (BackgroundsFile, False),
    "alignments.json": (AlignmentsFile, False),
    "exaltations.json": (ExaltationsFile, False),
    "ships.json": (ShipsFile, False),
    "npc-templates.json": (NpcTemplate, True),  # bare array
    "traits.json": (Trait, True),  # bare array
}

__all__ = [
    "FILE_MODELS",
    "AlignmentsFile",
    "BackgroundsFile",
    "ClassesFile",
    "EquipmentFile",
    "ExaltationsFile",
    "FeatsFile",
    "NpcTemplate",
    "RacesFile",
    "ShipsFile",
    "SkillsFile",
    "Trait",
    "WeaponsFile",
]
