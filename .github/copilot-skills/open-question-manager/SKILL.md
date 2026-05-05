---
name: open-question-manager
description: "Historical reference — the open question tracking system has been fully resolved and archived."
---

# Open Question Manager Skill

## Status: Archived

All 48 tracked rule ambiguities have been resolved and their resolutions applied to the source files. The `docs/editorial/open-questions.md` tracking file has been retired.

---

## Handling New Ambiguities

If a new rule ambiguity is discovered during editing:

1. **Follow the source hierarchy** — see the `dtd-source-hierarchy` skill
2. **Add a clarification note** directly in the source file where the ambiguity appears
3. **Do NOT invent a ruling** — preserve the ambiguity and note it for GM discretion
4. **Annotate with an HTML comment** for traceability:

```markdown
<!-- AMBIGUITY: [brief description of the unclear rule] -->
> **Note:** This rule's application in [situation] is unclear. [Options or GM guidance if applicable.]
```

---

## Categories Reference

These categories remain useful for classifying ambiguities when encountered:

| Category          | Description                                     | Example                            |
| ----------------- | ----------------------------------------------- | ---------------------------------- |
| Contradiction     | Same rule stated differently in multiple places | Dodge as parry vs dodge bonus      |
| Missing Content   | Referenced but not defined                      | Feat in class table, no feat entry |
| Gray Area         | Vague conditions, unclear interactions          | Does X stack with Y?               |
| Calculation Error | Formula produces wrong stated value             | NPC stat doesn't match formula     |
