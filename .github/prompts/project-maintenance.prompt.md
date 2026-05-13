---
description: "Autonomous maintenance session: audit configs, upgrade dependencies, remove dead code, and modernize the project. Discovers the target project and runs to completion."
---

# Project Maintenance

This is a **CLOSED PROMPT** — it launches on a clean session, discovers its target project, and runs autonomously to completion. It does NOT assume a specific project, toolchain, or framework. It probes, discovers, and self-assembles.

You are the **maintenance session owner**. You have full authority over this project's dependency versions, configuration files, dead code removal, and toolchain modernization for the duration of this session. No other agent or session will dispute your work. Your decisions are final.

---

## Operating Principles

- **Config files are code.** Every dotfile, JSON config, and workflow definition deserves the same rigor as source code. Stale configs, deprecated options, and missing best-practice files are all defects.
- **Programmatic verification is the arbiter.** If a tool can check it, the tool's output decides. Human judgment is for what tools can't measure.
- **Discover before assuming.** Never hardcode a package name, file path, or tool command. This prompt targets **any project** — JavaScript, Python, Rust, Go, Java, C#, multi-stack monorepos, or anything else. Scan the filesystem, read manifest files, detect the stack. Build your plan from what you find, not from what you expect.
- **The branch is the safety net.** If the process fails irrecoverably, the branch is deleted. That's the rollback mechanism — not timidity.
- **The aggregate check command passing is the red line.** If the project has a comprehensive check script (e.g., `check`, `ci`, `verify`), that must pass before and after every phase. No exceptions.
- **You are an orchestrator.** Leverage the project's own tooling — its linter, test runner, dead code detector, and validation scripts. Your role is to arbitrate and sequence, not to manually replicate what programmatic tools already do.
- **No preconceptions.** The current pinning strategy, version ranges, config choices, and overrides are all open for review. Decide what's best for the project right now.
- **Resolution is the work.** This is not just version bumping or config tweaking — it's resolving the consequences: breaking changes, deprecated API removal, code modernization, dead pattern cleanup.
- **Deferral is failure.** If a phase produces findings — lint warnings, dead code, broken types, new rule violations — resolve them in this session. Do NOT log them as "recommendations for a future session." The operator gave you full authority precisely so you can drive everything to resolution. The only acceptable deferral is a finding that literally cannot be resolved without the operator's input (e.g., a design decision with no clear answer).
- **Backwards compatibility is not a concern.** Clean, current, idiomatic code is the goal. The operator explicitly accepts that this session may introduce breaking changes.

---

## Phase A — Bootstrap & Ground Truth

### A0. Shell Verification

Before any work, verify the terminal environment is safe for this project.

**On Windows:** The correct shell for VS Code agents is **Git Bash**, not Command Prompt or PowerShell. Two settings control terminal selection — they are independent and both must be set:

| Setting | Controls |
|---------|----------|
| `terminal.integrated.defaultProfile.windows` | Terminals opened by the user |
| `chat.tools.terminal.terminalProfile.windows` | Terminals opened by agents/tools |

If either is missing or points to the wrong shell, fix `.vscode/settings.json` and report the change. Do not rely on the user's global settings — workspace settings must be explicit.

### A1. Project Discovery

Identify what this project is — its stacks, toolchains, and structure — by probing the filesystem. Do NOT assume a single language or ecosystem. Many projects are multi-stack (e.g., Python backend + React frontend, Rust core + Node bindings). Discover each stack independently.

#### A1.1. Stack Detection

Scan the project root and immediate subdirectories for **manifest files** that identify each stack:

| Manifest File | Stack | Package Manager | Lockfile |
|---------------|-------|-----------------|----------|
| `package.json` | JavaScript/TypeScript | npm / yarn / pnpm / bun | `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` / `bun.lock` |
| `pyproject.toml` | Python | uv / poetry / pip | `uv.lock` / `poetry.lock` / `requirements.txt` |
| `requirements.txt` | Python (legacy) | pip | — |
| `Cargo.toml` | Rust | cargo | `Cargo.lock` |
| `go.mod` | Go | go modules | `go.sum` |
| `pom.xml` / `build.gradle` | Java/Kotlin | Maven / Gradle | — |
| `*.csproj` / `*.sln` | C# / .NET | dotnet / NuGet | — |
| `Gemfile` | Ruby | Bundler | `Gemfile.lock` |
| `composer.json` | PHP | Composer | `composer.lock` |

For each detected stack, note:
- **Root directory** (may be a subdirectory like `backend/`, `frontend/`, `api/`)
- **Package manager** (inferred from lockfile presence or config)
- **Language version** (from `engines`, `requires-python`, `rust-edition`, `go` directive, etc.)
- **Framework** (FastAPI, Django, React, Astro, Actix, Gin, etc. — from dependencies)

**Monorepo detection.** If multiple `package.json` files exist (root + subdirectories), or a `workspace` field is present, or tools like Turborepo/Nx/Lerna are detected — note the workspace structure. Each workspace member may need independent upgrade handling.

#### A1.2. Per-Stack Toolchain Inventory

For each detected stack, discover its tools:

