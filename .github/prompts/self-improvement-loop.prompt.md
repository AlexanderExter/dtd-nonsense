---
description: "Systematic review and evolution of the agentic framework — prompts, skills, instructions, and documentation."
---

# Self-Improvement Loop

Systematic review and evolution of the project's agentic framework — prompts, skills, instructions, documentation, and project structure. The ideal state is a journey, not a destination. The framework should evolve with the project.

Run this prompt periodically: after a burst of work, when the framework feels stale, when patterns keep failing, or when the project has grown beyond its scaffolding. This is not a session-wrapup (which harvests lessons from one session) — this is a step back to ask whether the whole system still serves the project.

---

## Philosophy

The agentic framework exists to make AI-assisted work predictable, efficient, and aligned with project goals. It degrades in three ways:

1. **Drift** — the project evolves but the framework doesn't. Instructions describe a past state. Skills teach patterns that are no longer used.
2. **Sprawl** — additions accumulate without pruning. Overlapping guidance in multiple files. Instructions that contradict each other.
3. **Gaps** — new capabilities, patterns, or project areas emerge with no framework support. The agent improvises where it should have guidance.

The loop detects all three and proposes corrections.

---

## Phase 1 — Orient

Read the entire framework from disk. Do not rely on memory or assumptions.

### 1a. Framework Inventory

Read and catalog every framework file:

| Layer              | Files                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Instructions       | `.github/copilot-instructions.md`                                  |
| Prompts            | `.github/prompts/*.prompt.md`                                      |
| Skills             | `.github/copilot-skills/*/SKILL.md`                                |
| Documentation      | `docs/*.md`, `docs/**/*.md`                                        |
| Project config     | `biome.json`, `bunfig.toml`, `astro.config.mjs`, `package.json`, `tsconfig.json` |
| CI/CD              | `.github/workflows/*.yml`                                          |

For each file, note:
- Its stated purpose
- When it was last meaningfully updated (check git blame or modification date)
- Its approximate size and complexity

### 1b. Project State

Gather situational awareness:

1. `git log --oneline -30` — what's been happening?
2. `docs/product-vision.md` — the north star (if it exists)

### 1c. Build a Mental Model

Before diagnosing, verify alignment: does the framework (instructions, skills, prompts) accurately describe what the project is today? Note any drift.

---

## Phase 2 — Diagnose

Work through each diagnostic category. Compile findings but do not fix anything yet.

### 2a. Copilot Instructions Audit

`.github/copilot-instructions.md` is the lean router — the first thing every agent reads.

- **Accuracy**: Does the project architecture section match the actual file tree?
- **Completeness**: Are all prompts, skills, and key docs listed? Any missing?
- **Routing**: Does the skills table correctly describe when each skill loads?
- **Size**: Is it still lean (~140 lines)? Has it bloated with content that belongs in skills or docs?
- **Links**: Do all relative links resolve correctly?

### 2b. Prompts Audit

Each `.github/prompts/*.prompt.md` is a reusable workflow.

For each prompt:
- **Still relevant?** Does the workflow it describes still match how the project works?
- **Still accurate?** Do file paths, baseline numbers, tool names, and conventions match reality?
- **Still effective?** Based on session history, does this prompt produce good outcomes? Are there recurring problems it doesn't catch?
- **Gaps**: Are there workflows the project regularly performs that have no prompt? (Look at git history for patterns.)
- **Overlap**: Do any prompts duplicate effort? (e.g., sanity-check and session-wrapup both audit docs.)

### 2c. Skills Audit

Each skill file provides domain-specific knowledge loaded on demand.

For each skill:
- **Still accurate?** Do references, file paths, formatting rules, and techniques match the current project?
- **Still scoped correctly?** Has the skill grown beyond its original domain, or has the domain shifted?
- **Skill format**: Skills now live in subdirectories (`*/SKILL.md`) with YAML frontmatter containing `name` and `description` fields. Verify each skill conforms.
- **Loading triggers**: Does the description in `copilot-instructions.md` accurately describe when to load?
- **Redundancy**: Does any skill content duplicate `docs/project-conventions.md` or other authoritative sources?
- **Gaps**: Are there project domains with no skill coverage that would benefit from one?

### 2d. Documentation Audit

`docs/` contains the project's institutional knowledge.

- **Freshness**: For each doc, does its content match the current state of the codebase? (Check claims against reality.)
- **Completeness**: Are there project areas, tools, or systems with no documentation?
- **Structure**: Does the "docs own, skills point" model hold? Or has knowledge leaked into the wrong layer?
- **Cross-references**: Do tables that enumerate "all X" (tools, JSON files, cleaned-references) include everything?
- **Actionability**: Are docs useful to an agent starting cold, or do they require extra context to interpret?

