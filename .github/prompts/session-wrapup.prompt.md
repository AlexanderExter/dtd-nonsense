# Session Wrapup

Close out the current editing session by harvesting lessons learned into project instructions and skills, then performing git housekeeping.

**Environment reminder:** You are running in VS Code on Windows with PowerShell terminals. Multiple agents may have been active this session — verify git state before any merge operations.

---

## Phase 1 — Review the Session

Gather context on what happened this session:

1. **Scan conversation history** for:
    - Mistakes the agent made (and corrections the user provided)
    - New conventions or rulings the user established
    - Workflow friction (things that took multiple attempts or required user intervention)
    - Patterns that should be codified (repeated instructions the user gave)
    - Terminology decisions or formatting standards that aren't yet documented
    - Tool/process discoveries (e.g., encoding issues, subagent pitfalls)
    - Tool changes that need docs/ updates (new features, changed behavior, schema changes)

2. **Check recent git history** — `git log --oneline -30` — to see what branches were worked, what was merged, and what's still open.

3. **Check for uncommitted changes** — `git status` — across all tracked files.

4. **Compile a candidate list** of lessons learned. For each, note:
    - What happened (the mistake or discovery)
    - Where it should be documented (which file: `copilot-instructions.md`, a skill file, a prompt, etc.)
    - The specific addition or change to make

Present the candidate list to the user for review before making any edits. The user may accept all, reject some, or refine wording.

---

## Phase 2 — Apply Lessons Learned

After user approval, update the relevant files. Common targets:

| Pattern                                       | Target File                                                          |
| --------------------------------------------- | -------------------------------------------------------------------- |
| Cross-cutting conventions, pitfalls, workflow | `docs/project-conventions.md`                                        |
| Editing technique, formatting, content rules  | `.github/copilot-skills/ttrpg-rules-editor/SKILL.md`                 |
| Source authority, verification rules          | `.github/copilot-skills/dtd-source-hierarchy.md`                     |
| Open question lifecycle changes               | `.github/copilot-skills/open-question-manager.md`                    |
| Tool development patterns, JS/CSS issues      | `.github/copilot-skills/tool-development.md`                         |
| Formatting reference updates                  | `.github/copilot-skills/ttrpg-rules-editor/references/formatting.md` |
| Template changes                              | `.github/copilot-skills/ttrpg-rules-editor/references/templates.md`  |
| Agent routing, skills table                   | `.github/copilot-instructions.md`                                    |
| Tool specs and architecture                   | `docs/tools/[tool].md`, `docs/architecture.md`                       |
| Slash command improvements                    | `.github/prompts/*.prompt.md`                                        |

### Guidelines for Instruction Updates

- **Add to existing sections** rather than creating new ones where possible
- **Be specific and actionable** — "Always do X when Y" is better than "Consider X"
- **Include the why** — future agents need to understand the reasoning, not just the rule
- **Use the existing tone** — match the voice of the file you're editing (concise imperatives for instructions, structured detail for skills)
- **Add to "Red Flags" or "Common Rationalizations"** tables in the skill file when appropriate — these are high-value for preventing repeat mistakes
- **Don't duplicate** — if a rule already exists in a different form, strengthen or clarify the existing text rather than adding a second version
- **Cross-reference** — if a lesson affects multiple files, update all of them and keep them consistent

### Verify No New Duplication

After applying lessons, check that the same content doesn't now exist in multiple files. The restructured project follows a "docs own, skills point" model:

- Cross-cutting conventions live in `docs/project-conventions.md` — other files link to it
- Skills contain domain-specific technique, not universal rules
- `copilot-instructions.md` is a lean router (~117 lines) — don't bloat it

### Editing Approach

Apply lesson updates directly on the current session branch (`session-YYYY-MM-DD`). Commit after each file is updated with a message describing what lessons were added and why.

---

## Phase 3 — Git Housekeeping

### 3a. Commit Pending Work

1. Run `git status` to check for uncommitted changes
2. If on a feature branch with uncommitted work:
    - Review changes with `git diff`
    - Commit with a descriptive message
3. If uncommitted changes exist on main — this shouldn't happen. Stage and commit to a new session branch, or stash and flag for the user.

### 3b. Merge Session Branch

Session branches use the squash-merge pattern:

```powershell
git checkout main
git merge --squash session-YYYY-MM-DD
git commit -m "Session YYYY-MM-DD: [summary of all session work]"
git branch -D session-YYYY-MM-DD
```

If multiple branches exist (from multi-agent confusion or multi-day features):

1. List all branches: `git branch`
2. **Ask the user** how to reconcile — don't guess merge order
3. For each branch assess: same-session work (merge), multi-day WIP (leave), stale (flag for deletion)

### 3c. Clean Up

1. Delete all branches that have been fully merged into main, excluding main itself
2. Scan the working tree for orphaned backup files, temp files, or build artifacts — remove if found
3. Verify main is clean: `git status` should report a clean working tree with nothing to commit

---

## Phase 4 — Summary

Report to the user:

1. **Lessons applied** — what was added/changed in which files
2. **Branches merged** — which branches were merged and deleted
3. **Branches remaining** — any WIP or flagged branches still open
4. **Open items** — anything that needs user attention (stale branches, unresolved questions, etc.)
5. **Closure** — Explicitly conclude the chat with "Session Completed" (visual marker confirming full execution of this procedure)
