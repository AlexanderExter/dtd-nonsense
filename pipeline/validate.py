"""JSON schema validation engine.

Loads each JSON data file, validates against its Pydantic model,
and reports errors with file path and context.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from pydantic import TypeAdapter, ValidationError

from pipeline import DATA_DIR
from pipeline.models import FILE_MODELS


@dataclass
class ValidationResult:
    """Result of validating a single file."""

    file: str
    ok: bool
    record_count: int = 0
    errors: list[str] = field(default_factory=list)


def _preprocess_ships(data: dict[str, Any]) -> dict[str, Any]:
    """Rename 'class' → 'hullClass' in ship hulls (reserved word workaround)."""
    if "hulls" in data:
        for hull in data["hulls"]:
            if "class" in hull:
                hull["hullClass"] = hull.pop("class")
    return data


def validate_file(filename: str, data_dir: Path = DATA_DIR) -> ValidationResult:
    """Validate a single JSON file against its Pydantic model."""
    filepath = data_dir / filename

    if filename not in FILE_MODELS:
        return ValidationResult(file=filename, ok=False, errors=[f"No model registered for {filename}"])

    if not filepath.exists():
        return ValidationResult(file=filename, ok=False, errors=[f"File not found: {filepath}"])

    model_cls, is_bare_array = FILE_MODELS[filename]

    try:
        raw = json.loads(filepath.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return ValidationResult(file=filename, ok=False, errors=[f"Invalid JSON: {e}"])

    # Pre-processing for known quirks
    if filename == "ships.json" and isinstance(raw, dict):
        raw = _preprocess_ships(raw)

    try:
        if is_bare_array:
            adapter = TypeAdapter(list[model_cls])
            result = adapter.validate_python(raw)
            count = len(result)
        else:
            result = model_cls.model_validate(raw)
            # Try to count records from the main list field
            count = _count_records(result)

        return ValidationResult(file=filename, ok=True, record_count=count)

    except ValidationError as e:
        errors = []
        for err in e.errors():
            loc = " → ".join(str(x) for x in err["loc"])
            errors.append(f"  {loc}: {err['msg']}")
        return ValidationResult(file=filename, ok=False, errors=errors)


def _count_records(model: object) -> int:
    """Attempt to count the primary records in a validated model."""
    # Try common field names that contain the main data list
    for attr in ("races", "classes", "feats", "skills", "exaltations", "backgrounds", "alignments", "packages", "hulls", "weapons"):
        val = getattr(model, attr, None)
        if isinstance(val, list):
            return len(val)
        if isinstance(val, dict):
            # For skills.json which has nested dicts of lists
            total = sum(len(v) for v in val.values() if isinstance(v, list))
            if total > 0:
                return total
    return 0


def validate_all(data_dir: Path = DATA_DIR) -> list[ValidationResult]:
    """Validate all registered JSON files."""
    results = []
    for filename in sorted(FILE_MODELS.keys()):
        results.append(validate_file(filename, data_dir))
    return results


def cross_reference_check(data_dir: Path = DATA_DIR) -> list[str]:
    """Check cross-file references for consistency.

    Verifies:
    - Class skill names exist in skills.json
    - Class feat names exist in feats.json
    - NPC trait names exist in traits.json
    """
    issues: list[str] = []

    try:
        skills_raw = json.loads((data_dir / "skills.json").read_text(encoding="utf-8"))
        skill_names = set()
        for group_list in skills_raw.get("skills", {}).values():
            for skill in group_list:
                skill_names.add(skill["name"])

        classes_raw = json.loads((data_dir / "classes.json").read_text(encoding="utf-8"))
        for cls in classes_raw.get("classes", []):
            for skill_name in cls.get("skills", []):
                if skill_name not in skill_names:
                    issues.append(f"classes.json: class '{cls['name']}' references unknown skill '{skill_name}'")
    except Exception as e:
        issues.append(f"Cross-ref check (classes→skills) failed: {e}")

    try:
        feats_raw = json.loads((data_dir / "feats.json").read_text(encoding="utf-8"))
        feat_names = {f["name"] for f in feats_raw.get("feats", [])}

        classes_raw = json.loads((data_dir / "classes.json").read_text(encoding="utf-8"))
        for cls in classes_raw.get("classes", []):
            for feat_entry in cls.get("feats", []):
                feat_name = feat_entry["name"] if isinstance(feat_entry, dict) else feat_entry

                # Handle choice-based entries like "Two Weapon Fighting OR Far Shot"
                if " OR " in feat_name:
                    alternatives = [alt.strip() for alt in feat_name.split(" OR ")]
                    found_any = False
                    for alt in alternatives:
                        base = alt.split(" (")[0] if " (" in alt else alt
                        if base in feat_names or alt in feat_names:
                            found_any = True
                            break
                    if not found_any:
                        issues.append(f"classes.json: class '{cls['name']}' references unknown feat '{feat_name}'")
                    continue

                # Feats with parenthetical variants like "Skill Focus (Any Lore)" won't match exactly
                # Strip parenthetical for base name matching
                base_name = feat_name.split(" (")[0] if " (" in feat_name else feat_name
                if base_name not in feat_names and feat_name not in feat_names:
                    issues.append(f"classes.json: class '{cls['name']}' references unknown feat '{feat_name}'")
    except Exception as e:
        issues.append(f"Cross-ref check (classes→feats) failed: {e}")

    try:
        traits_raw = json.loads((data_dir / "traits.json").read_text(encoding="utf-8"))
        trait_names = {t["name"] for t in traits_raw}
        trait_ids = {t["id"] for t in traits_raw}

        npcs_raw = json.loads((data_dir / "npc-templates.json").read_text(encoding="utf-8"))
        for npc in npcs_raw:
            for trait_ref in npc.get("traits", []):
                # Trait refs can be dicts {"id": "fear", "param": 3} or strings
                if isinstance(trait_ref, dict):
                    trait_id = trait_ref.get("id", "")
                    if trait_id not in trait_ids:
                        issues.append(f"npc-templates.json: NPC '{npc['name']}' references unknown trait id '{trait_id}'")
                else:
                    # String refs may have parameters like "Fear (3)" — strip those
                    base_trait = trait_ref.split(" (")[0] if " (" in trait_ref else trait_ref
                    if base_trait not in trait_names:
                        issues.append(f"npc-templates.json: NPC '{npc['name']}' references unknown trait '{trait_ref}'")
    except Exception as e:
        issues.append(f"Cross-ref check (npcs→traits) failed: {e}")

    return issues
