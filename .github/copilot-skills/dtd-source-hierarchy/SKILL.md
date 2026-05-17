---
name: dtd-source-hierarchy
description: "Use when doing D:TD content editing, rule verification, ambiguity resolution, or content sourcing."
---

# Source Hierarchy Skill

## Prime Directive

**Books are canonical. Forums are supplementary. Never invent.**

For the definitive authority tier definitions (Tier 1: Books, Tier 2: Open Questions, Tier 3: Forums), see [docs/project-conventions.md — Source Hierarchy](../../docs/project-conventions.md#source-hierarchy).

This skill provides the editorial **workflow** for applying the hierarchy: how to resolve ambiguities, how to annotate sources, and what actions are prohibited.

---

## Resolution Protocol

When encountering unclear rules:

```text
1. Search books/ for the original book text
   ↓ Found? → Use book text as authoritative
   ↓ Unclear? → Continue

2. Search forums for developer clarification
   ↓ Found developer post? → Apply with SOURCE annotation
   ↓ Found consensus? → Note as community interpretation
   ↓ Nothing useful? → Continue

3. Preserve the ambiguity
   → Do NOT invent a ruling
   → Preserve ambiguity in text
   → Add a clarification note in the source file
```

---

## Annotation Standards

### Forum-Sourced Content

Always annotate content derived from forums:

```markdown
<!-- SOURCE: forum - [thread URL] -->

> **Community Clarification:** [Interpretation from forums]
```

### Book-Sourced Clarifications

When book text resolves an ambiguity:

```markdown
<!-- SOURCE: Book 1, p.XX -->

> **Clarification Note:** [Resolution text]
```

### Unresolved Ambiguities

When preserving unclear rules:

```markdown
> **Note:** This rule's application in [situation] is unclear.
```

---

## Prohibited Actions

| Action                                 | Why Prohibited                            |
| -------------------------------------- | ----------------------------------------- |
| Inventing rulings                      | Violates "never invent" doctrine          |
| Treating forum posts as canonical      | Variable quality, not authoritative       |
| Silently "fixing" book text            | May be intentional; preserve ambiguity    |
| Using forum content without annotation | Must be traceable                         |
