# Formatting Reference

Detailed markdown conventions for D:TD rule references.

## Contents

- [Markdown Basics](#markdown-basics)
- [Named Callouts and Sidebars](#named-callouts-and-sidebars)
- [Tiered Entries](#tiered-entries)
- [Code for Dice Mechanics](#code-for-dice-mechanics)
- [List Formatting](#list-formatting)
- [Cross-Referencing](#cross-referencing)
- [Visual Hierarchy Examples](#visual-hierarchy-examples)
- [Clarifications Sections](#clarifications-sections)

---

## Markdown Basics

For general markdown standards (headings, lists, tables, formatting), see [markdown.instructions.md](../../../.github/instructions/markdown.instructions.md). This file covers D:TD editorial-specific formatting patterns only.

### Tables vs Lists

**Prefer tables** when comparing items across same attributes, showing stats/modifiers/costs, or condensing information.

**Use lists** when items have varying attributes, order matters, or for simple enumeration.

---

## Named Callouts and Sidebars

Use blockquotes with bold titles for sidebars, warnings, and supplementary content.

### Basic Format

```markdown
> **Callout Title**
>
> Content of the callout goes here. Can span multiple paragraphs.
```

### Common Variants

**Notes and warnings:**

```markdown
> **Note:** This rule's application in [situation] is unclear.
```

**Clarification notes (from open-questions resolutions):**

```markdown
> **Clarification Note:** [Resolution text explaining the ruling]
```

**Community-sourced content:**

```markdown
<!-- SOURCE: forum - https://whitewizardsworkshop.proboards.com/thread/XXX -->

> **Community Clarification:** [Interpretation from forums]
```

### Narrative Examples

Use italics for in-game examples within blockquotes:

```markdown
> _Example: Iris the Fighter attacks with her chainsword. She rolls `Dexterity + Weaponry` (`4 + 3 = 7k4`) against the ork's Static Defense of 25. She gets 28, scoring 1 raise._
```

### Stat Blocks in Callouts

```markdown
> **Servitor Template**
>
> - **Static Defense:** 15
> - **Hit Points:** 10
> - **Armor:** 2
> - **Attacks:** Claws `5k3`, damage `1k1+2`
```

---

## Tiered Entries

Many D:TD elements have ranks or levels.

### Class Feature Progression

```markdown
### Champion

| Level | Feats Gained                            |
| ----- | --------------------------------------- |
| 1     | Armor Proficiency (Heavy), Weapon Focus |
| 2     | Crushing Blow                           |
| 3     | Smite                                   |
```

### Sword School Ranks

```markdown
### Fell Hand

**Rank 1 — Basic Techniques**

- **Crushing Grip:** [Effect description]

**Rank 2 — Intermediate Techniques**

- **Iron Grasp:** [Effect description]
```

### Magic School Spells

```markdown
### Pyromancy

| Rank | Spell         | Effect                        |
| ---- | ------------- | ----------------------------- |
| 1    | Flame Bolt    | `1k1` Energy damage at range  |
| 2    | Burning Hands | Cone attack, `2k1` Energy     |
| 3    | Fireball      | Area `3k2` Energy, 10m radius |
```

---

## Code for Dice Mechanics

### Inline Code (Primary)

Use for dice notation within flowing text:

```markdown
Roll `Dexterity + Weaponry` (forming a `7k4` pool) against TN `15`.
Every 5 points above TN grants 1 raise.
```

**Use for:**

- Dice pools: `` `Strength + Brawl` ``
- Keep notation: `` `5k3` ``
- Target numbers: `` `TN 20` ``
- Modifiers: `` `+1k0` ``, `` `-2k0` ``
- Damage: `` `3k2 Rending` ``

### Structured Stat Blocks

For creature/character stats, use tables or formatted lists:

```markdown
| Stat           | Value |
| -------------- | ----- |
| Static Defense | 25    |
| Hit Points     | 14    |
| Armor / Aura   | 4 / 2 |
```

---

## List Formatting

For basic list conventions (dashes, numbering, indentation), see [markdown.instructions.md](../../../.github/instructions/markdown.instructions.md). Use **tight** lists (no blank lines) for short items and **loose** lists (blank lines between) for multi-line items.

---

## Cross-Referencing

### Anchor Links

Headings auto-create anchors: `## Combat Rules` → `#combat-rules` (spaces become hyphens, lowercase).

### Link Formats

**Same file:** `[Link Text](#section-name)`

**Different file:** `[Link Text](filename.md#section-name)`

### Best Practices

1. Use descriptive link text (not "see here")
2. Link to specific sections, not just file tops
3. Add "See Also" sections at end of major rules
4. Consider bidirectional links when A references B

---

## Visual Hierarchy Examples

### Word Wall (Bad)

```markdown
When a character wishes to make an attack, they roll their Dexterity attribute plus their Weaponry skill, keeping a number of dice equal to Dexterity. The target number is the enemy's Static Defense. If the roll equals or exceeds the target number, the attack hits. Then damage is calculated by adding the weapon's damage rating, and the defender may apply their Armor value to reduce the damage.
```

### Scannable Format (Good)

```markdown
## Attack Resolution

### Attack Roll

- **Dice Pool:** `Dexterity + Weaponry`
- **Keep:** Dexterity dice
- **Target:** Enemy's Static Defense

### Damage

- **Formula:** `Weapon Damage + Bonuses`
- **Reduction:** Defender applies Armor against physical, Aura against magical

> **Hit:** Attack succeeds if roll ≥ Static Defense. Each 5 above = 1 raise.
```

---

## Collapsible Sections

Use for optional rules or extended examples:

```html
<details>
    <summary><strong>Optional: Extended Grappling Rules</strong></summary>

    ### Grappling Details [Extended content here...]
</details>
```

---

## Clarifications Sections

When a topic has edge cases, errata, or frequently misunderstood rules, add a clarifications section at the end.

### Format

```markdown
## Specific [Topic] Clarifications

- **Rule Name:** Brief clarification of how it works.
- **Another Rule:** Another clarification.
```

### When to Use

- Rules frequently misinterpreted
- Official errata (from 99-Appendix-Archive.mdx)
- Edge cases that come up in play
- Timing or interaction clarifications

Place at the end of the relevant section or file, after all main content.
