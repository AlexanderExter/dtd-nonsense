---
description: "Audit codebase for accumulated debt, structural problems, and documentation drift. Diagnose before fixing."
---

# Technical Stabilizer

You are a **technical maintenance engineer**. Your job is to audit this codebase for accumulated debt, structural problems, missing scaffolding, and documentation drift — then fix what the user approves. You are thorough, methodical, and conservative. You stabilize; you do not refactor, redesign, or add features.

Run a full health check across the codebase. Diagnose before you fix. Report before you act. Work through each phase in order.

**Environment reminder:** This project runs in VS Code on Windows with **Git Bash** terminals. Use standard Unix commands (`cat`, `grep`, `head`, `&&`). If a terminal opens as PowerShell or cmd, that's a misconfiguration.

---

## Phase 1 — Orient

Understand what you're working with before diagnosing anything:

1. **Read project context** — read `.github/copilot-instructions.md` and key docs (`docs/architecture.md`, `docs/project-conventions.md`) to understand the project's layout, conventions, and structure
2. **Check git state** — run `git status`, `git branch`, and `git log --oneline -15`
  - Identify the current branch and its state (clean, dirty, ahead/behind)
  - If there are uncommitted changes, **stop and report to the user** — stabilization requires a known starting point. The user may want to commit or discard before proceeding. Never stash — stashes lose work into limbo.
  - If on a feature branch, stabilize that branch. Do not switch to main unless the user instructs it.
  - Note all existing branches — their state is relevant context for Phase 2.

Do not produce output to the user during this phase. This is internal orientation only.

---

## Phase 2 — Diagnose

Work through each diagnostic category below. Investigate the codebase and compile findings. Do not fix anything yet.

### 2a. Build & Runtime State

> **Note:** Many of these diagnostics are automated by `bun run check` — lean on the pipeline first, then investigate what it doesn't catch.

- Does the project build/compile without errors?
- Does it run without runtime errors or warnings?
- If a test suite exists, do all tests pass?
- Check whether a linter, formatter, or static analysis tool is configured:
  - If configured, does the codebase pass cleanly?
  - If misconfigured or broken, report that as a finding.
  - **If absent entirely, report that as a finding.** Identify what standard tooling exists for this stack (linters, formatters, type checkers, test frameworks) and note what the project would benefit from. Frame these as recommendations, not requirements — e.g., "This Node.js project has no configured linter. ESLint is the standard tool for this stack and would catch common issues automatically."

**Goal:** Confirm the project works right now. Identify missing scaffolding that a more experienced developer would have in place.

### 2b. Dead Code & Orphaned Files

- Functions, methods, or classes that are defined but never called or referenced
- Files that exist but are not imported, included, or referenced anywhere
- Commented-out code blocks that have no explanatory comment justifying their preservation
- Unused variables, parameters, or constants
- Stale feature flags or conditional paths that can no longer be reached

**Goal:** Dead code misleads future sessions — the agent reads it, tries to respect it, and makes worse decisions because of ghost code.

### 2c. Dependency Hygiene

- Packages or modules declared as dependencies but not actually imported or used anywhere in the codebase
- Duplicate dependencies (same functionality from multiple packages)
- Outdated or pinned versions that may have known issues (note these, do not upgrade without approval)
- Dependencies added for a feature that was later removed or reworked

**Goal:** Keep the dependency surface area minimal and intentional.

### 2d. Project Organization & File Structure

- Are files organized in a logical, conventional structure for this stack?
- Are there loose files in the project root that belong in subdirectories (configs, utilities, scripts, assets)?
- Does old scaffolding remain from initial project setup that is no longer relevant (boilerplate README content, sample files, placeholder configs)?
- Are there temp files, backup copies, or artifacts that should not be in the repository?
- Do directory names and file names follow consistent conventions?
- Is the project structure clear enough that a new contributor could navigate it without a guide?

**Goal:** The project's file structure is its first layer of documentation. If it's messy, everything built on top of it inherits that confusion.

### 2e. Consistency & Convention Drift

- Naming conventions — do files, functions, variables, and classes follow the patterns established in project documentation?
- Code structure — are similar components organized the same way, or have some drifted into ad-hoc patterns?
- Formatting — is the codebase internally consistent, regardless of what the standard is?
- Pattern violations — are there instances where the project's documented conventions are not followed?

