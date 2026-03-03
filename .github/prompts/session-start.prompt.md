# Session Start

Quick health check and orientation when beginning a new work session.

**Environment reminder:** You are running in VS Code on Windows with PowerShell terminals. Use agent edit tools for file changes — never `Set-Content` or `Out-File` (they corrupt UTF-8). Multiple agents may be working concurrently — always verify git state.

---

## Phase 1 — Repository Health

1. **Check branches and git state:**

    ```powershell
    git branch --list
    git status
    git log --oneline -5
    ```

    - Flag any non-main branches: are they today's session, stale WIP, or ready to merge?
    - If uncommitted changes exist, **ask the user** how to proceed (commit, stash, or discard)
    - If changes from another agent are present, **ask the user** how to reconcile

2. **Verify recent edits weren't reverted** — external formatters or editor extensions can silently revert agent edits between sessions. Pick 2-3 recently modified files from the log and spot-check that prior changes are intact.

## Phase 2 — Orient and Plan

1. **Ask the user** what they want to work on this session. Use the `ask_questions` tool to clarify scope, priorities, and edge cases before committing to a direction.

2. **Check for relevant context:**
    - `books/open-questions.md` — any unresolved questions related to the planned work?
    - Recent git history — any in-progress work that relates?
    - `docs/project-conventions.md` — any conventions especially relevant to the task?

3. **Propose a plan** with specific steps, estimated scope, and potential risks. **Ask alignment questions** before starting — even when things seem clear, this prevents costly backtracking.

## Phase 3 — Set Up Branch

Session branches use the format `session-YYYY-MM-DD`.

```powershell
# If today's branch exists → use it
git checkout session-YYYY-MM-DD

# If not → create from main
git checkout main
git checkout -b session-YYYY-MM-DD
```

- If another agent already created today's branch with commits, review what's there first
- If a non-session feature branch is active and relevant, **ask the user** whether to continue on it or start a session branch
- **Read target files fully** before editing — never assume file state from memory

---

Present findings from Phases 1-2 to the user before proceeding to Phase 3.
