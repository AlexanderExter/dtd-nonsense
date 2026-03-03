---
description: "Markdown content standards for DTD rulebook documentation"
applyTo: "**/*.md"
---

# Markdown Standards for D:TD

Rules for editing markdown files in this tabletop RPG documentation project. These complement the conventions in `docs/project-conventions.md`.

## Front Matter

Cleaned-reference files use **Starlight YAML front matter** injected by `dtd starlight-prep`:

```yaml
---
title: "Core Rules"
description: "Dice system, tests, raises, and checks"
sidebar:
    order: 1
---
```

Do **not** add or modify front matter manually — it is managed by the pipeline. Book source files (`books/`) have no front matter.

## Heading Hierarchy

- **H1 (`#`)** — chapter title. One per file. Matches the `title` in front matter for cleaned-references.
- **H2 (`##`)** — major sections within a chapter.
- **H3 (`###`)** — subsections.
- **H4+ (`####`)** — avoid where possible. If content needs H4, consider restructuring.
- Never skip heading levels (e.g., H1 → H3 without an H2).

## Game Terminology

Follow the canonical terminology in `docs/project-conventions.md`:

- **Dice notation** in backticks: `3k2`, `1d10`, `5k3+2`
- **Characteristics** capitalized: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma, Composure, Fellowship, Willpower
- **Derived stats**: Static Defense, Hit Points, Mental Defense, Resolve, Speed, Resilience, Initiative
- **Formulas** in backticks: `(Con + Wil) × 2`
- **Game terms** capitalized when used as proper nouns: Feat, Asset, Hindrance, Exaltation, Sword School, Gun Kata

## Formatting

- **Tables**: use markdown pipe tables with header row. Align columns for readability.
- **Code blocks**: fenced with triple backticks. Specify language for syntax highlighting.
- **Links**: use relative paths for internal links. Verify targets exist.
- **Lists**: use `-` for unordered, `1.` for ordered. Indent nested lists with 2 spaces.
- **Line length**: no hard limit, but break very long lines at logical points for diff readability.
- **Whitespace**: single blank line between sections. No trailing whitespace.

## Source Files (`books/`)

These are faithful transcriptions of the original rulebook PDFs. Do **not** reformat or restructure them. Edits should only correct OCR errors or add editorial notes in `<!-- comments -->`.

## Cleaned References (`cleaned-references/`)

These are curated, merged summaries organized by topic. They may restructure, clarify, and consolidate content from both books. Follow all conventions above. Front matter is auto-injected.

## Documentation (`docs/`)

Technical documentation follows standard markdown conventions. No Starlight front matter required (these files are not published to the site).