**JavaScript/TypeScript stack:**
- Linter: Biome, ESLint (flat or legacy config), or none
- Formatter: Biome, Prettier, or none
- Test runner: Vitest, Jest, Playwright, Cypress, or none
- Type checker: TypeScript (`tsc`), or none
- CSS framework: Tailwind, PostCSS, or none
- Bundler/dev server: Vite, Webpack, Next.js, Astro, etc.
- Linter presets: check `biome.json` `"extends"` or ESLint config extends
- Scripts: read all `package.json` scripts — note which are check/test/lint/build/dev

**Python stack:**
- Package manager: uv (`pyproject.toml` with `[tool.uv]`), poetry (`[tool.poetry]`), pip
- Linter/formatter: ruff, black, flake8, pylint, mypy, or none
- Test runner: pytest, unittest, or none
- Type checker: mypy, pyright, pytype, or none
- Framework: FastAPI, Django, Flask, etc.
- Scripts: check `[tool.taskipy]`, `[tool.poe]`, `Makefile`, or `scripts/` directory

**Rust stack:**
- Linter: clippy
- Formatter: rustfmt
- Test runner: `cargo test`
- Build: `cargo build`

**Go stack:**
- Linter: golangci-lint, go vet
- Formatter: gofmt, goimports
- Test runner: `go test`

For unlisted stacks, apply the same principle: find the manifest, identify the package manager, detect linter/formatter/test runner from config files or dependencies.

#### A1.3. Recon Script (optional shortcut)

If the project has a `maintenance:recon` script in `package.json`:
- Run it and capture the JSON manifest from stdout. Read the human summary from stderr.
- Save as the **project profile** — but still verify against A1.1/A1.2 for completeness (the script may not cover all stacks).

#### A1.4. Tool Availability

For each detected stack, verify the maintenance tools are available on PATH:

**JavaScript/TypeScript:**
- **ncu (npm-check-updates):** `npx npm-check-updates --version` or `bunx npm-check-updates --version`. Install if needed.
- **Package manager CLI:** Verify functional.
- **Node version:** Note version; compare against `engines.node`.

**Python:**
- **Package manager:** `uv --version`, `poetry --version`, or `pip --version`.
- **Linter/formatter:** `ruff --version`, `black --version`, `mypy --version`, etc.
- **Test runner:** `pytest --version` or equivalent.

**Rust:** `cargo --version`, `rustc --version`, `clippy-driver --version`.

**Go:** `go version`, `golangci-lint --version`.

For any stack, if a critical tool is missing and can be installed, install it. If it requires system-level installation outside the agent's authority, note it and proceed with what's available.

### A2. Version Control Bootstrap

Before anything else, verify the project has a functioning git repository. The entire maintenance workflow depends on branching and rollback.

1. **Check `git status`.** If it succeeds, the repo exists — proceed.
2. **If `git status` fails** (not a git repository):
    - Run `git init`.
    - Stage everything: `git add -A`.
    - Create an initial commit: `git commit -m "Initial commit"`.
    - This gives the maintenance session a clean base to branch from and diff against.
3. **Check for uncommitted changes.** If the working tree is dirty, decide:
    - If the changes look like in-progress work, **do NOT commit them** — ask the user or note the risk and proceed on top.
    - If the changes look like forgotten artifacts (build output, editor temp files), clean them up.

### A3. Establish Baseline

Before changing anything, record the current state so every subsequent check can be compared.

1. **Run the aggregate check command** if one exists (commonly named `check`, `ci`, `verify`, or `test:all`). Record the full output — this is the **"before" snapshot**.
    - If no aggregate command exists, **build a synthetic check sequence** from the detected per-stack tools. Chain them in this order for each stack: test runner → linter → type checker → build → any validation scripts. Record the full command and its output — this becomes the project's ad-hoc aggregate check for the rest of the session. Use it everywhere this prompt says "aggregate check command."
    - If the project has **no detectable check tooling at all** (no test runner, no linter, no type checker), note this in the briefing as a gap. The baseline is "no automated checks exist." Proceed with config audit and dependency upgrades; the dev server smoke test and IDE diagnostics become the primary validation.

2. **Note pre-existing warnings.** Many projects have known linter warnings (false positives, intentional patterns, legacy code). Count them. New warnings after your work are regressions; removing old warnings is an improvement.

3. **Tree health.** Run the appropriate package manager command for each detected stack:
    - npm: `npm ls --depth=1`
    - yarn: `yarn list --depth=1`
    - pnpm: `pnpm ls --depth=1`
    - Bun: `bun pm ls --depth=1`
    - uv: `uv pip list` or `uv tree`
    - poetry: `poetry show --tree`
    - pip: `pip list --outdated`
    - cargo: `cargo tree --depth=1`
    - go: `go list -m all`

### A4. Read Context

Read the project's documentation and configs to understand conventions before making decisions.

1. **Project conventions docs.** Look for and read (if they exist): `CONTRIBUTING.md`, `CLAUDE.md`, `AGENTS.md`, `docs/project-conventions.md`, `docs/DEVELOPMENT.md`, `README.md` (sections on development, contributing, or tooling), `Makefile` (for common commands).
2. **Dependency manifest details.** For each detected stack:
    - **JS/TS:** Read `package.json` `overrides`/`resolutions` and `engines`. Note any `_comments` explaining why overrides exist.
    - **Python:** Read `pyproject.toml` `[tool.*]` sections, dependency groups, Python version constraints.
    - **Rust:** Read `Cargo.toml` `[patch]` and `[profile]` sections, edition, MSRV.
    - **Go:** Read `go.mod` directives, `go.sum` presence.
