# Project Conventions

Single source of truth for all cross-cutting conventions — git workflow, terminology, formulas, and hard-won pitfalls. All other project files (skills, instructions, guides) reference this file rather than duplicating these rules.

---

## Git Workflow

**All agent-driven work must be performed on a dedicated git branch.**

1. **Branch first** — `git checkout -b [task-description]` before any edits
2. **Commit incrementally** — after each logical unit of work (a section, a file, a coherent change set)
3. **Write meaningful commit messages** — describe what changed and why
4. **Review via diff** — use `git diff` before committing to verify changes
5. **Main stays clean** — no direct edits to main/master branch ever
6. **Clean up after merge** — delete the source branch immediately after merging. Before starting a new branch, check for existing branches on the same topic to avoid parallel/superseded work
7. **Task prompts are ephemeral** — prompt files in `.github/prompts/` that describe a specific task (e.g., `continue-pipeline.prompt.md`) should be deleted once complete. Migrate lessons to permanent docs before deletion.

### Branch Naming

`[type]-[description]` — e.g., `process-chapter-14-combat`, `fix-sd-formula`, `batch-terminology-update`, `tools-character-builder-races`

| Task Type          | Pattern                           | Example                          |
| ------------------ | --------------------------------- | -------------------------------- |
| Chapter processing | `process-chapter-NN-name`         | `process-chapter-14-combat`      |
| Feat/class updates | `update-[scope]`                  | `update-feats-placeholder-fill`  |
| Bug fixes          | `fix-[description]`               | `fix-sd-formula-antagonists`     |
| Bulk operations    | `batch-[operation]-[scope]`       | `batch-terminology-all-chapters` |
| Tool updates       | `tools-[component]-[description]` | `tools-character-builder-races`  |

### Editing Policy

All editing is done directly by the agent. Do not write Python scripts for file modifications — they produce pseudo-random edits that are hard to trace in diffs and have caused destructive mistakes in the past.

**Exception — pipeline scripts:** Version-controlled scripts in `pipeline/` may write files (JSON validation, frontmatter injection, linting auto-fix) when they are tested and review-gated. This does not apply to ad-hoc throwaway scripts.

### Batched Replacements

When applying multiple `multi_replace_string_in_file` operations to the same file in one call, earlier replacements change the file content, potentially invalidating later `oldString` matches. Either order replacements carefully so later ones don't depend on unchanged text from before earlier ones, or split into sequential calls when edits overlap. Always check the result summary for partial failures.

### Formatter/Tool Reversion

External formatters or editor extensions may silently revert agent edits between sessions. After resuming work on a branch, always re-read recently edited files and verify that prior changes are still present before building on them.

For pipeline Python files specifically: run `uv run ruff check .` and `uv run dtd validate` after any external edits touch `pipeline/`. Formatters commonly undo manual line-wrapping (E501 fixes), re-merge split strings, and reformat f-strings — all of which can re-introduce ruff violations.

### Python Code Style

Ruff enforces Python style. Key settings (in `pyproject.toml`):

- **Line length: 120** characters (not the default 100)
- **Per-file-ignores**: N815 suppressed in `pipeline/models/` (Pydantic camelCase matches JSON), RUF001/RUF002 suppressed in `terminology.py` (intentional Unicode symbols)
- Run `uv run ruff check .` before committing any Python changes

