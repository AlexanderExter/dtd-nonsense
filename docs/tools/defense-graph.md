# Defense Graph

Visual analysis tool for Static Defense (SD) distributions across character builds. Helps Story Masters calibrate encounter difficulty and players understand defensive scaling.

**Phase:** Complete
**Files:** `src/pages/tools/defense-graph.astro`, `src/components/preact/tools/defense-graph/` (10 components), `src/workers/defense-worker.ts`
**Pattern:** Preact Island via `client:load` with module-level `@preact/signals`, Web Worker for defense calculations

---

## Features

### SD Visualization

- **Scatter plot** — SD values plotted against character level or total XP
- **Build comparison** — overlay multiple character builds on one graph
- **Formula breakdown** — interactive display showing how each component contributes to SD

### Analysis Modes

| Mode        | X-Axis      | Y-Axis | Description                              |
| ----------- | ----------- | ------ | ---------------------------------------- |
| By Level    | Class level | SD     | SD progression as characters gain levels |
| By XP       | Total XP    | SD     | SD vs investment (reveals efficiency)    |
| By Race     | Race        | SD     | Racial SD distributions (box plot)       |
| By Exaltion | Exaltation  | SD     | Exaltation impact on SD spread           |

### Calculator Panel

- **Manual input** — set Dexterity, Wisdom, Size → instant SD calculation
- **Slider controls** — adjust characteristics with real-time graph update
- **Comparison mode** — "what-if" analysis for gear/feat changes affecting SD

### Formula Reference

```
Character SD = 10 + (Dexterity + Wisdom) × 3 − (Size × 2)
```

Component contribution at different dot levels:

| Dex + Wis | Size 3 (Small) | Size 4 (Medium) | Size 5 (Large) |
| --------- | -------------- | --------------- | -------------- |
| 4 (2+2)   | 16             | 14              | 12             |
| 6 (3+3)   | 22             | 20              | 18             |
| 8 (4+4)   | 28             | 26              | 24             |
| 10 (5+5)  | 34             | 32              | 30             |
| 12 (6+6)  | 40             | 38              | 36             |

---

## Architecture

**Dependencies:** `import { derived } from '@/lib/dtd/core.ts'`, **Chart.js** (via npm dynamic import), ESM Web Worker (`src/workers/defense-worker.ts`, bundled by Vite)

### Data Sources

- **Imported characters** — loads from localStorage via `character.list()` / `character.load()`
- **Manual builds** — user-specified characteristic sets
- **Race data** — Size values from `races.json` for racial comparison mode

### Chart Rendering

```javascript
DefGraph.renderChart = function () {
    const datasets = this.builds.map((build) => ({
        label: build.name,
        data: build.dataPoints, // [{x: level, y: sd}]
        borderColor: build.color,
    }));

    new Chart(ctx, {
        type: "scatter", // or 'bar' for racial comparison
        data: { datasets },
        options: {
            scales: {
                x: { title: { text: "Class Level" } },
                y: { title: { text: "Static Defense" }, min: 0 },
            },
        },
    });
};
```

### SD Calculation

Uses `derived.calculateSD()` from `@/lib/dtd/core.ts`:

```typescript
// from core.ts
export function calculateSD(dex: number, wis: number, size: number): number {
    return 10 + (dex + wis) * 3 - size * 2;
}
```

---

## Persistence

| Key                  | Content                    |
| -------------------- | -------------------------- |
| `dtd-defense-builds` | Saved build configurations |

---

## UI Layout

```
┌───────────────────────────────────────────────────────────────┐
│  Mode: [By Level ▼]   [Import Characters] [Add Manual Build] │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ SD                                                      │  │
│  │ 40│                                           ● Build A │  │
│  │   │                                  ●                  │  │
│  │ 30│                        ●                  ○ Build B │  │
│  │   │              ●                   ○                  │  │
│  │ 20│    ●                   ○                            │  │
│  │   │    ○         ○                                      │  │
│  │ 10│                                                     │  │
│  │   └──────────────────────────────────────────           │  │
│  │      1    2    3    4    5    6    7    8                │  │
│  │                  Class Level                             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────── Calculator ─────────────────┐                │
│  │  Dexterity: [●●●●○○]  4                  │                │
│  │  Wisdom:    [●●●○○○]  3                  │                │
│  │  Size:      [●●●●○○]  4                  │                │
│  │                                           │                │
│  │  SD = 10 + (4+3)×3 − (4×2) = 23         │                │
│  └───────────────────────────────────────────┘                │
└───────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

| Decision      | Choice             | Rationale                                            |
| ------------- | ------------------ | ---------------------------------------------------- |
| Chart type    | Scatter + Bar      | Scatter for builds over time, bar for racial compare |
| SD formula    | Character formula  | Tool is for character SD, not vehicle SD             |
| Chart library | Chart.js (npm)     | Dynamic import, consistent with Success Curves       |
| Import source | localStorage chars | Uses existing Character Sheet data                   |
| Calculator    | Inline panel       | Quick what-if analysis without full character build  |

---

## Verification

1. Calculator: set Dex 4, Wis 3, Size 4 → verify SD = 23
2. Import character from Sheet → verify plotted SD matches Sheet display
3. Racial comparison mode → verify Size values match `races.json`
4. Multiple builds overlay → verify distinct colors and labels
5. Formula breakdown → verify each component shows correct contribution
