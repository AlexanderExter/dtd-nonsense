# Project Conventions

Single source of truth for all cross-cutting conventions — git workflow, terminology, formulas, and hard-won pitfalls. All other project files (skills, instructions, guides) reference this file rather than duplicating these rules.

---

## Git Workflow

**All agent-driven work must be performed on a session branch. Never edit main directly.**

### Session Branches

Every work session uses a **date-based branch**: `session-YYYY-MM-DD`.

**Session lifecycle scripts** automate the git ceremony:

| Command                            | Purpose                                                      |
| ---------------------------------- | ------------------------------------------------------------ |
| `npm run session:start`            | Create/switch to `session-YYYY-MM-DD`, run baseline check    |
| `npm run session:start my-feature` | Create/switch to named branch, run baseline check            |
| `npm run session:end`              | Squash-merge current branch to main, delete branch           |
| `npm run session:status`           | Quick git state report (branch, dirty/clean, recent commits) |
| `npm run upgrade:recon`            | Dependency recon: outdated, audit, tree health, overrides    |

**Pre-commit hook:** `.githooks/pre-commit` runs `npm run check` before every commit. Installed automatically via `npm run prepare` (which runs on `npm install`). Skip with `git commit --no-verify` when needed.

**Start of session:**

```powershell
git branch --list                          # Check existing branches
git status                                 # Check for uncommitted changes
```

- If `session-YYYY-MM-DD` already exists (from another agent or earlier in the day) → `git checkout session-YYYY-MM-DD`
- If no session branch exists → `git checkout -b session-YYYY-MM-DD` from `main`
- If uncommitted changes exist on any branch → ask the user how to proceed before creating/switching

**During session:**

1. **Commit incrementally** — after each logical unit of work (a section, a file, a coherent change set)
2. **Write meaningful commit messages** — describe what changed and why
3. **Review via diff** — use `git diff` before committing to verify changes
4. **Check for concurrent work** — other agents may commit to the same branch. Run `git status` before committing.

**End of session:**

Run `npm run session:end` to squash-merge and clean up. The script:

1. Verifies working tree is clean and branch is not main
2. Shows the branch commit log
3. Squash-merges to main with an auto-generated commit message
4. Deletes the session branch
5. Verifies clean state

Or leave the branch open if work will continue tomorrow — the next session creates `session-YYYY-MM-DD+1`

### Multi-Agent Sessions

Multiple agents (VS Code Copilot, Claude, etc.) may work on the same repo concurrently. This causes branch confusion if not managed:

- **Same-day agents share a branch** — both commit to `session-YYYY-MM-DD`
- **Always check git state** before committing (`git status`, `git log --oneline -5`)
- **Expect unexpected commits** — another agent may have pushed changes since you last checked
- **Ask the user** if you find uncommitted changes you didn't make, or commits you don't recognize
- **Reconciliation**: If branches diverge, ask the user how to merge rather than guessing. The session-wrapup prompt handles this.

### Other Branch Patterns

For work that spans multiple sessions or needs isolation beyond day-scoping:

| Task Type          | Pattern                     | Example                          |
| ------------------ | --------------------------- | -------------------------------- |
| Multi-day feature  | `feature-[description]`     | `feature-combat-tracker-v2`      |
| Chapter processing | `process-chapter-NN-name`   | `process-chapter-14-combat`      |
| Bug fixes          | `fix-[description]`         | `fix-sd-formula-antagonists`     |
| Bulk operations    | `batch-[operation]-[scope]` | `batch-terminology-all-chapters` |

### Additional Rules

5. **Main stays clean** — no direct edits to main branch ever
6. **Clean up after merge** — delete the source branch immediately after merging
7. **Task prompts are ephemeral** — prompt files in `.github/prompts/` that describe a specific task (e.g., `continue-pipeline.prompt.md`) should be deleted once complete. Migrate lessons to permanent docs before deletion.

### Editing Policy

All editing is done directly by the agent. Do not write Python scripts for file modifications — they produce pseudo-random edits that are hard to trace in diffs and have caused destructive mistakes in the past.

**Exception — pipeline scripts:** Version-controlled scripts in `scripts/` may write files (JSON validation, frontmatter injection, linting auto-fix) when they are tested and review-gated. This does not apply to ad-hoc throwaway scripts.

### Batched Replacements