3. **Changelogs and migration guides.** If the discovery report shows major version bumps available for framework-tier dependencies, fetch migration guides when `fetch_webpage` is available.

---

## Phase B — Plan

Produce a brief maintenance plan. This is for **transparency, not approval** — state what you intend to do, then do it.

### B1. Scope Assessment

Based on the project profile (manifest), determine which phases apply:

| Phase | Condition |
|-------|-----------|
| C — Config Audit | Always (every project has config files) |
| D — Dependency Upgrade | If outdated packages were detected in any stack |
| D9 — Security Audit | Always (run even if no version upgrades — vulnerabilities exist independently) |
| E — Dead Code & Hygiene | If tools like `knip`, `check:structure`, or `check:deps` exist |
| F — Validate & Clean | Always |
| F5 — Dev Server Smoke Test | If the project has a dev server script and can run locally |
| F6 — IDE Diagnostics Check | Always (uses `get_errors` tool to surface VS Code Problems) |
| G — Briefing | Always |

### B2. Execution Order

Execute in this order. Rationale: upgrade the tools that validate code before upgrading the code they validate. Audit configs before dependencies so the tools are correctly configured when they run.

1. **Config Audit** — ensure all configs are valid, current, and complete before relying on them
2. **Dependency Upgrade** — toolchain first (linter, type checker), then framework, then utilities
3. **Dead Code & Hygiene** — run after upgrades so removed dependencies and APIs are caught
4. **Validate & Clean** — CLI checks, build, lint autofix, content linting
5. **Dev Server Smoke Test** — start the app, navigate critical routes, verify no blank pages or console errors
6. **IDE Diagnostics** — use `get_errors` tool to surface and resolve VS Code Problems panel findings
7. **Baseline Comparison** — compare final state against Phase A snapshot

### B3. Acknowledgment

State clearly:

> "This plan upgrades aggressively and modernizes configs. The branch is the safety checkpoint. If the result doesn't pass the aggregate check command, the branch can be discarded. The intent is to bring the project to the best possible maintenance state — not to preserve the current one."

Then proceed to execution.

---

## Phase C — Config Audit

Audit every config file discovered in Phase A. For each file, apply the generic pattern then the category-specific checks. In multi-stack projects, each stack may have its own config files (e.g., `frontend/tsconfig.json`, `backend/pyproject.toml`) — audit all of them.

### Generic Pattern (applies to every config file)

1. **Does the file parse without errors?** (JSON, YAML, TOML — check format validity)
2. **Is there a `$schema` URL?** If yes, is it current for the installed tool version?
3. **Are there deprecated options?** Check against the current version of the tool the config serves.
4. **Are there new options worth enabling?** Check the tool's changelog or docs for recently added features.
5. **Do file paths, patterns, and globs match the current project structure?** (Entry points, ignore patterns, include/exclude lists)

### C0. Create Session Branch

```
# If the project has a session:start script, use it:
<package-manager> run session:start maintenance-YYYY-MM-DD

# Otherwise, create a branch manually:
git checkout -b maintenance-YYYY-MM-DD
```

If the session start script reports a dirty tree or failing baseline, resolve that first.

### C1. Version Control — `.gitignore`

1. **Generated artifacts covered.** Every build output, generated content directory, and cache should be ignored. Check for: `dist/`, `build/`, `.cache/`, `node_modules/`, coverage directories, generated content directories (identified from prebuild scripts or framework conventions).
2. **Stale patterns.** Remove patterns for tools or directories that no longer exist in the project.
3. **Missing patterns.** Check for common omissions: editor temp files (`*.swp`, `*~`), OS files (`.DS_Store`, `Thumbs.db`), environment files (`.env.local`), lock files from non-canonical package managers.
4. **Source material safety.** If the project has copyrighted/proprietary source material directories, verify they're ignored.

### C2. Version Control — `.gitattributes`

1. **Text normalization.** Verify `* text=auto eol=lf` is set (ensures consistent line endings in the repo regardless of OS).
2. **Binary file coverage.** All binary file extensions used in the project should be marked as `binary`: images (`.png`, `.jpg`, `.gif`, `.ico`, `.webp`, `.svg`), fonts (`.woff`, `.woff2`, `.ttf`, `.otf`), documents (`.pdf`), etc.
3. **Linguist hints.** Consider adding `*.mdx linguist-language=Markdown` (for GitHub rendering) and framework-specific hints (e.g., `*.astro linguist-language=TypeScript`).
4. **Lockfile merge strategy.** If a lockfile exists and is committed, consider adding a merge strategy: `bun.lock merge=binary` (or equivalent for the detected lockfile).
5. **If `.gitattributes` doesn't exist** and should — create it with the above settings.

### C3. Editor Config — `.editorconfig`

1. **If it exists:** Verify settings align with the project's formatter config (indent style, indent size, line endings, charset, trailing whitespace).
2. **If it doesn't exist:** Assess whether to create one. EditorConfig is useful when:
    - The project has contributors who may not use the primary linter/formatter
    - Quick edits on GitHub.com or other web editors should get basic formatting right
    - Non-linted file types (TOML, YAML, shell scripts) need consistent formatting
3. **If creating:** Derive settings from the detected linter/formatter config—don't introduce conflicts.

### C4. Editor Config — `.vscode/settings.json` and `.vscode/extensions.json`

