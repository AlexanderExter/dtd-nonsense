# Character Builder

Guided 11-step character creation wizard that enforces creation rules and outputs Character Sheet-compatible JSON. Designed for new players who need structured guidance through the character creation process.

**Phase:** 1.2
**Files:** `src/pages/tools/character-builder.astro`, `src/components/react/tools/character-builder/` (18 components)
**Pattern:** React Island via `client:only="react"` with module-level Zustand

---

## Features

### Wizard Steps

| Step | Name            | Content                                                                                            |
| ---- | --------------- | -------------------------------------------------------------------------------------------------- |
| 1    | Identity        | Name (required), Player, Concept — no game mechanics                                               |
| 2    | Race            | Selection grid from `races.json` with Book 1/2 filter. Characteristic bonus choice                 |
| 3    | Exaltation      | Selection grid from `exaltations.json`. Power stat, resource info                                  |
| 4    | Characteristics | Priority assignment (6/4/2) across Physical/Social/Mental groups. Dot allocation within each group |
| 5    | Skills          | Priority assignment (8/6/4). Dot allocation with race bonuses shown                                |
| 6    | Backgrounds     | 11 backgrounds from `backgrounds.json`. 7-dot budget, 5th dot costs 2                              |
| 7    | Alignment       | Pantheon filter → alignment selection → devotion slider (0-10) with sin table                      |
| 8    | Classes         | Track + level selection from `classes.json`. Multi-classing supported. XP deductions               |
| 9    | Feats           | Category filter, searchable list from `feats.json`. Prerequisite display. Running XP cost          |
| 10   | Equipment       | Starting equipment packages from `equipment.json`. Choice resolution                               |
| 11   | Review & Export | Full summary, derived stats, XP breakdown, warnings. "Open in Sheet" + "Export JSON"               |

### Sidebar Summary (Always Visible)

- Character name, Race + Exaltation badges
- Derived stats (updating live as allocations change)
- XP budget bar: `████████░░ 120/600 remaining`
- Per-category XP breakdown
- Step completion indicators (checkmarks)
- "Open in Sheet" + "Export" buttons

### Creation Rules Enforced

| Rule                    | Limit                                              |
| ----------------------- | -------------------------------------------------- |
| Characteristics         | ≤ 4 during allocation (racial bonus can push to 5) |
| Skills                  | ≤ 3 during allocation                              |
| Classes                 | Tier 1 only (new characters start at level 1)      |
| Backgrounds (free)      | Max 3 dots per background from 7-dot budget        |
| Backgrounds (XP)        | Dots 4-5 cost 100 XP each; creation only           |
| Magic/Sword/Gun schools | Dots capped at highest class Level                 |

### Priority System

Characters allocate dots via tiered priorities:

| Priority  | Characteristic Dots | Skill Dots |
| --------- | ------------------- | ---------- |
| Primary   | 6                   | 8          |
| Secondary | 4                   | 6          |
| Tertiary  | 2                   | 4          |

Groups for both characteristics and skills:

- **Physical:** Str/Dex/Con (chars) or physical skills
- **Social:** Cha/Fel/Com (chars) or social skills
- **Mental:** Int/Wis/Wil (chars) or mental skills

---

## Architecture

Rewrite of the original Builder as a React Island, following Character Sheet patterns.

**Dependencies:** `@/lib/dtd/core.ts` (character, derived, loadAllData), `@/hooks/use-data`, `@/hooks/use-local-storage`, Zustand

**Data sources:** `races.json`, `exaltations.json`, `skills.json`, `classes.json`, `feats.json`, `backgrounds.json`, `alignments.json`, `equipment.json`, `weapons.json`

### State Management

```javascript
Builder.state = {
    step: 1,                              // Current wizard step
    stepsCompleted: [false, ...],         // Completion tracking per step
    character: character.createDefault(), // Canonical format throughout
    charPriority: { physical: null, social: null, mental: null },
    skillPriority: { physical: null, social: null, mental: null },
    xpBudget: { total: 600, spent: {} }   // Breakdown by category
};
```

The character object in state is **always in canonical format**. No translation needed at export time.

### Equipment Resolution

When equipment is selected, `resolveEquipmentWeapons()` maps item names to full weapon objects from `weapons.json`:

```javascript
const weaponItems = getEquipmentWeaponItems();
state.character.weapons = weaponItems.map((name) => findWeaponByName(name)).filter((w) => w !== null);
```

### Exaltation Power Tracking

Each exaltation has a `progression` array. Powers at `dots: 1` are automatically unlocked on selection.

---

## UI Layout

Accordion wizard with non-linear navigation (jump back to any completed step). Sidebar summary always visible on desktop.

```
┌───────────────────────────────────────────────────────────────┐
│ WIZARD STEPS (accordion)           │ SIDEBAR SUMMARY          │
│                                    │                          │
│ ▸ 1. Identity ✓                    │ Name: Kael               │
│ ▸ 2. Race ✓                       │ Eldarin Vampire           │
│ ▾ 3. Exaltation (expanded)         │                          │
│   [selection grid]                 │ SD: 28  HP: 10           │
│                                    │ XP: ████░░ 340/600       │
│ ▸ 4. Characteristics               │                          │
│ ▸ 5. Skills                        │ [Open in Sheet]          │
│ ...                                │ [Export JSON]            │
└───────────────────────────────────────────────────────────────┘
```

---

## Export

- **"Open in Sheet"** — `character.save(id, data)` → redirect to Character Sheet with character pre-selected
- **"Export JSON"** — `character.exportJSON(data)` → file download
- **"Start Over"** — resets all state

Output is always canonical Character Sheet format. The Builder no longer produces its own legacy format.

---

## Data Requirements

Uses existing JSON files only — no new data files needed.

---

## Persistence

The Builder itself does not auto-save wizard state. Characters are persisted only on explicit export or "Open in Sheet."

---

## Key Design Changes from Original Builder

| Aspect        | Original Builder          | Revised Builder                            |
| ------------- | ------------------------- | ------------------------------------------ |
| Output format | Custom Builder JSON       | Canonical Character Sheet JSON             |
| Export target | "Open in Play" (removed)  | "Open in Sheet" → Character Sheet          |
| Code pattern  | IIFE with loose functions | Object literal with delegated events       |
| Persistence   | None (export only)        | `character.save()` for "Open in Sheet" |
| XP tracking   | Not tracked               | Running XP budget with breakdown           |
| Steps         | 9 steps                   | 11 steps (Identity + Review added)         |

---

## Verification

1. Complete all 11 steps → "Open in Sheet" → verify all data appears in Character Sheet
2. Export JSON → import in Sheet → compare all fields
3. Priority allocation math: 6/4/2 dots allocate correctly, no over-budget
4. XP budget decrements correctly per class level, feat, school dot
5. Background 5th-dot costs 2 from budget
6. Class level caps enforce magic/sword/gun school dot limits
