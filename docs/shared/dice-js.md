# dice.ts — Dice Engine API

Sole dice module for the project. Implements D:TD's `XkY+N` exploding d10 system with notation parsing, roll execution, overflow compression, and outcome evaluation.

**File:** `src/lib/dtd/dice.ts` (pure ES module with named exports)
**Types:** `src/lib/dtd/types.ts` — provides `DiceResult`, `DieRoll`, `Outcome`, `ParsedNotation`, `OverflowInfo`
**Pattern:** Named exports — `import { roll, calculateOutcome, parseNotation } from '@/lib/dtd/dice.ts'`
**Consumers:** Combat Tracker, Ship Builder

---

## Exported Functions

### `roll(numDice, keepDice, modifier?, options?)`

Roll `numDice` exploding d10s, keep the highest `keepDice`, add a flat `modifier`. Applies overflow compression automatically when pools exceed 10.

**Signature:**

```typescript
export function roll(
    numDice: number,
    keepDice: number,
    modifier?: number, // default: 0
    options?: { rankZero?: boolean } // default: {}
): DiceResult;
```

**Parameters:**

| Param      | Type                     | Description                                         |
| ---------- | ------------------------ | --------------------------------------------------- |
| `numDice`  | `number`                 | Number of d10s to roll (the X in XkY)               |
| `keepDice` | `number`                 | Number of highest dice to keep (the Y in XkY)       |
| `modifier` | `number`                 | Flat bonus/penalty added to the total (default `0`) |
| `options`  | `{ rankZero?: boolean }` | Optional flags (see below)                          |

**Options:**

- `rankZero: true` — Rank-0 mode. Rolls a single d10 with no explosion; a natural 10 counts as 0. Used for untrained skill tests. Also triggered automatically when `keepDice === 0`.

