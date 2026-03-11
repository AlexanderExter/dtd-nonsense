# core.ts — ES Module API

Shared utility module exporting data loading, derived stat calculations, and character persistence (localStorage CRUD). Pure ES module with named exports — no global namespace.

**File:** `src/lib/dtd/core.ts`
**Types:** `src/lib/dtd/types.ts` — canonical interfaces (`CharacterData`, `Characteristics`, `CharacterModifiers`, etc.)
**Consumers:** Character Sheet, Character Builder, Combat Tracker, NPC Generator, Defense Graph, and any future tool pages.

```typescript
import { loadData, loadAllData, derived, character } from "@/lib/dtd/core.ts";
import type { CharacterData } from "@/lib/dtd/types.ts";
```

---

## Data Loading

### loadData\<T\>(filename)

Fetches a single JSON file from the Astro `public/data/` directory.

```typescript
async function loadData<T = unknown>(filename: string): Promise<T>;
```

| Param      | Type     | Description                                             |
| ---------- | -------- | ------------------------------------------------------- |
| `filename` | `string` | JSON filename including extension (e.g. `'races.json'`) |

**Returns:** `Promise<T>` — parsed JSON data.
**Throws:** `Error` if the fetch response is not OK (includes HTTP status).

```typescript
const races = await loadData<Race[]>("races.json");
```

### loadAllData(filenames)

Fetches multiple JSON files in parallel and returns them as a keyed object.

```typescript
async function loadAllData(filenames: string[]): Promise<Record<string, unknown>>;
```

| Param       | Type       | Description                      |
| ----------- | ---------- | -------------------------------- |
| `filenames` | `string[]` | Array of JSON filenames to fetch |

**Returns:** `Promise<Record<string, unknown>>` — object keyed by filename stem (`.json` stripped).

```typescript
const data = await loadAllData(["races.json", "classes.json", "skills.json"]);
// data.races, data.classes, data.skills
```

---

## Derived Stat Calculations — `derived`

Exported as `derived`, a plain object containing all derived stat formulas. All functions are pure (no side effects, no state).

### derived.calculateSD(dex, wis, size, isHalfling?)

**Static Defense** — physical dodge/parry defense.

```typescript
calculateSD(dex: number, wis: number, size: number, isHalfling?: boolean): number
```

| Param        | Type      | Default | Description                   |
| ------------ | --------- | ------- | ----------------------------- |
| `dex`        | `number`  | —       | Dexterity characteristic dots |
| `wis`        | `number`  | —       | Wisdom characteristic dots    |
| `size`       | `number`  | —       | Character size value          |
| `isHalfling` | `boolean` | `false` | Uses Halfling formula if true |

**Formula:**

- Standard: `10 + (dex + wis) × 3 − size × 2`
- Halfling: `10 + dex × 6 − size × 2`

| Example                      | Result |
| ---------------------------- | ------ |
| `calculateSD(4, 3, 4)`       | 23     |
| `calculateSD(5, 5, 4)`       | 32     |
| `calculateSD(4, 3, 3, true)` | 28     |

### derived.calculateHP(con, wil)

**Hit Points** — damage capacity.

```typescript
calculateHP(con: number, wil: number): number
```

**Formula:** `(con + wil) × 2`

### derived.calculateMentalDefense(composure)

**Mental Defense** — resistance to social/psychic effects.

```typescript
calculateMentalDefense(composure: number): number
```

**Formula:** `5 + composure × 5`

### derived.calculateResolve(wil, composure)

**Resolve Points** — social combat resource.

```typescript
calculateResolve(wil: number, composure: number): number
```

**Formula:** `wil + composure`

### derived.calculateInitiativeBase(dex, composure)

**Initiative base** (before roll).

```typescript
calculateInitiativeBase(dex: number, composure: number): number
```

**Formula:** `dex + composure`

### derived.calculateSpeed(str, dex)

**Movement Speed**.