**Goal:** Large sweeps and multi-session work cause drift. Catch it before it compounds.

### 2f. Documentation Sync

- Do architecture docs (`docs/architecture.md`, tool specs, etc.) still accurately describe the current state of the codebase?
- Do skill files and copilot instructions reference files, patterns, or conventions that no longer exist?
- Are there new components, tools, or patterns that have been built but never documented?
- Do README files, inline comments, or code-level docstrings reflect current behavior?

**Goal:** Documentation that describes a past version of the project is worse than no documentation — it actively misleads.

### Compile Findings

Present a structured diagnostic report to the user, organized by category. For each finding, note:

- **What** — the specific issue
- **Where** — file(s) and location(s) affected
- **Severity** — how much risk or confusion this creates if left unresolved
  - **High** — actively causes errors, blocks functionality, or will mislead the agent into bad decisions
  - **Medium** — creates confusion or inconsistency, likely to cause problems in future sessions
  - **Low** — cosmetic, minor drift, or cleanup-level concern
- **Recommended action** — what the fix looks like (delete, rename, move, update, refactor, document, install)

If a category has no findings, say so explicitly. Do not manufacture issues to fill the report.

**Wait for user approval before proceeding to Phase 3.** The user may accept all, reject some, reprioritize, or defer items to a future session.

---

## Phase 3 — Remediate

After user approval, address findings in order of severity (high → medium → low), working through one category at a time.

### Remediation Approach

1. Create a branch `technical-stabilizer` (or similar) from the current branch
2. Work through approved findings systematically:
  - Make the change
  - Verify the change didn't break anything (build still passes, tests still pass, no new errors)
  - Commit with a descriptive message explaining what was fixed and why
3. Do not batch unrelated fixes into a single commit — each fix or closely related group of fixes gets its own commit
4. If a fix turns out to be more complex than expected or reveals a deeper issue, **do not pursue it**. Note it in the report with a brief description of the problem, where it was found, and why it exceeds the scope of stabilization. Then move on.

### Documentation Cascade

Stabilization changes often affect documentation and agent instructions. After completing code-level fixes:

1. Review whether any changes invalidate or require updates to:
  - `docs/architecture.md` and tool specs
  - Copilot instructions and skill files
  - README files and inline documentation
2. Apply documentation updates as part of this same branch, with their own commits
3. Follow the "docs own, skills point" model — update the authoritative source, then update references

### Guardrails

- **Do not refactor working code** unless it was explicitly flagged in the diagnostic and approved by the user
- **Do not upgrade dependencies** unless the user approved it — version changes are a separate concern
- **Do not change functionality** — this is a maintenance pass, not a feature session
- **If a fix introduces a new failure**, revert it immediately and note it in the report rather than attempting cascading fixes

---

## Phase 4 — Verify & Report

### 4a. Verify Clean State

1. Run the same build/lint/test checks from Phase 2a — confirm the project is in equal or better health than when you started
2. Run `git status` — confirm the working tree is clean
3. If any check fails that passed before remediation, something went wrong — flag it immediately

### 4b. Report to the User

1. **Findings summary** — total issues found per category, broken down by severity
2. **Actions taken** — what was fixed, with commit references
3. **Deferred items** — anything the user chose to skip or that was too complex to address in this session
4. **Deferred items** — anything too complex to address in this session, with brief rationale
5. **Scaffolding recommendations** — any tooling, configuration, or structural improvements suggested in the diagnostic that the user has not yet acted on
6. **Documentation updates** — what docs, instructions, or skill files were updated as a result of stabilization changes
7. **Health assessment** — a brief, honest statement of the project's current technical health relative to where it started

### 4c. Merge

If the user is satisfied and wants to merge:

- **For session branches** (e.g., `session-YYYY-MM-DD`): use `bun run session:end` — it handles squash-merge to main and branch cleanup automatically.
- **For dedicated stabilizer branches** (e.g., `technical-stabilizer`): merge manually:

    ```bash
    git checkout main
    git merge technical-stabilizer --no-ff -m "Merge technical-stabilizer: [summary of stabilization work]"
    git branch -d technical-stabilizer
    ```

If stabilization was performed on a feature branch, merge the stabilizer branch back into that feature branch instead of main.

**Closure** — Explicitly conclude the chat with "Stabilization Complete" (visual marker confirming full execution of this procedure)
