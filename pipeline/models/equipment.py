"""Pydantic model for equipment.json."""

from __future__ import annotations

from .common import StrictModel


class EquipmentItem(StrictModel):
    """An item within a starting equipment package."""

    name: str
    choice: bool
    options: list[str] | None = None


class EquipmentPackage(StrictModel):
    """A starting equipment package (Earth, Air, Fire, Water, Void)."""

    id: str
    name: str
    description: str
    items: list[EquipmentItem]


class EquipmentFile(StrictModel):
    """Top-level structure of equipment.json."""

    packages: list[EquipmentPackage]