When applying multiple `multi_replace_string_in_file` operations to the same file in one call, earlier replacements change the file content, potentially invalidating later `oldString` matches. Either order replacements carefully so later ones don't depend on unchanged text from before earlier ones, or split into sequential calls when edits overlap. Always check the result summary for partial failures.

### Formatter/Tool Reversion

External formatters or editor extensions may silently revert agent edits between sessions. After resuming work on a branch, always re-read recently edited files and verify that prior changes are still present before building on them.

After any external edits touch `scripts/`, run `npm run validate` to verify data integrity.

### Subagent Discipline

When dispatching subagents, always specify the exact branch name and explicitly state "Do NOT create a new branch." Without this, subagents create their own branches, causing merge conflicts and orphaned work. Also tell subagents to commit directly — don't rely on them to follow the parent's workflow.

**Staging rule:** Tell subagents to `git add` only the specific files they changed — never `git add -A`. In multi-agent sessions, `-A` sweeps in unrelated changes from concurrent agents, contaminating commits with work that belongs elsewhere.

**Size limit:** Subagents reliably handle tool ports up to ~1,500 LOC of _input_ source. The main agent also fails when asked to _generate_ 2,000+ LOC of output from scratch (character-sheet and character-builder each failed 2+ times). For large files, use the **copy+edit** approach (copy original, make surgical replacements) instead of generating from scratch.

**`git rm` pitfall:** After `git rm <file>`, the deletion is already staged. Do not `git add` the same path again — it will fail with `fatal: pathspec did not match`. This commonly happens when batching a `git rm` with `git add` of other files in the same command.

**Whitespace normalization:** Subagent-generated file rewrites may introduce CRLF line endings or trailing whitespace changes (the repo enforces LF via `.gitattributes`). Expect a minor diff after subagent file rewrites. Either normalize in the same commit or accept a separate normalization commit.

### Dependency Upgrade Sessions

Periodic upgrade sessions bring all dependencies to their best possible state. These are dedicated sessions — the upgrade agent owns the branch and has full authority.

**Prompt:** `.github/prompts/dependency-upgrade.prompt.md` — orchestrates the full workflow.
**Recon:** `npm run upgrade:recon` — gathers dependency state, tree health, audit results, and tool availability.
**Output:** `docs/whats-new/YYYY-MM-DD.md` — per-session briefing documenting what upgraded and what opportunities it creates.

**How it works:**

1. Run the `dependency-upgrade` prompt to start a dedicated upgrade session
2. The prompt bootstraps tools (ncu, bun detection), runs recon, and establishes a baseline
3. Upgrades execute in tiered order: toolchain → framework → utility, validated between each tier
4. Breaking changes are resolved (code modernization, deprecated pattern removal, config updates)
5. A "What's New" briefing is generated for subsequent sessions
6. The branch is merged via `npm run session:end` or deleted if the upgrade failed

**Safety model:** The branch is the safety net. If the process botches, the branch is deleted. `npm run check` passing is the red line — if it passes, the upgrade stands.

**When to run:** Periodically, or when `npm run upgrade:recon` shows significant drift. Not every session — this is a deliberate maintenance ritual.

**`upgrade:recon` scope caveat:** `npm run upgrade:recon` only reports packages that are outside their _current_ declared version range — it will show "0 outdated" even when major upgrades are available. To see the full upgrade picture, also run `npx npm-check-updates --format group`. Always do this at the start of an upgrade session.

**`bun install` and nested overrides:** `bun install` prints a warning and exits with code 1 when `package.json` contains nested `overrides` (e.g., `overrides: { "pkg": { "dep": "^x" } }`). The install *succeeds* despite the error exit — but the false failure is confusing. Use `npm install` instead of `bun install` when nested overrides are present.

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

### `var` vs `const`/`let` for DTD Namespace (Historical)

> **Note:** This pattern was replaced by ES module named exports during the Astro port. The `DTD.*` global namespace no longer exists in `src/lib/dtd/`. This section is preserved for context when reading the vanilla `tools/` history or `project-history.md`.

The `DTD` global was declared with `var` (not `const`/`let`) in core.js so it existed as `window.DTD`. Other modules (dice.js) extended it via `window.DTD = window.DTD || {}`. Using `const` or `let` at global scope creates a separate lexical binding invisible to `window`, silently splitting the namespace.

### Empty-State Guards

Features that depend on data from another tool (e.g., importing characters from the Character Sheet) must check preconditions before opening modals or complex UI. If no data exists, show a lightweight non-blocking notification (toast) instead of presenting an empty modal that traps user focus.

