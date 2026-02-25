# Architecture

System-wide architecture for the DTD 40k project: Astro/Starlight documentation site with ES module play tools.

---

## Technology Stack

### Astro / Starlight Layer (Documentation Site)

The rulebook and play tools are published as a static site via **Astro 5 + Starlight**, deployed to Vercel.

| Choice              | Rationale                                                                         |
| ------------------- | --------------------------------------------------------------------------------- |
| Astro + Starlight   | Documentation-first static site with built-in search (Pagefind), sidebar, theming |
| npm                 | Manages Astro, Starlight, Chart.js, Sharp, Vercel adapter                         |
| TypeScript (strict) | Astro config/content collections; `@/` path alias for `src/*`                     |
| ES modules          | `src/lib/dtd/core.ts` and `dice.ts` are typed ES module ports of the shared libraries; `types.ts` provides canonical interfaces |
| Vercel (static)     | Zero-config deploy; `@astrojs/vercel` adapter with static output                  |

Key files:

| File / Directory       | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `astro.config.mjs`     | Starlight config, sidebar, theme, Vercel adapter                  |
| `scripts/prebuild.mjs` | Copies cleaned-references → rules, books, JSON → public/data      |
| `src/content/docs/`    | Generated Starlight content (rules, books) — gitignored           |
| `src/pages/tools/`     | Tool pages (Astro pages outside Starlight)                        |
| `src/lib/dtd/`         | Typed ES modules: core.ts, dice.ts, types.ts                      |
| `src/lib/tools/`       | Tool-specific ES module scripts (sheet-app.ts, builder-app.ts)    |
| `src/layouts/`         | `ToolLayout.astro` — wrapper for tool pages                       |
| `src/styles/`          | `custom.css` (WH40K theme), per-tool CSS (sheet.css, builder.css) |
| `data/`                | Canonical JSON game data (12 files) — source for prebuild         |
| `public/data/`         | Generated JSON data copies (from `data/`) — gitignored            |

Build pipeline: `node scripts/prebuild.mjs && astro build` — prebuild copies source content into Astro structure, then Astro builds the static site.

### When to Reconsider

- **TypeScript for tools:** ~~If tool complexity warrants it, Astro's Vite-based build supports `.ts` files natively.~~ Done — Phase 1 complete. `core.ts`, `dice.ts`, and `types.ts` are fully typed; tool apps have `@ts-nocheck` pending Phase 2 module refactor.

### Python Pipeline

A `pipeline/` Python package (Pydantic v2 + Click CLI) provides data validation, content linting, and Astro/Starlight migration prep. Managed via `uv`; entry point is `dtd` CLI. See [docs/pipeline.md](pipeline.md) for details.

---

## Deployment & CI

### Vercel

The site is deployed to **Vercel** as a static site via `@astrojs/vercel`.

| Setting          | Value                                  |
| ---------------- | -------------------------------------- |
| Framework        | Astro (auto-detected)                  |
| Build command    | `npm run build`                        |
| Output directory | `.vercel/output/static`                |
| Production URL   | `https://dtd-nonsense.vercel.app`      |
| Adapter          | `@astrojs/vercel` (static output mode) |
| Env variables    | None required                          |

Vercel is connected to the GitHub repository (`AlexanderExter/dtd-nonsense`). It automatically:

- **Deploys production** when commits land on `main`
- **Creates preview deployments** for every pull request, with a unique URL posted as a PR comment
- Runs its own build (`npm run build`) independently of GitHub Actions

### GitHub Actions CI

The `.github/workflows/build.yml` workflow runs on every push and pull request:

```
Node / Astro          Python pipeline
─────────────         ─────────────────
npm ci                uv sync --dev
npm run build         ruff check .
                      dtd validate
                      dtd lint
```

Both pipelines must pass for a PR to be merge-ready. Vercel preview builds run in parallel with CI — a PR can have a working preview even while CI is still running.

---

