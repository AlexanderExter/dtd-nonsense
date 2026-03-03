# Copilot Instructions

This is a **tabletop RPG rulebook documentation project** with **web-based play tools** for Dungeons the Dragoning (D:TD) a game blending Warhammer 40K aesthetics with D&D and World of Darkness mechanics. Work spans markdown editing (rules content), an Astro/Starlight documentation site, and vanilla JavaScript tools.

---

## Environment

All sessions run in **VS Code** on **Windows** with **PowerShell** terminals. Keep this in mind for every command and file operation:

- **Paths**: Use backslashes or forward slashes — both work in PowerShell, but external tools may differ. Always quote paths with spaces.
- **Encoding**: Windows defaults to cp1252. Never use `Set-Content` or `Out-File` for non-ASCII files — they silently corrupt UTF-8. Use agent edit tools (replace_string_in_file, create_file) instead of terminal commands for file edits.
- **Line endings**: Git handles CRLF conversion. The `LF will be replaced by CRLF` warning is expected and harmless.
- **Python**: Managed via `uv` with a `.venv` in the project root. Always use `uv run` to execute Python commands.
- **npm**: Standard `npm run build`, `npm run dev`. Node modules live in `node_modules/`.
- **Multiple agents**: Sessions may involve multiple parallel agents (VS Code Copilot agents, Claude sessions). Assume other agents may be working on the same repo concurrently — always check git state before committing.

---

## How We Work

### Ask Questions, Challenge Approaches

**Ambiguity is the enemy.** Use the `ask_questions` tool early and often — it exists so you can clarify before committing to a direction.

- **Before starting work**: Ask about scope, priorities, and edge cases. Don't wait until you're stuck.
- **When choosing between approaches**: Present the options with trade-offs. Let the user pick.
- **When instructions conflict or feel incomplete**: Ask rather than guessing. A 10-second question prevents a 10-minute redo.
- **When multiple agents are involved**: Ask which work to prioritize, what to defer, how to reconcile.
- **Challenge the proposed approach** if you see a better path or a potential problem. Flag trade-offs explicitly.

Questions are not a sign of weakness — they're the primary tool for alignment. A confident agent that marches in the wrong direction wastes more time than one that pauses to confirm.

### Keep Docs in Sync

Every task that changes mechanics, tool behavior, or project conventions must update the relevant documentation. This is not optional cleanup it's part of the definition of done.

| What Changed              | Update                                                         |
| ------------------------- | -------------------------------------------------------------- |
| Game rules / terminology  | `books/`, `cleaned-references/`, `docs/project-conventions.md` |
| Tool behavior or features | `docs/tools/[tool].md`, `docs/architecture.md`                 |
| Shared module API         | `docs/shared/core-js.md` or `dice-js.md`                       |
| JSON data schemas         | `docs/data-reference.md`, `pipeline/models/*.py`               |
| Pipeline behavior         | `docs/pipeline.md`                                             |
| Workflow or conventions   | `docs/project-conventions.md`                                  |
| Astro config / pages      | `docs/architecture.md`                                         |
| Skills or instructions    | `.github/copilot-skills/`, `.github/copilot-instructions.md`   |

### Git Essentials

All work on **date-based session branches** (`session-YYYY-MM-DD`). If today's branch already exists, use it. Otherwise, create it from `main`. Commit incrementally. Never edit main directly. Merge via squash at session end.

