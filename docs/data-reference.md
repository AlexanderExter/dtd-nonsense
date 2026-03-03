# Data Reference

> **⚠️ Schema accuracy warning:** The per-file schemas below are manually maintained and may drift from the actual data. Auto-generation from the Pydantic models in `pipeline/models/` is aspirational but not yet implemented. When in doubt, inspect the actual JSON files or run `uv run dtd validate`.

Documentation for all JSON data files in `data/`. These files drive the game-data dropdowns, autocomplete, and calculation engines across all tools.

> **Astro note:** The prebuild script (`scripts/prebuild.mjs`) copies all 12 JSON files to `public/data/` for the Astro site. The `data/` directory is the single source of truth — `public/data/` is gitignored and regenerated on every build.

---

## Data File Inventory

| File                 | Records | Source Markdown                | Consumers                                         | Added In  |
| -------------------- | ------- | ------------------------------ | ------------------------------------------------- | --------- |
| `races.json`         | 16      | `04-Races.md`                  | Character Sheet, Character Builder                | Phase 0   |
| `exaltations.json`   | 9       | `05-Exaltations.md`            | Character Sheet, Character Builder                | Phase 0   |
| `skills.json`        | 27      | `03-Characteristics-Skills.md` | Character Sheet, Character Builder, NPC Generator | Phase 0   |
| `classes.json`       | 90      | `06-Classes.md`                | Character Sheet, Character Builder                | Phase 0   |
| `feats.json`         | 100+    | `07-Feats.md`                  | Character Sheet, Character Builder, NPC Generator | Phase 0   |
| `backgrounds.json`   | 11      | `08-Backgrounds.md`            | Character Sheet, Character Builder                | Phase 0   |
| `alignments.json`    | 21      | `09-Alignments.md`             | Character Sheet, Character Builder                | Phase 0   |
| `equipment.json`     | varies  | `10-Equipment.md`              | Character Builder                                 | Phase 0   |
| `weapons.json`       | varies  | `10-Equipment.md`              | Character Sheet, Character Builder, NPC Generator | Phase 0   |
| `npc-templates.json` | 40+     | `19-Antagonists.md`            | NPC Generator                                     | Phase 2.1 |
| `traits.json`        | ~20     | `19-Antagonists.md`            | NPC Generator                                     | Phase 2.1 |
| `ships.json`         | ~70     | `18-Ships.md`                  | Ship Builder                                      | Phase 2.2 |

All source markdown files are in `cleaned-references/`.

---

## Sync Strategy

**Semi-automated synchronization** — the `pipeline` package provides `uv run dtd validate --xref` for schema validation and cross-reference checking, plus `uv run dtd sync-check --source <type>` for markdown↔JSON drift detection (races, classes, feats). After editing rules in `books/` or `cleaned-references/`, run these checks and manually verify any remaining gaps.

**Recommended practice:** Document changes in git commit messages (e.g., "Update classes.json to match 06-Classes.md additions").

**Risk:** JSON and markdown can drift silently. Key relationships to watch:

- `classes.json` references skill IDs from `skills.json`
- `feats.json` prerequisites reference class names from `classes.json`
- `equipment.json` weapon names should match entries in `weapons.json`
- `exaltations.json` progression powers reference game mechanics that must match `cleaned-references/05-Exaltations.md`

---

## Loading Mechanism

All data loads through `core.ts`:

```typescript
import { loadData, loadAllData } from "@/lib/dtd/core";

// Single file
const races = await loadData("races.json");

// Multiple files in parallel (returns keyed object)
const data = await loadAllData(["races.json", "exaltations.json", "skills.json"]);
// → data.races, data.exaltations, data.skills
```

Fetches from `/data/[file].json` at runtime.

---

## Per-File Schemas

### races.json

```json
{
    "races": [
        {
            "id": "aasimar",
            "name": "Aasimar",
            "size": 5,
            "languages": ["Trade", "Celestial"],
            "charBonus": {
                "options": ["wisdom", "constitution"],
                "description": "+1 to Wisdom or Constitution"
            },
            "skillBonuses": { ... },
            "racialPower": "...",
            "source": "book1"
        }
    ]
}
```

| Field          | Type     | Description                                     |
| -------------- | -------- | ----------------------------------------------- |
| `id`           | string   | Unique ID (lowercase, used in canonical format) |
| `name`         | string   | Display name                                    |
| `size`         | number   | Size rating (affects SD, speed, resilience)     |
| `languages`    | string[] | Starting languages                              |
| `charBonus`    | string[] | Characteristics eligible for +1 racial bonus    |
| `skillBonuses` | object   | Automatic skill dot bonuses `{ skillId: dots }` |
| `racialPower`  | string   | Description of racial special ability           |
| `source`       | string   | `"book1"` or `"book2"`                          |

