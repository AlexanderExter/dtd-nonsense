# Session Handover

Running context for the current work session. Updated as work progresses — not a logbook.

---

## Current Branch

`main` (merged from `preact-tailwind` + `technical-stabilizer`)

## Session Objective

Self-driven maintenance pass — doc correctness, tooling robustness, side-tracks review.

## What Changed This Session

- Reset session-handover to reflect merged main state
- Fixed architecture.md component count table (105→97 total; all per-tool counts corrected; fixed `char-builder`→`character-builder` and `char-sheet`→`character-sheet` directory paths)
- Fixed session-end.mjs commit message robustness: replaced inline `-m "..."` with `--file <tmpfile>` to avoid injection from backticks/`$` in commit messages

## Known Issues

See `docs/side-tracks.md` for the full prioritized backlog.

## Suggested Next

1. **Browser test all 9 tools** — run `bun run dev` and manually verify each tool loads and functions
2. **Z-index stacking fix** — define semantic z-index layer system in `tailwind.css`, replace ad-hoc values across tool components
3. **ConditionPicker viewport overflow** — add boundary checks, refactor inline styles to Tailwind
