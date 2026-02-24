# Templates

Reusable structures for D:TD rule content types.

## Contents

- [Major Rule Section](#major-rule-section)
- [Class Entry](#class-entry)
- [Feat Entry](#feat-entry)
- [Spell Entry](#spell-entry)
- [Sword School / Gun Kata Entry](#sword-school--gun-kata-entry)
- [Race Entry](#race-entry)
- [Weapon Entry](#weapon-entry)
- [Stat Block](#stat-block)
- [Comparative Table](#comparative-table)
- [Named Callout](#named-callout)
- [Narrative Example](#narrative-example)
- [Open Questions Entry](#open-questions-entry)

---

## Major Rule Section

```markdown
# [Chapter Name]

## Overview

Brief description of what this chapter covers.

---

## Core Mechanics

### [Sub-mechanic Name]

[Rule description]

- **Dice Pool:** `[formula]k[keep]`
- **Target Number:** `[number]`
- **Success:** [criteria]

### See Also

- [Related rule](#section)
- [Related rule](other-file.md#section)
```

---

## Class Entry

For base and advanced classes:

```markdown
### [Class Name]

**Type:** Base Class | Advanced Class
**Prerequisites:** [If advanced class]
**Associated Skills:** [Skill list]
**Associated Sword School / Gun Kata:** [If any]

[Brief description of class theme]

#### Progression

| Level | Feats Gained             |
| ----- | ------------------------ |
| 1     | [Feat name], [Feat name] |
| 2     | [Feat name]              |
| 3     | [Feat name]              |
| 4     | [Feat name]              |
| 5     | [Feat name]              |

#### Special Rules

[Any class-specific mechanics or restrictions]
```

---

## Feat Entry

```markdown
### [Feat Name]

_Prerequisites: [Requirements, or "None"]_

**Effect:** [Core mechanical effect]

**Details:** [Additional rules, edge cases, clarifications]

> **Note:** [Special interactions if any]
```

### Compact Feat Entry

For lists with many similar feats:

```markdown
### [Feat Name]

_Prerequisites: [Requirements]_

[One-line effect description]
```

### Placeholder Feat Entry

For referenced but undefined feats:

```markdown
### [Feat Name]

_Prerequisites: [If known from class table]_

**Effect:** [Placeholder - feat referenced but not defined in source material]
```

---

## Spell Entry

```markdown
### [Spell Name]

**School:** [School Name]
**Rank:** [1-5]
**Cost:** [Resource cost]
**Casting Time:** [Action type]
**Range:** [Range]
**Duration:** [Duration]

**Effect:** [What the spell does]

**Overcast:** [Effect if cast with extra successes, if any]
```

### Compact Spell Table

```markdown
### [School Name] Spells

| Rank | Spell  | Cost   | Effect         |
| ---- | ------ | ------ | -------------- |
| 1    | [Name] | [Cost] | [Brief effect] |
| 2    | [Name] | [Cost] | [Brief effect] |
```

---

## Sword School / Gun Kata Entry

```markdown
### [School Name]

**Associated Weapon(s):** [Weapon types]
**Key Characteristic:** [Primary stat]

[Brief thematic description]

#### Rank 1 — [Tier Name]

##### [Technique Name]

**Cost:** [Resource if any]
**Action:** [Action type]

[Effect description]

#### Rank 2 — [Tier Name]

##### [Technique Name]

...

#### Rank 3 — [Tier Name]

##### [Technique Name]

...
```

---

## Race Entry

```markdown
### [Race Name]

**Size:** [Size category]
**Speed:** [Base speed]

**Characteristic Bonuses:** [+1 to X, etc.]
**Skill Bonuses:** [+1 to X skill, etc.]

**Racial Power:** [Name]
[Power description]

**Special Traits:**

- [Trait 1]
- [Trait 2]

**Languages:** [Starting languages]
```

---

## Weapon Entry

```markdown
### [Weapon Name]

**Category:** [Melee/Ranged] — [Subcategory]
**Class:** [Basic/Martial/Exotic]

| Stat        | Value                      |
| ----------- | -------------------------- |
| Damage      | `[XkY]` [Type]             |
| Penetration | [Value]                    |
| Range       | [If ranged]                |
| RoF         | [Rate of Fire, if ranged]  |
| Clip        | [Ammo capacity, if ranged] |
| Special     | [Keywords]                 |
```

### Compact Weapon Table

```markdown
| Weapon      | Damage  | Pen | Special     |
| ----------- | ------- | --- | ----------- |
| Chainsword  | `2k2` R | 2   | Tearing     |
| Power Sword | `2k2` E | 4   | Power Field |
```

---

## Stat Block

For NPCs and creatures:

```markdown
### [Creature Name]

**Type:** [Creature type]
**Size:** [Size category]

#### Characteristics

| Str | Dex | Con | Int | Wis | Wil | Cha | Fel | Com |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [X] | [X] | [X] | [X] | [X] | [X] | [X] | [X] | [X] |

#### Derived Stats

| Stat           | Value        |
| -------------- | ------------ |
| Static Defense | [Calculated] |
| Hit Points     | [Calculated] |
| Armor / Aura   | [X] / [X]    |

#### Attacks

- **[Attack Name]:** `[Pool]k[Keep]`, damage `[XkY]` [Type], [Special]

#### Special Abilities

- **[Ability Name]:** [Effect]

#### Skills

[Relevant skills and ratings]
```

---

## Comparative Table

For stats, modifiers, options:

```markdown
### [Table Title]

| [Column 1] | [Column 2] | [Column 3] |
| ---------- | ---------- | ---------- |
| Value 1    | Value 2    | Value 3    |
| Value 4    | Value 5    | Value 6    |
```

### Modifier Table Example

```markdown
### Combat Modifiers

| Situation             | Modifier |
| --------------------- | -------- |
| Aiming (Half Action)  | +1k0     |
| Called Shot           | -2k0     |
| Prone Target (Ranged) | -1k0     |
| Flanking              | +1k0     |
```

---

## Named Callout

For sidebars, warnings, and supplementary content:

```markdown
> **[Callout Title]**
>
> [Content of the callout.]
```

### Common Variants

**Warning/Note:**

```markdown
> **Note:** This rule's application in [situation] is unclear.
```

**Clarification:**

```markdown
> **Clarification Note:** [Resolution from open-questions]
```

---

## Narrative Example

For in-game examples that illustrate mechanics:

```markdown
> _Example: [Character name] [performs action]. She rolls `[dice pool]` and gets [result]. [Outcome description]._
```

### Extended Example

```markdown
> _Example: Iris is grappling an ork. She rolls `Strength + Brawl` (`5k3`) against the ork's `4k2`. Iris gets 22, the ork gets 15. With 7 points difference, Iris maintains the grapple and may apply a grapple action._
```

---

## Open Questions Entry

For tracking ambiguities in `open-questions.md`:

```markdown
### Entry [ID]: [Short Title]

**Status:** Open | Resolved | Applied
**Category:** Contradiction | Missing Content | Gray Area | Calculation Error
**Source:** [File(s) where issue appears]
**Line(s):** [Approximate line numbers]

**Issue:**
[Clear description of the ambiguity or problem]

**Possible Interpretations:**

1. [Interpretation A]
2. [Interpretation B]

**Resolution:** _(if resolved)_
[Chosen interpretation and reasoning]

**Applied:** _(if applied)_

- [x] [File]: [Description of change]
```

---

## Usage Notes

1. **Copy and fill:** Use templates as starting points
2. **Remove unused sections:** Don't leave empty placeholders
3. **Maintain consistency:** Same template for same content types
4. **Adapt as needed:** Templates are guides, not rigid requirements
