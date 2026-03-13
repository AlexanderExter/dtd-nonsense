# Editorial Backlog

Actionable editorial tasks detected by automated linting (`bun run lint:data`). Items are grouped by category and sorted by volume. The editing team picks these up at their own pace.

**Generated:** 2026-03-12
**Baseline:** 893 issues (0 errors, 12 warnings, 881 info) across 101 files

Run `bun run lint:data --severity warning` to see warnings only, or `bun run lint:data` for the full report.

---

## Heading Hierarchy (warning)

Heading levels skip from H1 directly to H3, violating standard markdown hierarchy. These are inherited from source book structure but should be normalized for accessibility and TOC generation.

| File | Line | Skip | Notes |
|------|------|------|-------|
| `books/book-1-dungeons-the-dragoning/07-feats-assets-and-hindrances.mdx` | 18 | H1 → H3 | Missing H2 between chapter title and "Feat Groups" |
| `books/book-1-dungeons-the-dragoning/10-backgrounds.mdx` | 10 | H1 → H3 | Missing H2 between chapter title and first section |
| `docs/shared/dice-js.md` | 71 | H1 → H3 | API doc uses H3 for functions without H2 grouping |

**Action:** Add appropriate H2 headings to bridge the gap. For books/, this likely means adding a section heading like `## Overview` or `## Feats` before the H3s. For dice-js.md, add `## API Reference` or similar before the function headings.

---

## Dice Notation Formatting (info) — 619 issues

Dice expressions like `1k0`, `2k1`, `3k2` appear as plain text instead of inline code (`` `1k0` ``). Wrapping in backticks improves readability and enables future tooling (syntax highlighting, linkification).

The linter can auto-fix these: `bun run scripts/lint.ts --target books --fix` (review changes before committing — the auto-fixer is aggressive).

### By file (highest volume first)

| File | Count |
|------|-------|
| `books/book-2-for-a-few-subtitles-more/08-vehicles.mdx` | 209 |
| `books/book-2-for-a-few-subtitles-more/29-reference-sheets.mdx` | 92 |
| `books/book-1-dungeons-the-dragoning/17-antagonists.mdx` | 79 |
| `books/book-1-dungeons-the-dragoning/12-equipment.mdx` | 75 |
| `books/book-1-dungeons-the-dragoning/14-playing-the-game.mdx` | 65 |
| `books/book-1-dungeons-the-dragoning/09-sword-schools.mdx` | 63 |
| `books/book-2-for-a-few-subtitles-more/07-gun-kata.mdx` | 60 |
| `books/book-2-for-a-few-subtitles-more/09-ships.mdx` | 73 |
| `books/book-2-for-a-few-subtitles-more/21-appendix-i-character-optimization.mdx` | 31 |
| `books/book-2-for-a-few-subtitles-more/19-appendix-g-spelljamming.mdx` | 28 |
| `books/book-2-for-a-few-subtitles-more/14-appendix-b-safe-sex-magic.mdx` | 26 |
| `books/book-2-for-a-few-subtitles-more/26-appendix-n-the-umbra.mdx` | 19 |
| `books/book-2-for-a-few-subtitles-more/15-appendix-c-daemonic-possession.mdx` | 12 |
| `books/book-2-for-a-few-subtitles-more/18-appendix-f-vehicles.mdx` | 12 |
| `books/book-2-for-a-few-subtitles-more/25-appendix-m-character-stubs.mdx` | 10 |
| `books/book-1-dungeons-the-dragoning/05-exaltation.mdx` | 8 |
| `books/book-2-for-a-few-subtitles-more/20-appendix-h-zero-g-combat.mdx` | 7 |
| `books/book-2-for-a-few-subtitles-more/27-appendix-o-last-words.mdx` | 3 |
| `books/book-1-dungeons-the-dragoning/11-alignment.mdx` | 1 |

**Strategy:** Tackle file-by-file, starting with highest count. Run `bun run scripts/lint.ts --target books --fix` then review `git diff` per file to confirm auto-fixes are correct. Commit per-file or per-book.

---

## Empty Table Cells (info) — 262 issues

Pipe table cells that contain no data (just `|  |`). Most are in stat block tables where a field genuinely doesn't apply. Review each file to determine if the empty cell should have:

- A dash (`-`) to indicate "not applicable"
- A zero (`0`) if the value is actually zero
- Content that was lost during extraction

### By file

| File | Count |
|------|-------|
| `books/book-2-for-a-few-subtitles-more/08-vehicles.mdx` | Large share — vehicle stat tables |
| `books/book-1-dungeons-the-dragoning/17-antagonists.mdx` | NPC stat blocks |
| `books/book-2-for-a-few-subtitles-more/29-reference-sheets.mdx` | Reference tables |
| Other files | Scattered instances |

**Strategy:** Review case-by-case. Most empty cells are intentional (field doesn't apply) and should get a `-`. Some may represent missing data from PDF extraction — cross-reference with source PDFs where available.

---

## Known False Positives (no action needed)

These warnings fire on intentional content. Do not "fix" them.

| File | Count | Reason |
|------|-------|--------|
| `docs/project-conventions.md` | 6 warnings | Terminology table "Not This" column intentionally shows wrong terms |
| `docs/pipeline.md` | 1 warning | "Armour" appears in linter description showing what the rule catches |
| `docs/editorial/open-questions.md` | 2 warnings | Entry 14 discusses the inconsistency itself, mentioning old terms |
| `docs/shared/dice-js.md` | 1 info | Dice notation in API doc function names — intentional |
| `docs/project-conventions.md` | 3 info | Dice notation in convention examples |
