---
name: open-question-manager
description: "Use when managing open questions, resolving ambiguity, applying resolutions, cleaning up open-questions, or archiving resolved entries."
---

# Open Question Manager Skill

## Purpose

Manage the full lifecycle of rule ambiguities: documenting, resolving, applying to source files, and archiving completed entries. Maintains `docs/editorial/open-questions.md` as a clean, organized tracking document.

---

## File Structure

`docs/editorial/open-questions.md` should follow this structure:

```markdown
# Open Questions

Tracked ambiguities and contradictions in D:TD documentation.

## Status Legend

- **Open** — Unresolved, needs investigation
- **Resolved** — Resolution determined, not yet applied to source files
- **Applied** — Resolution applied to source files, ready for archive

---

## Open

[Active entries needing resolution]

## Resolved (Pending Application)

[Entries with resolutions ready to apply]

## Archive

[Completed entries for reference]
```

---

## Entry Format

Each entry should follow this template:

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

## Workflow: Adding New Entry

```
1. ASSIGN next Entry ID (sequential)

2. DETERMINE category:
   - Contradiction: Same rule stated differently
   - Missing Content: Referenced but undefined
   - Gray Area: Vague conditions, unclear interactions
   - Calculation Error: Formula produces wrong value

3. DOCUMENT in Open section:
   - Clear issue description
   - File and line references
   - All plausible interpretations (minimum 2)

4. DO NOT RESOLVE immediately
   - Document and move on
   - Resolution is a separate step
```

---

## Workflow: Resolving Entry

```
1. INVESTIGATE using source hierarchy:
   Tier 1: Check books/ for book text
   Tier 2: Check existing resolutions in docs/editorial/open-questions.md
   Tier 3: Search forums for developer clarification

2. CHOOSE resolution:
   - If book is clear → use book text
   - If developer clarification exists → cite forum thread
   - If community consensus → note as interpretation
   - If truly ambiguous → recommend "GM discretion" with options

3. UPDATE entry:
   - Change Status to "Resolved"
   - Add Resolution section with reasoning
   - Add source citation if using forums

4. MOVE entry from "Open" to "Resolved (Pending Application)"
```

---

## Workflow: Applying Resolution

This is the key step that updates source files.

```
1. READ the resolution from docs/editorial/open-questions.md

2. LOCATE target in source file(s)
   - Find the rule text that needs clarification
   - Identify insertion point for clarification note

3. INSERT clarification note:

   > **Clarification Note:** [Resolution text explaining the ruling]

   Or for forum-sourced resolutions:

   <!-- SOURCE: forum - [thread URL] -->
   > **Community Clarification:** [Resolution text]

4. UPDATE entry:
   - Change Status to "Applied"
   - Add Applied section listing changes made
   - Include file names and brief descriptions

5. VERIFY the change:
   - Read the modified section
   - Confirm clarification is clear and properly placed
```

---

## Workflow: Archive and Cleanup

Run periodically to maintain file organization.

```
1. IDENTIFY entries with Status: Applied

2. MOVE to Archive section:
   - Keep full entry content
   - Entries ordered by ID (newest last)

3. RENUMBER if needed:
   - IDs should remain stable (don't renumber archived entries)
   - New entries get next sequential ID

4. CLEAN formatting:
   - Consistent heading levels (### for entries)
   - Proper spacing between entries
   - Remove duplicate entries
   - Fix broken links

5. VERIFY structure:
   - Open section has only Open entries
   - Resolved section has only Resolved entries
   - Archive section has only Applied entries
```

---

## Quick Commands

### List Open Entries

```
1. Read open-questions.md
2. Extract entries with Status: Open
3. Report: ID, Title, Category, Source file
```

### Add New Entry

```
Input: file, description, optional interpretations
1. Read current open-questions.md
2. Find highest entry ID, increment
3. Create entry from template
4. Insert in Open section
5. Save file
```

### Resolve Entry

```
Input: entry ID, resolution text, source citation (optional)
1. Find entry by ID
2. Update Status to Resolved
3. Add Resolution section
4. Move to Resolved section
5. Save file
```

### Apply Entry

```
Input: entry ID
1. Read resolution from entry
2. Open source file(s) listed in entry
3. Insert clarification note(s)
4. Update entry Status to Applied
5. Add Applied section with changes
6. Save both files
```

### Cleanup

```
1. Read open-questions.md
2. Move all Applied entries to Archive
3. Reorganize sections
4. Fix formatting issues
5. Save file
6. Report: X entries archived, Y remain open, Z pending application
```

---

## Categories Reference

| Category          | Description                                     | Example                            |
| ----------------- | ----------------------------------------------- | ---------------------------------- |
| Contradiction     | Same rule stated differently in multiple places | Dodge as parry vs dodge bonus      |
| Missing Content   | Referenced but not defined                      | Feat in class table, no feat entry |
| Gray Area         | Vague conditions, unclear interactions          | Does X stack with Y?               |
| Calculation Error | Formula produces wrong stated value             | NPC stat doesn't match formula     |