**Returns:** `DiceResult` (see [Types](#types) below)

**Usage:**

```typescript
import { roll } from "@/lib/dtd/dice.ts";

// Standard roll: 5k3
const result = roll(5, 3);
// result.total → sum of 3 highest dice

// Roll with modifier: 5k3+5
const buffed = roll(5, 3, 5);

// Rank-0 roll: single d10, 10 → 0
const rankZero = roll(1, 0);
```

**Behavior details:**

1. If `rankZero` option is set or `keepDice === 0`, rolls a single non-exploding d10 (10 → 0) plus modifier.
2. Otherwise, clamps `numDice` and `keepDice` to at least 1. If `keepDice > numDice`, it's reduced to `numDice`.
3. Applies overflow compression (see [Overflow Compression](#overflow-compression)).
4. Rolls `numDice` exploding d10s.
5. Sorts all dice descending by value, keeps the top `keepDice`.
6. Returns the full result with kept/dropped dice, totals, and overflow info.

---

### `calculateOutcome(total, tn)`

Evaluate a roll total against a Target Number (TN). Determines pass/fail and counts raises (every 5 above TN) or checks (every 5 below TN).

**Signature:**

```typescript
export function calculateOutcome(total: number, tn: number): Outcome;
```

**Parameters:**

| Param   | Type     | Description             |
| ------- | -------- | ----------------------- |
| `total` | `number` | The roll total to check |
| `tn`    | `number` | Target Number to beat   |

**Returns:** `Outcome`

| Field     | Type      | Description                                                 |
| --------- | --------- | ----------------------------------------------------------- |
| `success` | `boolean` | `true` if `total >= tn`                                     |
| `raises`  | `number`  | `Math.floor((total - tn) / 5)` on success, else `0`         |
| `checks`  | `number`  | `Math.floor(Math.abs(total - tn) / 5)` on failure, else `0` |

**Usage:**

```typescript
import { roll, calculateOutcome } from "@/lib/dtd/dice.ts";

const result = roll(5, 3);
const outcome = calculateOutcome(result.total, 20);

if (outcome.success) {
    console.log(`Passed with ${outcome.raises} raises!`);
} else {
    console.log(`Failed by ${outcome.checks} checks.`);
}
```

---

### `parseNotation(str)`

Parse an `XkY`, `XkY+N`, or `XkY-N` dice notation string into its numeric components.

**Signature:**

```typescript
export function parseNotation(str: unknown): ParsedNotation | null;
```

**Parameters:**

| Param | Type      | Description                               |
| ----- | --------- | ----------------------------------------- |
| `str` | `unknown` | Notation string to parse (e.g. `"5k3+2"`) |

**Returns:** `ParsedNotation | null` — returns `null` for invalid/empty input.

| Field      | Type     | Description                             |
| ---------- | -------- | --------------------------------------- |
| `num`      | `number` | Number of dice to roll (X)              |
| `keep`     | `number` | Number of dice to keep (Y)              |
| `modifier` | `number` | Flat modifier (N), `0` if not specified |

**Accepted formats:** `"5k3"`, `"5K3"`, `"10k5+3"`, `"3k2-1"`, `"5k3 + 2"` (whitespace around modifier allowed).

**Usage:**

```typescript
import { parseNotation } from "@/lib/dtd/dice.ts";

parseNotation("5k3+2"); // { num: 5, keep: 3, modifier: 2 }
parseNotation("10k5"); // { num: 10, keep: 5, modifier: 0 }
parseNotation("3k2-1"); // { num: 3, keep: 2, modifier: -1 }
parseNotation(""); // null
parseNotation(42); // null
parseNotation("garbage"); // null
```

---

## Types

All types are defined in `src/lib/dtd/types.ts` and imported by the dice module.

### `DieRoll`

Represents a single die in a roll.

```typescript
interface DieRoll {
    value: number; // Final value (sum of all rolls if exploded)
    base: number; // First d10 result (before explosion)
    exploded: boolean; // Whether the die exploded (rolled a 10)
}
```

### `DiceResult`

Complete result of a `roll()` call.

```typescript
interface DiceResult {
    allRolls: DieRoll[]; // All dice rolled (unsorted, original order)
    keptRolls: DieRoll[]; // Highest dice kept (sorted descending)
    droppedRolls: DieRoll[]; // Dice not kept (sorted descending)
    diceTotal: number; // Sum of kept dice values only
    modifier: number; // Flat modifier (post-compression)
    total: number; // diceTotal + modifier
    overflow: OverflowInfo | null; // Non-null if overflow compression was applied
}
```

### `OverflowInfo`

Compression details when the original pool exceeded d10 limits.

```typescript
interface OverflowInfo {
    numDice: number; // Final number of dice rolled (after compression)
    keepDice: number; // Final number of dice kept (after compression)
    modifier: number; // Final modifier (after adding excess-keep bonuses)
    compressed: boolean; // Always true when returned in DiceResult.overflow
}
```

### `Outcome`

Result of `calculateOutcome()`.

```typescript
interface Outcome {
    success: boolean; // total >= tn
    raises: number; // Full 5-point increments above TN (on success)
    checks: number; // Full 5-point increments below TN (on failure)
}
```

### `ParsedNotation`

Result of `parseNotation()`.

```typescript
interface ParsedNotation {
    num: number; // Dice to roll (X in XkY)
    keep: number; // Dice to keep (Y in XkY)
    modifier: number; // Flat modifier (N in XkY+N)
}
```

---

## Mechanics

### Exploding d10s

Every die is a d10 (1–10). When a die rolls a natural 10, it "explodes": roll again and add the new result to the same die's total. Explosions chain — if the re-roll is also a 10, roll again. This continues until a non-10 result.

```text
Example: roll 10 → roll 10 → roll 4 → die value = 24
```

The `DieRoll.base` field captures the first roll (always 10 for exploded dice). `DieRoll.value` captures the full sum. `DieRoll.exploded` is `true` if any explosion occurred.

### Keep Highest

After rolling all dice, they are sorted descending by value. The top `keepDice` are kept; the rest are dropped. The `diceTotal` is the sum of kept dice only.

### Rank-0 Mode

When a character has no training in a skill (rank 0), they roll a single flat d10 with no explosion. A natural 10 counts as 0 instead. This is triggered by `options.rankZero = true` or `keepDice === 0`.

### Overflow Compression

When dice pools grow beyond 10 (common at high levels), the internal `_compressOverflow` function applies the D:TD overflow rules:

1. **Excess rolled dice (numDice > 10):** Every 2 excess rolled dice convert to +1 kept die. Rolled dice are capped at 10.
2. **Keep can't exceed rolled:** If `keepDice > numDice` after step 1, keep is clamped to numDice.
3. **Excess kept dice (keepDice > 10):** Each excess kept die converts to a flat +5 modifier. Kept dice are capped at 10.

**Example:** `14k8` → Step 1: 4 excess rolled → +2 kept → `10k10`. Step 3: 0 excess kept → final `10k10+0`.

**Example:** `16k12` → Step 1: 6 excess rolled → +3 kept → `10k15`. Keep clamped to 10 → `10k10`. Step 3: 5 excess kept (from 15) → +25 modifier → final `10k10+25`.

The `DiceResult.overflow` field is `null` when no compression was needed, or an `OverflowInfo` object showing the final compressed values.

**Internal signature (not exported):**

```typescript
function _compressOverflow(numDice: number, keepDice: number, modifier: number): OverflowInfo;
```

---

## Mathematical Properties

| Property                | Value                                              |
| ----------------------- | -------------------------------------------------- |
| Die range               | 1–10 per roll, unbounded with explosions           |
| Explosion chance        | 10% per die per roll                               |
| Expected value (1d10)   | ~6.11 (accounting for explosions)                  |
| Max pool (pre-compress) | Unlimited; compressed to ≤`10k10`+N                  |
| Max chain               | Theoretically infinite, practically 3–4 explosions |

---

## Modification Checklist

When editing `dice.ts`:

1. **Remember: primitives in another file** — Core explosion/overflow logic lives in `src/lib/dtd/dice-primitives.ts` (canonical source). If formula changes, **update both files**.
2. **Test explosion behavior** — verify 10→10→10→… chains terminate correctly
3. **Verify overflow compression** — other tools depend on consistent results via `dice-primitives.ts`
4. **Check type alignment** — types live in `types.ts`; keep signatures in sync
5. **Grep consumers** — Combat Tracker, NPC Generator import from this module
6. **Run tests** — `bun run test` covers dice logic