## File Structure — Game Data

```
data/
├── alignments.json       21 alignments, devotion/sin tables
├── backgrounds.json      11 background types
├── classes.json          18 tracks × 5 levels (90 class entries)
├── equipment.json        Starting equipment packages
├── exaltations.json      9 supernatural types, power stat pools
├── feats.json            100+ feats with prerequisites
├── npc-templates.json    40+ pre-built NPC stat blocks
├── races.json            16 playable races
├── ships.json            Hulls, consoles, weapons, shields
├── skills.json           27 skills with grouping metadata
├── traits.json           ~20 NPC traits with parameterized effects
└── weapons.json          Ranged and melee weapon stats
```

`data/` is the canonical source for all game data. `scripts/prebuild.mjs` copies these files to `public/data/` during the build — `public/data/` is gitignored and never committed.

---

## Code Patterns

All tools follow the **object literal pattern**:

```javascript
const ToolName = {
    state: { ... },
    init() { ... },
    render() { ... },
    // ...methods
};

document.addEventListener('DOMContentLoaded', () => ToolName.init());
```

| Tool              | Global Name   | Pattern                 |
| ----------------- | ------------- | ----------------------- |
| Character Sheet   | `Sheet`       | Object literal          |
| Character Builder | `Builder`     | Object literal          |
| Dice Roller       | _(loose fns)_ | DOM caching + listeners |
| Combat Tracker    | `Tracker`     | Object literal          |
| Quick Reference   | `QRef`        | Object literal          |
| NPC Generator     | `NPCBuilder`  | Object literal          |
| Ship Builder      | `ShipTool`    | Object literal          |
| Success Curves    | `Analyzer`    | IIFE returning object   |
| Defense Graph     | `DefGraph`    | IIFE returning object   |

Event handling uses **delegation** on a root container (e.g., `.tab-panels`) with `data-*` attributes for routing:

```javascript
container.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'delete') { ... }
});
```

---

## Data Flow

### Character Sheet — Canonical Format

The Character Sheet defines the **canonical character JSON schema**. All other tools that produce or consume character data use this format.

```
┌──────────────────────────────────────────────────────────────┐
│                      CHARACTER SHEET                          │
│                                                              │
│  DTD.character.createDefault() → new character with UUID     │
│  DTD.character.save(id, data) → localStorage dtd_sheet_{id}  │
│  DTD.character.load(id)       → validated + migrated char    │
│  DTD.character.exportJSON()   → JSON file download           │
│  DTD.character.importJSON()   → legacy migration → save      │
└──────────────────────────────────────────────────────────────┘
```

### Builder → Sheet Pipeline

```
Character Builder                      Character Sheet
┌────────────────────┐                ┌────────────────────┐
│ User makes choices │                │                    │
│ via 11-step wizard │                │ DTD.character      │
│                    │ ── JSON ──►    │ .importJSON(file)  │
│ Exports canonical  │  export/       │                    │
│ Sheet-format JSON  │  import        │ Legacy detection   │
└────────────────────┘                │ + migration        │
                                      └────────────────────┘
```

The Builder also has a direct "Open in Sheet" button that calls `DTD.character.save()` and redirects to the Sheet with the character pre-selected.

### Legacy Format Migration

`DTD.character.importJSON()` detects old Builder format and converts:

| Builder (Legacy)                         | Sheet (Canonical)                              |
| ---------------------------------------- | ---------------------------------------------- |
| `race: { id, name, size, ... }` (object) | `race: "eldarin"` (ID string)                  |
| `exaltation: { id, name, ... }` (object) | `exaltation: "vampire"` (ID string)            |
| `backgrounds: { allies: 2 }` (keyed obj) | `backgrounds: [{ name, dots, notes }]`         |
| `feats: ["featId"]` (string array)       | `feats: [{ name, notes }]`                     |
| `weapons: [...]` (merged array)          | `meleeWeapons: [...]` + `rangedWeapons: [...]` |
| `psychicStrength: "fettered"` (string)   | `fettered: true` (boolean)                     |

