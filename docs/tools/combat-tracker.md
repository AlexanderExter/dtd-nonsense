# Combat Tracker

Turn-based combat management tool for Story Masters. Handles initiative order, HP/resource tracking, condition management, and multi-encounter support.

**Phase:** 2
**Files:** `src/pages/tools/combat-tracker.astro` (JS/CSS inline)
**Pattern:** Inline `<script>` in Astro page

---

## Features

### Initiative Management

- **Character import** — loads characters from localStorage (saved via Character Sheet)
- **Quick-add combatants** — manual entry for NPCs and enemies
- **Initiative rolling** — integrated `roll()` from `@/lib/dtd/dice.ts` for initiative, auto-sorted
- **Round tracking** — round counter with next/previous turn controls
- **Turn indicator** — highlights active combatant

### Combatant Cards

Each combatant displays:

| Field           | Source                                                |
| --------------- | ----------------------------------------------------- |
| Name            | Character name or manual entry                        |
| Initiative      | Rolled or manually set                                |
| Hit Points      | Current / Max (calculated from char data)             |
| Resource Points | Exaltation-specific pool                              |
| Hero Points     | Narrative resource                                    |
| Static Defense  | Calculated via `derived.calculateSD()`            |
| Mental Defense  | Calculated via `derived.calculateMentalDefense()` |
| Conditions      | Active conditions with duration tracking              |
| Armor / Aura    | From equipment data                                   |

### Damage & Healing

- **Apply damage** — reduces HP with armor/aura consideration
- **Apply healing** — restores HP up to maximum
- **Resource spend/restore** — tracks Resource Points and Hero Points
- **Overflow tracking** — damage beyond 0 HP noted for death/critical rules

### Condition Management

- **Add condition** — from predefined condition list matching `16-Conditions.md`
- **Duration tracking** — auto-decrement per round, notify on expiry
- **Custom conditions** — free-text for homebrew effects
- **Condition reference** — tooltip/popup with mechanical effects

### Multi-Encounter Support

- **Save encounter** — snapshot current combat state to localStorage
- **Load encounter** — restore saved encounters
- **New encounter** — reset with option to keep combatant roster

---

## Architecture

**Dependencies:** `import { character, derived } from '@/lib/dtd/core.ts'`, `import { roll } from '@/lib/dtd/dice.ts'`

### State Structure

```javascript
Tracker.state = {
    encounter: {
        round: 1,
        turn: 0,                         // Index into initiative order
        combatants: [
            {
                id: "char-uuid",
                name: "Kael",
                initiative: 15,
                hp: { current: 22, max: 22 },
                resource: { current: 5, max: 5, type: "Vitae" },
                heroPoints: 1,
                sd: 28,
                mentalDefense: 30,
                armor: 4,
                aura: 2,
                conditions: [
                    { name: "Stunned", rounds: 2 }
                ],
                isNPC: false,
                characterData: { ... }    // Full canonical character if imported
            }
        ]
    },
    savedEncounters: []
};
```

### Character Import Flow

```
Characters in localStorage → character.list() → user selects →
character.load(id) → derived calculations → combatant card created
```

### Initiative Resolution

```javascript
// For each combatant:
const initRoll = roll(initPool, initKeep);
combatant.initiative = initRoll.total + initiativeBase;
// Sort descending, ties broken by Dexterity then Wisdom
```

Initiative base is calculated from `derived.calculateInitiativeBase()` = `Dexterity + Wisdom`.

---

## Persistence

| Key                     | Content                            |
| ----------------------- | ---------------------------------- |
| `dtd-tracker-encounter` | Current encounter state            |
| `dtd-tracker-saved`     | Array of saved encounter snapshots |

Auto-saves after every state change (damage, turn advance, condition update).

---

## UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Round: 3   Turn: Kael                    [Next] [Prev] [New] │
│                                                                │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │ ► Kael (PC)      15  │  │   Goblin A (NPC)  12 │           │
│  │   HP: ██████░░ 18/22 │  │   HP: █████░░░  6/10 │           │
│  │   SD: 28  MD: 30     │  │   SD: 18  MD: 15     │           │
│  │   Vitae: ●●●●○  4/5  │  │   Conditions: Prone  │           │
│  │   Armor: 4  Aura: 2  │  │   [Damage] [Heal]    │           │
│  │   [Damage] [Heal]    │  └──────────────────────┘           │
│  │   [Conditions] [Edit]│                                      │
│  └──────────────────────┘  ┌──────────────────────┐           │
│                            │   Goblin B (NPC)   8 │           │
│  [Add Combatant]           │   HP: ░░░░░░░░  0/10 │           │
│  [Import Character]        │   ☠ Defeated          │           │
│  [Save Encounter]          └──────────────────────┘           │
└────────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

| Decision            | Choice                  | Rationale                                     |
| ------------------- | ----------------------- | --------------------------------------------- |
| Derived stat source | Calculated live         | Character edits in Sheet propagate to Tracker |
| Initiative engine   | Shared `dice.ts`        | Consistent explosion behavior across tools    |
| Condition list      | Matches `16-Conditions` | Single source of truth with rulebook          |
| Auto-save           | Every state change      | SM should never lose encounter state          |
| NPC quick-add       | Flat stat entry         | NPCs don't need full character objects        |

---

## Known Limitations

- **No networked play** — tracker is single-browser only (Story Master screen)
- **Condition effects** — displayed for reference but not auto-applied to stats
- **Large encounters** — card layout becomes crowded beyond ~8 combatants

---

## Verification

1. Import 2 characters from Sheet → verify SD, HP, Resource match Sheet display
2. Roll initiative → verify sorted order, exploding dice work
3. Advance rounds → verify condition duration decrements
4. Apply damage → verify HP decrements, armor subtraction if applicable
5. Save encounter → refresh page → load encounter → verify full state restored
6. Quick-add NPC → verify manual stats editable
