# Dice Roller

Interactive dice rolling tool for D:TD's `XkY` system. Provides visual roll displays, history tracking, and flexible notation parsing.

**Phase:** 0 (Foundation)
**Files:** `src/pages/tools/dice-roller.astro` (JS/CSS inline)
**Pattern:** Inline `<script>` in Astro page

---

## Features

### Roll Input

- **Notation parser** — accepts `XkY` format (e.g., `5k3` = roll 5 d10s, keep 3 highest)
- **Quick buttons** — preset roll buttons for common pools (2k1 through 10k5)
- **Manual input** — free-form notation field with Enter-to-roll
- **TN field** — optional Target Number for automatic pass/fail evaluation

### Roll Display

- **Individual dice** — each d10 shown with its value, kept dice highlighted
- **Exploding dice** — dice that rolled 10 re-roll (marked visually), chain shown
- **Total** — sum of kept dice prominently displayed
- **Raises/Checks** — if TN provided, shows Raises (every 5 above) or Checks (every 5 below)
- **Rank Zero** — 10s kept as 0 (for Rank 0 rolls, where 10 counts as 0 instead of 10)

### Roll History

- Rolling log of previous results with notation, total, and pass/fail
- Persists across page reloads via localStorage
- Clear history button

---

## Architecture

**Dependencies:** `import { roll, calculateOutcome, parseNotation } from '@/lib/dtd/dice.ts'`

### Core Flow

```
User input → parseNotation() → roll() → calculateOutcome() → render
```

1. `parseNotation(input)` — extracts pool size, keep count, modifiers
2. `roll(pool, keep, options)` — generates dice, applies explosions, selects kept
3. `calculateOutcome(result, tn)` — determines Raises/Checks vs TN
4. Roller reads `result.keptRolls`, `result.total`, etc. directly and renders inline

### Exploding Dice

D:TD d10s "explode" on 10: when a die rolls 10, it re-rolls and adds. This chains infinitely.

```javascript
// Simplified logic from dice.js
function rollOneDie() {
    let total = 0,
        roll;
    do {
        roll = Math.ceil(Math.random() * 10);
        total += roll;
    } while (roll === 10);
    return total;
}
```

### Overflow Compression

When exploding dice produce totals exceeding the die maximum, overflow compression maps them to a 1–10 visual scale. This is handled internally by `roll()` (via the private `_compressOverflow` helper) — callers do not need to invoke it separately.

---

## Persistence

| Key                | Content                    |
| ------------------ | -------------------------- |
| `dtd-roll-history` | Array of past roll results |

---

## UI Layout

```
┌──────────────────────────────────────┐
│  Roll: [5k3    ] TN: [15  ] [Roll]  │
│                                      │
│  Quick: [2k1] [3k2] [4k2] [5k3]... │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  ⑤  ⑧  ③  ⑩→⑥  ②           │    │
│  │  Kept: ⑧ ⑯ ⑤ = 29          │    │
│  │  vs TN 15: Pass (2 Raises)  │    │
│  └──────────────────────────────┘    │
│                                      │
│  History:                            │
│  5k3 → 29 (Pass, 2 Raises)          │
│  3k2 → 11 (Fail, 1 Check)           │
│  4k3 → 22 (Pass, 1 Raise)           │
└──────────────────────────────────────┘
```

---

## Design Decisions

| Decision          | Choice        | Rationale                                     |
| ----------------- | ------------- | --------------------------------------------- |
| Dice engine       | Shared module | Reused by Combat Tracker, NPC Generator       |
| Notation format   | `XkY` native  | Matches rulebook notation exactly             |
| Explosion display | Chain shown   | Players want to see each re-roll in the chain |
| History storage   | localStorage  | Survives page reloads, no server needed       |

---

## Verification

1. Roll `5k3` — verify 5 dice shown, top 3 highlighted, total = sum of kept
2. Roll until explosion occurs — verify chain display and correct addition
3. Set TN 15, roll — verify Raises/Checks calculation
4. Refresh page — verify roll history persists
5. Rank Zero toggle — verify 10s count as 0