### Cross-Tool Data Consumption

| Consumer       | Reads From                          | Via                                             |
| -------------- | ----------------------------------- | ----------------------------------------------- |
| Combat Tracker | Character Sheet characters          | `DTD.character.list()` + `DTD.character.load()` |
| NPC Generator  | `npc-templates.json`, `traits.json` | `DTD.loadData()`                                |
| Ship Builder   | `ships.json`                        | `DTD.loadData()`                                |
| Success Curves | _(no external data)_                | Self-contained Monte Carlo                      |
| Defense Graph  | _(no external data)_                | Self-contained simulation                       |

### JSON Data Loading

All game data loads via `core.js`:

```javascript
// Single file
const races = await DTD.loadData("races.json");

// Multiple files in parallel
const data = await DTD.loadAllData([
    "races.json",
    "exaltations.json",
    "skills.json",
    "classes.json",
    "feats.json",
    "backgrounds.json",
    "alignments.json",
    "equipment.json",
    "weapons.json",
]);
// data.races, data.exaltations, etc.
```

`DTD.getBasePath()` resolves the relative path to `tools/` based on the current page URL, so `shared/data/` is always reachable regardless of which tool subfolder the HTML lives in.

### JSON Wrapper Key Patterns

Most JSON files use a top-level wrapper key matching the filename. Tools access nested data through these paths:

| Tool / Context    | Access Pattern                                       | Notes                          |
| ----------------- | ---------------------------------------------------- | ------------------------------ |
| Character Builder | `data.races.races` → array                           | Wrapper key `races`            |
| Character Builder | `data.classes.tracks` → dict                         | Wrapper key `tracks`           |
| Character Builder | `data.feats.feats` → array                           | Wrapper key `feats`            |
| Character Builder | `data.weapons.weapons.melee` / `.ranged` / `.thrown` | Nested under `weapons.weapons` |
| Character Builder | `data.skills.skills` → dict of group → array         | Nested groups                  |
| NPC Generator     | `DTD.loadData('npc-templates.json')` → bare array    | No wrapper key                 |
| NPC Generator     | `DTD.loadData('traits.json')` → bare array           | No wrapper key                 |
| Ship Builder      | `data.hulls`, `data.consoles`, `data.weapons`        | Direct top-level keys          |
| Ship Builder      | `data.torpedoTubeCost`, `data.criticalDamage`        | Scalar + array                 |
| Ship Builder      | `data.holdingsBP`, `data.crewQualityCost`            | Config values                  |

The pipeline Pydantic models (`pipeline/models/`) mirror these exact shapes.

---

## Canonical Character Schema

Every field, its type, and its default value:

```javascript
{
    id: "",                    // UUID string (auto-generated)
    name: "",                  // Display name
    player: "",                // Player name
    concept: "",               // Freeform concept
    totalXP: 600,              // Starting XP
    xpSpent: 0,                // XP spent so far

    race: "",                  // ID string (lookup in races.json)
    raceCharBonus: "",         // Chosen characteristic bonus from race
    exaltation: "",            // ID string (lookup in exaltations.json)
    alignment: "",             // ID string (lookup in alignments.json)
    devotion: 6,               // 0-10

    characteristics: {
        strength: 2,  dexterity: 2,  constitution: 2,
        charisma: 2,  fellowship: 2, composure: 2,
        intelligence: 2, wisdom: 2,  willpower: 2
    },
    charSpecialties: {},       // Per-characteristic specialty text
    skills: {},                // Keyed by skill ID, values 0-6
    skillSpecialties: {},      // Per-skill specialty text

    backgrounds: [],           // [{ name, dots, notes }]
    classes: [],               // [{ classId, level }]
    feats: [],                 // [{ name, notes }]
    assets: [],                // [{ name, notes }]
    hindrances: [],            // [{ name, notes }]

    meleeWeapons: [],          // [{ name, type, proficiency, test, damage, ... }]
    rangedWeapons: [],         // [{ name, type, proficiency, test, damage, ... }]
    armor: [],                 // [{ name, type, ap, maxDex, locations[], special }]
    naturalArmor: 0,
    aura: 0,
    auraSource: "",

    magicSchools: {},          // { evocation: 0, ... }
    swordSchools: {},          // { ironHeart: 0, ... }
    gunKata: {},               // { clayPigeon: 0, ... }
    spells: [],                // [{ school, level, name, notes }]
    specialAttacks: [],        // [{ name, description }]
    trickShots: [],            // [{ name, description }]

    powerStat: 1,
    heroPointsMax: 2,
    heroPointsCurrent: 2,
    heroPointsBurnt: 0,
    fettered: false,
    pushAmount: 0,
    extraSchoolLevels: 0,
    bonusSchoolLevels: {},
    sanctioned: false,
    resourceCurrent: 0,
    exaltationNotes: "",

    modifiers: {               // Manual modifier overrides
        staticDefense: 0,
        hitPoints: 0,
        mentalDefense: 0,
        resolve: 0,
        speed: 0,
        resilience: 0,
        initiative: 0
    },

    savedPools: [],            // [{ label, pool }]
    languages: [],             // [string]
    equipment: "",             // Freeform
    notes: "",                 // Freeform
    classNotes: "",            // Freeform
    description: "",           // Freeform
    height: "",
    weight: "",
    age: "",
    currentHP: 0,
    currentResolve: 0
}
```

---

## Persistence Conventions

All tools use localStorage with consistent key patterns:

| Tool            | Data Key             | Index Key            |
| --------------- | -------------------- | -------------------- |
| Character Sheet | `dtd_sheet_{id}`     | `dtd_sheet_list`     |
| Combat Tracker  | `dtd_encounter_{id}` | `dtd_encounter_list` |
| NPC Generator   | `dtd_npc_{id}`       | `dtd_npc_list`       |
| Ship Builder    | `dtd_ship_{id}`      | `dtd_ship_list`      |
| Dice Roller     | `dtd_dice_history`   | _(single key)_       |

Pattern: data stored as JSON string per-entity, with a separate JSON array index mapping `[{ id, name }]` entries.

Auto-save uses a 400ms debounce on state changes.

---

## CSS Theming

All tools inherit from `shared/css/dtd-theme.css` which defines custom properties:

```css
var(--bg)                /* Page background */
var(--surface)           /* Card / panel backgrounds */
var(--text)              /* Primary text color */
var(--text-dim)          /* Secondary / muted text */
var(--text-muted)        /* Tertiary text */
var(--accent)            /* Gold accent color */
var(--border)            /* Border color */
var(--success)           /* Green status */
var(--success-bg)        /* Green background */
var(--warning)           /* Orange status */
var(--warning-bg)        /* Orange background */
var(--space-sm)          /* Spacing: small */
var(--space-md)          /* Spacing: medium */
var(--space-lg)          /* Spacing: large */
var(--space-xl)          /* Spacing: extra large */
var(--radius)            /* Border radius */
```

All tools use a dark theme with gold accents. Cards use `var(--surface)` backgrounds with `var(--border)` borders and `var(--radius)` rounding.

---

## Responsive Breakpoints

| Width      | Behavior                                                 |
| ---------- | -------------------------------------------------------- |
| ≥ 1100px   | Full desktop layout — two-column where applicable        |
| 768–1099px | Sidebars collapse to toggle buttons, grids narrow        |
| ≤ 768px    | Single column, sidebar as overlay, horizontal tab scroll |

### Print

Every tool with persistent data includes a print stylesheet. Common pattern:

- All tabs/panels shown simultaneously
- Management bar, tab navigation, save status hidden
- Adapted for paper output with `@media print { ... }`
