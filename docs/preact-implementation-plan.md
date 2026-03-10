# Preact Implementation Plan

Full implementation plan for migrating DTD Nonsense tools from vanilla TypeScript DOM manipulation to Preact Islands with Tailwind CSS v4. Based on the research in `docs/preact-tailwind-roadmap.md` and a thorough audit of all 10 tool pages, 2 app scripts, 2 workers, and the shared `src/lib/dtd/` library.

---

## Table of Contents

1. [Current State Summary](#current-state-summary)
2. [Phase 0: Foundation (Dependencies & Config)](#phase-0-foundation)
3. [Phase 1: Shared Infrastructure](#phase-1-shared-infrastructure)
4. [Phase 2: Proof-of-Concept — Dice Roller](#phase-2-proof-of-concept--dice-roller)
5. [Phase 3: Data Display Tools](#phase-3-data-display-tools)
6. [Phase 4: Stateful Tools](#phase-4-stateful-tools)
7. [Phase 5: Complex Tools](#phase-5-complex-tools)
8. [Phase 6: CSS Token Migration](#phase-6-css-token-migration)
9. [Phase 7: Documentation & Framework Updates](#phase-7-documentation--framework-updates)
10. [Migration Patterns Reference](#migration-patterns-reference)
11. [Risk Register](#risk-register)
12. [File Inventory](#file-inventory)

---

## Current State Summary

### Tools by Implementation Complexity

| Tool              | File                                         | LOC          | Complexity | State Model               | Key Challenge                      |
| ----------------- | -------------------------------------------- | ------------ | ---------- | ------------------------- | ---------------------------------- |
| Dice Roller       | `dice-roller.astro`                          | ~500         | ★★☆☆☆      | History array             | Simplest — good PoC                |
| Quick Reference   | `quick-reference.astro`                      | ~1,500       | ★★★☆☆      | Search filter string      | Data tables, no persistence        |
| Tools Dashboard   | `index.astro`                                | ~200         | ★☆☆☆☆      | None (static)             | Barely needs Preact                |
| Success Curves    | `success-curves.astro`                       | ~600         | ★★★☆☆      | Chart config + URL hash   | Chart.js integration               |
| Defense Graph     | `defense-graph.astro`                        | ~1,000       | ★★★★☆      | Worker results + charts   | 5 Chart.js graphs + worker         |
| Combat Tracker    | `combat-tracker.astro`                       | ~1,400       | ★★★★☆      | Combatant[] + round state | Heavy event delegation, conditions |
| NPC Generator     | `npc-generator.astro`                        | ~1,500       | ★★★★☆      | NPC object + templates    | Dynamic form, nested arrays        |
| Ship Builder      | `ship-builder.astro`                         | ~700         | ★★★★☆      | Ship config + combat mode | Dual-mode UI                       |
| Character Builder | `character-builder.astro` + `builder-app.ts` | ~1,800 total | ★★★★☆      | Priority wizard + XP      | Multi-step wizard, constraints     |
| Character Sheet   | `character-sheet.astro` + `sheet-app.ts`     | ~3,000 total | ★★★★★      | Full CharacterData + tabs | 100+ fields, 6 tabs, import/export |

### Shared Library Assessment

| Module               | Lines | DOM Deps     | Migration Impact                               |
| -------------------- | ----- | ------------ | ---------------------------------------------- |
| `core.ts`            | 11    | None         | Zero change — barrel re-export                 |
| `types.ts`           | 180   | None         | Zero change — pure types                       |
| `character.ts`       | 310   | localStorage | Keep as-is, call from hooks                    |
| `data.ts`            | 20    | fetch        | Keep as-is, wrap in hooks                      |
| `derived.ts`         | 30    | None         | Zero change — pure functions                   |
| `dice.ts`            | 100   | None         | Zero change — pure functions                   |
| `dice-primitives.ts` | 65    | None         | Zero change — pure functions                   |
| `constants.ts`       | 15    | None         | Zero change — static data                      |
| `util.ts`            | 20    | None         | Zero change — `debounce`, `escapeHtml`         |
| `ui.ts`              | 15    | Yes          | **Delete** — accordion becomes component state |

**Key finding:** The shared library is already cleanly separated from DOM concerns. Only `ui.ts` (accordion helper) has DOM dependencies. Every other module can be imported directly into Preact components with zero modification.

---

## Phase 0: Foundation

**Goal:** Install dependencies, configure build, verify nothing breaks.

**Prerequisite:** Start a fresh session branch.

### 0A — Upgrade Starlight (0.32 → 0.37+)

**Why:** Starlight 0.34+ is required for Tailwind v4 compatibility via `@astrojs/starlight-tailwind`.

```powershell
npm install @astrojs/starlight@latest
npm run check
npm run build
```

**Verification checklist:**

- [ ] `npm run check` passes
- [ ] `npm run build` succeeds
- [ ] Doc pages render correctly (spot-check 3–4 pages)
- [ ] Tool pages render correctly (spot-check dice roller, character sheet)
- [ ] Pagefind search works
- [ ] `Head.astro` override still injects Vercel Analytics
- [ ] `--sl-*` custom properties in `custom.css` still resolve
- [ ] Sidebar `autogenerate` API unchanged

**Rollback:** `npm install @astrojs/starlight@0.32` if build fails.

### 0B — Add Tailwind CSS v4

```powershell
npm install tailwindcss @tailwindcss/vite @astrojs/starlight-tailwind
```

**Config changes:**

1. **`astro.config.mjs`** — Add Tailwind Vite plugin and update Starlight customCss:

```js
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    // ...existing...
    integrations: [
        starlight({
            customCss: ["./src/styles/tailwind.css", "./src/styles/custom.css"],
            // ...rest unchanged...
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
```

2. **Create `src/styles/tailwind.css`:**

```css
@layer base, starlight, theme, components, utilities;

@import "@astrojs/starlight-tailwind";
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

**Open question to resolve during implementation:** Does `custom.css` need `@layer` wrapping? Test by building and inspecting doc page styles. If Starlight table/blockquote overrides stop working, wrap `custom.css` contents in `@layer theme { }`.

**Verification:**

- [ ] `npm run build` succeeds
- [ ] Doc pages look identical (gold theme, table styling, blockquote accents)
- [ ] Tool pages look identical (ToolLayout tokens unaffected)
- [ ] Add `class="text-red-500"` to any element temporarily — verify it applies

### 0C — Add Preact Integration

```powershell
npm install @astrojs/preact preact
```

**Config changes to `astro.config.mjs`:**

```js
import preact from "@astrojs/preact";

export default defineConfig({
    integrations: [
        preact({ compat: true }),
        starlight({
            /* ... */
        }),
    ],
    // ...
});
```

**Open question:** Integration order. If Starlight pages break, try swapping Preact after Starlight.

**Verification:**

- [ ] `npm run build` succeeds
- [ ] Create a temporary test: `src/components/preact/HelloTest.tsx`

```tsx
export default function HelloTest() {
    return <p>Preact works</p>;
}
```

- [ ] Import in `dice-roller.astro` with `client:load`, verify it renders
- [ ] Delete `HelloTest.tsx` after verification

### 0D — Biome Configuration for TSX

Check and update `biome.json` if needed:

- Verify `src/**` glob covers `src/components/preact/*.tsx`
- The current `includes: ["src/**", "scripts/**"]` pattern already covers TSX.
- Biome 2.x handles JSX/TSX natively — no additional config expected.

**Convention decision:** Use `class` (not `className`) in Preact components. Preact supports both, but `class` is the Preact convention. With compat mode, `className` also works. Pick one and document it.

**Recommendation:** Use `class` — it's shorter and matches the HTML output.

### 0E — TypeScript Configuration

Update `tsconfig.json` to support JSX:

```json
{
    "extends": "astro/tsconfigs/strict",
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"]
        },
        "jsx": "react-jsx",
        "jsxImportSource": "preact"
    }
}
```

**Note:** Astro's Preact integration may handle this automatically. Check after installation — if `.tsx` files compile without this change, skip it.

**Session gate:** Phase 0 must end with a green `npm run check` + successful `npm run build`. Commit before proceeding.

---

## Phase 1: Shared Infrastructure

**Goal:** Build the reusable hooks and component primitives that all Preact tools will share.

### 1A — Directory Structure

```
src/components/preact/
  hooks/
    use-data.ts          ← JSON data loading with loading/error states
    use-local-storage.ts ← Typed localStorage persistence
    use-worker.ts        ← Web Worker message bridge
    use-debounce.ts      ← Debounced value updates
  ui/
    Panel.tsx            ← Shared card/panel container
    Button.tsx           ← Styled button variants (primary, secondary, sm)
    Accordion.tsx        ← Collapsible section (replaces ui.ts initAccordion)
    TabGroup.tsx         ← Tab navigation with panels
    StatEntry.tsx        ← Characteristic/skill display with +/- buttons
    Modal.tsx            ← Confirmation/export dialogs
    SearchInput.tsx      ← Debounced search with clear button
  layout/
    ToolShell.tsx        ← Preact-side tool wrapper (title, loading state)
```

### 1B — Core Hooks

#### `use-data.ts` — JSON Data Loading

Wraps `loadData()` / `loadAllData()` with loading/error state:

```tsx
import { signal, computed } from "@preact/signals";
import { loadData, loadAllData } from "@/lib/dtd/data";

export function useData<T>(filename: string) {
    const data = signal<T | null>(null);
    const loading = signal(true);
    const error = signal<string | null>(null);

    loadData<T>(filename)
        .then((result) => {
            data.value = result;
        })
        .catch((e) => {
            error.value = e.message;
        })
        .finally(() => {
            loading.value = false;
        });

    return { data, loading, error };
}

export function useAllData(filenames: string[]) {
    const data = signal<Record<string, unknown> | null>(null);
    const loading = signal(true);
    const error = signal<string | null>(null);

    loadAllData(filenames)
        .then((result) => {
            data.value = result;
        })
        .catch((e) => {
            error.value = e.message;
        })
        .finally(() => {
            loading.value = false;
        });

    return { data, loading, error };
}
```

#### `use-local-storage.ts` — Typed Persistence

Wraps `character.save()` / `character.load()` and generic localStorage:

```tsx
import { signal, effect } from "@preact/signals";

export function useLocalStorage<T>(key: string, initial: T) {
    const stored = localStorage.getItem(key);
    const value = signal<T>(stored ? JSON.parse(stored) : initial);

    effect(() => {
        localStorage.setItem(key, JSON.stringify(value.value));
    });

    return value;
}
```

#### `use-worker.ts` — Worker Bridge

Wraps the existing `postMessage` / `onmessage` pattern:

```tsx
import { signal } from "@preact/signals";
import { useRef } from "preact/hooks";

export function useWorker<TInput, TOutput>(workerUrl: URL) {
    const result = signal<TOutput | null>(null);
    const loading = signal(false);
    const workerRef = useRef<Worker | null>(null);
    let nextId = 0;
    const callbacks = new Map<number, (data: TOutput) => void>();

    if (!workerRef.current) {
        workerRef.current = new Worker(workerUrl, { type: "module" });
        workerRef.current.onmessage = (e) => {
            const cb = callbacks.get(e.data.id);
            if (cb) {
                cb(e.data);
                callbacks.delete(e.data.id);
            }
            loading.value = false;
        };
    }

    function run(input: TInput): Promise<TOutput> {
        const id = nextId++;
        loading.value = true;
        return new Promise((resolve) => {
            callbacks.set(id, (data) => {
                result.value = data;
                resolve(data);
            });
            workerRef.current!.postMessage({ id, ...input });
        });
    }

    return { result, loading, run };
}
```

#### `use-debounce.ts` — Debounced Signals

```tsx
import { signal, effect } from "@preact/signals";

export function useDebouncedSignal<T>(source: Signal<T>, delay = 300) {
    const debounced = signal(source.value);
    let timer: number;

    effect(() => {
        const val = source.value;
        clearTimeout(timer);
        timer = setTimeout(() => {
            debounced.value = val;
        }, delay) as unknown as number;
    });

    return debounced;
}
```

### 1C — UI Primitives

Each primitive maps directly to an existing CSS pattern in `ToolLayout.astro`:

| Component     | Replaces                                            | CSS Source                      |
| ------------- | --------------------------------------------------- | ------------------------------- |
| `Panel`       | `.panel` class                                      | ToolLayout.astro                |
| `Button`      | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-sm` | ToolLayout.astro                |
| `Accordion`   | `initAccordion()` from `ui.ts`                      | combat-tracker.astro inline CSS |
| `TabGroup`    | Manual tab switching in sheet-app.ts                | sheet.css `.tab-*` classes      |
| `StatEntry`   | Repeated stat-entry pattern across tools            | sheet.css `.stat-entry`         |
| `Modal`       | `confirm()` dialogs in sheet/builder                | New                             |
| `SearchInput` | Manual debounced search inputs                      | quick-reference.astro           |

Each component should:

1. Accept a `class` prop for Tailwind utility overrides
2. Use CSS custom properties from ToolLayout's `:root` for base styling
3. Be small (under 50 lines) and focused on one concern

### 1D — ToolShell Component

Wraps the Preact island with loading state and error boundary:

```tsx
export function ToolShell({ title, children, loading, error }) {
    if (error)
        return (
            <div class="panel" style="border-color: var(--error)">
                {error}
            </div>
        );
    if (loading) return <div class="panel">Loading {title}...</div>;
    return <>{children}</>;
}
```

**Session gate:** Commit infrastructure. Unit test the hooks (Vitest + preact testing library if needed, or just test the pure signal logic).

---

## Phase 2: Proof-of-Concept — Dice Roller

**Goal:** Migrate the simplest tool end-to-end to validate the full pattern.

### Why Dice Roller First

- Smallest tool (~500 lines)
- Self-contained state (history array, current input)
- No external data loading (no JSON fetch)
- No localStorage persistence (history is session-only)
- No workers
- Uses `dice.ts` directly (pure function, zero changes needed)
- Clear success criteria: rolls dice, shows results, navigates history

### Component Decomposition

```
src/components/preact/tools/dice-roller/
  DiceRollerApp.tsx       ← Root component (state container)
  DiceInput.tsx           ← Notation input + preset buttons + TN field
  DiceResult.tsx          ← Current roll display (kept/dropped/exploded dice)
  RollHistory.tsx         ← Sidebar list of past rolls
  DiceVisual.tsx          ← Individual die face rendering
```

### State Model

```tsx
// Signals
const notation = signal("");
const targetNumber = signal(0);
const currentRoll = signal<DiceResult | null>(null);
const history = signal<RollEntry[]>([]);

// Computed
const outcome = computed(() =>
    currentRoll.value && targetNumber.value ? calculateOutcome(currentRoll.value.total, targetNumber.value) : null
);
```

### Migration Steps

1. Create `DiceRollerApp.tsx` with signals for input state + roll history
2. Create `DiceInput.tsx` — notation field, keep/mod fields, preset buttons, TN
3. Create `DiceResult.tsx` — shows kept/dropped/exploded dice, total, outcome
4. Create `RollHistory.tsx` — clickable history entries
5. Update `dice-roller.astro`:
    - Remove inline `<script>` block entirely
    - Remove all inline HTML (tool markup)
    - Keep ToolLayout wrapper
    - Add: `<DiceRollerApp client:load />`
    - Keep tool-specific CSS (can inline in components or keep as `<style>`)
6. Verify: roll, presets, TN, history, keyboard shortcuts, mobile layout

### Astro Page After Migration

```astro
---
import ToolLayout from "@/layouts/ToolLayout.astro";
import DiceRollerApp from "@/components/preact/tools/dice-roller/DiceRollerApp";
---

<ToolLayout title="Dice Roller" description="Roll XkY dice pools with exploding d10s">
  <DiceRollerApp client:load />
</ToolLayout>

<style>
  /* Tool-specific CSS (or migrate to Tailwind utilities in components) */
</style>
```

### Verification

- [ ] All dice rolling works (basic, with modifier, rank zero)
- [ ] Exploding dice display correctly
- [ ] Preset buttons work
- [ ] Target Number / Raises / Checks display
- [ ] History sidebar works
- [ ] Keyboard shortcuts (Enter, Escape)
- [ ] Mobile responsive
- [ ] `npm run check` passes
- [ ] `npm run build` succeeds

**Session gate:** Commit. This validates the entire Preact island pattern.

---

## Phase 3: Data Display Tools

**Goal:** Migrate tools that primarily display data with light interactivity.

### 3A — Quick Reference

**Current pattern:** Fetches JSON data, renders searchable/filterable tables, collapsible sections.

**Why next:** High-value Preact win — search filtering and table rendering are classic reactive UI patterns.

**Component decomposition:**

```
src/components/preact/tools/quick-reference/
  QuickReferenceApp.tsx    ← Root + data loading
  SearchBar.tsx            ← Global search input (reuses SearchInput)
  ReferenceSection.tsx     ← Collapsible section wrapper
  ActionTable.tsx          ← Actions reference table
  ConditionTable.tsx       ← Conditions reference table
  WeaponTable.tsx          ← Weapons data table
  FormulaCard.tsx          ← Formula reference cards
  HitLocationTable.tsx     ← Hit location table
  SchoolTable.tsx          ← Sword/gun school tables
```

**State:** Search filter string + section collapse states. No persistence.

**Data loading:** Uses `useAllData()` hook to fetch multiple JSON files.

### 3B — Tools Dashboard (index)

**Current pattern:** Static listing with minimal JS for active-link highlighting.

**Decision:** This page is mostly static HTML. **Do not migrate to Preact.** The only dynamic part is active nav highlighting, which CSS can handle. Leave as vanilla Astro.

### 3C — Success Curves

**Current pattern:** Chart.js graphs driven by Monte Carlo simulation results from a Web Worker.

**Component decomposition:**

```
src/components/preact/tools/success-curves/
  SuccessCurvesApp.tsx     ← Root + worker management
  SimulationInput.tsx      ← Pool inputs (num dice, keep, mod, TN range)
  PresetButtons.tsx        ← Preset pool configurations
  PoolCalculator.tsx       ← Characteristic + skill → pool calculator
  HistogramChart.tsx       ← Distribution histogram (Chart.js wrapper)
  SuccessRateChart.tsx     ← Success probability curve
  RaiseDistChart.tsx       ← Raise distribution chart
  ShareButton.tsx          ← URL hash encoding for sharing
```

**Key concern:** Chart.js integration with Preact. Use `useRef` + `useEffect` to manage Chart.js instances. Chart.js renders to `<canvas>`, so Preact manages the data flow, Chart.js manages the rendering.

**Worker integration:** Use `useWorker()` hook to communicate with `simulation-worker.ts`. Worker stays unchanged.

### 3D — Defense Graph

**Current pattern:** 5 Chart.js visualizations + defense worker simulation + canvas heatmap.

**Component decomposition:**

```
src/components/preact/tools/defense-graph/
  DefenseGraphApp.tsx      ← Root + data loading + worker
  DefenseInput.tsx         ← Character defense parameters
  WaterfallChart.tsx       ← Defense pipeline waterfall
  EffectiveHPChart.tsx     ← Effective HP under various attacks
  HitProbabilityChart.tsx  ← Hit probability vs TN
  ArmorTradeoffChart.tsx   ← Armor AP vs coverage tradeoffs
  HitLocationHeatmap.tsx   ← Canvas-based heatmap
```

**Worker integration:** Same `useWorker()` hook pattern as Success Curves. Worker `defense-worker.ts` stays unchanged.

**Session gate:** Commit after each tool migration. Run `npm run check` + `npm run build` after each.

---

## Phase 4: Stateful Tools

**Goal:** Migrate tools with complex state, persistence, and inter-tool data flow.

### 4A — Combat Tracker

**Current pattern:** Initiative list, conditions, action budgets, HP tracking, encounter persistence, character import from Sheet.

**Component decomposition:**

```
src/components/preact/tools/combat-tracker/
  CombatTrackerApp.tsx     ← Root + encounter state
  CombatantList.tsx        ← Sorted initiative list
  CombatantCard.tsx        ← Individual combatant (HP, conditions, actions)
  InitiativeRoller.tsx     ← Roll/set initiative
  ConditionPicker.tsx      ← Add/remove conditions with levels
  ActionBudget.tsx         ← Half/full action + reaction toggles
  HPBar.tsx                ← HP/resource bar with +/- buttons
  EncounterControls.tsx    ← New/save/load encounter, import characters
  Sidebar.tsx              ← Rules reference sidebar
  RoundTracker.tsx         ← Round counter + next turn
```

**State model:**

```tsx
const combatants = signal<Combatant[]>([]);
const round = signal(1);
const activeTurnIndex = signal(0);
const encounterStarted = signal(false);

// Derived
const sortedCombatants = computed(() => [...combatants.value].sort((a, b) => b.initiativeTotal - a.initiativeTotal));
```

**Persistence:** Use `useLocalStorage` hook for encounter auto-save. Keep existing `character.load()` for importing characters from the Sheet tool.

**End-of-round effects:** Burning, toxic, blood loss auto-alerts remain as they are — just move from imperative alerts to a signal-driven notification component.

### 4B — NPC Generator

**Current pattern:** Template loading, dynamic form with add/remove lists, derived stat calculation, markdown export.

**Component decomposition:**

```
src/components/preact/tools/npc-generator/
  NPCGeneratorApp.tsx      ← Root + template loading
  NPCForm.tsx              ← Main form container
  CharacteristicsGrid.tsx  ← 9-stat grid with inputs
  SkillList.tsx            ← Dynamic skill add/remove list
  FeatList.tsx             ← Dynamic feat selector
  TraitPicker.tsx          ← Trait checkboxes with parameters
  ArmorList.tsx            ← Dynamic armor entries
  WeaponList.tsx           ← Dynamic weapon entries (melee + ranged)
  AbilityList.tsx          ← Custom abilities text entries
  DerivedStats.tsx         ← Auto-calculated SD, HP, etc.
  TemplateSelector.tsx     ← Load from npc-templates.json
  ExportPanel.tsx          ← Markdown/JSON export
  EncounterManager.tsx     ← Save/load NPC groups
```

**State model:** Single `signal<NPCData>()` with granular updates. Use `computed()` for derived stats (SD, HP, Mental Defense, etc.) that auto-recalculate when characteristics change.

**Data loading:** `useAllData(["npc-templates.json", "traits.json", "skills.json", "weapons.json"])`.

### 4C — Ship Builder

**Current pattern:** Dual-mode (builder + combat tracker), hull selection, component slots, crew management.

**Component decomposition:**

```
src/components/preact/tools/ship-builder/
  ShipBuilderApp.tsx       ← Root + mode switch
  BuilderMode/
    HullSelector.tsx       ← Hull type selection
    ConsoleGrid.tsx        ← Ship console assignments
    WeaponBay.tsx          ← Weapon slot configuration
    TorpedoRack.tsx        ← Torpedo loadout
    ShieldConfig.tsx       ← Shield configuration
    CrewRoster.tsx         ← Crew assignments
    ShipSummary.tsx        ← Stats overview
  CombatMode/
    ShipCombatTracker.tsx  ← Ship combat state
    HullIntegrity.tsx      ← Hull HP tracking
    SystemDamage.tsx       ← System damage tracking
```

**Session gate:** Commit after each tool. These are the heaviest migrations — expect multiple sub-sessions per tool.

---

## Phase 5: Complex Tools

**Goal:** Migrate the two largest tools — Character Builder and Character Sheet.

### 5A — Character Builder

**Current:** `character-builder.astro` (HTML template) + `builder-app.ts` (900 lines of controller logic) + `builder.css` (850 lines).

**This is the second-largest migration. The builder's step-by-step wizard with priority allocation and constraint enforcement is the most complex UI flow.**

**Component decomposition:**

```
src/components/preact/tools/character-builder/
  BuilderApp.tsx           ← Root + wizard state
  StepNavigation.tsx       ← Step indicator + prev/next
  steps/
    IdentityStep.tsx       ← Name, concept
    PriorityStep.tsx       ← Priority allocation table
    RaceStep.tsx           ← Race selection with details
    ExaltationStep.tsx     ← Exaltation selection
    CharacteristicsStep.tsx ← Stat allocation with points
    SkillsStep.tsx         ← Skill point allocation
    ClassStep.tsx          ← Starting class selection
    FeatsStep.tsx          ← Feat selection
    BackgroundsStep.tsx    ← Background dots allocation
    AlignmentStep.tsx      ← Alignment selection
    ReviewStep.tsx         ← Summary + export
  shared/
    AllocationGrid.tsx     ← Reusable +/- allocation UI
    SelectionCard.tsx      ← Race/exaltation/class card
    XPTracker.tsx          ← Running XP budget display
    ConstraintBadge.tsx    ← Valid/invalid constraint indicator
```

**State model:**

```tsx
const step = signal(1);
const character = signal(character.createDefault());
const priorities = signal({
    /* allocation */
});
const validationErrors = computed(() => validateStep(step.value, character.value));
```

**Key challenge:** Priority allocation creates hard constraints that flow through multiple steps. A change in priority ordering can invalidate choices in later steps. This is where Preact's computed signals shine — constraint validation auto-updates.

**Data loading:** `useAllData(["races.json", "exaltations.json", "classes.json", "feats.json", "skills.json", "backgrounds.json", "alignments.json"])`.

**Persistence:** Auto-save wizard progress to localStorage. Existing `character.save()` for final export.

### 5B — Character Sheet

**Current:** `character-sheet.astro` (HTML template) + `sheet-app.ts` (1,500 lines of controller logic) + `sheet.css` (1,200 lines).

**This is the largest and most complex tool. 6 tabs, 100+ editable fields, multi-character management, import/export, and derived stat calculations.**

**Component decomposition:**

```
src/components/preact/tools/character-sheet/
  SheetApp.tsx             ← Root + character state + tab management
  CharacterManager.tsx     ← Character list, new/load/delete/import/export
  tabs/
    IdentityTab.tsx        ← Name, race, exaltation, class, level, XP
    StatsTab.tsx           ← Characteristics grid + skills grid
    CombatTab.tsx          ← Derived stats + weapons + armor
    PowersTab.tsx          ← Magic/sword schools/gun kata + spells
    FeaturesTab.tsx        ← Feats + assets + hindrances + backgrounds
    NotesTab.tsx           ← Freeform notes
  shared/
    CharGrid.tsx           ← 9-characteristic grid with derived modifiers
    SkillGrid.tsx          ← Full skill list with dots
    WeaponTable.tsx        ← Melee + ranged weapon entries
    ArmorTable.tsx         ← Armor entries with location coverage
    SpellList.tsx          ← Spell entries with school grouping
    SchoolEntry.tsx        ← Sword school / gun kata entry
    BackgroundBudget.tsx   ← Background dot allocation
    FeatEntry.tsx          ← Feat display with tier
    WoundTracker.tsx       ← HP/wound status display
```

**State model:**

```tsx
const characterId = signal<string | null>(null);
const character = signal<CharacterData>(character.createDefault());
const activeTab = signal("identity");

// All derived stats are computed signals
const staticDefense = computed(() =>
    derived.calculateSD(character.value.characteristics.dex, character.value.characteristics.wis, character.value.size)
);
// ... etc for HP, Mental Defense, Resolve, Speed, Resilience, Initiative
```

**Persistence:** The existing `character.ts` module handles all localStorage operations. Wrap `character.save()` in a debounced effect:

```tsx
const debouncedChar = useDebouncedSignal(character, 400);
effect(() => {
    if (characterId.value) {
        character.save(characterId.value, debouncedChar.value);
    }
});
```

**Key challenge:** The sheet has ~100 individually editable fields. Each field update must:

1. Update the character signal
2. Trigger derived stat recalculation (via computed signals — automatic)
3. Schedule auto-save (via debounced effect — automatic)
4. Re-render only affected UI (Preact virtual DOM handles this)

This is the **highest-value Preact migration** — the current imperative `renderAll()` pattern with manual DOM updates is the most painful part of the codebase.

**Session gate:** These two tools should each be their own session. They are the most complex and most likely to surface edge cases.

---

## Phase 6: CSS Token Migration

**Status:** ✅ Complete — Implemented via the [Tailwind v4 migration plan](tailwind-v4-migration-plan.md).

All ~5,569 lines of hand-written CSS across 10 tool pages and ~97 Preact components have been converted to Tailwind v4 utility classes. The `@theme` block in `src/styles/tailwind.css` is the single source of truth for design tokens. Bridge variables have been removed from `ToolLayout.astro`. See `docs/tailwind-v4-migration-plan.md` for the full completion log.

---

## Phase 7: Documentation & Framework Updates

**Status:** ✅ Complete — All architecture docs, tool specs, agent instructions, and shared module docs updated to reflect Preact Islands + Tailwind CSS v4 architecture.

### 7A — Architecture Documentation

**`docs/architecture.md`:**

- Add Preact + Tailwind to Technology Stack table
- Add `@tailwindcss/vite`, `@astrojs/preact`, `@astrojs/starlight-tailwind` to dependency list
- Update key files table: add `tailwind.css`, `src/components/preact/`
- Document the two valid tool patterns (vanilla TS vs Preact island)
- Update data flow diagram to show Preact signal layer

### 7B — Development Guide

**`docs/development-guide.md`:**

- Add "Creating a Preact Tool" recipe alongside existing vanilla TS recipe
- Add Tailwind utility conventions
- Add "When to use Preact vs Vanilla TS" decision guide
- Update CSS section for Tailwind + custom properties coexistence

### 7C — Agent Instructions

**`.github/instructions/astro.instructions.md`:**

- Remove "No React/Vue/Svelte" and "No client directives" statements
- Document two valid patterns: Vanilla TS (existing tools) and Preact Islands (new tools)
- Add Preact component file location convention: `src/components/preact/`
- Add Tailwind CSS v4 utility availability note
- Add client directive guidance (`client:load` for above-fold, `client:visible` for below-fold)

**`.github/copilot-instructions.md`:**

- Update architecture tree to show `src/components/preact/`, `src/styles/tailwind.css`
- Update Technology Stack description to include Preact and Tailwind
- Add Preact/Tailwind to the "Where to Find What" table

### 7D — Tool Specs

Update each tool spec in `docs/tools/` after its migration:

- Note the migration from vanilla TS to Preact
- Update the component structure section
- Update the state management section

### 7E — Shared Module Docs

**`docs/shared/core-js.md`:**

- Note that `ui.ts` (`initAccordion`) is deprecated / removed, replaced by Accordion component
- Document new hooks API surface

**New: `docs/shared/preact-hooks.md`:**

- Document `useData`, `useLocalStorage`, `useWorker`, `useDebouncedSignal`
- Document UI component library (Panel, Button, Accordion, TabGroup, etc.)

### 7F — Side Tracks Update

**`docs/side-tracks.md`:**

- Update "Phase 3: Reactivity Layer" — Preact decision made, implementation complete
- Remove from "open consideration"

---

## Migration Patterns Reference

### Pattern 1: Imperative DOM → Preact JSX

**Before (vanilla TS):**

```typescript
function renderSkills(skills) {
    const html = skills
        .map(
            (s) => `
    <div class="skill-entry">
      <span>${s.name}</span>
      <input type="number" value="${s.dots}" data-skill="${s.name}">
    </div>
  `
        )
        .join("");
    document.getElementById("skills").innerHTML = html;
}
```

**After (Preact):**

```tsx
function SkillList({ skills, onChange }) {
    return (
        <div class="skill-list">
            {skills.map((s) => (
                <div class="skill-entry" key={s.name}>
                    <span>{s.name}</span>
                    <input type="number" value={s.dots} onInput={(e) => onChange(s.name, e.currentTarget.valueAsNumber)} />
                </div>
            ))}
        </div>
    );
}
```

### Pattern 2: Event Delegation → Component Handlers

**Before:**

```typescript
container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === "add-skill") addSkill();
    if (action === "remove-skill") removeSkill(btn.dataset.index);
    if (action === "roll-init") rollInitiative();
});
```

**After:**

```tsx
<Button onClick={addSkill}>Add Skill</Button>
<Button onClick={() => removeSkill(index)}>Remove</Button>
<Button onClick={rollInitiative}>Roll Initiative</Button>
```

### Pattern 3: Manual Re-render → Computed Signals

**Before:**

```typescript
function updateCharacteristic(name, value) {
    char.characteristics[name] = value;
    renderDerivedStats(); // Must remember to call this
    renderCombatTab(); // And this
    scheduleAutoSave(); // And this
}
```

**After:**

```tsx
const characteristics = signal(char.characteristics);
const sd = computed(() => derived.calculateSD(characteristics.value.dex, ...));
const hp = computed(() => derived.calculateHP(characteristics.value.con, ...));
// UI auto-updates when characteristics change. Auto-save via effect.
```

### Pattern 4: Chart.js Integration

```tsx
function ChartWrapper({ config }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new Chart(canvasRef.current, config);
        return () => chartRef.current?.destroy();
    }, [config]);

    return <canvas ref={canvasRef} />;
}
```

### Pattern 5: Worker Communication

```tsx
function SimulationPanel() {
    const { result, loading, run } = useWorker(new URL("../../workers/simulation-worker.ts", import.meta.url));

    return (
        <div>
            <Button onClick={() => run({ config: poolConfig, trials: 100000 })}>{loading.value ? "Simulating..." : "Run Simulation"}</Button>
            {result.value && <HistogramChart data={result.value} />}
        </div>
    );
}
```

---

## Risk Register

| Risk                                         | Likelihood | Impact | Mitigation                                                                                        |
| -------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------- |
| Starlight upgrade breaks Head.astro override | Medium     | High   | Test immediately after upgrade; override is simple (3 lines)                                      |
| Tailwind CSS conflicts with Starlight styles | Medium     | Medium | `@astrojs/starlight-tailwind` handles cascade layers; test doc pages                              |
| `@theme` can't reference `var()`             | High       | Low    | Use literal values in `@theme`, bridge via `:root` vars (already planned)                         |
| Chart.js + Preact lifecycle conflicts        | Low        | Medium | Use `useRef` + cleanup in `useEffect`; Chart.js manages its own canvas                            |
| Large tool migration introduces regressions  | Medium     | High   | Migrate one tool per session; run full check after each; keep old code until new code is verified |
| Bundle size increase from Preact             | Low        | Low    | Preact is 3KB gzipped; compat adds ~1KB; trivial vs current inline scripts                        |
| Worker imports break with Preact build       | Low        | High   | Workers don't change; they use relative imports that Vite already bundles                         |
| Biome doesn't handle TSX                     | Low        | Low    | Biome 2.x supports JSX/TSX natively; verify in Phase 0D                                           |
| `character.ts` migration logic breaks        | Low        | High   | Don't modify `character.ts` — call it from hooks unchanged                                        |

---

## File Inventory

### Files Created (New)

| File                                                  | Phase | Purpose                                  |
| ----------------------------------------------------- | ----- | ---------------------------------------- |
| `src/styles/tailwind.css`                             | 0B    | Tailwind entry point with layer ordering |
| `src/components/preact/hooks/use-data.ts`             | 1B    | JSON data loading hook                   |
| `src/components/preact/hooks/use-local-storage.ts`    | 1B    | Typed localStorage hook                  |
| `src/components/preact/hooks/use-worker.ts`           | 1B    | Worker communication hook                |
| `src/components/preact/hooks/use-debounce.ts`         | 1B    | Debounced signal hook                    |
| `src/components/preact/ui/Panel.tsx`                  | 1C    | Shared panel component                   |
| `src/components/preact/ui/Button.tsx`                 | 1C    | Shared button component                  |
| `src/components/preact/ui/Accordion.tsx`              | 1C    | Collapsible section component            |
| `src/components/preact/ui/TabGroup.tsx`               | 1C    | Tab navigation component                 |
| `src/components/preact/ui/StatEntry.tsx`              | 1C    | Stat display with +/-                    |
| `src/components/preact/ui/Modal.tsx`                  | 1C    | Dialog component                         |
| `src/components/preact/ui/SearchInput.tsx`            | 1C    | Debounced search input                   |
| `src/components/preact/layout/ToolShell.tsx`          | 1D    | Loading/error wrapper                    |
| `src/components/preact/tools/dice-roller/*.tsx`       | 2     | 5 components                             |
| `src/components/preact/tools/quick-reference/*.tsx`   | 3A    | 9 components                             |
| `src/components/preact/tools/success-curves/*.tsx`    | 3C    | 8 components                             |
| `src/components/preact/tools/defense-graph/*.tsx`     | 3D    | 7 components                             |
| `src/components/preact/tools/combat-tracker/*.tsx`    | 4A    | 10 components                            |
| `src/components/preact/tools/npc-generator/*.tsx`     | 4B    | 13 components                            |
| `src/components/preact/tools/ship-builder/*.tsx`      | 4C    | 12 components                            |
| `src/components/preact/tools/character-builder/*.tsx` | 5A    | 15 components                            |
| `src/components/preact/tools/character-sheet/*.tsx`   | 5B    | 16 components                            |
| `docs/shared/preact-hooks.md`                         | 7E    | Hook + component API docs                |

### Files Modified

| File                                         | Phase | Change                                                         |
| -------------------------------------------- | ----- | -------------------------------------------------------------- |
| `package.json`                               | 0     | Add preact, tailwind, starlight-tailwind deps                  |
| `astro.config.mjs`                           | 0     | Add preact integration, tailwind vite plugin, update customCss |
| `tsconfig.json`                              | 0E    | Add JSX config (if needed)                                     |
| `biome.json`                                 | 0D    | Verify TSX coverage (likely no change)                         |
| `src/layouts/ToolLayout.astro`               | 6     | Bridge vars to Tailwind `@theme` tokens                        |
| `src/styles/custom.css`                      | 0B    | Possibly add `@layer` wrapper                                  |
| `src/pages/tools/dice-roller.astro`          | 2     | Replace inline script with Preact island                       |
| `src/pages/tools/quick-reference.astro`      | 3A    | Replace inline script with Preact island                       |
| `src/pages/tools/success-curves.astro`       | 3C    | Replace inline script with Preact island                       |
| `src/pages/tools/defense-graph.astro`        | 3D    | Replace inline script with Preact island                       |
| `src/pages/tools/combat-tracker.astro`       | 4A    | Replace inline script with Preact island                       |
| `src/pages/tools/npc-generator.astro`        | 4B    | Replace inline script with Preact island                       |
| `src/pages/tools/ship-builder.astro`         | 4C    | Replace inline script with Preact island                       |
| `src/pages/tools/character-builder.astro`    | 5A    | Replace inline script with Preact island                       |
| `src/pages/tools/character-sheet.astro`      | 5B    | Replace inline script with Preact island                       |
| `docs/architecture.md`                       | 7A    | Add Preact + Tailwind architecture                             |
| `docs/development-guide.md`                  | 7B    | Add Preact recipes                                             |
| `.github/instructions/astro.instructions.md` | 7C    | Update for Preact + Tailwind                                   |
| `.github/copilot-instructions.md`            | 7C    | Update architecture tree + stack                               |
| `docs/shared/core-js.md`                     | 7E    | Note ui.ts deprecation                                         |
| `docs/side-tracks.md`                        | 7F    | Close Phase 3 item                                             |

### Files Deleted (After Full Migration)

| File                           | Phase | Replaced By                                     |
| ------------------------------ | ----- | ----------------------------------------------- |
| `src/lib/tools/builder-app.ts` | 5A    | Preact components in `tools/character-builder/` |
| `src/lib/tools/sheet-app.ts`   | 5B    | Preact components in `tools/character-sheet/`   |
| `src/styles/builder.css`       | 5A    | Tailwind utilities in components                |
| `src/styles/sheet.css`         | 5B    | Tailwind utilities in components                |
| `src/lib/dtd/ui.ts`            | 4A    | `Accordion.tsx` component                       |

**Note:** `ui.ts` is only used in combat-tracker. Remove after combat-tracker migration. Update `core.ts` barrel export to remove `initAccordion`.

---

## Session Boundaries

| Session | Phases                 | Estimated Scope                       |
| ------- | ---------------------- | ------------------------------------- |
| 1       | 0 (Foundation)         | Install deps, configure, verify build |
| 2       | 1 (Infrastructure)     | Hooks, UI primitives, ToolShell       |
| 3       | 2 (Dice Roller PoC)    | Full dice roller migration            |
| 4       | 3A (Quick Reference)   | Data display migration                |
| 5       | 3C–3D (Chart tools)    | Success Curves + Defense Graph        |
| 6       | 4A (Combat Tracker)    | Stateful tool migration               |
| 7       | 4B (NPC Generator)     | Stateful tool migration               |
| 8       | 4C (Ship Builder)      | Stateful tool migration               |
| 9       | 5A (Character Builder) | Complex wizard migration              |
| 10      | 5B (Character Sheet)   | Complex sheet migration               |
| 11      | 6 (CSS tokens)         | Token migration + cleanup             |
| 12      | 7 (Docs)               | Documentation updates                 |

**Parallelization opportunity:** Phase 6 (CSS tokens) can start after Phase 0 and run incrementally alongside Phases 2–5. Phase 7 (docs) should happen during or immediately after each tool migration, not deferred.

---

## Success Criteria

The migration is complete when:

1. All 9 interactive tools render as Preact islands (Dashboard stays vanilla Astro)
2. `npm run check` passes with zero new errors
3. `npm run build` succeeds
4. All tool functionality is preserved (manual verification per tool)
5. `builder-app.ts`, `sheet-app.ts`, `builder.css`, `sheet.css` are deleted
6. `ui.ts` is deleted and removed from `core.ts` barrel
7. All documentation reflects the new architecture
8. Tailwind utilities are available and used in new components
9. Existing CSS custom properties still work for any un-migrated styles
10. No regressions in Starlight doc pages

---

## Completion Status

**Status: Phases 0–7 executed. Migration functionally complete.**

All 12 implementation steps committed on branch `preact-tailwind` (12 commits, `635e376`→`868a00a`).

### Criteria Checklist

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | All 9 tools as Preact islands | ✅ Done | 105 components across 9 tools, all using `client:load` |
| 2 | `npm run check` passes | ✅ Done | 0 errors, 19 warnings (baseline), 187 tests pass |
| 3 | `npm run build` succeeds | ✅ Done | 89 pages built |
| 4 | Functionality preserved | ❌ Broken | Tailwind not loading on tool pages; Character Sheet/Builder data loading 404s |
| 5 | Old vanilla files deleted | ✅ Done | `sheet-app.ts`, `builder-app.ts`, `sheet.css`, `builder.css` deleted |
| 6 | `ui.ts` deleted | ⚠️ Pending | Not yet addressed |
| 7 | Documentation updated | ✅ Done | architecture.md, development-guide.md, README.md, tool specs, skills, instructions all updated |
| 8 | Tailwind utilities used | ⚠️ Partial | Classes in JSX but `tailwind.css` not imported by ToolLayout — utilities not generated |
| 9 | CSS custom properties work | ✅ Done | `ToolLayout.astro` bridges `@theme` tokens to `var(--name)` aliases |
| 10 | No Starlight regressions | ✅ Done | Build passes, doc pages unaffected |

### Remaining Work

- **Fix Tailwind import for tool pages** — `ToolLayout.astro` needs to import `tailwind.css` so utility classes are generated (tools currently render unstyled)
- **Fix data loading filenames** — `CharacterSheetApp.tsx` and `CharacterBuilderApp.tsx` pass bare names (e.g., `"races"`) to `useAllData()` but `loadData()` needs `.json` extension
- Investigate `ui.ts` deletion (criterion 6)
- Manual browser testing of all 9 tools (after CSS and data fixes)
- Implement full Tailwind styling pass across all tool components