See [docs/pipeline.md — Ruff Configuration](pipeline.md#ruff-configuration) for full rationale.

### Subagent Discipline

When dispatching subagents, always specify the exact branch name and explicitly state "Do NOT create a new branch." Without this, subagents create their own branches, causing merge conflicts and orphaned work. Also tell subagents to commit directly — don't rely on them to follow the parent's workflow.

**Size limit:** Subagents reliably handle tool ports up to ~1,500 LOC of _input_ source. The main agent also fails when asked to _generate_ 2,000+ LOC of output from scratch (character-sheet and character-builder each failed 2+ times). For large files, use the **copy+edit** approach (copy original, make surgical replacements) instead of generating from scratch. See the "Large Tool Copy+Edit Variant" in the [tool-development skill](../.github/copilot-skills/tool-development.md).

---

## D:TD Conventions

### Standardized Terms

Use consistent terminology across all files:

| Use This           | Not This                        | Notes                                     |
| ------------------ | ------------------------------- | ----------------------------------------- |
| Test               | check (for dice rolls)          | "Make a Perception Test", "Strength Test" |
| Check              | _(keep as-is)_                  | Degrees of failure, every 5 below TN      |
| Raise              | degree of success               | Every 5 above TN                          |
| Target Number / TN | DC, Difficulty Class            | D:TD term, not D&D                        |
| Initiative Roll    | Initiative Check                | It's a roll, not a Test                   |
| Alignment Check    | _(canonical compound — keep)_   | Not a Test — canonical name               |
| Persuasion         | Persuade                        |                                           |
| Performer          | Perform, Performance            |                                           |
| Ballistics         | Ballistic                       |                                           |
| Armor              | Armour                          | Physical damage reduction                 |
| Aura               | Magical Armor                   | Magical damage reduction                  |
| Hero Points        | Fate Points, Action Points      | Narrative resource (all characters)       |
| Resource Points    | _(always capitalized compound)_ | Exaltation-specific power pool            |
| Resolve Points     | _(always capitalized compound)_ | Social defense resource                   |
| Resource           | Power Pool, Essence             | Exaltation-specific power pool            |
| Static Defense     | Defense, SD                     | Abbreviated only when space-constrained   |

### Capitalized Game Terms

Always capitalize when used as game mechanics: **Test**, **Hero**, **Story Master**, **Target Number**, **Raises**, **Checks**, **Static Defense**, **Mental Defense**, **Hit Points**, **Hero Points**, **Resource Points**, **Resolve Points**

Lowercase "test" or "static defense" in rules text is a bug.

### Terminology Pitfall — "check"

The word "check" appears in three distinct contexts requiring different treatment:

1. **D:TD Check** (capitalize) — degrees of failure mechanic. KEEP: "failed by two Checks", "Raises and Checks"
2. **Game Test** — dice rolls against a TN. REPLACE "check" → "Test": ~~"Perception check"~~ → "Perception Test"
3. **English verb** — ordinary meaning. KEEP: "check the chart", "double-check", "checking for jams"

Also preserve: Umbra depth idiom "checks away from the Warp" (spatial metaphor, not game mechanic) and canonical compound "Alignment Check".

### Pronoun Convention

- **She/her** for the acting player character (Hero)
- **He/him** for opponents, enemies, or other parties
- **They/them** for the Story Master (SM)

This applies to all rules text in `books/` and `cleaned-references/`.

### Dice Notation

D:TD uses the XkY system: roll X d10s, keep Y highest.

| Notation                | Meaning                          |
| ----------------------- | -------------------------------- |
| `5k3`                   | Roll 5d10, keep 3 highest        |
| `(Skill + Char)k(Char)` | Dice pool formula                |
| `+1k0`                  | Add 1 die to roll, keep the same |
| `+0k1`                  | Keep 1 additional die            |

In markdown: always use inline code for dice — `` `5k3` ``, `` `Dexterity + Melee` ``

### Formula Symbols

Always use `×` (multiplication) and `−` (minus) in formula code blocks, not `x` or `-`.

### Formatting Basics

- **Tables:** pipe-delimited with header separator, no empty cells (use `—` or `N/A`)
- **Headings:** H1 for chapters, H2 for sections, H3 for subsections — no skipped levels
- **Bold** for key term definitions (first occurrence only)
- **Language:** American English (e.g., "armor" not "armour"). Contractions are acceptable

See the `ttrpg-rules-editor` skill's [formatting.md](../.github/copilot-skills/ttrpg-rules-editor/references/formatting.md) for detailed conventions.

---

## Formula Quick Reference

| Metric         | Formula                                                |
| -------------- | ------------------------------------------------------ |
| Static Defense | `10 + (Dexterity + Wisdom) × 3 − (Size × 2)`           |
| Hit Points     | `(Constitution + Willpower) × 2`                       |
| Mental Defense | `5 + (Composure × 5)`                                  |
| Resolve        | `Willpower + Composure`                                |
| Speed          | `Strength + Dexterity`                                 |
| Resilience     | `ceil((Size + Level) / 2) + 1`                         |
| Initiative     | `1d10 + Dexterity + Composure`                         |
| Skill Test     | `(Skill + Characteristic)k(Characteristic)` vs TN      |
| Vehicle SD     | `10 + Maneuver − (2 × Size) + (Speed × Momentum Tier)` |
| Base TN        | 15 (average difficulty)                                |
| Raise/Check    | Every 5 above/below TN                                 |
| Dot Ratings    | Characteristics: 1–6; Skills: 1–6; Backgrounds: 1–5    |
| Creation Caps  | Chars ≤ 4 (pre-racial); Skills ≤ 3; Classes Tier 1     |
| Starting Dots  | Chars 6/4/2; Skills 8/6/4; Backgrounds 7 free (max 3)  |
| Starting XP    | 600 (class level caps power stat, magic/sword ranks)   |
| BG dots 4–5    | 100 XP each (double normal 50 XP/dot); creation only   |

### Stat Block Verification

Always verify calculated stats against formulas. Common errors:

- **Character SD:** Uses `10 + (Wisdom + Dexterity) × 3 − (Size × 2)` — produces values in 20s-30s
- **Vehicle SD:** Uses `10 + Maneuver − (2 × Size) + (Speed × Momentum Tier)` — negative base values clamp to 0
- **NPC stat blocks:** May use simplified flat values rather than calculated formulas
- **Halfling SD:** Uses a unique variant formula (`10 + Dex × 6 − Size × 2`) — must be handled as a special case

---

## Source Hierarchy

**Books are canonical. Forums are supplementary. Never invent.**

| Tier | Source                                      | Authority                                                 |
| ---- | ------------------------------------------- | --------------------------------------------------------- |
| 1    | `books/` (per-chapter rulebook split)       | Absolute for core mechanics                               |
| 2    | `books/open-questions.md` (resolutions)     | Enriches Tier 1 with clarifications                       |
| 3    | Forums (whitewizardsworkshop.proboards.com) | Last resort, requires `<!-- SOURCE: forum -->` annotation |

When sources conflict: higher tier wins. When unclear: document in `books/open-questions.md`, do NOT invent rulings.

For the full resolution protocol and annotation standards, see the `dtd-source-hierarchy` skill.

**Open-questions references:** Always cite `books/` paths (e.g., `book-1-dungeons-the-dragoning/02-character-creation.md`), never `archive/extracted/` paths. _(Historical note: `archive/extracted/` was a temporary extraction directory that no longer exists in the repository.)_

---

## Appendix Mapping

Cross-references to appendices use letter codes. The definitive mapping:

**Book 1** (`book-1-dungeons-the-dragoning/`):

| Letter | Content                      |
| ------ | ---------------------------- |
| A      | Perception And Stealth       |
| B      | Codes Of Honor               |
| C      | Insanity, Therapy, and Fruit |

**Book 2** (`book-2-for-a-few-subtitles-more/`):

| Letter | Content                 |
| ------ | ----------------------- |
| A      | Magic                   |
| B      | Safe Sex Magic          |
| C      | Daemonic Possession     |
| D      | Tracking                |
| E      | Astropaths & Navigators |
| F      | Vehicles                |
| G      | Spelljamming            |
| H      | Zero-G Combat           |
| I      | Character Optimization  |
| J      | Explosives              |
| K      | Orbital Strikes         |
| L      | The Petting Zoo         |
| M      | Character Stubs         |
| N      | The Umbra               |
| O      | Last Words              |

**Note:** Book 1 references to appendices D–I point to content that was planned but never published. These are annotated with `<!-- EDITOR: -->` comments in the source.

---

## Hard-Won Pitfalls

Lessons from project history — each one caused real damage at least once.

### PowerShell Encoding

**NEVER use PowerShell `Set-Content` to write files containing non-ASCII characters.** PowerShell 5.1 silently converts UTF-8 to CP1252, corrupting characters like `×`, `½`, `°`, smart quotes, and bullets.

```powershell
# WRONG — silently corrupts non-ASCII:
$content | Set-Content file.md

# If you must use PowerShell, force encoding:
Set-Content file.md -Encoding utf8
```

### CSS `display` Overrides `hidden`

Never set an explicit `display` value (e.g., `display: flex`) on an element that uses the HTML `hidden` attribute for visibility toggling. The CSS `display` wins over `hidden`'s implicit `display: none`, making the element permanently visible. Instead, use `display: none` as default and toggle visibility with a class (e.g., `.open { display: flex }`).

### Astro `<style>` Scoping Eats `@import`

A bare `<style>@import "../styles/foo.css";</style>` in an Astro layout is **scoped by default**. Astro appends a scope hash (e.g., `:where(.astro-mqzpnqfb)`) to every selector in the imported file. Slotted content from child pages gets a _different_ hash, so imported rules never match child elements — the CSS is silently dead.

**Fix:** Use `<style is:global>` for any `@import` whose selectors must reach into slotted/child content. Alternatively, make each page fully self-contained and skip the shared import entirely.

### `var` vs `const`/`let` for DTD Namespace

The `DTD` global is declared with `var` (not `const`/`let`) in core.js so it exists as `window.DTD`. Other modules (dice.js) extend it via `window.DTD = window.DTD || {}`. Using `const` or `let` at global scope creates a separate lexical binding invisible to `window`, silently splitting the namespace.

### Empty-State Guards

Features that depend on data from another tool (e.g., importing characters from the Character Sheet) must check preconditions before opening modals or complex UI. If no data exists, show a lightweight non-blocking notification (toast) instead of presenting an empty modal that traps user focus.

### Refactoring Shared Modules

When moving, renaming, or removing functions in shared JS files (core.js, dice.js):

1. **Grep all tool directories** for every affected function name before committing — callers in sheet.js, roller.js, builder.js, etc. will break silently if not updated
2. **Check all HTML files** that include the modified script — if a module gains new dependencies, every consuming HTML page needs `<script>` tags updated
3. **Test the load chain** mentally: verify every `<script>` loads in correct order (core.js → dice.js → tool .js) and nothing is missing

### Weapon Stat Block `X` vs `×`

`X` in weapon/attack damage columns is the Explosive damage type abbreviation, not a multiplication sign. Only convert `x` → `×` in formulas, drive multipliers, and similar mathematical contexts.

### Never Trust Docs for JSON Schemas

`docs/data-reference.md` per-file schemas are outdated for several files (written from initial samples, not comprehensive audits). When building models or validators against `tools/shared/data/*.json`, always inspect the **actual JSON files** — not the docs. The Pydantic models in `pipeline/models/` are now the closest thing to ground-truth schemas.

### Unicode Escapes in Python Source

Use `\uXXXX` escape sequences for non-ASCII patterns in Python string literals — never embed raw non-ASCII characters. Files that contain raw `×`, `½`, or CP1252 byte patterns are vulnerable to the same encoding corruption they're trying to detect. This was learned the hard way when `formatting.py`'s encoding-corruption checker was itself corrupted by an editor/OS round-trip.

### `.github/` Relative Link Prefix

Markdown files in `.github/` need `../` prefix to link to project root directories (`docs/`, `tools/`, etc.). VS Code's markdown validator catches broken links, but anchor fragments (`#section`) cause false positives — the file path resolves correctly even if the validator complains about the fragment.

### Temporary Diagnostic Scripts

Scripts created at project root for one-off debugging (e.g., `_diag.py`) must be deleted immediately after use and never committed. Prefix with `_` as a reminder that they're disposable.

### Bulk Edits Need Phasing

Large cross-file edits (e.g., heading hierarchy normalization across all chapters) should be phased by file or semantic boundary — not committed as one atomic change. A 38-heading bulk conversion was once committed in one shot, then fully reverted because it was too broad. Phase by file, commit after each, and review via diff at each step.

### Tool Builds Need a Test-Fix Pass

Every non-trivial tool build has been followed by fix commits (CSS bugs, missing scripts, calc errors). This is the norm, not the exception. Plan for it:

1. **Build** — implement the feature
2. **Smoke test** — check console for errors, verify core interactions, test edge cases
3. **Fix** — address issues found during testing (separate commit)
4. **Merge** — only after the fix pass is clean

### Editorial Passes Are Multi-Round

Editorial cleanup is inherently iterative — each pass discovers issues the previous one missed. Plan for 2-3 rounds minimum. OCR artifact cleanup alone took 4+ passes to reach near-zero. Single-pass completeness is unrealistic for any file over ~100 lines.

---

## Cross-File Dependencies

Files heavily reference each other. Key relationships to verify when editing:

- Classes → require characteristics/skills from `03-Characteristics-Skills.md`
- Feats → reference class features from `06-Classes.md`
- Magic/Sword schools → gated by class level
- `99-Appendix-Archive.md` → contains errata that supersedes earlier files
- `tools/shared/data/` → JSON data must match `cleaned-references/` (skill mappings, dot values, formulas)
- `tools/shared/js/core.js` → DTD namespace root; extended by dice.js
- `tools/shared/js/dice.js` → sole dice module; attaches via `window.DTD`
- `src/lib/dtd/core.js` ↔ `tools/shared/js/core.js` → ES module port, must stay in manual sync
- `src/lib/dtd/dice.js` ↔ `tools/shared/js/dice.js` → ES module port, must stay in manual sync

### Astro / Starlight Build

The project publishes a static site via Astro + Starlight, deployed to Vercel. Key commands:

| Command                     | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `npm run dev`               | Start Astro dev server with hot reload                        |
| `npm run build`             | Full build: `prebuild.mjs` + `astro build` (89 pages)         |
| `npm run preview`           | Preview production build locally                              |
| `uv run dtd starlight-prep` | Inject Starlight frontmatter (run after editing cleaned-refs) |

**Build dependency chain:**

1. `uv run dtd starlight-prep` — adds YAML frontmatter to `cleaned-references/` (run once, or after edits)
2. `node scripts/prebuild.mjs` — copies cleaned-refs → `src/content/docs/rules/`, books → `src/content/docs/books/`, JSON → `public/data/`
3. `astro build` — builds 89 static pages + Pagefind search index

Generated directories (`src/content/docs/rules/`, `src/content/docs/books/`, `public/data/`) are in `.gitignore` — never commit them.

**ES module sync:** `src/lib/dtd/core.js` and `dice.js` are manual ports of `tools/shared/js/core.js` and `dice.js`. There is no automated sync. When editing shared logic, update both versions. The vanilla versions remain source of truth until migration is complete.

See [astro-migration-roadmap.md](astro-migration-roadmap.md) for porting status and next steps.

### Python Pipeline

- **Package manager:** `uv` — run with `uv run dtd <command>`, sync deps with `uv sync`
- **Schema authority:** Pydantic models in `pipeline/models/` are the source of truth for JSON data schemas. `docs/data-reference.md` is a readable summary but may lag behind.
- **Validation:** `uv run dtd validate --xref` checks all 12 JSON files and cross-references (class→skill, class→feat, NPC→trait). All files pass; remaining warnings are real data gaps.
- **Content linting:** `uv run dtd lint` enforces terminology, formatting, and encoding consistency across markdown files.
- **Astro prep:** `uv run dtd starlight-prep` injects Starlight-compatible YAML frontmatter into `cleaned-references/`.
- **Sync checking:** `uv run dtd sync-check --source <type>` detects drift between markdown and JSON data (races, classes, feats).
- **Documentation:** See `docs/pipeline.md` for CLI commands, package structure, and conventions.
- **When editing JSON data:** Always run `uv run dtd validate` afterward to catch schema violations. If adding new fields, update both the Pydantic model and `docs/data-reference.md`.