### 2e. Project Structure Audit

The project layout is its first layer of documentation.

- **Convention adherence**: Does the actual file tree match what `copilot-instructions.md` describes?
- **New patterns**: Have new directories, file types, or organizational patterns emerged that aren't documented?
- **Stale structure**: Are there directories, files, or config entries that no longer serve a purpose?
- **Pain points**: Based on git history, are there structural issues that keep causing friction?

### 2f. Coherence Check

The most valuable diagnostic — do all the layers agree with each other?

- Do prompts reference conventions that still exist in `docs/project-conventions.md`?
- Do skills teach patterns consistent with what the prompts expect?
- Does `copilot-instructions.md` route correctly to the files that actually exist?
- Do docs describe the same architecture that the code implements?
- If `docs/product-vision.md` exists: is the framework aligned with the project's stated vision and goals?

### Compile Findings

Present findings organized by layer, with severity:

- **High** — actively misleading. Will cause an agent to make wrong decisions.
- **Medium** — stale or incomplete. Creates friction or missed opportunities.
- **Low** — cosmetic, minor drift, or optimization opportunities.

For each finding:
- What's wrong
- Where (file + specific content)
- Proposed fix
- Risk level of the fix (safe, moderate, needs care)

**Wait for user approval before proceeding to Phase 3.**

---

## Phase 3 — Remediate

Apply approved changes, working from highest to lowest severity.

### Remediation Principles

1. **Edit, don't rewrite** — unless a file is fundamentally broken, make surgical changes. Full rewrites lose institutional knowledge embedded in phrasing and structure.
2. **Maintain the architecture** — "docs own, skills point, instructions route." Don't move authoritative content into the wrong layer.
3. **Preserve voice** — match the existing tone of each file. Instructions are concise imperatives. Skills are structured technique. Docs are detailed reference.
4. **One concern per commit** — group related changes, but don't mix prompt fixes with doc updates in the same commit.

### Change Categories

| Change Type              | Approach                                                                  |
| ------------------------ | ------------------------------------------------------------------------- |
| Stale file paths/names   | Find-and-replace across all framework files                               |
| Outdated baseline numbers| Update to current values (verify by running tools)                        |
| Missing entries in tables| Add entries, maintaining alphabetical/logical order                       |
| Redundant content        | Remove from wrong layer, strengthen in authoritative source, add link     |
| Gap (missing skill/doc)  | Draft new content, present to user for review before committing           |
| Structural issues        | Propose change, explain trade-offs, implement only after explicit approval|

### After Each Change

- Verify links still resolve
- Verify no new contradictions introduced
- Commit with a message explaining what evolved and why

---

## Phase 4 — Evolve

This phase goes beyond fixing drift — it asks whether the framework should grow.

### 4a. Framework Evolution Candidates

Based on diagnosis, identify opportunities:

- **New prompts**: Workflows the project performs repeatedly that would benefit from structure
- **New skills**: Knowledge domains that keep requiring ad-hoc context gathering
- **Instruction changes**: Routing updates, new conventions, retired patterns
- **Doc restructuring**: Files that have grown unwieldy, or gaps that need new docs
- **Retired artifacts**: Prompts, skills, or docs that no longer serve a purpose

### 4b. Evaluate Each Candidate

For each evolution candidate:
- **Value**: How often would this be used? How much friction does it eliminate?
- **Cost**: How much effort to create and maintain? Does it add complexity?
- **Risk**: Could this create new contradictions or confusion?
- **Alignment**: Does this serve the project's vision and goals?

Present candidates with evaluations. The user decides what to pursue — in this session or as future work.

### 4c. Implement Approved Evolutions

For approved items, create drafts:
- New prompts follow the existing phase-based pattern (orient → diagnose → act → verify)
- New skills follow the trigger + knowledge + technique pattern
- New docs follow the authoritative-source-with-cross-references pattern

---

## Phase 5 — Close

### 5a. Verify Framework Health

After all changes:
1. Re-read `copilot-instructions.md` — is it still lean and accurate?
2. Grep for broken relative links across `.github/` and `docs/`
3. Confirm the skills table matches actual skill files
4. Confirm the prompts listed in docs match actual prompt files

### 5b. Summary

Report:
1. **Framework health before** — summary of what was found
2. **Changes applied** — what was fixed, evolved, or retired
3. **Framework health after** — current state assessment
4. **Deferred items** — evolution candidates saved for future loops
5. **Recommended cadence** — based on the volume of drift found, suggest when to run this loop again

### 5c. Self-Reference

This prompt is part of the framework it audits. If during this loop you identified improvements to the Self-Improvement Loop itself — apply them now. The loop must evolve too.

**Closure** — Explicitly conclude with "Framework Evolution Complete" (visual marker confirming full execution of this procedure)