### Refactoring Shared Modules

When moving, renaming, or removing functions in shared TS files (core.ts, dice.ts, types.ts):

1. **Grep all tool files** for every affected export name before committing — callers in `src/pages/tools/*.astro`, `src/lib/tools/*.ts`, and `src/workers/*.ts` will break silently if not updated
2. **Check barrel re-exports** — `core.ts` re-exports from `character.ts`, `data.ts`, `derived.ts`, `ui.ts`, `util.ts`. If you change a sub-module's exports, verify `core.ts` still re-exports correctly
3. **Run `npm run test`** — the unit tests cover core and dice module APIs and will catch signature changes

### Weapon Stat Block `X` vs `×`

`X` in weapon/attack damage columns is the Explosive damage type abbreviation, not a multiplication sign. Only convert `x` → `×` in formulas, drive multipliers, and similar mathematical contexts.

### Never Trust Docs for JSON Schemas

`docs/data-reference.md` per-file schemas are outdated for several files (written from initial samples, not comprehensive audits). When building models or validators against `data/*.json`, always inspect the **actual JSON files** — not the docs. The Zod schemas in `src/lib/dtd/schemas/` are the ground-truth schemas.

### Biome and Line Endings on Windows

**This issue is now resolved** — `.gitattributes` (`* text=auto eol=lf`) is committed and enforces LF checkout on all platforms. The repo is LF-first.

**Historical context (preserved for diagnosis if it recurs):** Before `.gitattributes`, `core.autocrlf=true` (Windows default) checked out all files with CRLF. Biome's formatter check then reported every tracked file as a format error, completely breaking `npm run check` and `session:start`. The symptom was 14 format errors, all showing CRLF→LF diffs with no code changes.

**If the issue recurs** (e.g., after cloning on a machine without `.gitattributes` taking effect), run:
```powershell
git add --renormalize .
npm run lint:fix
```
This re-normalizes all tracked files to LF and auto-fixes the format violations in one pass.

### Biome Safe vs Unsafe Fixes

`biome check --write` only applies **safe** fixes. Diagnostics showing `Unsafe fix:` in the output require `--write --unsafe` or manual editing. Common examples: renaming unused `catch (e)` to `catch`, converting string concatenation to template literals. If `npm run lint:fix` doesn't clear a warning, check whether it's flagged as unsafe.

### `&&` in npm Scripts vs PowerShell

`&&` is forbidden in PowerShell terminals (use `;` instead) but works correctly in `package.json` scripts because npm uses `cmd.exe` as its default shell on Windows. The `npm run check` composite command uses `&&` chaining — this is intentional and correct despite the general `&&` prohibition.

### Git Push stderr on PowerShell

`git push` outputs informational messages (like the "Create a pull request" URL) to stderr. PowerShell interprets any stderr output as a non-terminating error, setting `$LASTEXITCODE = 1` even when the push succeeds. Check the actual output message — if the branch was created/updated on the remote, it worked. Don't treat exit code 1 from `git push` as a failure without reading the output.

### Plan vs Execution Drift

Decisions in planning documents (open questions, side tracks) can be silently ignored by executing agents who default to more familiar tools. After a plan is executed, **verify that plan decisions were actually followed** — especially tool choices (e.g., Bun vs tsx), naming conventions, and architectural approaches. If a deviation was intentional, document why. If unintentional, flag it.

### Skill Files Drift After Broad Refactors

Copilot skill files (`.github/copilot-skills/*.md`) load automatically for matching tasks but are easy to miss during documentation sweeps. After broad refactors (worker migration, toolchain changes, `@ts-nocheck` removal), cross-check **all** agent-facing files — not just `docs/`. In March 2026, a multi-agent stabilizer session updated 40 files across 15 commits but left `tool-development.md` with 5 stale claims about worker architecture, causing agents in subsequent sessions to receive contradictory instructions.

### `.github/` Relative Link Prefix

Markdown files in `.github/` need `../` prefix to link to project root directories (`docs/`, `data/`, etc.). VS Code's markdown validator catches broken links, but anchor fragments (`#section`) cause false positives — the file path resolves correctly even if the validator complains about the fragment.

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

### Hardcoded Counts Drift Silently

Specific counts in documentation (e.g., "187 tests", "12 files", "103 records") go stale every time a test, data record, or file is added. Agents read these as authoritative and propagate the stale values into new docs and commits.

**Rules for counts in active documentation:**

