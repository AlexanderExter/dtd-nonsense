# core.js — DTD Namespace & Character API

Foundation module that defines the `DTD` global namespace and provides character data management, derived stat calculations, XP cost tables, and shared UI helpers.

**File:** `tools/shared/js/core.js` (~681 lines)
**Consumers:** Every tool in the project

---

## Namespace Declaration

```javascript
var DTD = window.DTD || {};
```

> **Why `var` not `const`?** Using `var` at global scope creates a property on `window` (`window.DTD`). `const` and `let` create block-scoped bindings that do NOT appear on `window`, silently splitting the namespace when other scripts access `window.DTD`. This is intentional — do not "modernize" it.

---

## DTD.derived — Stat Formulas

All derived stat calculation functions. Used by Character Sheet, Builder, Combat Tracker, NPC Generator, and Defense Graph.

### calculateSD(dex, wis, size)

**Static Defense** — physical dodge/parry defense.

```javascript
return 10 + (dex + wis) * 3 - size * 2;
```

| Example              | Result |
| -------------------- | ------ |
| Dex 4, Wis 3, Size 4 | 23     |
| Dex 5, Wis 5, Size 4 | 32     |
| Dex 2, Wis 2, Size 5 | 12     |

### calculateHP(con, wil)

**Hit Points** — damage capacity.

```javascript
return (con + wil) * 2;
```

### calculateMentalDefense(composure)

**Mental Defense** — resistance to social/psychic effects.

```javascript
return 5 + composure * 5;
```

### calculateResolve(willpower, composure)

**Resolve Points** — social combat resource.

```javascript
return willpower + composure;
```

### calculateInitiativeBase(dex, wis)

**Initiative base** (before roll).

```javascript
return dex + wis;
```

### calculateSpeed(dex, str)

**Movement Speed**.

```javascript
return dex + str;
```

### calculateResilience(con, wil)

**Resilience** — resistance to physical effects.

```javascript
return con + wil;
```

---

## DTD.character — Character CRUD

Complete character lifecycle management with localStorage persistence.

### Schema: DEFAULTS

The canonical character object shape. All tools must produce and consume this format.

```javascript
DTD.character.DEFAULTS = {
    version: 2,
    name: "",
    player: "",
    concept: "",
    race: "",
    subrace: "",
    exaltation: "",
    exaltationPower: "",
    characteristics: {
        strength: 1,
        dexterity: 1,
        constitution: 1,
        intelligence: 1,
        wisdom: 1,
        willpower: 1,
        charisma: 1,
        fellowship: 1,
        composure: 1,
    },
    skills: {}, // { "weaponry": 3, "athletics": 2, ... }
    classes: [], // [{ name, level, features: [] }]
    feats: [], // [{ name, source, page }]
    backgrounds: {}, // { "allies": 2, "wealth": 3 }
    alignment: { name: "", devotion: 0 },
    weapons: [], // [{ name, damage, type, pen, qualities }]
    armor: { name: "", ap: 0, type: "", qualities: [] },
    gear: [], // [{ name, quantity }]
    hp: { current: 0, max: 0 },
    heroPoints: 1,
    resource: { name: "", current: 0, max: 0 },
    xp: { total: 600, spent: 0, log: [] },
    notes: "",
    swordSchools: {}, // { "schoolName": dotRating }
    gunKatas: {}, // { "kataName": dotRating }
    spells: [], // [{ name, school, rank }]
    powerStat: { name: "", value: 1 },
    size: 4,
    derivedStats: {}, // Cached calculated values
};
```

### createDefault()

Returns a deep copy of `DEFAULTS`. Always use this to create new characters.

```javascript
const char = DTD.character.createDefault();
```

### validate(data)

Validates and repairs a character object against `DEFAULTS`. Missing fields are filled with defaults. Extra fields are preserved. Returns the repaired object.

```javascript
const clean = DTD.character.validate(loadedData);
```

### save(id, data)

Persists character to localStorage under key `dtd-char-{id}`. Also updates the character index.

```javascript
DTD.character.save("abc-123", characterObj);
```

### load(id)

Loads character from localStorage. Returns `null` if not found. Runs `_migrateIfNeeded()` on load.

```javascript
const char = DTD.character.load("abc-123");
```

### list()

Returns array of `{ id, name, race, exaltation }` for all saved characters.

```javascript
const chars = DTD.character.list();
// [{ id: 'abc-123', name: 'Kael', race: 'Eldarin', exaltation: 'Vampire' }]
```

### remove(id)

Deletes character from localStorage and removes from index.

### exportJSON(data)

Triggers browser file download of character as `.json` file.

### importJSON(file, callback)

Reads a `.json` file, validates it, and passes the character object to callback.

### \_migrateIfNeeded(data)

Internal migration function. Upgrades older character formats to current version. Currently handles:

- **v1 → v2:** Added `swordSchools`, `gunKatas`, `spells`, `powerStat` fields

---

## XP_COSTS — Experience Point Tables

```javascript
DTD.XP_COSTS = {
    characteristic: [0, 0, 100, 200, 300, 400, 700], // Index = dot level
    skill: [0, 50, 50, 100, 150, 200, 400],
    classLevel: [0, 200, 200, 400, 600, 1000],
    background: [0, 50, 50, 50, 100, 100], // Dots 4-5 cost 100
    powerStat: [0, 0, 200, 200, 400, 600, 1000],
    swordSchool: [0, 100, 100, 200, 300, 500],
    gunKata: [0, 100, 100, 200, 300, 500],
    spell: 100, // Flat per spell
};
```

Index = dot level being purchased. `characteristic[3]` = 200 XP to buy characteristic dot 3.

---

## UI Helpers

### renderDotRating(current, max, options)

Renders a clickable dot-rating widget (●●●○○) as HTML string.

```javascript
const html = DTD.renderDotRating(3, 5, { editable: true, name: "strength" });
// → '<span class="dot-rating">●●●○○</span>'
```

**Options:**

- `editable` (boolean) — enables click-to-set
- `name` (string) — field name for data binding
- `onChange` (function) — callback when value changes

### initAccordion(container)

Initializes accordion behavior on elements within `container`. Toggles `.open` class on header click.

### debounce(fn, delay)

Returns debounced version of `fn` with `delay` ms wait.

### escapeHtml(str)

HTML-entity-encodes `<`, `>`, `&`, `"`, `'` for safe DOM insertion.

---

## localStorage Keys

| Key Pattern      | Content                      | Manager         |
| ---------------- | ---------------------------- | --------------- |
| `dtd-char-{id}`  | Individual character JSON    | `DTD.character` |
| `dtd-char-index` | Array of character summaries | `DTD.character` |

---

## Script Load Order

core.js must load before any other DTD module:

```html
<script src="../shared/js/core.js"></script>
<!-- 1st: namespace + character -->
<script src="../shared/js/dice.js"></script>
<!-- 2nd: dice engine -->
<script src="tool-specific.js"></script>
<!-- 3rd: tool module -->
```

---

## Modification Checklist

When editing core.js:

1. **Grep all tool directories** for any function you modify — callers break silently
2. **Check all HTML files** for script tag order if adding/removing exports
3. **Update DEFAULTS** version number if schema changes
4. **Update \_migrateIfNeeded()** to handle old → new format
5. **Test Character Sheet** first — it exercises the most core.js surface area
