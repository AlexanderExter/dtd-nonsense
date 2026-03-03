# Success Curves

Probability visualization tool for D:TD's XkY dice system. Generates success probability curves, distribution histograms, and comparative analysis for different dice pools.

**Phase:** 4
**Files:** `src/pages/tools/success-curves.astro` (JS/CSS inline), `public/workers/simulation-worker.js`
**Pattern:** Inline `<script>` in Astro page

---

## Features

### Probability Curves

- **Success vs TN** — line chart showing P(success) for a given pool across TN range 5-50
- **Multiple pools overlay** — compare up to 4 pools on one chart (e.g., 3k2 vs 5k3 vs 7k4)
- **Interactive tooltips** — hover for exact probability at any TN

### Distribution Histogram

- **Result distribution** — bar chart of result frequencies for a single pool
- **Mean / Median / Mode** — statistical summary
- **Percentile markers** — 25th, 50th, 75th, 95th percentile lines

### Comparative Analysis

- **Pool comparison table** — side-by-side stats for selected pools
- **Break-even TN** — TN where two pools have equal success probability
- **Effective range** — TN range where a pool has >50% success

### Simulation Engine

Results computed via **Monte Carlo simulation** (configurable sample count) rather than exact combinatorial math. This handles exploding dice naturally without complex analytical formulas.

Default: 10,000 simulations per pool. Adjustable via UI slider (1,000 to 100,000).

---

## Architecture

**Dependencies:** **Chart.js** (via npm dynamic import), external Web Worker (`/workers/simulation-worker.js`)

### Simulation Flow

```javascript
// For each TN in range:
for (let tn = 5; tn <= 50; tn++) {
    let successes = 0;
    for (let i = 0; i < sampleCount; i++) {
        const result = roll(pool, keep);  // runs inside Worker
        if (result.total >= tn) successes++;
    }
    probabilities[tn] = successes / sampleCount;
}
```

The Web Worker contains its own dice roll implementation — ensures exploding dice behavior matches the Dice Roller exactly.

### Chart Rendering

```javascript
// Chart.js line chart for probability curves
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: tnRange,          // [5, 10, 15, ..., 50]
        datasets: poolDatasets    // One dataset per pool
    },
    options: { ... }
});
```

### Performance

Monte Carlo with 10,000 samples × 10 TN steps × 4 pools = 400,000 dice rolls. The simulation runs in a dedicated Web Worker (`/workers/simulation-worker.js`) to keep the UI responsive during computation.

---

## Persistence

| Key                  | Content                  |
| -------------------- | ------------------------ |
| `dtd-curves-pools`   | Last configured pool set |
| `dtd-curves-samples` | Sample count preference  |

Minimal persistence — saves pool configuration for quick reload.

---

## UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Pools: [5k3] [3k2] [7k4] [+Add]    Samples: [10000]       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 100%│                                                  │  │
│  │     │  ╲                                               │  │
│  │  75%│   ╲  ╲                                           │  │
│  │     │    ╲  ╲  ╲                                       │  │
│  │  50%│─────╲──╲──╲─────────────────── 50% line          │  │
│  │     │      ╲  ╲  ╲                                     │  │
│  │  25%│       ╲  ╲   ╲                                   │  │
│  │     │        ╲   ╲    ╲                                │  │
│  │   0%│─────────────────────────────                     │  │
│  │     5   10   15   20   25   30   35   40   45   50     │  │
│  │                    Target Number                        │  │
│  │     ── 5k3  ── 3k2  ── 7k4                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────┬──────────┬──────────┐                          │
│  │ 5k3      │ 3k2      │ 7k4      │                          │
│  │ Mean: 22 │ Mean: 13 │ Mean: 30 │                          │
│  │ P(≥15):  │ P(≥15):  │ P(≥15):  │                          │
│  │  85.2%   │  41.7%   │  96.1%   │                          │
│  └──────────┴──────────┴──────────┘                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

| Decision           | Choice            | Rationale                                           |
| ------------------ | ----------------- | --------------------------------------------------- |
| Computation method | Monte Carlo       | Exploding dice make analytical solutions complex    |
| Dice engine        | Worker-embedded   | Own dice implementation in Web Worker               |
| Chart library      | Chart.js (npm)    | Dynamic import, bundled by Vite                     |
| Threading          | Web Worker        | Offloads simulation to background thread            |
| Sample default     | 10,000            | Good accuracy/speed tradeoff                        |

---

## Verification

1. 5k3 at TN 15 → verify ~85% success (known approximate from community data)
2. Compare chart to Dice Roller: roll 5k3 100 times manually, compare success rate at TN 15
3. Increase samples to 100,000 → verify curve smooths (less noise)
4. Add 4 pools → verify all render without overlap issues
5. Pool `1k1` → verify curve matches theoretical d10 distribution (10% per value, +explosions)