### exaltations.json

```json
{
    "exaltations": [
        {
            "id": "vampire",
            "name": "Vampire",
            "description": "Undead predators...",
            "powerStat": "Blood Potency",
            "resourceStat": "Vitae",
            "resourceFormula": "Blood Potency + Composure",
            "resourceRecovery": "Feed on living blood",
            "tell": "Fangs, pale skin",
            "staticPowers": ["Undead resilience", "..."],
            "progression": [
                { "dots": 1, "name": "Celerity", "effect": "..." },
                { "dots": 2, "name": "Resilience", "effect": "..." }
            ]
        }
    ]
}
```

| Field              | Type     | Description                                    |
| ------------------ | -------- | ---------------------------------------------- |
| `id`               | string   | Unique ID                                      |
| `name`             | string   | Display name                                   |
| `description`      | string   | Flavor text                                    |
| `powerStat`        | string   | Name of the power stat (e.g., "Blood Potency") |
| `resourceStat`     | string   | Name of the resource pool (e.g., "Vitae")      |
| `resourceFormula`  | string   | How max resource is calculated                 |
| `resourceRecovery` | string   | How resource is replenished                    |
| `tell`             | string   | Visible supernatural marker                    |
| `staticPowers`     | string[] | Always-on abilities                            |
| `progression`      | array    | Powers unlocked at each power stat dot         |

### skills.json

```json
{
    "characteristics": {
        "physical": [ { "id": "strength", "name": "Strength", ... } ],
        "social":   [ ... ],
        "mental":   [ ... ]
    },
    "skills": {
        "mental":   [ { "id": "academicLore", "name": "Academic Lore", "characteristic": "intelligence", "advanced": true, "description": "..." } ],
        "social":   [ ... ],
        "physical": [ ... ]
    }
}
```

**Top-level keys:** `characteristics` (grouped by physical/social/mental), `skills` (grouped by mental/social/physical).

| Field            | Type    | Description (skill entry)                         |
| ---------------- | ------- | ------------------------------------------------- |
| `id`             | string  | Unique ID (used in character schema `skills` key) |
| `name`           | string  | Display name                                      |
| `characteristic` | string  | Governing characteristic ID                       |
| `advanced`       | boolean | Requires training to use (true = advanced)        |
| `description`    | string  | Brief description                                 |

### classes.json

```json
{
    "metadata": { "description": "...", "version": "complete", "levelsComplete": [1,2,3,4,5], "levelsPending": [] },
    "tracks": {
        "assassin": { "name": "Assassin Track", "classes": ["sellSteel", "nighthawk", ...] },
        ...
    },
    "classes": [
        {
            "id": "ratCatcher",
            "name": "Rat Catcher",
            "level": 1,
            "track": null,
            "prerequisites": "None",
            "characteristics": ["Dexterity", "Composure", "Wisdom"],
            "skills": ["Acrobatics", "Common Lore", "Crafts", ...],
            "feats": [
                { "name": "Common Sense", "type": "mandatory" },
                { "name": "Light Sleeper", "type": "optional" }
            ],
            "swordSchools": [],
            "magicSchools": [],
            "gunKata": [],
            "completionBonus": "...",
            "suggestedExits": ["..."]
        }
    ]
}
```

**Top-level keys:** `metadata`, `tracks` (track ID → track info with ordered class list), `classes` (flat array of all classes).

| Field             | Type           | Description                                                               |
| ----------------- | -------------- | ------------------------------------------------------------------------- |
| `id`              | string         | Unique ID (camelCase)                                                     |
| `name`            | string         | Display name                                                              |
| `track`           | string \| null | Track ID, or null for trackless classes                                   |
| `level`           | number         | Level within track (1–5)                                                  |
| `prerequisites`   | string         | Prerequisite text (e.g., "None")                                          |
| `characteristics` | string[]       | Characteristics advanced by this level                                    |
| `skills`          | string[]       | Skills advanced by this level                                             |
| `feats`           | array          | Array of `{ name, type }` objects (`type`: `"mandatory"` or `"optional"`) |
| `swordSchools`    | string[]       | Sword school access granted                                               |
| `magicSchools`    | string[]       | Magic school access granted                                               |
| `gunKata`         | string[]       | Gun kata access granted                                                   |
| `completionBonus` | string         | Bonus on completing this level                                            |
| `suggestedExits`  | string[]       | Recommended next class tracks                                             |

### feats.json

```json
{
    "metadata": { "description": "...", "version": "...", "sectionsComplete": [...], "sectionsPending": [...] },
    "feats": [
        {
            "id": "weapon-proficiency-ordinary",
            "name": "Weapon Proficiency (Ordinary)",
            "category": "general",
            "effect": "Can wield Ordinary melee weapons without penalty",
            "details": "Extended description...",
            "multipleAllowed": false,
            "groups": ["combat"],
            "prerequisites": null,
            "subOptions": null
        }
    ]
}
```