Full workflow in [docs/project-conventions.md](../docs/project-conventions.md#git-workflow).

**Three critical rules (always apply):**

- **PowerShell encoding** — never use `Set-Content` for non-ASCII files; it silently corrupts UTF-8
- **Check git state first** — other agents may have committed. Run `git status` and `git log --oneline -5` before starting work

---

## Skills

On-demand knowledge loaded when relevant. Each skill has trigger descriptions the system activates them automatically.

| Skill                   | When to Use                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `ttrpg-rules-editor`    | Editing rules content, formatting rulebook text, processing chapters |
| `dtd-source-hierarchy`  | Source authority questions, rule verification, ambiguity resolution  |
| `open-question-manager` | Adding, resolving, or applying entries in open-questions.md          |
| `tool-development`      | Building, modifying, or debugging web tools, JS, CSS, JSON data      |
| `product-owner`         | Decisions about what to build, prioritize, or cut; strategic context |

---

## Project Architecture

```
books/                 Core reference material (per-chapter split, 2 books)
  open-questions.md    Tracked ambiguities and contradictions
cleaned-references/    Succinct combined reading references (merged by topic)
data/                  Canonical JSON game data (12 files, validated by pipeline/models/)
docs/                  Technical documentation, conventions, project history
  project-conventions.md  Single source of truth for all cross-cutting rules
  tools/               Per-tool feature specs (9 tools)
  shared/              Shared module API docs (core.ts, dice.ts)
pipeline/              Python package: validation, linting, Astro prep
  models/              Pydantic schemas (source of truth for all 12 JSON files)
  linting/             Terminology + formatting linters
  starlight/           Frontmatter injection for Astro/Starlight
  parsers/             Markdown↔JSON sync checkers
.github/               Agent instructions, skills, prompt files
astro.config.mjs       Starlight configuration, sidebar, Vercel adapter
package.json           npm dependencies (Astro, Starlight, Chart.js)
tsconfig.json          TypeScript strict config with @/ path alias
scripts/prebuild.mjs   Copies content into Astro structure before build
src/                   Astro source files
  content/docs/        Generated Starlight content (gitignored)
  pages/tools/         Tool pages (Astro pages outside Starlight)
  lib/dtd/             ES module ports: core.ts, dice.ts, types.ts
  lib/tools/           Tool-specific ES module scripts (sheet-app.ts, builder-app.ts)
  layouts/             ToolLayout.astro
  styles/              custom.css (WH40K theme), per-tool CSS (sheet.css, builder.css)
public/data/           Generated JSON data copies (gitignored)
```

**Workflow:** `books/` is canonical for rules — `cleaned-references/` condenses them by topic — `data/` holds the canonical JSON game data, copied to `public/data/` for Astro — `pipeline/models/` validates the data. `docs/` documents everything.

**Build:** `npm run build` runs `prebuild.mjs` (copies content/data) then `astro build` (Pagefind search). Dev server: `npm run dev`.

**Deployment:** Vercel is connected to GitHub. Production deploys on `main` merge; preview deployments auto-created for every PR. GitHub Actions CI (`.github/workflows/build.yml`) runs the Astro build + Python pipeline checks (ruff, validate, lint) on every push/PR.

### Pipeline CLI

The `dtd` CLI (run via `uv run dtd <command>`) provides:

| Command               | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `dtd validate`        | Validate all 12 JSON data files against Pydantic schemas             |
| `dtd validate --xref` | Also check cross-file references (skills, feats, traits)             |
| `dtd lint`            | Lint markdown for terminology, formatting, encoding                  |
| `dtd starlight-prep`  | Inject Starlight-compatible YAML frontmatter into cleaned-references |
| `dtd sync-check`      | Detect drift between markdown and JSON data                          |

All 12 JSON files pass validation. Cross-ref warnings for abbreviated feat names and missing skills in `classes.json` are real data gaps, not bugs.

### Cleaned References Index

| File                         | Content                                      |
| ---------------------------- | -------------------------------------------- |
| 01-Core-Rules.md             | Dice system, tests, raises/checks            |
| 02-Char-Creation.md          | 9-step character creation                    |
| 03-Characteristics-Skills.md | 9 characteristics, skill list                |
| 04-Races.md                  | 16 playable races                            |
| 05-Exaltations.md            | Supernatural types (Vampire, Werewolf, etc.) |
| 06-Classes.md                | 50+ classes with progression tables          |
| 07-Feats.md                  | Feats, assets, hindrances                    |
| 08-Backgrounds.md            | Background dots (Allies, Wealth, etc.)       |
| 09-Alignments.md             | Pantheons and devotion mechanics             |
| 10-Equipment.md              | Weapons, armor, gear                         |
| 11-Magic.md                  | Sorcery system and spell schools             |
| 12-Sword-Schools.md          | 9 melee combat disciplines                   |
| 13-Gun-Kata.md               | 6 ranged combat disciplines                  |
| 14-Combat.md                 | Combat rules and action economy              |
| 15-Social-Combat.md          | Social interaction mechanics                 |
| 16-Conditions.md             | Status effects                               |
| 17-Vehicles.md               | Vehicle rules                                |
| 18-Ships.md                  | Spelljammer-style space vessels              |
| 19-Antagonists.md            | NPC creation and 40+ stat blocks             |
| 20-Artifacts.md              | Magical items                                |
| 21-Advanced-Rules.md         | Optional rules                               |
| 22-SM-Reference.md           | Story Master tools                           |
| 23-Setting-Lore.md           | Setting & lore (Crystal Spheres, factions)   |
| 99-Appendix-Archive.md       | Errata (supersedes earlier files)            |

---

## Where to Find What

All project conventions (git workflow, terminology, formulas, pitfalls, appendix mapping) live in **[docs/project-conventions.md](../docs/project-conventions.md)** the canonical cross-cutting reference. Skills and other docs link there rather than duplicating.

| Need                     | Go To                                                         |
| ------------------------ | ------------------------------------------------------------- |
| Conventions and pitfalls | [docs/project-conventions.md](../docs/project-conventions.md) |
| Editorial technique      | `ttrpg-rules-editor` skill (auto-loads for editing tasks)     |
| Source authority         | `dtd-source-hierarchy` skill                                  |
| Tool architecture        | [docs/architecture.md](../docs/architecture.md)               |
| How-to recipes (tools)   | [docs/development-guide.md](../docs/development-guide.md)     |
| JSON data schemas        | [docs/data-reference.md](../docs/data-reference.md)           |
| Pipeline & validation    | [docs/pipeline.md](../docs/pipeline.md)                       |
| Per-tool specs           | [docs/tools/](../docs/tools/) (9 files)                       |
| Shared module APIs       | [docs/shared/](../docs/shared/) (core-js.md, dice-js.md)      |
| Project history          | [docs/project-history.md](../docs/project-history.md)         |
| Product vision & goals   | [docs/product-vision.md](../docs/product-vision.md)           |
