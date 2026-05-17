# Character Sheet

The primary character tool — a freeform editable sheet for both character creation and gameplay tracking. Replaces the old builder-only workflow with a single unified interface where all sections are accessible at once.

**Phase:** 4 (ongoing polish)
**Files:** `src/pages/tools/character-sheet.astro`, `src/components/react/tools/character-sheet/` (16 components)
**Pattern:** React Island via `client:only="react"` with module-level Zustand

---

## Features

### Header

- Character name (editable), Level badge, XP remaining badge
- 4 tracker widgets: HP, Resource (dynamic label from exaltation), Resolve, Hero Points — each with current/max and +/- controls

### Sidebar (Always Visible on Desktop)

- 7 derived stats with formula labels: SD, HP, Mental Defense, Resolve, Speed, Resilience, Initiative
- Each stat shows: formula label, base value, modifier input, effective total
- Size display (from race)
- Wound status badge: Healthy / Lightly Wounded / Heavily Wounded / Down
- Halfling SD variant auto-switches on race selection

### Identity Tab

- Name, Player, Concept, Total XP, XP Spent, XP Remaining
- Languages (add/remove list, seeded from race)
- Race: dropdown → racial bonus characteristic selector → info box (size, languages, skill bonuses, racial power)
- Exaltation: dropdown → info box (description, power stat, resource formula/recovery, tell, static powers, progression table)
- Alignment: dropdown → devotion (0–10) → info box with commandments, collapsible sin table highlighting current devotion

### Stats Tab

- 9 characteristics in 3×3 grid (Physical / Social / Mental), inputs 1–6, specialty at effective total ≥ 4
- 27 skills in 3-column grid from JSON, inputs 0–6, advanced badge, specialty at 4+

### Combat Tab

- Armor & Defense: Aura, Natural Armor, location AP grid (6 tiles), armor table (Name, Type, AP, Max Dex, Location checkboxes, Special)
- Melee weapons: collapsed summary row (Name, Attack XkY, Damage XkY, Pen, Type, Special, Notes) with expandable detail area containing Attack Roll (skill selector → baseline dice/keep + additional Dice/Keep/Fixed inputs), Damage Roll (Dice/Keep/Fixed), Weapon Info (Class, Pen, Type), and Modifiers (Proficient, Weapon Focus, Imp. WF, Specialization, Imp. WS, Crushing Blow)
- Ranged weapons: same layout with additional Range/RoF/Clip/Reload fields and Mighty Shot instead of Crushing Blow
- Weapon attack model: Skill provides baseline dice/keep (read-only), NumberInputs add extras on top. Modifiers (Proficient, Weapon Focus, etc.) stack automatically.

### Powers Tab

- Exaltation info, Power Stat (1-5), Limit/Round display
- Collapsible Resource Point Uses (from `exaltations.json`)
- Hero Points: Max/Burnt/Effective, collapsible spending/burning guide
- Powers/Notes textarea
- Magic Schools: 9-school grid with dot inputs (capped at class Level), bonus level input, dice pool display
- Psychic Strength selector (Fettered/Unfettered), Sanctioned checkbox
- Spells Known: table (School, Level, Name, Notes)
- Sword Schools: 9-school grid with dot inputs
- Gun Kata: 6-kata grid with dot inputs
- Special Attacks / Trick Shots tables

### Features Tab

- Classes: dropdown + level + remove, collapsible details (chars, skills, feats with M/O/C tags, schools, completion bonus, exits)
- Feats: Name (datalist autocomplete, auto-populates notes from JSON) + Notes
- Assets: Name + Notes
- Hindrances: Name + Notes
- Backgrounds: 11-type grid with dot inputs (0-5), notes, budget display (X/7 with over-budget warning)
- Equipment textarea, Notes textarea

### Attacks Tab

- Special Attacks builder: select Sword School, choose weapon, pick action, add techniques (advantages reduce Style Cost, restrictions increase it)
- Trick Shots builder: same pattern for Gun Kata ranged schools
- Technique selector with universal advantages/restrictions shared across all schools
- Style Cost calculation with XP equivalent display (50 XP per Style Point)
- Uses `attacks-data.ts` for school definitions, technique lists, and cost computation

