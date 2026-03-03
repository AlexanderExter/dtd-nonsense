````prompt
# Sanity Check

Post-change coherence audit. Run after sweeping changes, large refactors, or multi-file sessions to catch the class of problems that individual file edits miss.

---

## 1 — Scope the Blast Radius

Before checking anything, understand what changed:

1. **List recent changes:**
    ```
    git diff --stat HEAD~5   # or appropriate range
    git status
    ```
2. **Categorize changes** by layer:
    - **Data** (JSON files, Pydantic models)
    - **Code** (JS tools, Python pipeline)
    - **Content** (markdown rules, cleaned-references)
    - **Documentation** (docs/, instructions, skills)
    - **Config** (.gitignore, pyproject.toml, prompts)

This determines which downstream checks matter.

---

## 2 — State Checkpoint

You have been working in this codebase and your memory of file states may have drifted. Before auditing, ground yourself:

1. **Re-read from disk, not from memory.** For every file you intend to report on, `cat` or open it. Do not rely on what you believe its contents to be.
2. **Verify your mental model.** List the files you believe you modified this session and what you believe their current state is. Then confirm against `git diff` and the filesystem. Flag any discrepancies — these are the most dangerous class of error.
3. **Identify phantom state.** If you attempted a change that failed, was reverted, or was superseded by a different approach — note it. Phantom changes you *think* you made but didn't are a primary source of audit errors.

This step exists because you are at peak context fatigue. Treat your own memory of this session as unreliable and verify.

---

## 3 — Automated Verification

Run the pipeline to catch machine-detectable issues:

````

uv run dtd validate # Schema validation — must pass
uv run dtd validate --xref # Cross-references — note new warnings vs baseline
uv run dtd lint # Terminology + formatting

````

Compare results against known baselines:
- Validate: 12/12 pass
- Cross-ref: ~41 known warnings (abbreviated feat names, missing skills)
- Lint cleaned-references: 2 info-level empty-table-cells in 16-Conditions.md

**Any delta from baseline is a finding.** New warnings may be legitimate, but they need explanation.

---

## 4 — Coherence Checks

### 4a. Upstream/Downstream Impact

For each changed file, trace its consumers and producers:

| If you changed...         | Check these downstream consumers...                                  |
| ------------------------- | -------------------------------------------------------------------- |
| `pipeline/models/*.py`    | `uv run dtd validate` still passes                                   |
| `pipeline/linting/*.py`   | `uv run dtd lint` — results match expectations                       |
| `data/*.json`             | Tools that load this data still render correctly                     |
| `src/lib/dtd/core.ts`     | All 9 tools — shared ES module                                        |
| `cleaned-references/*.md` | `uv run dtd lint`, `uv run dtd sync-check`, starlight-prep          |
| `books/*.md`              | `uv run dtd lint --target books`, open-questions.md                  |
| `docs/*.md`               | Cross-references from other docs, copilot-instructions.md links      |
| `.github/copilot-*`       | Relative links resolve correctly (files live in `.github/`)          |

### 4b. Link and Reference Integrity

- **Markdown links**: Files in `.github/` need `../` prefix to reach `docs/`. Check that relative paths resolve.
- **Doc cross-references**: Tables in copilot-instructions.md, README.md, architecture.md that list tools, files, or capabilities — do they match reality?
- **Index tables**: Any table that enumerates "all X" (all tools, all JSON files, all cleaned-references) — is it complete? Missing entries are common after additions.

### 4c. Stale Content

Search for references to things that no longer exist:

- Deleted files still mentioned in docs or instructions
- Removed features still described in tool specs
- Changed terminology not updated everywhere (grep for old term)
- Renamed fields/models still referenced by old name

### 4d. Duplication Drift

The project follows "docs own, skills point" — conventions live in `docs/project-conventions.md`, other files link to it. Check that:

- The same rule doesn't now exist in two places with different wording
- `copilot-instructions.md` stays lean (~140 lines) — it routes, not teaches
- Skills contain domain technique, not universal rules

---

## 5 — Semantic Consistency

