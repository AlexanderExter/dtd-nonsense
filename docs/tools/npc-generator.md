# NPC Generator

Generates NPC stat blocks for Story Masters. Supports both quick-build (template-based) and custom-build (manual specification) workflows.

**Phase:** Complete
**Files:** `src/pages/tools/npc-generator.astro`, `src/components/preact/tools/npc-generator/` (12 components)
**Pattern:** Preact Island via `client:load` with module-level `@preact/signals`

---

## Features

### Quick Build (Template-Based)

1. Select NPC template from `npc-templates.json`
2. Choose threat level (Minion / Standard / Elite / Boss)
3. Adjust level slider (scales stats per template formulas)
4. Generate → full stat block with calculated values

### Custom Build

1. Set characteristics directly (dot ratings 1-10)
2. Assign skills, weapons, armor
3. Add special abilities from `traits.json`
4. Computed stats update live

### Trait System

- **Traits** loaded from `traits.json` — special abilities, auras, powers
- Searchable/filterable trait list
- Multiple traits per NPC
- Trait effects displayed in stat block

### Output

- **Stat block card** — formatted for print or screenshot
- **Export to Tracker** — saves as combatant-ready data for Combat Tracker import
- **Copy as text** — plain-text stat block for paste into notes

---

## Architecture

**Dependencies:** `import { loadData, derived, escapeHtml } from '@/lib/dtd/core.ts'`

**Data sources:** `npc-templates.json`, `traits.json`, `skills.json`

### Template Schema

```json
{
    "name": "Ork Boy",
    "type": "Humanoid",
    "threat": "Standard",
    "characteristics": {
        "strength": 4,
        "dexterity": 3,
        "constitution": 4,
        "intelligence": 2,
        "wisdom": 2,
        "willpower": 3,
        "charisma": 2,
        "fellowship": 1,
        "composure": 3
    },
    "skills": { "weaponry": 3, "ballistics": 2, "brawl": 4 },
    "size": 4,
    "traits": ["Fearless", "Mob Rule"],
    "equipment": ["Choppa", "Slugga", "Light Armor"]
}
```

### Stat Calculation

```javascript
// Derived stats use standard formulas from core.ts
const sd = derived.calculateSD(chars.dexterity, chars.wisdom, npc.size);
const hp = derived.calculateHP(chars.constitution, chars.willpower);
const md = derived.calculateMentalDefense(chars.composure);
```

NPC stat blocks use the **same formulas** as player characters. The books note "NPCs may use simplified flat values" but this tool uses calculated values for consistency.

---

## Persistence

| Key             | Content                        |
| --------------- | ------------------------------ |
| `dtd-npc-saved` | Array of saved NPC stat blocks |

Saved NPCs can be re-loaded for editing or exported to Combat Tracker.

---

## UI Layout

```
┌───────────────────────────────────────────────────────────────┐
│  [Quick Build] [Custom Build]                                 │
│                                                               │
│  Template: [Ork Boy ▼]  Threat: [Standard ▼]  Level: [3]     │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ORK BOY                              Standard, Level 3 │  │
│  │  Humanoid, Size 4                                       │  │
│  │                                                         │  │
│  │  STR 4  DEX 3  CON 4  INT 2  WIS 2  WIL 3             │  │
│  │  CHA 2  FEL 1  COM 3                                   │  │
│  │                                                         │  │
│  │  SD: 22   HP: 14   MD: 20                               │  │
│  │  Armor: 3  Aura: 0                                      │  │
│  │                                                         │  │
│  │  Weaponry 3, Ballistics 2, Brawl 4                      │  │
│  │                                                         │  │
│  │  Traits: Fearless, Mob Rule                              │  │
│  │  Equipment: Choppa (2k2 R, Pen 1), Slugga, Light Armor  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  [Save] [Export to Tracker] [Copy Text] [New]                 │
└───────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

| Decision       | Choice         | Rationale                                               |
| -------------- | -------------- | ------------------------------------------------------- |
| Stat formulas  | Same as PC     | Consistency; book allows flat values but calc is better |
| Template data  | Separate JSON  | Easy to extend, community-contributed                   |
| Threat scaling | Multiplicative | Matches book guidance for encounter building            |
| Export target  | Combat Tracker | Primary consumer of NPC stat blocks                     |

---

## Verification

1. Quick Build: select template → generate → verify SD/HP/MD match formula calculations
2. Threat levels: same template at Minion vs Boss → verify HP/stat scaling correct
3. Traits: add 2+ traits → verify all display in stat block
4. Export to Tracker → open Tracker → verify NPC appears as combatant
5. Custom Build: set all characteristics manually → verify derived stats match
