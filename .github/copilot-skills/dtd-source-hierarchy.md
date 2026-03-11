# Source Hierarchy Skill

**Skill type:** Doctrine (source authority chain)

**Triggers:** Any D:TD content editing, rule verification, ambiguity resolution, content sourcing

---

## Prime Directive

**Books are canonical. Forums are supplementary. Never invent.**

All D:TD content follows a strict authority chain. When sources conflict, higher-tier sources win. When sources are silent, escalate up the chain or document as an open question.

---

## Authority Tiers

### Tier 1: Books (Canonical)

**Location:** `books/`

- `book-1-dungeons-the-dragoning/` — Core Rulebook (23 per-chapter files)
- `book-2-for-a-few-subtitles-more/` — Expansion (30 per-chapter files)

**Authority:** Absolute for core mechanics. Even apparent errors are preserved until confirmed via docs/editorial/open-questions.md.

**Usage:**

- Primary source for all rule text
- Per-chapter files with YAML frontmatter for easy navigation
- Reference when cleaned-references content is incomplete

### Tier 2: Open Questions with Resolutions

**Location:** `docs/editorial/open-questions.md`

**Authority:** Enriches Tier 1 by documenting:

- Contradictions between book passages
- Errata and corrections
- Calculation verifications
- Missing content identification

**Usage:**

- Check before assuming a rule is unclear
- Resolutions here override ambiguous book text
- Applied resolutions become authoritative

### Tier 3: Community Forums (Supplementary)

**Location:** https://whitewizardsworkshop.proboards.com/

**Authority:** Clarifies ambiguities not resolved by Tiers 1-2. Variable quality—never treat as canonical without verification.

**Usage:**

- Last resort when books and open-questions are silent
- Developer posts have higher weight than general discussion
- Popular consensus on mechanics can inform interpretations

**Required annotation when using forum content:**

```markdown
<!-- SOURCE: forum - https://whitewizardsworkshop.proboards.com/thread/XXX -->
```

---

## Resolution Protocol

When encountering unclear rules:

```
1. Search books/ for the original book text
   ↓ Found? → Use book text as authoritative
   ↓ Unclear? → Continue

2. Check docs/editorial/open-questions.md for existing entry
   ↓ Has resolution? → Apply resolution
   ↓ No entry? → Continue

3. Search forums for developer clarification
   ↓ Found developer post? → Apply with SOURCE annotation
   ↓ Found consensus? → Note as community interpretation
   ↓ Nothing useful? → Continue

4. Document as new open question
   → Do NOT invent a ruling
   → Preserve ambiguity in text
   → Add entry to docs/editorial/open-questions.md
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
> **Note:** This rule's application in [situation] is unclear. See open-questions.md entry #XX.
```

---

## Prohibited Actions

| Action                                 | Why Prohibited                            |
| -------------------------------------- | ----------------------------------------- |
| Inventing rulings                      | Violates "never invent" doctrine          |
| Treating forum posts as canonical      | Variable quality, not authoritative       |
| Silently "fixing" book text            | May be intentional; log to open-questions |
| Ignoring open-questions resolutions    | They exist for a reason                   |
| Using forum content without annotation | Must be traceable                         |
