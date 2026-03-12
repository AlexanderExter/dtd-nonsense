# Architecture

System-wide architecture for the DTD 40k project: Astro/Starlight documentation site with ES module play tools.

---

## Technology Stack

### Astro / Starlight Layer (Documentation Site)

The rulebook and play tools are published as a static site via **Astro 5 + Starlight**, deployed to Vercel.

| Choice              | Rationale                                                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Astro + Starlight   | Documentation-first static site with built-in search (Pagefind), sidebar, theming                                                                                                                                                                            |
| npm                 | Manages Astro, Starlight, Chart.js, `@vercel/analytics`, `typescript`, Vercel adapter                                                                                                                                                                        |
| TypeScript (strict) | Astro config/content collections; `@/` path alias for `src/*`                                                                                                                                                                                                |
| ES modules          | `src/lib/dtd/core.ts` is a barrel re-exporting sub-modules (`character.ts`, `data.ts`, `derived.ts`); `dice.ts` provides dice logic (internally uses `dice-primitives.ts` for core algorithms); `types.ts` provides canonical interfaces |
| Preact + Signals     | Lightweight reactive UI for tool pages; `@astrojs/preact` with compat mode; `@preact/signals` for fine-grained state                                                                                                                                        |
| Tailwind CSS v4      | Utility framework; `@theme` tokens as single source of truth; `@tailwindcss/vite` plugin; `@astrojs/starlight-tailwind` bridge                                                                                                                              |
| Vercel (static)     | Zero-config deploy; `@astrojs/vercel` adapter with static output                                                                                                                                                                                             |

Key files:

| File / Directory            | Purpose                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `astro.config.mjs`          | Starlight config, sidebar, theme, Vercel adapter                                                                       |
| `scripts/prebuild.mjs`      | Copies cleaned-references → rules, books, JSON → public/data                                                           |
| `src/content/docs/`         | Generated Starlight content (rules, books) — gitignored                                                                |
| `src/pages/tools/`          | Tool pages (Astro pages outside Starlight) — **must use `ToolLayout.astro`, never `StarlightPage`**                    |
| `src/lib/dtd/`              | Typed ES modules: core.ts (barrel re-export), character.ts, data.ts, derived.ts, dice.ts, dice-primitives.ts, types.ts |
| `src/layouts/`              | `ToolLayout.astro` — wrapper for tool pages (also bridges Tailwind tokens → short `var(--name)` aliases)               |
| `src/styles/`               | `custom.css` (WH40K theme), `tailwind.css` (Tailwind v4 `@theme` tokens — design token source of truth)                |
| `src/components/preact/`    | Preact island components for all 6 tools (72 components)                                                               |
| `src/components/preact/ui/` | Shared UI primitives (18 components) — Ariakit + Tailwind wrappers                                                     |
| `data/`                     | Canonical JSON game data (12 files) — source for prebuild                                                              |
| `public/data/`              | Generated JSON data copies (from `data/`) — gitignored                                                                 |

Build pipeline: `bun run scripts/prebuild.mjs` then `astro build` — prebuild copies source content into Astro structure, then Astro builds the static site. `npm run build` runs both steps.

### When to Reconsider

- **Preact Islands:** All 6 tools are migrated. If a tool grows beyond what signals can manage cleanly, consider a state management library — but signals have scaled to 17 components (Character Builder) without issues so far.

### Code Quality & Testing

| Tool     | Purpose                        | Config         | npm Scripts          |
| -------- | ------------------------------ | -------------- | -------------------- |
| Biome    | Linter + formatter (JS/TS/CSS) | `biome.json`   | `lint`, `lint:fix`   |
| bun:test | Unit testing (Jest-compatible)  | `bunfig.toml`  | `test`, `test:watch` |

**Biome** replaces separate ESLint/Prettier setups with a single tool. CI runs `biome ci .` to enforce formatting and lint rules. Run `npm run lint` locally to check, `npm run lint:fix` to auto-fix.

**bun:test** is Bun's built-in Jest-compatible test runner. It auto-discovers `*.test.ts` files and picks up `@/` path aliases from `tsconfig.json` automatically. Test files use the co-location pattern in `src/lib/dtd/` and `scripts/__tests__/`. Run `npm run test` for current counts.

### TypeScript Pipeline Scripts

TypeScript scripts in `scripts/` provide data validation, content linting, and sync checking. Zod schemas in `src/lib/dtd/schemas/` are the source of truth for JSON data. See [docs/pipeline.md](pipeline.md) for details.

