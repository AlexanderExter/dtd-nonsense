# Session Start

Quick health check and orientation when beginning a new work session.

---

## Phase 1 — Repository Health

1. **Check for dangling branches:**

    ```
    git branch --list
    ```

    For each non-master branch, assess: is it WIP, stale, or ready to merge? Flag any that look abandoned.

2. **Check for uncommitted changes:**

    ```
    git status
    ```

    If uncommitted work exists, identify it and ask the user how to proceed (commit, stash, or discard).

3. **Verify recent edits weren't reverted** — external formatters or editor extensions can silently revert agent edits between sessions. Read 2-3 recently modified files and spot-check that prior changes are intact:
    ```
    git log --oneline -5
    ```
    Pick the most recent edited files from the log and verify their content matches expectations.

## Phase 2 — Orient and Plan

1. **Ask the user** what they want to work on this session.

2. **Check for relevant context:**
    - `books/open-questions.md` — any unresolved questions related to the planned work?
    - Recent git history — any in-progress work that relates?
    - `docs/project-conventions.md` — any conventions especially relevant to the task?

3. **Propose a plan** with specific steps, estimated scope, and potential risks. Ask alignment questions before starting — even when things seem clear, this prevents costly backtracking.

## Phase 3 — Set Up

1. **Create or switch to** the appropriate branch
2. **Read the target files** fully before editing
3. **Confirm approach** with the user — especially for multi-file or high-risk changes

---

Present findings from Phases 1-2 to the user before proceeding to Phase 3.