| Field                   | Type             | Description                                                                               |
| ----------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `id`                    | string           | Unique ID                                                                                 |
| `name`                  | string           | Display name                                                                              |
| `category`              | string           | `"general"`, `"racial"`, `"supplementary"`, `"asset"`, `"exaltedAsset"`, or `"hindrance"` |
| `effect`                | string           | Brief mechanical effect                                                                   |
| `details`               | string           | Extended description                                                                      |
| `multipleAllowed`       | boolean          | Can be taken more than once                                                               |
| `groups`                | string[] \| null | Grouping tags                                                                             |
| `prerequisites`         | string \| null   | Prerequisite text                                                                         |
| `raceRestriction`       | string?          | Racial feats only                                                                         |
| `exaltationRestriction` | string?          | Exalted assets only                                                                       |
| `creationOnly`          | boolean?         | Assets/hindrances at creation only                                                        |
| `bonusXP`               | number?          | Hindrances that grant bonus XP                                                            |
| `subOptions`            | list\|dict\|null | Choice options: array of dicts OR `{ name: effect }` dict                                 |

### backgrounds.json

```json
{
    "backgrounds": [
        {
            "id": "allies",
            "name": "Allies",
            "description": "Trusted companions at least as powerful as a starting character...",
            "ratings": [
                { "dots": 1, "effect": "One ally approximately equal to a starting character" },
                { "dots": 2, "effect": "Two allies, or one more powerful ally" },
                ...
            ]
        }
    ]
}
```

### alignments.json

```json
[
    {
        "id": "khorne",
        "name": "Khorne",
        "pantheon": "Chaos",
        "commandments": ["Seek worthy foes", "Never refuse a challenge"],
        "sinTable": [
            { "devotion": 10, "sin": "Allowing a foe to live when..." },
            { "devotion": 9, "sin": "..." }
        ]
    }
]
```

### equipment.json

```json
{
    "packages": [
        {
            "id": "earth",
            "name": "Earth Package",
            "items": [
                { "name": "Chainsword", "type": "weapon", "choices": null },
                { "name": "Light Armor", "type": "armor", "choices": ["Flak", "Mesh"] }
            ]
        }
    ]
}
```

### weapons.json

```json
{
    "weapons": {
        "ranged": [
            {
                "id": "lasgun",
                "name": "Lasgun",
                "category": "basic",
                "type": "las",
                "damage": "4k2",
                "damageType": "E",
                "pen": 0,
                "rof": "S/3/-",
                "range": 100,
                "clip": 60,
                "reload": "Full",
                "availability": "Common",
                "special": ["Reliable"],
                "proficiency": ["Basic"],
                "description": "..."
            }
        ],
        "melee": [
            {
                "id": "chainsword",
                "name": "Chainsword",
                "category": "ordinary",
                "type": "melee",
                "damage": "5k2",
                "damageType": "R",
                "pen": 3,
                "availability": "Common",
                "special": ["Tearing"],
                "proficiency": ["Ordinary"],
                "description": "..."
            }
        ],
        "thrown": [
            {
                "id": "bolas",
                "name": "Bolas",
                "category": "thrown",
                "type": "thrown",
                "damage": "-",
                "damageType": null,
                "pen": 0,
                "range": 20,
                "availability": "Uncommon",
                "special": ["Snare", "Inaccurate"],
                "proficiency": ["Throwing"],
                "description": "..."
            }
        ]
    },
    "damageTypes": { "E": "Energy...", "I": "Impact...", "R": "Rending...", "X": "Explosive..." },
    "qualities": { "accurate": "Gain +1k0...", "balanced": "..." }
}
```

**Top-level keys:** `weapons` (grouped by type), `damageTypes` (code → description map), `qualities` (keyword → description map).

**Weapon types:**

| Type     | Extra Fields vs Base                         | Notes                    |
| -------- | -------------------------------------------- | ------------------------ |
| `ranged` | `rof`, `range`, `clip`, `reload`             | Full ranged stats        |
| `melee`  | —                                            | No range/ammo fields     |
| `thrown` | `range` (int or formula string like `"Sx3"`) | No `rof`/`clip`/`reload` |

### npc-templates.json