### XP Tab

- XP log with timestamped entries (label + amount)
- Running total display
- Add/remove XP entries

### Multi-Character Management

- Character list in management bar
- Create, load, switch, delete characters
- Each character stored independently

### Import / Export

- **JSON Export:** `character.exportJSON()` → downloadable file
- **JSON Import:** `character.importJSON()` with legacy Builder format detection and migration
- **"Open in Sheet" from Builder:** Direct save via `character.save()` with redirect

---

## Architecture

| Component                                        | Description                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `character-sheet.astro`                          | Astro page shell — mounts `CharacterSheetApp` via `client:only="react"`                |
| `src/components/react/tools/character-sheet/`   | Root App + 7 tab components + shared sub-components (root: `CharacterSheetApp.tsx`) |

**Dependencies:** `@/lib/dtd/character` (character CRUD), `@/lib/dtd/derived` (derived stats), `@/lib/dtd/attacks-data.ts` (school definitions), `@/hooks/use-data`, Zustand

**Data sources:** `races.json`, `exaltations.json`, `alignments.json`, `classes.json`, `feats.json`, `skills.json`, `weapons.json`, `backgrounds.json`

**Rendering:** React component tree with Zustand-driven reactivity. Each tab is a separate component that re-renders via signal subscriptions.

**State management:** Module-level Zustand for character data, UI state (active tab, selections), and derived stats.

---

## Persistence

- **Storage:** `dtd_sheet_{id}` per character, `dtd_sheet_list` for the character index
- **Auto-save:** 400ms debounce on any state change
- **Validation:** `character.validate()` fills missing fields on load (forward-compatible)

---

## Responsive Behavior

| Width      | Layout                                                  |
| ---------- | ------------------------------------------------------- |
| ≥ 1100px   | Full desktop — sidebar + tabs side-by-side              |
| 768–1099px | Grids collapse to 2 columns                             |
| ≤ 768px    | Single column, sidebar collapses, horizontal tab scroll |

### Print

All panels shown simultaneously with `data-print-title` headers. Management bar, tab nav, and save status hidden.

---

## Design Decisions

| Decision                           | Rationale                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| Freeform over wizard               | No enforced creation order; budget displays are informational only                  |
| Exaltation resource-only           | Auto-calc resource pool max; everything else is free-text. Avoids 10 unique sub-UIs |
| No spell/feat database enforcement | Searchable dropdowns assist, but values are user-editable. Keeps scope manageable   |
| React Islands with signals        | Reactive UI with component composition; Tailwind for styling                        |
| Multiple character slots           | Essential — players often have backups, SM tracks NPCs                              |
| Conditions removed from sheet      | Better suited to Combat Tracker where temporary state lives during gameplay         |
| Hero Points merged into Powers tab | Unified card reduces tab-switching; Resource + Hero Points are thematically related |

---

## Known Limitations

**Budget/validation gaps:**

- Characteristic 6/4/2 dot allocation not tracked (Builder responsibility)
- Skill 8/6/4 dot allocation not tracked (Builder responsibility)
- Background budget displays warning but does not enforce
- Class level caps on magic/sword/gun schools displayed but not enforced

**Data gaps:**

- Ranged weapon total damage not auto-calculated (no standard bonus like melee's +Str)
- Race language change replaces (not merges) the language list
- Sound Constitution feat and class HP bonuses not auto-applied (use manual HP modifier)
- No feat/asset mechanical enforcement — effects applied via manual modifiers

**UX gaps:**

- No undo/redo
- No character templates or presets
- No search/filter within feat or class dropdowns (relies on browser datalist)
- No drag-and-drop reordering of list items

---

## Verification

1. Create character → fill all fields → export JSON → import → verify no data loss
2. Switch between 3+ characters — confirm independent state
3. Derived stats match formulas (spot-check with known character builds)
4. Weapon datalist auto-fill populates correct fields from `weapons.json`
5. Print output readable with all tabs visible
6. Responsive: test at 1920px, 768px, 375px
