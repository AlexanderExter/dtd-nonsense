# Copilot Instructions

This is a **tabletop RPG rulebook documentation project** with **web-based play tools** for Dungeons the Dragoning (D:TD) a game blending Warhammer 40K aesthetics with D&D and World of Darkness mechanics. Work spans markdown editing (rules content), an Astro/Starlight documentation site, and React-based interactive tools.

**Strategic context:** The project's mission, design principles, scope boundaries, and feature priorities are defined in **[docs/product-vision.md](../docs/product-vision.md)**. Read it before making scope or priority decisions. The project is currently in **beta** — stabilization and polish take priority over new features.

---

## Environment

All sessions run in **VS Code** on **Windows** with **Git Bash** terminals. The workspace configures Git Bash as the default shell for both user terminals and agent/tool terminals (`.vscode/settings.json`). If a terminal opens as PowerShell or cmd, that's a misconfiguration — report it and switch.

### Shell Standard: Git Bash

Standard Unix commands work: `cat`, `grep`, `head`, `tail`, `ls`, `rm`, `which`, `&&`, pipes, redirects. Use them naturally.

**Key differences from a full Linux shell:**

| Concern                    | Git Bash behavior                                     |
| -------------------------- | ----------------------------------------------------- |
| Path separators            | Both `/` and `\` work; prefer `/` in scripts         |
| Paths with spaces          | Always quote: `"C:/Coding Proyects/DTD Nonsense"`    |
| `npx` / `bunx`             | Use `bun x pkg`                                       |
| Windows-native tools       | `cmd.exe`, `powershell.exe` are available if needed    |
| Environment variables      | `export VAR=value`, not `$env:VAR` (that's PowerShell) |
| PATH refresh               | `export PATH=$(cygpath -p "$USERPROFILE/.bun/bin"):$PATH` |

### Other Windows Constraints

- **Paths**: Both `/` and `\` work in Git Bash. Prefer `/`. Always quote paths with spaces.
- **Encoding**: Git Bash uses UTF-8 by default. For agent edit tools (`replace_string_in_file`, `create_file`), encoding is handled automatically. Avoid PowerShell's `Set-Content` / `Out-File` — they corrupt UTF-8 on Windows.
- **Line endings**: Git handles CRLF conversion. The `LF will be replaced by CRLF` warning is expected and harmless.

### Toolchain

- **Bun**: Package manager, test runner, script runner, and TypeScript pipeline executor. Standard `bun run build`, `bun run dev`. Node modules live in `node_modules/`.
- **Biome**: Linter/formatter for JS/TS/CSS, configured via **ultracite** presets (`ultracite/biome/{core,react,astro}`) with project-specific overrides. Run `bun run lint` to check; **run `bun run lint:fix` to auto-fix all fixable violations at once** — use this instead of manually patching files one by one. Config in `biome.json`. CI runs `biome ci .` before build.
- **bun:test**: Built-in test runner (Jest-compatible). Unit tests across multiple test files (core, dice, schemas, pipeline scripts). Run `bun run test` (or `bun test` directly) to run all tests. Config via `bunfig.toml`.
- **React**: UI framework for tool pages. `@astrojs/react` integration, **Zustand** for state management, **Radix UI** for accessible primitives.
- **Tailwind CSS v4**: `@tailwindcss/vite` plugin, `@theme` tokens in `src/styles/tailwind.css`, `@astrojs/starlight-tailwind` bridge.
- **dependency-cruiser** (installed): Enforces architectural import boundaries via `.dependency-cruiser.cjs`. Run `bun run check:deps`. Encodes the tool-island architecture as machine-checkable rules. See `docs/pipeline.md`.
- **ts-morph** (installed): TypeScript Compiler API wrapper for type-aware structural analysis. Import in pipeline scripts: `import { Project } from "ts-morph"`. Reference: `scripts/check-structure.ts`. See `docs/pipeline.md`.
- **jscodeshift** (via `bun x` — not installed): AST-based bulk code transformation. Use on-demand: `bun x jscodeshift -t scripts/codemods/<transform>.ts src/`. Write transforms to `scripts/codemods/`, verify with `bun run check`, delete post-merge.
- **`bun run check`**: Runs **all** verification in one command: tests → Biome lint → JSON schema + xref validation → content lint → sync-check → knip → check:deps → check:structure. Use this as the single baseline command.
- **Multiple agents**: Sessions may involve multiple parallel agents (VS Code Copilot agents, Claude sessions). Assume other agents may be working on the same repo concurrently — always check git state before committing.

---

## How We Work

### Ask Questions, Challenge Approaches

**Ambiguity is the enemy.** Ask clarifying questions early and often — clarify before committing to a direction.

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
| JSON data schemas         | `docs/data-reference.md`, `src/lib/dtd/schemas/*.ts`           |
| Pipeline behavior         | `docs/pipeline.md`                                             |
| Workflow or conventions   | `docs/project-conventions.md`                                  |
| Astro config / pages      | `docs/architecture.md`                                         |
| Skills or instructions    | `.github/copilot-skills/`, `.github/copilot-instructions.md`   |

### Git Essentials

All work on **date-based session branches** (`session-YYYY-MM-DD`). If today's branch already exists, use it. Otherwise, create it from `main`. Commit incrementally. Never edit main directly. Merge via squash at session end.

Full workflow in [docs/project-conventions.md](../docs/project-conventions.md#git-workflow).

**Session lifecycle scripts** (deterministic — replaces manual git ceremony):

| Command                            | Purpose                                                      |
| ---------------------------------- | ------------------------------------------------------------ |
| `bun run session:start`            | Create/switch to `session-YYYY-MM-DD`, run baseline check    |
| `bun run session:start my-feature` | Create/switch to named branch, run baseline check            |
| `bun run session:end`              | Squash-merge current branch to main, delete branch           |
| `bun run session:status`           | Quick git state report (branch, dirty/clean, recent commits) |

**Pre-commit hook:** `.githooks/pre-commit` runs `bun run check` before every commit. Installed automatically via `bun run prepare` (which runs on `bun install`). Skip with `git commit --no-verify` when needed.

**Three critical rules (always apply):**

- **Git Bash only** — if a terminal opens as PowerShell or cmd, report it as a misconfiguration. All commands should use Unix syntax.
- **No PowerShell for file editing** — never use `Set-Content` or `Out-File`; they corrupt UTF-8. Use agent edit tools.
- **Check git state first** — other agents may have committed. Run `bun run session:status` or `git status && git log --oneline -5` before starting work

**Verification protocol:**

- **Start of session:** Run `bun run session:start` to create the branch and establish a green baseline. If anything fails, fix it before doing other work.
- **After code/data changes:** Run `bun run check` to confirm nothing broke. Watch for _new_ warnings only — some pre-existing Biome warnings (false positives and intentional CSS) are expected.
- **After doc-only changes:** No check needed unless you edited `scripts/`, `src/lib/`, or `data/`.
- **Before committing:** The pre-commit hook runs `bun run check` automatically. If you want to verify before staging, run `bun run check` manually.
- **Quick targeted checks:** Use `bun run test` (unit tests only), `bun run lint` (Biome only), `bun run validate` (JSON schemas only), or `bun run knip` (dead code only) when you know exactly what scope changed.
- **End of session:** Run `bun run session:end` to squash-merge to main and clean up the branch.

---

## Skills

On-demand knowledge loaded when relevant. Each skill has trigger descriptions — the system activates them automatically based on the `description` field in their YAML frontmatter. **All skills and prompts must have YAML frontmatter with a `description` field** — this is how agents discover and load them. Missing descriptions = invisible files.

| Skill                    | When to Use                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `ttrpg-rules-editor`     | Editing rules content, formatting rulebook text, processing chapters |
| `dtd-source-hierarchy`   | Source authority questions, rule verification, ambiguity resolution  |
| `tool-development`       | Building, modifying, or debugging web tools, JS, CSS, JSON data      |
| `product-owner`          | Decisions about what to build, prioritize, or cut; strategic context |
| `frontend-stack-advisor` | Frontend technology choices, framework evaluation, stack decisions   |

---

## Project Architecture

```
books/                 Core reference material (per-chapter split, 2 books, .mdx)
cleaned-references/    Succinct combined reading references (merged by topic, .mdx)
data/                  Canonical JSON game data (12 files, validated by Zod schemas)
docs/                  Technical documentation, conventions
  project-conventions.md  Single source of truth for all cross-cutting rules
  tools/               Per-tool feature specs (6 tools)
  shared/              Shared module API docs (core.ts, dice.ts)
scripts/               TypeScript pipeline: validate, lint, sync-check, prebuild
  __tests__/           Pipeline script tests (validate, lint, sync-check, check-structure)
.github/               Agent instructions, skills, prompt files
astro.config.mjs       Starlight configuration, sidebar, Vercel adapter
biome.json             Biome linter/formatter config (JS/TS/CSS)
package.json           Dependencies (Astro, Starlight)
tsconfig.json          TypeScript strict config with @/ path alias
bunfig.toml            Bun config (shell, test runner settings, preload)
scripts/prebuild.mjs   Copies content into Astro structure, injects Starlight frontmatter
src/                   Astro source files
  test-setup.ts        jsdom globals + jest-dom matchers (preloaded by bunfig.toml)
  content/docs/        Generated Starlight content (gitignored)
  pages/tools/         Tool pages (Astro pages outside Starlight)
  components/
    react/
      __test-utils__/  Mock game data, render wrapper
      tools/           React island components (6 tools, 74 components)
      ui/              Shared UI primitives (migrating to shadcn/ui)
        __tests__/     UI primitive tests (Accordion, Modal, Tabs, Toast)
  hooks/               Custom React hooks (use-data.ts)
  lib/dtd/             ES modules: core.ts (barrel), character.ts, data.ts, derived.ts, dice.ts, dice-primitives.ts, types.ts
  lib/dtd/__test-utils__/  Mock localStorage, fetch, dice
  lib/dtd/schemas/     Zod schemas (source of truth for all 12 JSON data files)
  layouts/             ToolLayout.astro
  styles/
    custom.css         WH40K theme (Starlight)
    tailwind.css       Tailwind v4 @theme tokens (design token source of truth)
public/data/           Generated JSON data copies (gitignored)
```

**Workflow:** `books/` and `cleaned-references/` are `.mdx` files — `cleaned-references/` condenses them by topic — `data/` holds the canonical JSON game data, copied to `public/data/` for Astro — `src/lib/dtd/schemas/` validates the data. `docs/` documents everything.

**Build:** `bun run build` runs `prebuild.mjs` (copies content/data, injects frontmatter) then `astro build` (Pagefind search). Dev server: `bun run dev`. Lint with `bun run lint`. Run tests with `bun run test`.

**Deployment:** Vercel is connected to GitHub. Production deploys on `main` merge; preview deployments auto-created for every PR. GitHub Actions CI (`.github/workflows/build.yml`) runs Biome lint → bun test → JSON validation → content lint → knip → Astro build on every push/PR.

### Pipeline Scripts

TypeScript pipeline scripts (run via bun):

| Script                   | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `bun run check`            | **Run everything:** tests → lint → validate+xref → content lint → sync-check → knip → check:deps → check:structure |
| `bun run test`             | Unit tests only (bun:test)                                                         |
| `bun run lint`             | Biome lint/format check only                                                       |
| `bun run validate`         | Validate all 12 JSON data files against Zod schemas                                |
| `bun run validate:xref`    | Validate + cross-reference checks (class→skill, class→feat)                        |
| `bun run lint:data`        | Lint content for terminology, formatting, encoding                                 |
| `bun run sync-check`       | Detect drift between content and JSON data                                         |
| `bun run knip`             | Dead code detection: unused files, exports, types, dependencies                    |
| `bun run check:deps`       | Enforce architectural import boundaries (dependency-cruiser)                       |
| `bun run check:structure`  | Verify TS structural conventions: stores, barrel exports, named-exports-only       |
| `bun run test:coverage`    | Text coverage summary (local-only, no CI threshold)                                |
| `bun run test:coverage:lcov` | lcov report for tooling integration                                              |
| `bun run session:start`    | Create/switch to session branch + baseline check                                   |
| `bun run session:end`      | Squash-merge to main + cleanup                                                     |
| `bun run session:status`   | Quick git state report                                                             |
| `bun run upgrade:recon`    | Dependency recon: outdated, audit, tree health, override check                     |
| `bun run maintenance:recon` | Comprehensive project discovery for maintenance sessions                           |

All 12 JSON files pass validation. Cross-ref warnings for abbreviated feat names and missing skills in `classes.json` are real data gaps, not bugs.

### Cleaned References Index

| File                          | Content                                      |
| ----------------------------- | -------------------------------------------- |
| 01-Core-Rules.mdx             | Dice system, tests, raises/checks            |
| 02-Char-Creation.mdx          | 9-step character creation                    |
| 03-Characteristics-Skills.mdx | 9 characteristics, skill list                |
| 04-Races.mdx                  | 16 playable races                            |
| 05-Exaltations.mdx            | Supernatural types (Vampire, Werewolf, etc.) |
| 06-Classes.mdx                | 50+ classes with progression tables          |
| 07-Feats.mdx                  | Feats, assets, hindrances                    |
| 08-Backgrounds.mdx            | Background dots (Allies, Wealth, etc.)       |
| 09-Alignments.mdx             | Pantheons and devotion mechanics             |
| 10-Equipment.mdx              | Weapons, armor, gear                         |
| 11-Magic.mdx                  | Sorcery system and spell schools             |
| 12-Sword-Schools.mdx          | 9 melee combat disciplines                   |
| 13-Gun-Kata.mdx               | 6 ranged combat disciplines                  |
| 14-Combat.mdx                 | Combat rules and action economy              |
| 15-Social-Combat.mdx          | Social interaction mechanics                 |
| 16-Conditions.mdx             | Status effects                               |
| 17-Vehicles.mdx               | Vehicle rules                                |
| 18-Ships.mdx                  | Spelljammer-style space vessels              |
| 19-Antagonists.mdx            | NPC creation and 40+ stat blocks             |
| 20-Artifacts.mdx              | Magical items                                |
| 21-Advanced-Rules.mdx         | Optional rules                               |
| 22-SM-Reference.mdx           | Story Master tools                           |
| 23-Setting-Lore.mdx           | Setting & lore (Crystal Spheres, factions)   |

---

## Where to Find What

All project conventions (git workflow, terminology, formulas, pitfalls, appendix mapping) live in **[docs/project-conventions.md](../docs/project-conventions.md)** the canonical cross-cutting reference. Skills and other docs link there rather than duplicating.

| Need                     | Go To                                                         |
| ------------------------ | ------------------------------------------------------------- |
| Conventions and pitfalls | [docs/project-conventions.md](../docs/project-conventions.md) |
| Editorial technique      | `ttrpg-rules-editor` skill (auto-loads for editing tasks)     |
| Source authority         | `dtd-source-hierarchy` skill                                  |
| Tool architecture        | [docs/architecture.md](../docs/architecture.md)               |
| JSON data schemas        | [docs/data-reference.md](../docs/data-reference.md)           |
| Pipeline & validation    | [docs/pipeline.md](../docs/pipeline.md)                       |
| Per-tool specs           | [docs/tools/](../docs/tools/) (6 files)                       |
| Shared module APIs       | [docs/shared/](../docs/shared/) (core-js.md, dice-js.md)      |
| React components         | `src/components/react/tools/`                                 |
| React hooks              | `src/hooks/`                                                  |
| Test infrastructure      | `src/test-setup.ts`, `src/**/__test-utils__/`                  |
| Design tokens            | `src/styles/tailwind.css` (`@theme` block)                    |
| Product vision & goals   | [docs/product-vision.md](../docs/product-vision.md)           |