```json
[
    {
        "id": "goblin-warrior",
        "name": "Goblin Warrior",
        "category": "Mortal",
        "level": 1,
        "size": 3,
        "speed": 4,
        "characteristics": {
            "strength": 2,
            "dexterity": 3,
            "constitution": 2,
            "charisma": 1,
            "fellowship": 1,
            "composure": 2,
            "intelligence": 2,
            "wisdom": 2,
            "willpower": 2
        },
        "skills": [{ "name": "Weaponry", "dots": 2 }],
        "feats": ["Weapon Proficiency (Ordinary)"],
        "traits": ["Dark Sight"],
        "armor": [{ "name": "Leather", "ap": 2, "locations": ["body", "arms", "legs"] }],
        "weapons": [{ "name": "Rusty Sword", "damage": "3k2", "type": "R", "pen": 0 }],
        "abilities": [],
        "gear": ["Rusty sword", "shortbow", "20 arrows"]
    }
]
```

### traits.json

```json
[
    {
        "id": "daemonic",
        "name": "Daemonic",
        "parameterized": false,
        "paramLabel": "",
        "effect": "+Constitution to HP and armor (all locations)",
        "derivedEffects": {
            "hp": "add_con",
            "armor": "add_con",
            "resilience": "add_con"
        }
    },
    {
        "id": "machine",
        "name": "Machine",
        "parameterized": true,
        "paramLabel": "Rating",
        "effect": "Armor rating X to all locations",
        "derivedEffects": {
            "armor": "set_param"
        }
    }
]
```

### ships.json

```json
{
    "holdingsBP": [5, 10, 15, 20, 25],
    "crewQualityCost": { "Green": 0, "Competent": 5, "Veteran": 15, "Elite": 30 },
    "hulls": [
        {
            "id": "steamboat",
            "name": "Steamboat",
            "class": "Escort",
            "cost": 10,
            "crew": 1,
            "hullStrength": 15,
            "maneuverability": 15,
            "acceleration": 4,
            "speed": 4,
            "sensors": 5,
            "consoles": { "arcana": 2, "command": 1, "engineering": 1, "tactical": 1, "universal": 1 },
            "weapons": { "forward": 1, "rear": 0 }
        }
    ],
    "consoles": [{ "id": "ancient-helm", "name": "Ancient Helm", "type": "arcana", "cost": 1, "effect": "..." }],
    "weapons": [
        {
            "id": "las-light-cannon",
            "name": "Las Light Cannon",
            "size": "Light Cannon",
            "material": "Las",
            "damage": "1d10",
            "disruption": 0,
            "accuracy": 0,
            "crit": 0,
            "range": "Short",
            "cost": 1,
            "arc": "Normal",
            "type": "Lance"
        }
    ],
    "torpedoTubeCost": 5,
    "torpedoes": [
        {
            "id": "micro",
            "name": "Micro Torpedo",
            "damage": "4k4",
            "disruption": 2,
            "accuracy": 2,
            "crit": 5,
            "arc": "Normal",
            "range": 5,
            "cost": 1,
            "effect": "Cheap option..."
        }
    ],
    "shields": [
        {
            "id": "standard-mk1",
            "name": "Standard Mk I",
            "type": "Standard",
            "mark": 1,
            "capacity": 80,
            "regeneration": 15,
            "special": "",
            "cost": 5
        }
    ],
    "criticalDamage": [{ "roll": "1", "name": "Minor Damage", "effect": "Attacker chooses one console..." }]
}
```

**Top-level keys:** `holdingsBP`, `crewQualityCost`, `hulls`, `consoles`, `weapons`, `torpedoTubeCost`, `torpedoes`, `shields`, `criticalDamage`.

| Component        | Key Fields                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hulls`          | `id`, `name`, `class`, `cost`, `crew`, `hullStrength`, `maneuverability`, `acceleration`, `speed`, `sensors`, `consoles` (slot object), `weapons` (slot object) |
| `consoles`       | `id`, `name`, `type`, `cost`, `effect`                                                                                                                          |
| `weapons`        | `id`, `name`, `size`, `material`, `damage`, `disruption`, `accuracy`, `crit`, `range`, `cost`, `arc`, `type`                                                    |
| `torpedoes`      | `id`, `name`, `damage`, `disruption`, `accuracy`, `crit`, `arc`, `range` (int), `cost`, `effect`                                                                |
| `shields`        | `id`, `name`, `type`, `mark` (int), `capacity`, `regeneration`, `special`, `cost`                                                                               |
| `criticalDamage` | `roll` (string), `name`, `effect`                                                                                                                               |

---

## Cross-File Dependencies

```
classes.json ──references──► skills.json (skill IDs)
classes.json ──references──► feats.json (feat names)
feats.json   ──references──► classes.json (prerequisite class levels)
equipment.json ─resolves──► weapons.json (weapon names → full stats)
npc-templates.json ──uses──► traits.json (trait IDs)
npc-templates.json ──uses──► skills.json (skill names)
npc-templates.json ──uses──► weapons.json (weapon stats inline)
```

**Always verify consistency** when editing mechanics that appear in multiple files.