Session lifecycle scripts (`session-start.mjs`, `session-end.mjs`, `session-status.mjs`) automate branch creation, squash-merge, and state reporting. A pre-commit hook (`.githooks/pre-commit`) runs `npm run check` before every commit. See [project-conventions.md](project-conventions.md#git-workflow) for the full workflow.

## Shared Library Structure

Assessment of `src/lib/dtd/` modules. The shared library is cleanly separated from DOM concerns — only one module (since deleted) had DOM dependencies.

| Module | Purpose | DOM Dependencies | Notes |
|--------|---------|-----------------|-------|
| `core.ts` | Barrel re-export | None | 11 lines — re-exports character, data, derived |
| `types.ts` | Canonical interfaces | None | ~180 lines — `CharacterData`, dice types |
| `character.ts` | Character CRUD | localStorage | ~310 lines — create, save, load, migrate |
| `data.ts` | JSON data fetching | fetch | ~20 lines — `loadData()`, `loadAllData()` |
| `derived.ts` | Derived stat formulas | None | ~30 lines — SD, HP, Speed, etc. |
| `dice.ts` | Dice engine | None | ~100 lines — roll, outcome, notation parsing |
| `dice-primitives.ts` | Core dice algorithms | None | ~65 lines — used by dice.ts and workers |
| `constants.ts` | Game constants | None | ~15 lines — characteristic groups/names |

All modules import cleanly into Preact components.

---

## Shared UI Layer

All 6 tools share a set of **18 UI primitive components** in `src/components/preact/ui/`, backed by [Ariakit](https://ariakit.org/) for accessibility and Tailwind CSS tokens for styling.

### Import Convention

```tsx
import { Button, Modal, Toast, showToast } from "@/components/preact/ui";
```

**Never import `@ariakit/react` directly in tool code** — always use the UI layer wrappers.

### Component Tiers

| Tier | Components | Ariakit? | Purpose |
|------|-----------|----------|---------|
| **Tier 1** — Pure styling | Button, Panel, SectionHeading, Badge, CloseButton, AddButton, NumberInput, FormGroup, PresetGroup, Toast | No | Wrap `.btn`/`.panel` CSS, standardize patterns |
| **Tier 2** — Core | Modal, AccordionItem, Tabs/TabPanel | Yes | Dialog, disclosure, tab navigation |
| **Tier 3** — Complex | Select, Popover, Tooltip, Combobox, Menu | Yes | Positioned overlays, search, dropdowns |

### SSR Constraint

Ariakit's store system (`useSyncExternalStore`) crashes during `preact-render-to-string`. All tool `.astro` pages **must** use `client:only="preact"` instead of `client:load`.

See [src/components/preact/ui/README.md](../src/components/preact/ui/README.md) for the full API reference.

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

```text
Bun + Node / Astro
───────────────────
bun install
bunx biome ci .
bun test
bun run scripts/validate.ts --xref
bun run scripts/lint.ts
bun run build
```

All steps must pass for a PR to be merge-ready. Vercel preview builds run in parallel with CI — a PR can have a working preview even while CI is still running.

---

## File Structure — Game Data

```text
data/
├── alignments.json       Alignments with devotion/sin tables
├── backgrounds.json      Background types
├── classes.json          Class track entries across all levels
├── equipment.json        Starting equipment packages
├── exaltations.json      Exaltation types with power stat pools
├── feats.json            Feats with prerequisites
├── npc-templates.json    Pre-built NPC stat blocks
├── races.json            Playable races
├── ships.json            Hulls, consoles, weapons, shields
├── skills.json           Skills with grouping metadata
├── traits.json           NPC traits with parameterized effects
└── weapons.json          Ranged and melee weapon stats
```

Run `npm run validate` to see current record counts for all 12 files.

`data/` is the canonical source for all game data. `scripts/prebuild.mjs` copies these files to `public/data/` during the build — `public/data/` is gitignored and never committed.

---

## Code Patterns

All tools use **Preact Islands** — components hydrated via `client:only="preact"` on their Astro page (required for Ariakit SSR compatibility). Each tool lives in `src/components/preact/tools/{tool-name}/` with:

- A root `*App.tsx` component (module-level signals, data loading, top-level layout)
- Tab/section components
- Shared sub-components in `shared/`
- A `constants.ts` for tool-specific types and helpers

State management uses `@preact/signals` with module-level signals exported from the root component:

```typescript
import { signal, computed } from "@preact/signals";
export const myState = signal(initialValue);
export const derivedValue = computed(() => myState.value * 2);
export function updateState(fn) { myState.value = fn(myState.value); }
```

| Tool              | Components | Directory                                     |
| ----------------- | ---------- | --------------------------------------------- |
| Quick Reference   | 12         | `src/components/preact/tools/quick-reference/`     |
| Combat Tracker    | 8          | `src/components/preact/tools/combat-tracker/`      |
| NPC Generator     | 11         | `src/components/preact/tools/npc-generator/`       |
| Ship Builder      | 11         | `src/components/preact/tools/ship-builder/`        |
| Character Builder | 17         | `src/components/preact/tools/character-builder/`   |
| Character Sheet   | 15         | `src/components/preact/tools/character-sheet/`     |

---

## Data Flow

### Character Sheet — Canonical Format

The Character Sheet defines the **canonical character JSON schema**. All other tools that produce or consume character data use this format.

```text
┌──────────────────────────────────────────────────────────────┐
│                      CHARACTER SHEET                          │
│                                                              │
│  character.createDefault()    → new character with UUID      │
│  character.save(id, data)     → localStorage dtd_sheet_{id}  │
│  character.load(id)           → validated + migrated char    │
│  character.exportJSON()       → JSON file download           │
│  character.importJSON()       → legacy migration → save      │
└──────────────────────────────────────────────────────────────┘
```

### Builder → Sheet Pipeline

```text
Character Builder                      Character Sheet
┌────────────────────┐                ┌────────────────────┐
│ User makes choices │                │                    │
│ via 11-step wizard │                │ character           │
│                    │ ── JSON ──►    │ .importJSON(file)  │
│ Exports canonical  │  export/       │                    │
│ Sheet-format JSON  │  import        │ Legacy detection   │
└────────────────────┘                │ + migration        │
                                      └────────────────────┘
```

The Builder also has a direct "Open in Sheet" button that calls `character.save()` and redirects to the Sheet with the character pre-selected.

### Legacy Format Migration

`character.importJSON()` detects old Builder format and converts:

| Builder (Legacy)                         | Sheet (Canonical)                              |
| ---------------------------------------- | ---------------------------------------------- |
| `race: { id, name, size, ... }` (object) | `race: "eldarin"` (ID string)                  |
| `exaltation: { id, name, ... }` (object) | `exaltation: "vampire"` (ID string)            |
| `backgrounds: { allies: 2 }` (keyed obj) | `backgrounds: [{ name, dots, notes }]`         |
| `feats: ["featId"]` (string array)       | `feats: [{ name, notes }]`                     |
| `weapons: [...]` (merged array)          | `meleeWeapons: [...]` + `rangedWeapons: [...]` |
| `psychicStrength: "fettered"` (string)   | `fettered: true` (boolean)                     |

### Cross-Tool Data Consumption

| Consumer       | Reads From                                         | Via                                     |
| -------------- | -------------------------------------------------- | --------------------------------------- |
| Combat Tracker | Character Sheet characters                         | `character.list()` + `character.load()` |
| NPC Generator  | `npc-templates.json`, `traits.json`, `skills.json` | `loadData()`                            |
| Ship Builder   | `ships.json`                                       | `loadData()`                            |

### JSON Data Loading

All game data loads via `core.ts` (ES module):

```typescript
import { loadData, loadAllData } from "@/lib/dtd/core";

// Single file
const races = await loadData("races.json");

// Multiple files in parallel
const data = await loadAllData([
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

`loadData()` fetches from `/data/{filename}` (files copied to `public/data/` by `scripts/prebuild.mjs` during build).

### JSON Wrapper Key Patterns

Most JSON files use a top-level wrapper key matching the filename. Tools access nested data through these paths:

| Tool / Context    | Access Pattern                                           | Notes                                                           |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| Character Builder | `data.races.races` → array                               | Wrapper key `races`                                             |
| Character Builder | `data.classes.tracks` → dict                             | Wrapper key `tracks`                                            |
| Character Builder | `data.feats.feats` → array                               | Wrapper key `feats`                                             |
| Character Builder | `data.weapons.weapons.melee` / `.ranged` / `.thrown`     | Nested under `weapons.weapons`                                  |
| Character Builder | `data.skills.skills` → dict of group → array             | Three top-level keys: `characteristics`, `skills`, `skillNotes` |
| NPC Generator     | `loadData('npc-templates.json')` → bare array            | No wrapper key                                                  |
| NPC Generator     | `loadData('traits.json')` → bare array                   | No wrapper key                                                  |
| NPC Generator     | `loadData('skills.json').skills` → dict of group → array | Extracts skill names                                            |
| Ship Builder      | `data.hulls`, `data.consoles`, `data.weapons`            | Direct top-level keys                                           |
| Ship Builder      | `data.torpedoTubeCost`, `data.criticalDamage`            | Scalar + array                                                  |
| Ship Builder      | `data.holdingsBP`, `data.crewQualityCost`                | Config values                                                   |

The Zod schemas (`src/lib/dtd/schemas/`) mirror these exact shapes.

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
    classes: [],               // [string] — class IDs taken
    feats: [],                 // [{ name, notes }]
    assets: [],                // [{ name, notes }]
    hindrances: [],            // [{ name, notes }]

    meleeWeapons: [],          // [{ name, damage, damageType, proficiency, qualities, notes }]
    rangedWeapons: [],         // [{ name, damage, damageType, range, proficiency, qualities, notes }]
    armor: [],                 // [{ name, type, locations[], ap, qualities }]
    naturalArmor: 0,
    aura: 0,
    auraSource: "",

    magicSchools: {},          // { evocation: 0, ... }
    swordSchools: {},          // { ironHeart: 0, ... }
    gunKata: {},               // { clayPigeon: 0, ... }
    spells: [],                // [string] — spell names
    specialAttacks: [],        // [string]
    trickShots: [],            // [string]

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

    savedPools: [],            // [{ label, notation }]
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

Pattern: data stored as JSON string per-entity, with a separate JSON array index mapping `[{ id, name }]` entries.

Auto-save uses a 400ms debounce on state changes.

---

## CSS Theming

All tool pages use **Tailwind CSS v4** utility classes. Design tokens are defined in `src/styles/tailwind.css` via the `@theme` block — this is the single source of truth for colors, spacing, radii, fonts, and animations.

### Token Architecture

| Layer | File | Purpose |
|-------|------|---------|
| Design tokens | `src/styles/tailwind.css` `@theme` | Colors, spacing, radii, fonts, animations |
| Reusable patterns | `src/styles/tailwind.css` `@layer components` | `.panel`, `.btn`, `.btn-primary`, `.btn-accent`, etc. |
| Starlight theme | `src/styles/custom.css` | WH40K dark/gold theme for docs pages |
| Print styles | Individual `.astro` files | `@media print` blocks for paper output |

### Styling Conventions

- **Tailwind utilities on every element** — no hand-written CSS in `<style>` blocks
- **`class` attribute** (not `className`) in Preact JSX
- **Conditional classes**: `.filter(Boolean).join(" ")` pattern
- **Dynamic values only** via `style={{}}` (runtime percentages, Chart.js colors, canvas)
- **No `@apply`** — utilities applied directly in JSX
- **Color lookup maps**: Typed `Record<string, string>` for badge/status colors

All tools use a dark theme with gold accents. Cards use `bg-surface` backgrounds with `border-border` borders and `rounded-md` rounding.

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

### Non-Tailwind CSS

CSS that cannot be expressed as Tailwind utilities and remains as hand-written CSS:

| File | Lines | Content |
|------|-------|---------|
| `src/styles/tailwind.css` | ~150 | `@theme` tokens, `@keyframes`, `@layer components` (`.panel`, `.btn` family) |
| `src/layouts/ToolLayout.astro` | 5 | `box-sizing: border-box` reset only |
| `quick-reference.astro` | 6 | Print-only `@media print` |
| `npc-generator.astro` | 6 | Print-only `@media print` |
| `ship-builder.astro` | 5 | Print-only `@media print` |
| `character-sheet.astro` | 12 | Print-only `@media print` + `tab-panel::before` content |

### Token Mapping Reference

`@theme` tokens in `tailwind.css` generate utility classes automatically. Reference for extending the design system:

| Token | Tailwind Utility | Example |
|-------|------------------|---------|
| `--color-bg` | `bg-bg` | `class="bg-bg"` |
| `--color-surface` | `bg-surface` | `class="bg-surface"` |
| `--color-surface-raised` | `bg-surface-raised` | `class="bg-surface-raised"` |
| `--color-border` | `border-border` | `class="border-border"` |
| `--color-text-primary` | `text-text-primary` | `class="text-text-primary"` |
| `--color-text-muted` | `text-text-muted` | `class="text-text-muted"` |
| `--color-accent` | `text-accent` / `bg-accent` | `class="text-accent"` |
| `--color-success` | `text-success` / `bg-success` | `class="text-success"` |
| `--color-warning` | `text-warning` / `bg-warning` | `class="text-warning"` |
| `--color-error` | `text-error` / `bg-error` | `class="text-error"` |
| `--spacing-xs` through `--spacing-xl` | `p-xs`, `m-sm`, `gap-md`, etc. | `class="p-sm gap-md"` |
| `--radius-sm`, `--radius-md`, `--radius-lg` | `rounded-sm`, `rounded-md`, `rounded-lg` | `class="rounded-md"` |