1. **Run `get_errors` on `.vscode/` files.** Call `get_errors` with paths to `settings.json` and `extensions.json` (and any other files in `.vscode/`). This catches schema validation errors, incorrect types, and deprecated setting names that are invisible to CLI tools. Fix all reported issues before proceeding — config errors here propagate to every other tool's behavior.
2. **Formatter associations.** Verify the default formatter for each language matches the detected linter/formatter.
3. **Deprecated settings.** Check for settings deprecated by tool updates:
    - **Biome:** `biome.lspBin` → `biome.lsp.bin`; `biome.requireConfigFile` → `biome.requireConfiguration`; `quickfix.biome` → `source.fixAll.biome`
    - **ESLint:** `eslint.autoFixOnSave` → `editor.codeActionsOnSave` with `source.fixAll.eslint`
4. **Format on save.** Verify `editor.formatOnSave` and `editor.codeActionsOnSave` are configured for the detected tools.
5. **Spell check dictionary.** If present, check for stale terms from removed features or renamed concepts.
6. **Recommended extensions.** In `.vscode/extensions.json`, verify the recommended extensions match the project's toolchain.

### C5. Linter & Formatter Config

Apply checks based on the **detected linter** from the project profile.

**If Biome:**
1. **Schema URL.** `$schema` in `biome.json` must match the installed `@biomejs/biome` version exactly: `https://biomejs.dev/schemas/<VERSION>/schema.json`.
2. **Config validity.** Run the linter's check command with summary output and read for "unknown option" warnings or parse errors.
3. **Extends / preset check.** If the config uses `"extends"` (e.g., `ultracite/biome/{core,react,astro}`), verify the preset package is installed and the extends paths resolve. If the config does NOT use a preset and relies only on `"recommended": true`, assess whether adopting **ultracite** would be beneficial — it provides ~200+ curated rules (Tailwind class sorting, optional chaining, sorted attributes/properties, cognitive complexity) as a stress-tested baseline. The integration pattern: `"extends": ["ultracite/biome/core", "ultracite/biome/react"]` (add `"ultracite/biome/astro"` for Astro projects), then add project-specific overrides for rules that don't fit. Expect ~50-100 auto-fixable violations on first adoption — `biome check --write --unsafe` handles the bulk.
4. **Domains review.** Biome v2+ uses linter domains (framework-aware rule sets). Check if domains relevant to the detected stack (`react`, `next`, `test`, etc.) are declared in `linter.domains`.
5. **HTML/Astro support.** If the framework is Astro, check `html.experimentalFullSupportEnabled: true` and `html.formatter.enabled: false` (the Astro extension owns `.astro` formatting).
6. **VS Code extension alignment.** Check the installed Biome VS Code extension version against the CLI version. Note mismatches in the briefing.
7. **New rules.** Review the changelog for rules added since the current version. Worth-enabling rules should be noted in the briefing. If using ultracite, also check `npm info ultracite` for preset updates that may enable new rules.
8. **Newly-promoted rules.** Even patch versions can promote rules from `nursery` to `recommended`, which effectively introduces new errors/warnings across the codebase. After any Biome version change (or ultracite version change), run `biome check .` and compare the warning/error count to the Phase A baseline. If new violations appeared, **resolve them now** — see the resolution techniques below.
9. **Override hygiene.** If the config has project-specific overrides (rules set to `off`), review whether they are still needed. Rules may have been disabled during initial ultracite adoption that the codebase has since grown to accommodate. Re-enable incrementally and test.

**Biome violation resolution techniques** (apply during C5, D3, or whenever new violations surface):

- **Auto-fix first.** Run `biome check --write --unsafe --only=<rule-group>/<rule-name>` per rule. This resolves the majority of `useExhaustiveDependencies` violations automatically.
- **`useHookAtTopLevel`:** Components that call hooks after an early return (`if (!data) return null`) must be restructured: move all hooks above the guard, use optional chaining for derived values, then place a single combined guard after all hooks.
- **`noArrayIndexKey`:** For display-only lists with stable data, derive a key from the data (e.g., `item.name`, `item.id`). For editable form lists where items have no stable identity, suppress with `biome-ignore`.
- **`biome-ignore` in JSX:** Place the comment **inside** the JSX tag as an attribute-level comment directly before the `key` prop — NOT before the opening tag. Biome's formatter splits multi-line JSX attributes to separate lines, which breaks suppression comments placed before the tag.
  ```jsx
  <div
    // biome-ignore lint/correctness/noArrayIndexKey: editable list, no stable key
    key={index}
  >
  ```

**If ESLint:**
1. **Config format.** ESLint 9+ uses flat config (`eslint.config.js`). If the project uses legacy format (`.eslintrc.*`), note migration opportunity.
2. **Plugin freshness.** Check that all ESLint plugins are compatible with the installed ESLint version.
3. **Deprecated rules.** Run `eslint --print-config .` and check for deprecated rule names.
4. **TypeScript integration.** If TypeScript is used, verify `@typescript-eslint/parser` and plugin versions match.

**If Prettier (standalone or alongside linter):**
1. **Config conflicts.** If both a linter and Prettier are detected, verify they don't have conflicting rules (tab vs spaces, quote style, etc.).

**Run the linter's autofix** after config changes: the detected `lint:fix` script or equivalent.

**Commit:** `chore: audit and update linter/formatter config`

