# dice.js — DTD.dice Rolling Engine

Sole dice module for the project. Implements D:TD's `XkY` exploding d10 system with notation parsing, roll execution, outcome evaluation, and result formatting.

**File:** `tools/shared/js/dice.js` (~314 lines)
**Pattern:** IIFE wrapping `DTD.dice` namespace
**Consumers:** Dice Roller, Combat Tracker, NPC Generator, Success Curves

---

## Namespace Attachment

```javascript
(function () {
    window.DTD = window.DTD || {};
    const dice = (DTD.dice = {});
    // ... all functions defined on dice object
})();
```

Extends the `DTD` global via `window.DTD` — same pattern rationale as core.js (must use `window` property, not lexical binding).

---

## Public API

### dice.roll(pool, keep, options)

Rolls `pool` d10s, keeps `keep` highest. Returns a `DiceResult` object.

**Parameters:**
| Param | Type | Description |
| ------- | ------ | --------------------------------------------- |
| pool | number | Number of d10s to roll |
| keep | number | Number of highest dice to keep |
| options | object | Optional: `{ rankZero: boolean }` |

**Returns:** `DiceResult`

```javascript
const result = DTD.dice.roll(5, 3);
// {
//     dice: [DieRoll, DieRoll, ...],   // All 5 dice
//     kept: [DieRoll, DieRoll, DieRoll], // Top 3
//     total: 27,                         // Sum of kept
//     pool: 5,
//     keep: 3,
//     isRankZero: false
// }
```

**Options:**

- `rankZero: true` — 10s count as 0 instead of 10 (for Rank 0 skill rolls)

### dice.calculateOutcome(result, tn)

Evaluates a roll result against a Target Number.

**Parameters:**
| Param | Type | Description |
| ------ | ---------- | ---------------------- |
| result | DiceResult | From `dice.roll()` |
| tn | number | Target Number to beat |

**Returns:**

```javascript
{
    passed: true,       // total >= tn
    raises: 2,          // Math.floor((total - tn) / 5) when passed
    checks: 0,          // Math.floor((tn - total) / 5) when failed
    margin: 12          // total - tn (positive = success, negative = failure)
}
```

### dice.parseNotation(input)

Parses dice notation string into components.

**Accepts:** `"5k3"`, `"5K3"`, `"10k5"`, etc.

**Returns:**

```javascript
{
    pool: 5,
    keep: 3,
    valid: true
}
```

Returns `{ valid: false }` for unparseable input.

### dice.formatResult(result)

Produces a display-ready string from a `DiceResult`.

```javascript
DTD.dice.formatResult(result);
// "5k3: [8, 10→6, 5, 3, 2] → kept [16, 8, 5] = 29"
```

Includes explosion chains (e.g., `10→6` = rolled 10 then 6 = 16).

### dice.compressOverflow(results)

Maps an array of die results to a 1-10 scale for visualization (e.g., bar charts). Used by Success Curves tool.

```javascript
DTD.dice.compressOverflow([3, 15, 7, 22, 8]);
// → scaled values for chart rendering
```

---

## Internal Functions

### rollOneDie()

Core die rolling. Implements exploding d10:

```javascript
function rollOneDie() {
    let total = 0, roll;
    do {
        roll = Math.ceil(Math.random() * 10);
        total += roll;
    } while (roll === 10);
    return { total, rolls: [...] };
}
```

- Rolls a d10
- On 10: roll again and add (chains infinitely)
- Returns total and individual roll chain

### rollRankZero()

Variant roller where 10s on kept dice count as 0 instead of 10. Used for Rank 0 skill Tests where the character has no training.

---

## Type Definitions

### DiceResult

```typescript
interface DiceResult {
    dice: DieRoll[]; // All rolled dice
    kept: DieRoll[]; // Selected (highest) dice
    total: number; // Sum of kept dice values
    pool: number; // Original pool size
    keep: number; // Original keep count
    isRankZero: boolean; // Whether Rank Zero rules applied
}
```

### DieRoll

```typescript
interface DieRoll {
    value: number; // Final value of this die
    rolls: number[]; // Individual rolls (length > 1 if exploded)
    exploded: boolean; // Whether this die exploded
    kept: boolean; // Whether this die was kept
}
```

---

## Backward Compatibility Aliases

```javascript
dice.rollKeepHighest = dice.roll; // Old name
dice.formatRollResult = dice.formatResult; // Old name
```

These exist for legacy callers. New code should use the canonical names.

---

## Script Load Order

dice.js must load after core.js (needs `window.DTD` to exist):

```html
<script src="../shared/js/core.js"></script>
<!-- 1st: creates DTD -->
<script src="../shared/js/dice.js"></script>
<!-- 2nd: extends DTD.dice -->
```

---

## Mathematical Properties

| Property              | Value                                              |
| --------------------- | -------------------------------------------------- |
| Die range             | 1-10 per roll, unbounded with explosions           |
| Explosion chance      | 10% per die per roll                               |
| Expected value (1d10) | ~6.11 (accounting for explosions)                  |
| Max chain observed    | Theoretically infinite, practically 3-4 explosions |
| Pool cap              | No hard cap; UI typically limits to 10k10          |

---

## Modification Checklist

When editing dice.js:

1. **Test explosion behavior** — edge case: 10→10→10→... must not infinite loop (it won't, but verify)
2. **Verify compressOverflow** — Success Curves depends on consistent scaling
3. **Check backward compat aliases** — removing them breaks old callers
4. **Grep all tool directories** — Dice Roller, Combat Tracker, NPC Generator, Success Curves all import DTD.dice
5. **Run Dice Roller manually** — fastest way to verify roll correctness