Things automated tools can't catch:

- **Open questions**: Do changes affect any entries in `books/open-questions.md`? Mark resolved entries, flag new ambiguities.
- **Project history**: If a tool or feature was added/removed/changed, does `docs/project-history.md` reflect it?
- **Decision log**: Were architectural decisions made during this session? They belong in the decision log.
- **Roadmap items**: Were planned items completed? Update status in `docs/pipeline.md` roadmap table.

---

## 6 — Doubt Budget

Before reporting, surface your uncertainty. This is not a failure mode — it is valuable intelligence that dies if not captured.

1. **Flag low-confidence areas.** List anything you are less than ~90% confident about. This includes:
    - Changes where you chose between alternatives and aren't sure you chose right
    - Files you edited but didn't fully re-verify after subsequent changes
    - Interactions between components where you're unsure of the coupling
    - Areas where you deferred investigation ("this is probably fine")
2. **Distinguish doubt types:**
    - **"I didn't check"** — knowable but unverified. These are action items.
    - **"I checked but I'm unsure"** — ambiguous results. These need a second opinion.
    - **"This works but feels fragile"** — technical debt signals. These are observations.
3. **Do not bury uncertainty in hedging language.** Instead of writing "this _should_ be fine," write "I did not verify this — flagging as unchecked." Be explicit.

---

## 7 — Documentation Update

Audit documentation for accuracy against the current state of the project. This section produces two artifacts: corrections to existing docs and a session handover.

### 7a. Documentation Accuracy Sweep

For each documentation file that touches areas you changed this session:

1. **Read the doc from disk** (do not rely on memory).
2. **Identify stale claims** — descriptions of behavior, file lists, capability summaries that no longer match reality.
3. **Identify gaps** — new features, files, or behaviors that exist but are not documented.
4. **List each finding** with file path, the stale/missing content, and the proposed correction.

Do not apply fixes yet — present them in the report for approval.

### 7b. Session Handover

Produce a structured handover document to preserve session context for future work. This is not a full context transfer — it is a distillation of judgment that a git diff cannot express.

The handover must include:

| Section               | Content                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| **Session objective** | What was the goal of this session's work?                                                       |
| **What changed**      | Summary of changes made, organized by layer (data/code/content/docs/config).                    |
| **Why it changed**    | Reasoning behind key decisions. What alternatives were considered and rejected?                  |
| **Known issues**      | Anything broken, partially implemented, or deferred. Pull from Doubt Budget findings.           |
| **Areas of concern**  | Zones of fragility, coupling risks, or things that "work but shouldn't be trusted."             |
| **Suggested next**    | What a fresh session should do first — verification steps, remaining work, recommended reading.  |

Write the handover to `docs/session-handover.md`, overwriting any previous version.

### 7c. Side Tracks

During the session, you may have noticed work that is valuable but out of scope — patterns worth refactoring, features worth adding, inconsistencies worth investigating. These are residual gains: the agent spots them in context but they'll be invisible to a cold session.

Capture them in `side-tracks.md` at project root.

**Format — append, do not overwrite:**

```markdown
## [Date] — [Brief session description]

- **[Category]**: [Description of the opportunity]. *Context*: [Why you noticed it, what makes it worth doing].
````

Categories: `refactor`, `feature`, `inconsistency`, `debt`, `investigation`, `optimization`.

If the file does not exist, create it with a header:

```markdown
# Side Tracks

Out-of-scope observations captured during sessions. Review periodically for residual value.

---
```

---

## 8 — Report

Present findings organized as:

1. **Errors** — things that are broken and need fixing now
2. **Stale references** — things that reference removed/renamed content
3. **Gaps** — missing entries in index tables, undocumented changes
4. **Doubts** — items surfaced from the Doubt Budget (Section 6), categorized by type
5. **Observations** — not wrong, but worth noting (e.g., growing tech debt)

For each finding, state the file, the problem, and the proposed fix. Wait for user approval before applying fixes.

Deliver the session handover (Section 7b) and side tracks (Section 7c) alongside the report.

```

```