### C6. TypeScript Config

1. **Extends target.** Verify the `extends` value (if any) points to a current base config (e.g., `astro/tsconfigs/strict` for Astro, `@tsconfig/strictest` for general projects).
2. **Compiler options.** Review for new strict flags available in the current TypeScript version that aren't enabled.
3. **Path aliases.** Verify `paths` entries match actual project structure (e.g., `@/*` → `src/*`).
4. **Module detection.** Ensure `moduleDetection` is set appropriately for the project type.

### C7. Build & Framework Config

Apply checks based on the **detected framework**.

**General:**
1. Does the config file parse without errors?
2. Are there deprecated configuration options for the installed framework version?
3. Are there new configuration options worth enabling?

**If Astro:**
1. Verify `output` mode (static, server, hybrid) matches deployment target.
2. Check integrations list against installed `@astrojs/*` packages.
3. Verify `site` URL is set (required for sitemap, canonical URLs).

**If Next.js:**
1. Check for deprecated `next.config.js` options in the installed version.
2. Verify `output` setting matches deployment target (standalone, export).

### C8. Test Runner Config

1. **Preload/setup files.** Verify paths to test setup files exist and are correct.
2. **Test patterns.** Verify glob patterns for test file discovery match actual test file locations.
3. **Coverage config.** If coverage is configured, verify output directories are gitignored.

### C9. Package Manager Config

1. **`bunfig.toml` / `.npmrc` / `.yarnrc.yml`**: Verify settings are valid and compatible with current package manager version.
2. **Shell setting.** For Bun, verify `[run] shell` is set explicitly (avoids cross-platform issues).

### C10. Code Quality Tools

**If `knip.json` or `knip.ts` exists:**
1. Verify entry points match actual application entry points (pages, scripts, etc.).
2. Verify `project` scope covers all source directories.
3. Review `ignore` patterns — are they still needed?
4. Review `ignoreDependencies` — are suppressed false positives still false positives?
5. Check for new knip plugins relevant to the detected stack (Astro, Next.js, React, etc.).

**If `.dependency-cruiser.cjs` or `.dependency-cruiser.js` exists:**
1. Verify boundary rules match current architecture.
2. Verify exclusion patterns (e.g., `node_modules`, virtual module prefixes like `astro:` or `bun:`).
3. Run the check command and review output for new violations.

### C11. Content Linting — `.rumdl.toml` / `.markdownlint.*`

1. Verify disabled rules are still appropriate.
2. Verify per-file overrides match current file structure and naming patterns.
3. Check for new rules in the current tool version.

### C12. CI/CD Config

**If GitHub Actions:**
1. **Action versions.** Check each `uses:` reference for the latest major version:
    - `actions/checkout` → currently `v4`
    - `actions/setup-node` → currently `v4`
    - `oven-sh/setup-bun` → currently `v2`
    - Other actions: check for major version updates.
2. **Node version.** Verify `node-version:` matches the `engines.node` requirement in `package.json`.
3. **Pipeline parity.** Verify CI steps run the same checks as the local aggregate check command. If CI runs fewer checks than local, note the gap. If CI runs checks in a different order, assess whether order matters.
4. **Caching.** Check if dependency caching is configured (speeds up CI by ~30-60%).

**If GitLab CI / CircleCI / Other:** Apply the same principles — action/image freshness, Node version, pipeline parity.

### C13. Lockfile Strategy

1. **Does a lockfile exist?** (Identified in discovery)
2. **Is it committed to git?** (Checked via `git ls-files`)
3. **Assessment criteria:**
    - **For applications (not libraries):** Lockfiles provide reproducible builds. Recommended to commit.
    - **For libraries:** Lockfiles can be excluded (consumers bring their own resolution).
    - **For Copilot/agent-maintained projects with single developer:** Lockfiles may cause unnecessary merge conflicts with no practical benefit. Assess whether CI or deployment actually uses the lockfile.
4. **Document the decision** in the briefing, whichever way it goes. If the lockfile should be committed but isn't (or vice versa), fix it.

**Commit config audit changes:** `chore: audit and modernize project config files`

---

## Phase D — Dependency Upgrade

Skip this phase entirely if no outdated packages were detected in Phase A.

### D0. Run Dependency Intelligence

For each detected stack, gather outdated dependency information.

**If the project has an `upgrade:recon` script**, run it and save the JSON manifest.

**Otherwise, gather manually per stack:**

**JavaScript/TypeScript:**
- `npm outdated --json` (or equivalent for yarn/pnpm/bun)
- Check changelogs for framework-tier packages with major bumps

**Python:**
- `uv pip list --outdated` / `poetry show --outdated` / `pip list --outdated`
- Check PyPI for major version changes in framework packages

**Rust:**
- `cargo outdated` (if cargo-outdated is installed)
- Check crates.io for major version bumps

**Go:**
- `go list -m -u all` for available updates

### D1. Classify Dependencies

Classify every outdated package into a tier. Do NOT hardcode tier assignments — classify based on the detected stack. Apply this classification **per stack** — a Python project and a JS project within the same repo each get their own tiered classification.