- **Don't embed exact counts** in prose that describes the current state. Use descriptive labels ("Unit tests cover core, dice, schemas, and pipeline scripts") or point to the command that produces the live count ("Run `npm run test` for current totals").
- **Dated snapshots are OK** — `session-handover.md` and `project-history.md` record what was true at a point in time. Those numbers are historical facts, not current claims.
- **`side-tracks.md` baseline notes are OK** — explicitly dated baselines (e.g., "> Baseline note (2026-03-09): ...") are timestamped by design.
- **Data structure descriptions** should name what a file _contains_, not how many (e.g., "Feats with prerequisites" not "329 feats with prerequisites").

---

## Cross-File Dependencies

Files heavily reference each other. Key relationships to verify when editing:

- Classes → require characteristics/skills from `03-Characteristics-Skills.md`
- Feats → reference class features from `06-Classes.md`
- Magic/Sword schools → gated by class level
- `99-Appendix-Archive.md` → contains errata that supersedes earlier files
- `data/` → JSON data must match `cleaned-references/` (skill mappings, dot values, formulas)
- `src/lib/dtd/core.ts` → ES module root — data loading, character CRUD, derived stats, XP, UI helpers
- `src/lib/dtd/dice.ts` → dice module — XkY rolling, overflow compression, notation parsing
- `src/lib/dtd/types.ts` → canonical TypeScript interfaces (CharacterData, DiceResult, etc.)

### Astro / Starlight Build

The project publishes a static site via Astro + Starlight, deployed to Vercel. Key commands:

| Command                  | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `npm run check`          | **Run everything:** tests → lint → validate+xref → content lint |
| `npm run dev`            | Start Astro dev server with hot reload                          |
| `npm run build`          | Full build: `prebuild.mjs` + `astro build`                      |
| `npm run preview`        | Preview production build locally                                |
| `npm run test`           | Unit tests only (Vitest)                                        |
| `npm run lint`           | Biome lint/format check only                                    |
| `npm run validate`       | Validate JSON data against Zod schemas                          |
| `npm run validate:xref`  | Validate + cross-reference checks (class→skill, class→feat)     |
| `npm run lint:data`      | Lint markdown for terminology, formatting, encoding             |
| `npm run sync-check`     | Detect drift between markdown and JSON data                     |
| `npm run session:start`  | Create/switch to session branch + baseline check                |
| `npm run session:end`    | Squash-merge to main + cleanup                                  |
| `npm run session:status` | Quick git state report                                          |
| `npm run upgrade:recon`  | Dependency recon: outdated, audit, tree health, override check  |

**Build dependency chain:**

1. `node scripts/prebuild.mjs` — copies cleaned-refs → `src/content/docs/rules/`, books → `src/content/docs/books/`, JSON → `public/data/`, injects Starlight frontmatter
2. `astro build` — builds static pages + Pagefind search index

Generated directories (`src/content/docs/rules/`, `src/content/docs/books/`, `public/data/`) are in `.gitignore` — never commit them.

The Astro/Starlight migration is complete — all tools ported, site live on Vercel. See [architecture.md](architecture.md) for the current system design.

### TypeScript Pipeline Scripts

- **Schema authority:** Zod schemas in `src/lib/dtd/schemas/` are the source of truth for JSON data schemas. `docs/data-reference.md` is a readable summary but may lag behind.
- **Validation:** `npm run validate` checks all 12 JSON files against Zod schemas. Use `npm run validate:xref` for cross-reference checks (class→skill, class→feat, NPC→trait). All files pass with 0 xref warnings — any new warning is a regression.
- **Content linting:** `npm run lint:data` enforces terminology, formatting, and encoding consistency across markdown files.
- **Baseline verification:** Always re-verify pipeline output baselines (error counts, warning counts) after scope changes. Don't carry forward numbers from previous sessions without validation — e.g., lint:data reported "2 warnings" when only scanning `cleaned-references/`, but "19 warnings" after scope expanded to include `books/`.
- **Starlight prep:** Frontmatter injection is now handled automatically by `scripts/prebuild.mjs` during the build.
- **Sync checking:** `npm run sync-check` detects drift between markdown and JSON data (races, classes, feats).
- **Documentation:** See `docs/pipeline.md` for CLI commands, script structure, and conventions.
- **When editing JSON data:** Always run `npm run validate` afterward to catch schema violations. If adding new fields, update both the Zod schema and `docs/data-reference.md`.
