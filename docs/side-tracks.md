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

---

## 2026-03 — Post-Migration Sanity Check

- ~~**debt**: Orphaned vanilla files (`sheet-app.ts`, `builder-app.ts`, `sheet.css`, `builder.css`)~~ — **Resolved:** Deleted in post-migration cleanup (2026-03-10).
- **inconsistency**: `tool-development.md` skill documents vanilla JS patterns (`import '@/lib/tools/sheet-app.ts'`) as current practice. *Context*: Agents following this skill will write code that doesn't match the Preact island architecture. **Resolved:** Skill rewritten (2026-03-10).
- **inconsistency**: `README.md` claims "Vanilla TypeScript — no framework dependencies" despite Preact + Tailwind migration. *Context*: Public-facing, likely first file new contributors read. **Resolved:** Updated (2026-03-10).
- ~~**debt**: `project-history.md` missing Phase 12 entry for Preact migration.~~ **Resolved:** Phase 12 added (2026-03-10).
- **investigation**: Module-level Preact signals mean shared state across hypothetical multiple tool instances. *Context*: Not a problem today (single-tool pages) but would break a dashboard that renders multiple tools.
- **investigation**: No runtime/browser testing of any Preact components. *Context*: Build passes, tests pass, but no visual verification — CSS fidelity and interaction correctness are untested.

### Browser Testing Findings (2026-03-10)

Manual testing revealed two critical issues that affect all Preact tools:

1. **All tools are unstyled ("naked")**: `ToolLayout.astro` does not import `tailwind.css`. The Starlight config (`customCss` in `astro.config.mjs`) only applies to doc pages, not tool pages. Without an explicit import, Tailwind utility classes are never generated for tool pages — components render with only the manual CSS variables from ToolLayout's `<style is:global>` block.
   - **Fix:** Add `import "@/styles/tailwind.css"` to ToolLayout.astro's frontmatter, or add a `<link>` / `<style>` import.

2. **Character Sheet & Builder stuck on "Loading game data"**: `useAllData()` calls pass filenames without `.json` extension (e.g., `"races"` instead of `"races.json"`). The `loadData()` function in `data.ts` fetches `/data/{filename}` verbatim — requesting `/data/races` returns 404 because the actual files are `/data/races.json`.
   - **Affected files:** `CharacterSheetApp.tsx` (8 filenames), `CharacterBuilderApp.tsx` (9 filenames)
   - **Not affected:** NPCGeneratorApp.tsx and ShipBuilderApp.tsx use `loadData()` directly with correct `.json` extensions.
   - **Fix:** Add `.json` to all filename strings in both `useAllData()` calls.
