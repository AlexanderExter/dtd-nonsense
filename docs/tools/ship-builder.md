# Ship Builder

Spelljammer ship construction and management tool. Handles hull selection, component installation, crew assignment, and derived ship stat calculations.

**Phase:** 3
**Files:** `tools/ship-builder/index.html`, `ship.js`, `ship.css`
**Pattern:** Object literal (`const ShipTool = { ... }`)

---

## Features

### Hull Selection

- Hull types from `ships.json` with base stats (Size, Hull Points, Maneuver, Speed)
- Hull comparison view — side-by-side stat comparison
- Filtered by category (Fighter, Transport, Frigate, Cruiser, Capital)

### Component Installation

- **Weapons** — broadside, turret, prow, dorsal mount points per hull
- **Defenses** — shields, armor plating, void shields
- **Propulsion** — engine types affecting Speed and Maneuver
- **Crew facilities** — quarters, cargo, special rooms
- **Component slots** — each hull has limited slots per category

### Crew Management

- Minimum crew requirements per hull
- Officer roles with skill requirements
- Crew quality levels affecting ship performance

### Derived Ship Stats

| Stat          | Formula                                           |
| ------------- | ------------------------------------------------- |
| Ship SD       | `10 + Maneuver − (2 × Size) + (Speed × Momentum)` |
| Hull Points   | Base from hull + armor components                 |
| Weapon Damage | Per-weapon stat from `ships.json`                 |
| Detection     | Base + sensor components                          |
| Speed         | Base + engine − cargo penalty                     |

### Vehicle SD Note

Vehicle/Ship SD uses a different formula than character SD:

- **Character SD:** `10 + (Dexterity + Wisdom) × 3 − (Size × 2)` → values in 20s-30s
- **Vehicle SD:** `10 + Maneuver − (2 × Size) + (Speed × Momentum Tier)` → can produce low or negative base values; negative results clamp to 0

---

## Architecture

**Dependencies:** `core.js` (namespace), `dtd-theme.css`

**Data sources:** `ships.json`

### Ship Data Schema

```json
{
    "hulls": [
        {
            "name": "Sword-class Frigate",
            "category": "Frigate",
            "size": 5,
            "hullPoints": 35,
            "maneuver": 15,
            "speed": 8,
            "turretSlots": 1,
            "broadsideSlots": 2,
            "prowSlots": 1,
            "dorsalSlots": 0,
            "crewMin": 20,
            "crewMax": 50
        }
    ],
    "weapons": [ ... ],
    "components": [ ... ]
}
```

### State Structure

```javascript
ShipTool.state = {
    hull: null, // Selected hull object
    components: [], // Installed components
    weapons: [], // Installed weapons with mount assignments
    crew: {
        count: 0,
        quality: "Competent",
        officers: [],
    },
    derivedStats: {}, // Calculated on every state change
};
```

---

## Persistence

| Key              | Content                    |
| ---------------- | -------------------------- |
| `dtd-ship-saved` | Array of saved ship builds |

Ships save as self-contained JSON including hull, all components, and crew.

---

## UI Layout

```
┌───────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐  ┌───────────────────────────────────┐  │
│  │ HULL SELECT      │  │ SHIP STATS                        │  │
│  │                  │  │                                   │  │
│  │ [Fighter    ]    │  │ Sword-class Frigate               │  │
│  │ [Transport  ]    │  │ Size: 5  HP: 35                   │  │
│  │ [Frigate  ●]    │  │ Maneuver: 15  Speed: 8            │  │
│  │ [Cruiser   ]    │  │ Ship SD: 13                       │  │
│  │ [Capital   ]    │  │                                   │  │
│  │                  │  │ Weapons:                          │  │
│  │ Sword-class      │  │  Turret: Mars Pattern Macrogun   │  │
│  │ Dauntless-class  │  │  Port: Macrobattery              │  │
│  │ Lunar-class      │  │  Starboard: (empty)              │  │
│  │                  │  │  Prow: Torpedo Tubes              │  │
│  └─────────────────┘  │                                   │  │
│                        │ Crew: 35/50 (Competent)           │  │
│  ┌─────────────────┐  └───────────────────────────────────┘  │
│  │ COMPONENTS       │                                        │
│  │ [Weapons ▼]      │  [Save] [Export] [New] [Compare]       │
│  │ [Defenses ▼]     │                                        │
│  │ [Engines ▼]      │                                        │
│  └─────────────────┘                                         │
└───────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

| Decision        | Choice              | Rationale                               |
| --------------- | ------------------- | --------------------------------------- |
| SD formula      | Vehicle formula     | Ships are vehicles, not characters      |
| Component slots | Per-hull limits     | Matches book construction rules         |
| Stat display    | Live recalculation  | Immediate feedback on component changes |
| Data source     | Single `ships.json` | All ship data in one file               |

---

## Verification

1. Select hull → verify base stats match `ships.json` data
2. Install weapon in turret slot → verify damage appears in stat block
3. Fill all slots → verify no additional components can be added
4. Ship SD calculation: manually compute `10 + Maneuver − (2 × Size) + (Speed × Momentum)` → verify match
5. Save ship → refresh → load → verify all components and stats restored