| Tier | What belongs here | Why upgrade first |
|------|-------------------|-------------------|
| **Toolchain** | The detected linter, linter presets (e.g., `ultracite`), `typescript`, `@types/*` for the detected test runner/runtime | These tools validate code. Upgrade them first so subsequent checks use the latest rules. |
| **Framework** | The detected framework and its ecosystem packages (adapters, integrations, plugins with peer dep coupling) | Largest blast radius. Must be upgraded as a coordinated set. |
| **Utility** | Everything else — standalone libraries, analytics, validation libs, etc. | Low coupling risk. Can be upgraded independently. |

### D2. Toolchain Tier

Use ncu's doctor mode to safely upgrade toolchain deps with automatic rollback on failure:

```
<npx-or-bunx> npm-check-updates --doctor --doctorTest "<aggregate-check-command>" --filter "<toolchain-package-list>"
```

**Doctor mode behavior:** For each package, ncu upgrades it, runs the doctor test, and automatically rolls back any upgrade that breaks the test.

After doctor mode completes:

1. **Review results.** Which upgrades succeeded? Which were rolled back?
2. **Resolve rollbacks.** For each rolled-back dep, investigate why the check failed:
    - **New linter rules:** Run the lint autofix command first — many new rule violations have auto-fixes. For the rest, update code to comply or disable the specific rule with rationale.
    - **TypeScript errors:** Resolve type errors introduced by stricter checking. Modernize code, don't patch with `any` or `@ts-ignore`.
    - After resolving, manually set the version, install, and run the check command to verify.
3. **Tree health.** Verify no unmet peer deps.
4. **Commit:** `chore: upgrade toolchain`

### D3. Linter Config Audit (conditional — only if linter or preset version changed)

If the linter package was upgraded in D2, or if a config preset like ultracite was upgraded, the config may need updating. Run the linter-specific audit steps from Phase C5 again:
- Update schema URL
- Check for renamed/deprecated options
- Review new rules and domains
- If using ultracite: check if the new version enables additional rules that produce violations
- Run config validity check
- **Compare violation count to Phase A baseline.** Newly-promoted rules (or newly-enabled rules from a preset update) can introduce violations even in patch upgrades. If violations increased, resolve them using the techniques documented in C5 before proceeding.

**Commit:** `chore: sync linter config to new version`

### D4. Framework Tier

**Do NOT use ncu doctor for framework deps.** Framework ecosystems have version-coupled packages with peer dependencies that must be upgraded as a coordinated set.

1. **Check compatibility.** Use `npm view <package>@latest peerDependencies --json` for each framework ecosystem package. Find a version set where all packages agree on the framework version.
2. **Choose a compatible version set.** All ecosystem packages must resolve without peer dep conflicts.
3. **Update `package.json`** with the chosen versions.
4. **Install.** Never use `--legacy-peer-deps` or `--force` — these hide problems.
5. **Tree health.** Verify no unmet peers.
6. **Migration guide.** If a major version bump occurred, follow the migration guide step by step. Apply config changes, remove deprecated APIs, adopt new patterns. **Modernize, don't patch around.** If the framework deprecated a pattern, adopt the new one.
7. **Build.** Run the build command — framework builds catch template and config issues.
8. **Full check.** Run the aggregate check command.
9. **Commit:** `chore: upgrade framework ecosystem`

### D5. Utility Tier

Use ncu doctor for everything not in toolchain or framework:

```
<npx-or-bunx> npm-check-updates --doctor --doctorTest "<aggregate-check-command>" --reject "<toolchain-and-framework-packages>"
```

1. **Review results** — resolve any rollbacks as in D2.
2. **Commit:** `chore: upgrade utility dependencies`

### D6. Overrides Review

For each override in `package.json` (or `resolutions` in yarn):

1. **Check if still needed.** Does the parent dependency now include the fix in its own transitive deps?
    - Check the tree to see who depends on the overridden package and what version they'd pull without the override.
    - Check the parent's changelog for whether the vulnerability/bug the override addresses has been fixed upstream.
2. **Remove stale overrides.** Update `package.json`, install, verify tree health + full check.
3. **Keep necessary overrides.** If still needed, update the comment explaining why.
4. **Commit:** `chore: clean up stale dependency overrides`

### D7. Pinning Review

Review all version specifiers in `package.json`:

- **Exact pins** (e.g., `"2.4.5"`): Are these still appropriate? Were they pinned for a reason that still holds?
- **Carets** (e.g., `"^5.3.0"`): Should any be pinned after this upgrade?
- **Decision criteria:** Pin tools where specific behavior matters (linters, formatters, type checkers). Use carets for libraries where patch/minor updates are safe.

**Commit separately if pinning strategy changes.**

### D8. Post-Install Validation

1. **Tree health.** Must show no unmet peer deps, no invalid entries, no extraneous packages.
2. **Engine check.** If any upgrade required raising `engines.node`, update it in `package.json`. Note that this affects CI (Node version in workflow) and deployment.

### D9. Security Audit

Run the security audit tool for each detected stack. This is not optional — vulnerabilities in dependencies are defects.

**JavaScript/TypeScript:**
1. Run `npm audit` (or `yarn audit`, `pnpm audit`, `bun audit`).
2. If vulnerabilities are found:
    - Run `npm audit fix` first — this resolves issues via semver-compatible upgrades.
    - If `audit fix` doesn't resolve everything, check whether the remaining advisories are in direct deps (fixable by upgrading) or transitive deps (may need overrides).
    - For transitive vulnerabilities: if the parent package has a newer version that resolves the issue, upgrade it. If not, add an `overrides` entry in `package.json` to force the patched transitive version, with a comment explaining the advisory.
    - Do NOT use `--force` with audit fix — it may introduce breaking changes silently.
