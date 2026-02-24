# Writing for Tools and AI

Rules often serve multiple purposes: player reference, tool input (character builder JSON), AI context. Write for all three.

## Contents

- [Consistent Field Labels](#consistent-field-labels)
- [Standardized Values](#standardized-values)
- [Explicit Triggers and Conditions](#explicit-triggers-and-conditions)
- [Explicit Scope](#explicit-scope)
- [Defaults Before Exceptions](#defaults-before-exceptions)
- [Avoiding Vague Quantifiers](#avoiding-vague-quantifiers)
- [Explicit Rule Interactions](#explicit-rule-interactions)

---

## Consistent Field Labels

Use identical labels for identical concepts across all files:

| Concept       | Use This                          | Not This                       |
| ------------- | --------------------------------- | ------------------------------ |
| Dice pool     | `**Dice Pool:**`                  | "Roll:", "Pool:", "Check:"     |
| Resource cost | `**Cost:**`                       | "Spend:", "Pay:", "Requires:"  |
| Duration      | `**Duration:**`                   | "Lasts:", "For:", "Until:"     |
| Prerequisites | `**Prerequisites:**`              | "Requires:", "Needs:", "Mins:" |
| Type/Category | `**Type:**`                       | "Kind:", "Category:", "Class:" |
| Target        | `**Target Number:**` or `**TN:**` | "Difficulty:", "DC:"           |

---

## Standardized Values

### Dice Pools (D:TD Style)

Always `Characteristic + Skill` format, with keep notation:

- `Dexterity + Weaponry` (pool)
- `(Dex + Weaponry)k(Dex)` (full notation)
- `5k3` (calculated example)

With modifiers: `Dexterity + Weaponry + 1k0`

### Durations

| Term          | Meaning                          |
| ------------- | -------------------------------- |
| `Instant`     | Immediate, no duration           |
| `One Round`   | Until start of actor's next turn |
| `One Scene`   | Until scene ends                 |
| `One Session` | Until game session ends          |
| `Permanent`   | Always active unless dispelled   |

### Costs

Format as `[number] [resource type]`:

- `2 Resource`
- `1 Hero Point`
- `3 Resource, 1 Hero Point`
- `1 Resource per target`

### Action Types

| Term              | Meaning                     |
| ----------------- | --------------------------- |
| `Free Action`     | No action cost              |
| `Reaction`        | Triggered by specific event |
| `Half Action`     | Standard half action        |
| `Full Action`     | Full action (entire turn)   |
| `Extended Action` | Multiple rounds             |

---

## Explicit Triggers and Conditions

State what activates the rule clearly.

**Bad:** "The character can sometimes reroll 1s on large dice pools."

**Good:** "**Reroll 1s:** If the dice pool is `10+` dice, reroll any dice showing `1` once."

### Pattern

```markdown
**[Rule Name]:** When [specific condition], [specific effect].
```

---

## Explicit Scope

State who or what is affected.

**Bad:** "Damage is reduced."

**Good:** "The **target's** incoming damage is reduced by the character's Armor value."

### Scope Markers

- **Actor/Hero:** The character using the ability
- **Target:** Who/what the ability affects
- **Area:** Everything within a defined space
- **All allies/enemies:** Specified group

---

## Defaults Before Exceptions

Establish baselines, then list modifications.

```markdown
**Default:** Characters take one Full Action or two Half Actions per turn.

**Exception:** Celerity grants additional Half Actions equal to Celerity dots.
```

---

## Avoiding Vague Quantifiers

Replace imprecise language with specifics or mark as SM discretion.

| Vague             | Specific                                    |
| ----------------- | ------------------------------------------- |
| "usually works"   | "works if target's Resolve is 3 or lower"   |
| "most enemies"    | "enemies without the Fearless trait"        |
| "sometimes"       | "[specific condition]" or "(SM discretion)" |
| "a lot of damage" | "`5+` wounds"                               |

**If no specific value exists:** "This works against most enemies (SM discretion for powerful foes)."

---

## Explicit Rule Interactions

When rules modify or override others, state it:

| Interaction    | Phrase                                                       |
| -------------- | ------------------------------------------------------------ |
| Replaces       | "This **replaces** the normal Static Defense calculation."   |
| Stacks         | "This **stacks with** other accuracy bonuses."               |
| Exception      | "This is an **exception to** the one-action-per-turn rule."  |
| Overrides      | "This **overrides** the default damage type."                |
| Adds to        | "This **adds to** (does not replace) existing Armor."        |
| Does not stack | "This **does not stack** with similar bonuses; use highest." |

---

## Example: Before and After

**Before (ambiguous):**

> Characters who are really hurt fight worse. The penalties get bad if you take a lot of damage.

**After (precise):**

```markdown
### Wound Penalties

Damage imposes penalties to all dice pools (not static values):

| Wounds Remaining | Penalty |
| ---------------- | ------- |
| Full HP          | None    |
| 75% HP           | -1k0    |
| 50% HP           | -2k0    |
| 25% HP           | -3k0    |
| Critical (1 HP)  | -4k0    |

**Applied Penalty:** Based on current HP relative to maximum.

> **Note:** Penalties affect dice pools only, not Static Defense or other derived stats.
```

---

## JSON Alignment

When writing rules that will be mirrored in `tools/shared/data/` JSON files:

- Use consistent `id` naming: `kebab-case` for IDs
- Match field names between markdown headers and JSON keys
- Document formulas so JSON can include calculated defaults
- Flag any derived values that need recalculation

Example alignment:

```markdown
### Crushing Blow

_Prerequisites: Strength 3, Weaponry 2_
**Effect:** Add +1k1 to damage on All-Out Attacks.
```

```json
{
    "id": "crushing-blow",
    "name": "Crushing Blow",
    "prerequisites": { "strength": 3, "weaponry": 2 },
    "effect": "Add +1k1 to damage on All-Out Attacks."
}
```
