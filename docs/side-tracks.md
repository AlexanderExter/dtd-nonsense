# Side Tracks

Tracked tech debt, deferred work, and future improvements. Grouped by theme, roughly priority-ordered within each group.

Items logged here during stabilization passes, code reviews, and work sessions. Resolved items are removed — see git history for the full log.

---

## TypeScript Migration

### Phase 3: Reactivity Layer — ✅ Complete

> Phase 2 (typing both tool files) is complete — see `docs/project-history.md` § Phase 11.

**Decision:** Preact with `@preact/signals` via `@astrojs/preact` (compat mode).

**Implementation complete:** All 9 tools migrated to Preact Islands with Tailwind CSS v4. Each tool lives in `src/components/preact/tools/{tool-name}/` with module-level signals for state management. Tailwind `@theme` tokens in `src/styles/tailwind.css` serve as the single source of truth for design tokens, bridged to short `var(--name)` aliases in `ToolLayout.astro`.

| Tool              | Components |
| ----------------- | ---------- |
| Dice Roller       | 6          |
| Quick Reference   | 13         |
| Success Curves    | 9          |
| Defense Graph     | 10         |
| Combat Tracker    | 9          |
| NPC Generator     | 12         |
| Ship Builder      | 12         |
| Character Builder | 18         |
| Character Sheet   | 16         |

---

## Infrastructure & Tooling

### L1b: lint:data docs/ Coverage

`scripts/lint.ts` supports target paths, but CI currently runs `npm run lint:data` with default scope (`books/` and `cleaned-references/`). The `docs/` prose is unscanned. Adding `docs/` as a target would catch terminology drift in technical documentation.

### A5: CI Skips sync-check

`build.yml` now runs `npm run validate:xref` (xref added 2026-03-09) and `npm run lint:data`, but not `npm run sync-check`. Sync-check could be added to CI to catch markdown↔JSON drift on every push.

---

## Data Quality

### Lint Info Messages (884)

`npm run lint:data` produces 884 "info" level messages — mostly directional quotes vs straight quotes, en/em dash suggestions, and minor formatting preferences. These are editorial suggestions, not errors. The 19 warnings are worth reviewing individually.

> **Baseline note (2026-03-09):** Counts increased from 880→884 info and 8→19 warnings when lint scope expanded to include `books/` alongside `cleaned-references/`.

---

## Future Work

### Session Script Robustness

`session-end.mjs` builds its squash commit message by shell-escaping double quotes in commit messages. If any commit message contains backticks, `$`, or other shell metacharacters, the `git commit -m "..."` invocation could break. Consider using `--file` with a temp file for the commit message instead of inline `-m`. Low priority — only matters for exceptional commit messages.