```typescript
calculateSpeed(str: number, dex: number): number
```

**Formula:** `str + dex`

### derived.calculateResilience(size, level)

**Resilience** — resistance to physical effects.

```typescript
calculateResilience(size: number, level: number): number
```

**Formula:** `ceil((size + level) / 2) + 1`

---

## Character Persistence — `character`

Exported as `character`, a plain object providing full character lifecycle management via localStorage.

### Constants

| Name               | Value              | Description                          |
| ------------------ | ------------------ | ------------------------------------ |
| `STORAGE_PREFIX`   | `"dtd_sheet_"`     | Prefix for individual character keys |
| `STORAGE_LIST_KEY` | `"dtd_sheet_list"` | Key for the character list index     |

### character.DEFAULTS

The canonical default character object. Deep-copied when creating new characters. Shape matches `CharacterData` from `types.ts`. See [Character Data Schema](#character-data-schema) below for details.

```typescript
const defaults = character.DEFAULTS; // read-only reference shape
```

### character.createDefault()

Returns a deep copy of `DEFAULTS` with a freshly generated `id`.

```typescript
createDefault(): CharacterData
```

```typescript
const newChar = character.createDefault();
console.log(newChar.id); // e.g. "m1abc2def3"
```

### character.validate(data)

Validates and repairs a character object against `DEFAULTS`. Missing fields are filled with defaults. Extra fields are preserved. Non-object input returns a fresh default character.

```typescript
validate(data: unknown): CharacterData
```

```typescript
const clean = character.validate(untrustedData);
```

### character.save(id, data)

Persists character to localStorage and updates the character list index.

```typescript
save(id: string, data: CharacterData): void
```

- Stores character JSON at key `dtd_sheet_{id}`
- Updates or appends `{ id, name }` in the list at `dtd_sheet_list`
- Logs errors to console on failure (does not throw)

```typescript
character.save(char.id, char);
```

### character.load(id)

Loads character from localStorage. Runs migration and validation on load. Returns a default character with the given `id` if not found or on error.

```typescript
load(id: string): CharacterData
```

```typescript
const char = character.load("m1abc2def3");
```

### character.list()

Returns the saved character list index from localStorage.

```typescript
list(): CharacterListEntry[]
// CharacterListEntry = { id: string; name: string }
```

```typescript
const chars = character.list();
// [{ id: 'm1abc2def3', name: 'Kael' }, ...]
```

### character.remove(id)

Deletes character data and removes entry from the list index.

```typescript
remove(id: string): void
```

### character.exportJSON(data, filename?)

Triggers a browser file download of the character as a `.json` file.

```typescript
exportJSON(data: CharacterData, filename?: string): void
```

| Param      | Type            | Description                                                    |
| ---------- | --------------- | -------------------------------------------------------------- |
| `data`     | `CharacterData` | Character object to export                                     |
| `filename` | `string?`       | Override filename; defaults to sanitized `data.name + ".json"` |

```typescript
character.exportJSON(char); // downloads "kael.json"
character.exportJSON(char, "backup.json");
```

### character.importJSON(file)

Reads a JSON file, runs migration and validation, and returns a character object. Generates a new `id` if none is present.

```typescript
async importJSON(file: File): Promise<CharacterData>
```

```typescript
const fileInput = document.querySelector<HTMLInputElement>("#import");
const char = await character.importJSON(fileInput.files![0]);
character.save(char.id, char);
```

### Internal: \_migrateIfNeeded(data)

Automatic migration logic run on `load()` and `importJSON()`. Handles legacy formats:

- **Object → string IDs** for `race`, `exaltation`, `alignment` (if stored as `{ id: ... }` objects)
- **raceChoices.charBonus → raceCharBonus** field promotion
- **backgrounds object → array** migration (old `{ allies: 2 }` → `[{ name: "Allies", dots: 2, notes: "" }]`)
- **String arrays → FeatEntry arrays** for `feats`, `assets`, `hindrances`
- **Unified weapons → split melee/ranged** (old `weapons[]` → `meleeWeapons[]` + `rangedWeapons[]`)
- **psychicStrength → fettered** boolean conversion
- **globalPush → extraSchoolLevels** rename
- **Cleanup** of stale Builder-only fields (`raceId`, `exaltationId`, `charPriorities`, etc.)

---

## Character Data Schema

The `CharacterData` interface (from `types.ts`) defines the canonical character object shape. All tools must produce and consume this format.

### Top-Level Fields

| Field           | Type     | Default | Description                            |
| --------------- | -------- | ------- | -------------------------------------- |
| `id`            | `string` | `""`    | Unique identifier (generated)          |
| `name`          | `string` | `""`    | Character name                         |
| `player`        | `string` | `""`    | Player name                            |
| `concept`       | `string` | `""`    | Character concept / high-level summary |
| `totalXP`       | `number` | `600`   | Total XP available                     |
| `xpSpent`       | `number` | `0`     | XP already spent                       |
| `race`          | `string` | `""`    | Race ID                                |
| `raceCharBonus` | `string` | `""`    | Chosen racial characteristic bonus     |
| `exaltation`    | `string` | `""`    | Exaltation ID                          |
| `alignment`     | `string` | `""`    | Alignment/pantheon ID                  |
| `devotion`      | `number` | `6`     | Alignment devotion level               |

### Characteristics

`characteristics: Characteristics` — default `2` for each:

| Key            | Type     |
| -------------- | -------- |
| `strength`     | `number` |
| `dexterity`    | `number` |
| `constitution` | `number` |
| `charisma`     | `number` |
| `fellowship`   | `number` |
| `composure`    | `number` |
| `intelligence` | `number` |
| `wisdom`       | `number` |
| `willpower`    | `number` |

### Skills & Specialties

| Field              | Type                     | Default | Description                |
| ------------------ | ------------------------ | ------- | -------------------------- |
| `charSpecialties`  | `Record<string, string>` | `{}`    | Characteristic specialties |
| `skills`           | `Record<string, number>` | `{}`    | Skill name → dot rating    |
| `skillSpecialties` | `Record<string, string>` | `{}`    | Skill specialties          |

### Lists

| Field         | Type           | Default | Description             |
| ------------- | -------------- | ------- | ----------------------- |
| `backgrounds` | `Background[]` | `[]`    | `{ name, dots, notes }` |
| `classes`     | `string[]`     | `[]`    | Class names             |
| `feats`       | `FeatEntry[]`  | `[]`    | `{ name, notes }`       |
| `assets`      | `FeatEntry[]`  | `[]`    | `{ name, notes }`       |
| `hindrances`  | `FeatEntry[]`  | `[]`    | `{ name, notes }`       |

### Equipment

| Field           | Type             | Default | Description                                                          |
| --------------- | ---------------- | ------- | -------------------------------------------------------------------- |
| `meleeWeapons`  | `MeleeWeapon[]`  | `[]`    | `{ name, damage, damageType, proficiency, qualities, notes }`        |
| `rangedWeapons` | `RangedWeapon[]` | `[]`    | `{ name, damage, damageType, range, proficiency, qualities, notes }` |
| `armor`         | `ArmorEntry[]`   | `[]`    | `{ name, type, locations, ap, qualities }`                           |
| `naturalArmor`  | `number`         | `0`     | Natural armor points                                                 |
| `aura`          | `number`         | `0`     | Aura rating                                                          |
| `auraSource`    | `string`         | `""`    | Source of aura                                                       |

### Magic & Combat Schools

| Field            | Type                     | Default | Description                    |
| ---------------- | ------------------------ | ------- | ------------------------------ |
| `magicSchools`   | `Record<string, number>` | `{}`    | School name → dot rating       |
| `swordSchools`   | `Record<string, number>` | `{}`    | Sword school name → dot rating |
| `gunKata`        | `Record<string, number>` | `{}`    | Gun kata name → dot rating     |
| `spells`         | `string[]`               | `[]`    | Known spell names              |
| `specialAttacks` | `string[]`               | `[]`    | Known special attacks          |
| `trickShots`     | `string[]`               | `[]`    | Known trick shots              |

### Power & Resources

| Field               | Type                     | Default | Description                      |
| ------------------- | ------------------------ | ------- | -------------------------------- |
| `powerStat`         | `number`                 | `1`     | Power stat dots                  |
| `heroPointsMax`     | `number`                 | `2`     | Maximum hero points              |
| `heroPointsCurrent` | `number`                 | `2`     | Current hero points              |
| `heroPointsBurnt`   | `number`                 | `0`     | Permanently burnt hero points    |
| `fettered`          | `boolean`                | `false` | Using fettered psychic strength  |
| `pushAmount`        | `number`                 | `0`     | Push amount                      |
| `extraSchoolLevels` | `number`                 | `0`     | Global extra school levels       |
| `bonusSchoolLevels` | `Record<string, number>` | `{}`    | Per-school bonus levels          |
| `sanctioned`        | `boolean`                | `false` | Sanctioned psyker flag           |
| `resourceCurrent`   | `number`                 | `0`     | Current exaltation resource pool |
| `exaltationNotes`   | `string`                 | `""`    | Exaltation-specific notes        |

### Modifiers

`modifiers: CharacterModifiers` — default `0` for each:

| Key             | Type     | Description             |
| --------------- | -------- | ----------------------- |
| `staticDefense` | `number` | Bonus to Static Defense |
| `hitPoints`     | `number` | Bonus to Hit Points     |
| `mentalDefense` | `number` | Bonus to Mental Defense |
| `resolve`       | `number` | Bonus to Resolve        |
| `speed`         | `number` | Bonus to Speed          |
| `resilience`    | `number` | Bonus to Resilience     |
| `initiative`    | `number` | Bonus to Initiative     |

### Miscellaneous

| Field            | Type          | Default | Description                              |
| ---------------- | ------------- | ------- | ---------------------------------------- |
| `savedPools`     | `SavedPool[]` | `[]`    | `{ label, notation }` — saved dice pools |
| `languages`      | `string[]`    | `[]`    | Known languages                          |
| `equipment`      | `string`      | `""`    | Freeform equipment text                  |
| `notes`          | `string`      | `""`    | General notes                            |
| `classNotes`     | `string`      | `""`    | Class-specific notes                     |
| `description`    | `string`      | `""`    | Physical description                     |
| `height`         | `string`      | `""`    | Character height                         |
| `weight`         | `string`      | `""`    | Character weight                         |
| `age`            | `string`      | `""`    | Character age                            |
| `currentHP`      | `number`      | `0`     | Current hit points tracker               |
| `currentResolve` | `number`      | `0`     | Current resolve tracker                  |

---

## localStorage Keys

| Key Pattern      | Content                                   | Manager     |
| ---------------- | ----------------------------------------- | ----------- |
| `dtd_sheet_{id}` | Full `CharacterData` JSON                 | `character` |
| `dtd_sheet_list` | `CharacterListEntry[]` — `[{ id, name }]` | `character` |

---

## Modification Checklist

When editing `core.ts`:

1. **Update `types.ts`** if adding/removing/changing any field on `CharacterData`
2. **Update `DEFAULTS`** to match any schema change in `types.ts`
3. **Update `_migrateIfNeeded()`** to handle old → new format if renaming/restructuring fields
4. **Grep tool scripts** (`src/lib/tools/`, `src/pages/tools/`) for any function you modify — callers break silently
5. **Test Character Sheet first** — it exercises the most `core.ts` surface area
6. **Update this doc** (`docs/shared/core-js.md`) to reflect the change
