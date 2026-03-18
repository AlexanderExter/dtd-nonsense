---
name: ttrpg-rules-editor
description: "Use when editing rules content, formatting rulebook text, processing chapters, or working with D:TD source material."
---

# TTRPG Rules Editor

Edit tabletop RPG rulebooks into clear, scannable markdown references. Adapted for D:TD's XkY dice system and hybrid mechanics.

## Prime Directive

**Preserve content. Organize and format.**

- Preserve all mechanical information: dice pools, difficulties, target numbers, formulas, modifiers, special rules, edge cases
- Preserve examples that show mechanics in action (e.g., "throws sand in eyes" for Distract)
- Never remove nuance; never invent rulings
- Preserve the author's voice and tone. Do not sanitize informal language, humor, profanity, or irreverent phrasing. The source material has a deliberate style — rewriting casual prose into formal technical language is content loss, not improvement
- Organize and format for scannability without cutting content

**Directory determines editing intent:**

- **`books/`** — Core reference material. Preserve all content. Clean artifacts, organize, apply formatting.
- **`cleaned-references/`** — Succinct combined reading references. Compression and reformatting are appropriate here.

---

## Git Workflow

Follow the git workflow in [docs/project-conventions.md](../../docs/project-conventions.md#git-workflow). Key points: all editing work on dedicated branches, commit incrementally, review via diff.

**Subagent discipline:** When dispatching subagents, always specify the exact branch name and state "Do NOT create a new branch." See the Delegating to Subagents section below for the full prompt pattern.

---

## Directory Structure

Key locations for editorial work: `books/` (core reference, `.mdx`), `cleaned-references/` (condensed references, `.mdx`), `docs/editorial/open-questions.md` (ambiguities), `data/` (JSON game data synced with cleaned-references).

### Content Maturity

| Directory             | Content State              | Editing Approach                              |
| --------------------- | -------------------------- | --------------------------------------------- |
| `books/`              | Authoritative, per-chapter | Clean and organize. Preserve all content      |
| `cleaned-references/` | Condensed references       | Full editorial treatment. Compression allowed |

**`cleaned-references/`:** Compress verbose meta-language, cut purely atmospheric flavor, standardize terminology, verify against `books/` sources.

**`books/`:** Clean artifacts, organize, apply formatting, convert prose formulas to notation. Do NOT condense or remove. Annotate corrections with `<!-- EDITOR: description -->` HTML comments as audit trail.

### Language Standard

Standardize spelling to **American English** (e.g., "armor" not "armour", "color" not "colour"). Contractions are acceptable—RPG rulebooks use them for approachable tone.

---

## D:TD-Specific Conventions

For terminology, pronouns, dice notation, formulas, and formatting basics, see [docs/project-conventions.md](../../docs/project-conventions.md#dtd-conventions). The most critical rules for editorial work:

- **Test** vs **Check** — "Check" is degrees of failure only; dice rolls are always "Tests"
- **Game terms always capitalized** — Static Defense, Hit Points, Hero Points, etc.
- Preserve the author's voice — informal tone, humor, and asides are deliberate

---

## Source Structure

When receiving raw chapter dumps, identify the section type before processing:

| Section Type               | Action                               |
| -------------------------- | ------------------------------------ |
| **Fluff/fiction intro**    | Skip or extract setting details only |
| **Core mechanics**         | Preserve fully                       |
| **Class/Feat/Power lists** | Use structured templates             |
| **Story Master guidance**  | Skip unless mechanics-relevant       |

---

## Source Cleanup

Raw material often contains artifacts from extraction. Fix these without altering meaning.

### Encoding Hazard

See [project-conventions.md — PowerShell Encoding](../../docs/project-conventions.md#powershell-encoding-historical). Never use PowerShell `Set-Content` for non-ASCII files; use agent edit tools instead.

### OCR Merged Words

PDF extraction frequently merges words at column breaks. These are invisible to casual reading but pervasive. Use iterative regex scanning:

```
# Common merged-word patterns — search with \b anchors
\b(ofthe|inthe|tothe|onthe|forthe|andthe|isthe|bythe|atthe)\b
\b(toa|ina|ona|asa|fora|witha|bya|hasa)\b
\b(canbe|maybe|mustbe|willbe|tobe|notbe)\b
\b(doesnot|cannot|isnot|hasnot|willnot|didnot)\b
```

A first pass catches ~30% of merged words. Systematic sweeps with expanding patterns find the rest. Expect 3-4 passes to reach near-zero remaining.

### Fix

| Issue                     | Action                                                |
| ------------------------- | ----------------------------------------------------- |
| **Typos/encoding errors** | Correct spelling, punctuation, stray characters       |
| **Extraction artifacts**  | Remove garbage text, broken formatting, layout debris |
| **Merged words**          | Split at word boundaries (see OCR Merged Words above) |
| **Duplication**           | Remove exact duplicates; flag near-duplicates         |
| **Truncation**            | Flag incomplete content; never invent                 |
| **Disorder**              | Reorganize logically                                  |

### Remove

| Item                     | Reason                                                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page references**      | `(p.45)`, `(Core p.123)` — replace with cross-references where a clear target exists (e.g., `(p.262)` → `(see Conditions)`). Remove without replacement only when no target is identifiable |
| **Source-only notation** | Headers, footers, "continued on next page"                                                                                                                                                  |
| **Layout artifacts**     | Sidebar markers, figure references to missing images                                                                                                                                        |

### Log (Don't Resolve)

| Issue                 | Action                                                        |
| --------------------- | ------------------------------------------------------------- |
| **Inconsistencies**   | Same rule stated differently → log to open-questions          |
| **Contradictions**    | Rules that conflict → log to open-questions                   |
| **Truncated content** | Missing endings → log to open-questions                       |
| **"Obvious errors"**  | What looks wrong may be intentional → log, don't fix silently |

---

## Faithful Integration

When integrating content from one source file into another (e.g., moving Book 2 appendix content into Book 1), the goal is **transcription, not paraphrase.**

### Rules

1. **Use the original text verbatim.** Fix only extraction artifacts: run-on words from PDF column breaks, broken tables, encoding errors, missing whitespace
2. **Do not restructure.** Don't split continuous numbered lists into sub-sections. Don't add headings the original didn't have. Don't reorder content
3. **Do not reformat for "consistency."** Don't bold game terms, backtick-format dice notation, or convert prose to bullet lists unless the target file's existing format strictly requires it and the change is purely visual
4. **Do not improve the writing.** The source's phrasing, humor, asides, and rhetorical questions are the author's deliberate choices. "Heh, now he's going to be a problem for someone isn't he?" stays exactly as written
5. **Mark the integration.** Add `> **Integrated:** Content from [source].` at the top of the integrated section

### Verification

After integration, verify: (1) **Word count** — output comparable to input; shorter means content lost. (2) **Spot-check** — 3-5 distinctive sentences match word-for-word. (3) **Structure** — same heading levels, list formats, paragraph breaks.

### In Subagent Reports

When a subagent performs integration, their report must include:

- Source location (file + line range) and target location
- Word count: source vs integrated
- List of any phrasing changes made and why (extraction artifact fixes only)
- Explicit confirmation: "Source text preserved verbatim" or list of deviations

---

## Open Questions File

Track ambiguities in `docs/editorial/open-questions.md`. See [templates.md](references/templates.md) for entry format and the `open-question-manager` skill for the full lifecycle.

---

## Delegating to Subagents

Subagents don't inherit context. The lead agent must provide everything they need.

### Lead Agent Responsibilities

1. **Give the subagent a clear, self-contained task** — file path, specific deliverables, acceptance criteria
2. **Tell it to read the skill files** it needs — provide paths, don't paste entire skills inline
3. **Specify the directory** — `books/` (preserve everything) or `cleaned-references/` (compression allowed)
4. **Require a structured report** — what changed, what was logged, what's blocked

### Subagent Prompt Pattern

```
**Agent:** [Use appropriate agent type for the task: editor, formatter, integrator]

**Task:** [One sentence: what to do and what file]

**Read these first:**
- `.github/copilot-skills/ttrpg-rules-editor/SKILL.md`
- `.github/copilot-instructions.md`

**File:** `cleaned-references/[FILENAME].mdx`

**Branch:** You MUST commit directly to branch `[branch-name]`. Do NOT create a new branch.

**Directory context:** This is in cleaned-references/ — compression and reformatting are appropriate.

**Source hierarchy:** Books (`books/`) are canonical. `docs/editorial/open-questions.md` has resolutions. Never invent rulings.

**Voice:** Preserve the source material's tone exactly. Do not sanitize informal language, humor, or casual phrasing. Integration = transcription, not paraphrase.

**Deliverables:**
- Edit the file
- Log any ambiguities to `docs/editorial/open-questions.md`
- Report: files modified, sections processed, open questions logged, anything blocked
- Confirm: source text preserved verbatim (or list specific phrasing changes and justification)
```

**Critical:** Always include the `**Branch:**` line. Without it, subagents create their own branches, causing merge conflicts and orphaned work.

---

## Editing Workflow

### Single-File Process

1. **Create a branch** for the task
2. **Read the entire file** before editing
3. **Check docs/editorial/open-questions.md** for applicable resolutions
4. **Clean artifacts first** (typos, garbage, duplicates)
5. **Work section by section**, top to bottom
6. **For each section:**
    - Identify mechanical content (must preserve exactly)
    - Identify verbose language (can compress in `cleaned-references/`)
    - Identify ambiguities (log to open-questions)
7. **Apply formatting** for scannability
8. **Commit** with descriptive message
9. **Final pass:** verify no mechanics lost via `git diff`

### Multi-File Projects

1. **Plan thoroughly** — inventory files, assess scope, identify dependencies
2. **Check docs/editorial/open-questions.md** — apply relevant resolutions during processing
3. **Process independent files in parallel** (2-3 subagents) or sequentially
4. **Commit after each file** — don't let changes pile up uncommitted
5. **Dependent files process after their dependencies** (e.g., classes before feats that reference them)
6. **Track cross-references** needed between files
7. **Track superseded approaches** — if a new strategy replaces an old one (e.g., in-place cleaning vs. chapter replacement), note it in the plan and schedule the old branch for deletion
8. **Review open-questions** after all files done

---

## Editorial Principles

### Constraints (Do Not Violate)

| Area            | Preserve Exactly                                          |
| --------------- | --------------------------------------------------------- |
| **Mechanics**   | Dice pools, difficulties, target numbers, formulas        |
| **Specificity** | Exact conditions, all modifiers, all restrictions, timing |
| **Edge Cases**  | Examples that clarify boundaries, optional rules          |

### Improvements (Apply Freely)

| Area              | Action                                                                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Verbose prose** | Compress meta-language and filler ("When a character wishes to attempt to..." → direct statement)                                                                          |
| **Structure**     | Group related mechanics; use clear headings; order sections from broad overviews to specific subtopics (general → specific; e.g., "Combat" before "Ranged Combat Actions") |
| **Formatting**    | Bullets, tables, bold, blockquotes; break up word walls                                                                                                                    |

### Flavor Text Heuristic

**Keep:** Flavor that shows mechanics in action (e.g., "throws sand in eyes" for Distract)
**Cut:** Purely atmospheric flavor (e.g., "the martial artist moves like wind through reeds")

---

## Formatting Essentials

Create scannable references, not word walls. See [formatting.md](references/formatting.md) for detailed conventions.

### Quick Reference

| Element        | Format                                    |
| -------------- | ----------------------------------------- |
| Dice pools     | Inline code: `` `Dexterity + Weaponry` `` |
| Dice notation  | Inline code: `` `5k3` ``                  |
| Target numbers | Inline code: `` `TN 15` ``                |
| Key terms      | **Bold** (first occurrence only)          |
| File names     | kebab-case: `combat-mechanics.md`         |

---

## Handling Ambiguities

**Never invent rulings.** Preserve ambiguity in text, add a clarification note, and log in `docs/editorial/open-questions.md`. See the `open-question-manager` skill for the full workflow.

---

## Red Flags — Stop and Reconsider

If you notice yourself doing any of these, pause and verify your approach:

- **Cutting content from `books/`** — That directory preserves everything; compression is for `cleaned-references/`
- **Bolding every occurrence** of a term — Bold first definitional use only
- **Adding excessive subsections** to short content — A 30-line rule doesn't need 5 subheadings
- **Leaving British spelling** unchanged — Standardize to American English
- **Silently fixing "obvious errors"** in source — Log to open-questions; the source may be intentional
- **Inventing rulings** to resolve ambiguity — Preserve ambiguity; note it for GM discretion
- **Rewriting source prose into your own words** — Integration means transcription, not paraphrase. If you're composing new sentences to express the source's ideas, you're rewriting
- **Editing without a branch** — Always branch before modifying files
- **Writing scripts for file edits** — Edit directly; scripts produce untraceable changes and have caused destructive mistakes
- **Scripting context-dependent terminology** — If the same word has multiple valid meanings (e.g., \"check\"), use manual review with an audit checklist, not automated find-replace- **Leaving game terms lowercase** — Test, Static Defense, Mental Defense, Hero Points, Hit Points etc. must always be capitalized as game terms. Lowercase "test" or "static defense" in rules text is a bug
- **Ignoring tool data files** — When editing mechanics in `cleaned-references/`, verify consistency with `data/` JSON and `src/lib/dtd/` implementations
- **Reorganizing content that's merely imperfect** — Reorganize only when content is CLEARLY under the wrong heading or CLEARLY interrupts an unrelated passage. Dense-but-self-contained sections don't need restructuring
- **Rewriting unclear-but-functional phrasing** — Only rewrite prose if a player could misapply the mechanic as written. Roundabout ≠ broken
- **Converting `X` to `×` in weapon stat blocks** — `X` in weapon/attack damage columns is the Explosive damage type abbreviation, not a multiplication sign. Only convert `x` → `×` in formulas, drive multipliers, and similar mathematical contexts

---

## Common Rationalizations

Observed failure patterns when processing rules content:

| Rationalization                         | Reality                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| "Bolding helps readability"             | Over-bolding creates visual noise; bold first occurrence only                          |
| "Adding sections improves organization" | Over-segmentation fragments short content                                              |
| "The meaning is preserved"              | Check word count—did you actually lose content?                                        |
| "This is obviously wrong in source"     | Log it; don't silently correct                                                         |
| "Tables are always better"              | Tables suit comparative data; lists suit sequential items                              |
| "I'll commit everything at the end"     | Commit at logical checkpoints; large diffs are unreviewable                            |
| "I'm making it clearer"                 | You're replacing the author's voice. If the original is understandable, leave it alone |
| "The tone is unprofessional"            | The tone is the author's deliberate choice. Informal ≠ wrong                           |
| "One subagent per file is fine"         | Good for editorial judgment tasks; use batched subagents for bulk mechanical fixes     |

---

## References

- [formatting.md](references/formatting.md) — Detailed markdown conventions
- [templates.md](references/templates.md) — Reusable structures for rule entries
- [ai-parsing.md](references/ai-parsing.md) — Machine-parseable formatting guidance

---

## Editing Tool Limitations

The `replace_string_in_file` tool requires exact string matching. Known issues:

- **Escaped markdown characters** (`\_`, `\*`, `\|`) in source files may not match when typed literally. If a replacement fails on a line containing escaped characters, delegate to a subagent or use `read_file` to copy the exact string
- **Long oldString blocks** increase the chance of whitespace mismatch. Keep replacements focused (5-15 lines) with sufficient unique context
- **Multiple identical matches** cause failures. Add surrounding context lines to disambiguate

---

## Checklist: Before Committing

- [ ] On a feature branch (not main)
- [ ] Artifacts cleaned (typos, garbage, page refs)
- [ ] All dice pools/formulas preserved exactly
- [ ] All numerical values unchanged
- [ ] Terminology consistent throughout (D:TD standards)
- [ ] Game terms capitalized (Test, Static Defense, Hero Points, etc.)
- [ ] Pronouns follow convention (she/her for Heroes, he/him for opponents, they/them for SM)
- [ ] Ambiguities logged to docs/editorial/open-questions.md
- [ ] No word walls; clear visual hierarchy
- [ ] Cross-references accurate
- [ ] Tool data consistency checked (if mechanics were edited)
- [ ] `git diff` reviewed — no unintended changes, no whitespace-only diffs
- [ ] Commit message describes what changed and why