3. Target: **0 vulnerabilities.** If any remain that cannot be resolved, document them in the briefing with severity, advisory URL, and why they can't be fixed (e.g., no upstream patch exists).

**Python:**
1. If `pip-audit` or `safety` is available, run it: `pip-audit` / `safety check`.
2. If neither is available and `uv` is the package manager, check `uv pip audit` availability.
3. Resolve by upgrading affected packages. If a direct upgrade isn't possible, note the advisory.

**Rust:**
1. If `cargo-audit` is available: `cargo audit`.
2. Fix by upgrading affected crates. If `cargo audit fix` is available, use it.

**Go:**
1. `govulncheck ./...` if available.
2. Upgrade affected modules.

**General principle:** Audit → auto-fix → manual resolve → document residual. The briefing must state the final audit result (0 vulnerabilities, or exactly which remain and why).

**Commit:** `fix: resolve security vulnerabilities`

---

## Phase E — Dead Code & Hygiene

Run all available code quality tools. Skip any tool that doesn't exist in the project.

### E1. Dead Code Detection

**If the project has a `knip` script:**

1. Run `knip` explicitly (don't rely on it being part of the aggregate check — run it standalone for detailed output).
2. Review findings: unused files, unused exports, unused types, unused dependencies, unlisted dependencies.
3. **Fix actionable items:**
    - Remove dead exports and orphan files.
    - Remove unused dependencies from `package.json`.
    - Add missing dependencies if unlisted.
4. **Update `knip.json`** ignore lists if genuine false positives are found. Document why each ignore entry exists.
5. **Commit:** `chore: remove dead code (knip)`

### E2. Structural Conventions

**If the project has a `check:structure` or `check-structure` script:**

1. Run it standalone for detailed output.
2. Fix any violations (store naming, barrel exports, named-only exports, etc.).
3. **Commit:** `chore: fix structural convention violations`

### E3. Dependency Boundaries

**If the project has a `check:deps` or `check-deps` script:**

1. Run it standalone for detailed output.
2. Review findings: circular dependencies, cross-module imports, boundary violations.
3. Fix violations — or update boundary rules if the architecture has intentionally evolved.
4. **Commit:** `chore: fix dependency boundary violations`

---

## Phase F — Validate & Clean

Final validation pass — this must be fully green before generating the briefing.

1. **Run the aggregate check command.** Must pass with zero new errors compared to the Phase A baseline.
2. **Run the build command** (if one exists). Production build must succeed. This is the definitive "does the project work" check.
3. **Run the lint autofix command** (if one exists). Final cleanup pass. Commit any auto-fixed changes.
4. **Run content linting** (if markdown/content linting scripts exist).

### F5. Dev Server Smoke Test

If the project supports local development (dev server script detected — commonly `dev`, `start`, or `serve`):

1. **Start the dev server** in async/background mode.
2. **Wait for ready signal** (Vite: "ready in", Next.js: "Ready in", generic: port listening).
3. **Open the application** in the integrated browser at the dev server URL.
4. **Navigate critical routes.** Visit at minimum:
    - The root/landing page
    - One page from each major section (e.g., a form page, a results page)
    - Verify no blank pages, console errors, or broken lazy imports.
5. **Distinguish real errors from dev artifacts.** If the dev server restarted during the session, stale module URLs cause `Failed to fetch dynamically imported module` errors. A hard refresh resolves these — they are NOT code bugs. Genuine import errors (wrong paths, missing exports, broken dependencies) will persist after refresh.
6. **Stop the dev server** when verification is complete.

**Multi-stack projects** (e.g., Python backend + React frontend):
- Start the backend first if it can run independently or has a dev mode.
- Start the frontend, which may proxy API calls to the backend.
- If the backend requires external services (databases, APIs) that aren't available locally, verify the frontend loads and renders without crashing — API errors are expected, but the UI should handle them gracefully (error boundaries, fallback states).

Skip this step if no dev server script exists or if the project is a library/CLI tool with no UI.

### F6. IDE Diagnostics Check

Use the **`get_errors` tool** (which surfaces VS Code's Problems panel — language server diagnostics, linter warnings, schema validation errors, accessibility checks) to catch issues that CLI tools miss.

**Important:** This step uses the IDE's diagnostic engine, NOT CLI linters. It catches accessibility issues (via HTML/JSX validators), JSON schema mismatches, TypeScript project reference problems, and framework-specific warnings that no CLI tool surfaces. Do not skip this step even if all CLI checks pass.

1. **Call `get_errors()` with no file path arguments** to retrieve all workspace diagnostics. This is how you access VS Code's Problems panel — there is no CLI equivalent.
2. **Categorize findings into actionable vs. noise:**

   **Real issues (fix these):**
   - TypeScript config warnings: missing `strict`, `forceConsistentCasingInFileNames`, invalid `target`/`lib` values for the schema version.
   - Accessibility violations: nested interactive controls (e.g., `<input>` inside `role="button"`), invalid ARIA attribute values, missing labels.
   - JSON schema validation errors in config files.
   - Actual linter errors not caught by CLI (some VS Code extensions run additional rules).

   **Intentional patterns / false positives (document, don't fix):**
   - CSS inline style warnings for CSS custom properties (`var(--font-name)`, `var(--gradient)`) that cannot be expressed as utility classes. Inline styles are the correct approach when CSS custom properties must be applied dynamically.
   - Static analysis limitations on dynamic JSX expressions — e.g., `aria-invalid={error ? "true" : undefined}` flagged because the linter cannot evaluate ternary expressions at static analysis time. The rendered output is correct.
   - Informational hints (`theme-color` meta tag, progressive enhancement suggestions).

3. **Fix real issues.** Apply fixes, then call `get_errors()` again **on the specific fixed files** to confirm resolution.
4. **Verify fixes don't regress.** Run the aggregate check command and test suite after all fixes.
5. **Document remaining noise** in the briefing — explain why each category of false positive is acceptable so future sessions don't re-investigate the same items.

**Commit:** `fix: resolve IDE diagnostics — [brief summary of what was fixed]`

### F7. Baseline Comparison

Compare final state with the Phase A baseline. For each tool:
- Did warning count change? Note improvements (fewer warnings) or regressions (new warnings).
- Did any new errors appear that didn't exist in the baseline?
- Did security audit results improve?

If any check fails that passed in the baseline, something went wrong. Debug and resolve before proceeding. Owning the process means owning the errors.

---

## Phase G — Briefing

Create a briefing document in the most appropriate docs directory (e.g., `docs/maintenance-YYYY-MM-DD.md`).

### Briefing Template

```markdown
# Maintenance Briefing — YYYY-MM-DD

## Executive Summary

<!-- Total deps upgraded, configs modified, dead code removed, files changed. 2-3 sentences. -->

## Config Changes

<!-- What config files were created, modified, or removed. Why each change was made. -->

| Config File | Change | Rationale |
|-------------|--------|-----------|

## Upgrade Manifest

<!-- One row per upgraded dependency -->

| Package | From | To | Bump | Tier | Notes |
|---------|------|----|------|------|-------|

## Actionable Intelligence

<!-- Per-dep "what's now possible" — not just version numbers.
     Examples: "Biome 2.5 adds noUnusedTypes rule — consider enabling"
               "ultracite 7.4 enables useConsistentCurlyBraces — review overrides"
               "Astro 5.4 supports view transitions natively" -->

## Dead Code Removed

<!-- Knip findings actioned: files deleted, exports removed, dependencies cleaned. -->

## Resolution Log

<!-- Breaking changes encountered and how they were resolved.
     Code modernized, deprecated patterns removed, configs updated. -->

## Security

<!-- Vulnerabilities resolved by the upgrade.
     Overrides removed, added, or retained.
     Remaining advisories (if any) with assessment. -->

## CI Changes

<!-- Workflow modifications: action versions, Node version, new steps. -->

## Lockfile Decision

<!-- Was the lockfile kept, added, or removed? Why? -->

## Pinning Decisions

<!-- What was pinned/unpinned and the rationale. -->

## Tree Health

<!-- Peer dep state post-maintenance. Engine requirements. -->

## Dev Server Verification

<!-- Did the app start and render correctly? Routes tested. Console errors observed (and whether they are real or HMR artifacts). For multi-stack projects, note which services were started and any expected failures (e.g., backend needs database). -->

## IDE Diagnostics

<!-- Findings from `get_errors` (VS Code Problems panel).
     Real issues fixed: what was wrong and how it was resolved.
     Intentional noise documented: categories of false positives and why they're acceptable.
     This helps future sessions skip re-investigation of known noise. -->

## Recommendations

<!-- Config changes to consider, new rules to enable, deprecated patterns to adopt,
     opportunities unlocked by upgrades, tool-specific recommendations. -->
```

**Tone:** This is a briefing, not a changelog. Be opinionated, actionable, and forward-looking. Write for the next session's agent who needs to understand what changed and why it matters.

---

## Phase H — Commit & Close

1. **Stage the briefing:** `git add docs/` (or wherever the briefing was placed).
2. **Commit:** `docs: add maintenance briefing for YYYY-MM-DD`
3. **Final status report** to the user:
    - Config files audited and modified
    - Total packages upgraded (by tier and bump type)
    - Dead code removed (files, exports, dependencies)
    - Breaking changes resolved
    - Security improvements
    - Any items that could NOT be resolved (and why)
    - Suggestion: run the session end script to merge, or review the branch first, or delete it if unsatisfied
4. **Marker:** "Maintenance Session Complete"

---

## Failure Modes

### Config Audit Failure

If a config file edit breaks the tool it configures (e.g., Biome can't parse its own updated config): revert the specific config change, note it in the briefing as "attempted but reverted," and proceed with other phases.

### Partial Dependency Success

If some tiers upgrade cleanly but others break:
1. Commit the successful tiers.
2. Revert the failing tier.
3. Document in the briefing what worked, what didn't, and why.

### Subagent File Corruption

Subagents can corrupt files — especially when restructuring complex React components. After any subagent completes work on a file, verify the file by running the aggregate check command. If a file was corrupted, restore it with `git checkout -- <file>` and redo the fix manually or with more targeted instructions.

### Total Failure

If every phase breaks something that can't be resolved:
1. Document findings in the briefing anyway (so the next attempt has context).
2. Commit the briefing.
3. Recommend the branch be deleted.

### Key Rule

**NEVER merge the branch** The user is the final arbiter of audit results. No exceptions.
