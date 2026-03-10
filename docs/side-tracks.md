# Side Tracks

Tracked tech debt, deferred work, and future improvements. Grouped by theme, roughly priority-ordered within each group.

Items logged here during stabilization passes, code reviews, and work sessions. Resolved items are removed — see git history for the full log.

---

## Human Additons

/TODO: Repeat the .. "supervised configuration" process done with biome and rumdl for gitingnore, gitattributes, astroconfig and any other discrete candidates. As a human operator I am not a dev so I have made errors of ignorance on their setup. Additionally, the projects stack was not assembled with intent, do conflicting architectures persist. An implication of this is that the tech stack needs to be validated, sanitized and then cautiously assumed to be working by intense LLM work, and not deliberate setup.
/TODO: The above is a pervasive issue, only noticed after the fact, its likely tsconfig is also misconfigured.

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

1. ~~**All tools are unstyled ("naked")**: `ToolLayout.astro` does not import `tailwind.css`.~~ **Resolved:** Added `import "@/styles/tailwind.css"` to ToolLayout.astro frontmatter (2026-03-10).

2. ~~**Character Sheet & Builder stuck on "Loading game data"**: `useAllData()` calls pass filenames without `.json` extension.~~ **Resolved:** Added `.json` to all filename strings in `CharacterSheetApp.tsx` (8 filenames) and `CharacterBuilderApp.tsx` (9 filenames) (2026-03-10). NPCGeneratorApp and ShipBuilderApp were already correct.

---

## Code Quality — Preact/Signals Correctness

Identified during code review (2026-03-10). These are not blocking bugs for single-tool pages, but are correctness gaps worth fixing.

### CQ1: `useData` / `useAllData` — Signals Recreated on Every Call — ✅ Resolved

**File:** `src/hooks/use-data.ts`

~~`signal()` is called inside the hook body without a stabilizing wrapper.~~ **Resolved:** Replaced `signal()` with `useSignal()` and wrapped fetch calls in `useEffect` to fire once per filename set (2026-03-10).

### CQ2: `useEffect([signal.value])` — Mixed Reactivity Systems

**Files:** `CharacterBuilderApp.tsx`, `CharacterSheetApp.tsx`

`data.value` read in a `useEffect` dependency array works *accidentally* — Preact rerenders the component when the signal changes, causing the effect to re-run with the new snapshot. But this conflates `@preact/signals` reactivity with React-style hook deps, which is fragile and non-idiomatic. Reactive side effects that read signals should use `effect()` from `@preact/signals` directly.

### CQ3: No Fetch Cancellation (`AbortController`)

**File:** `src/lib/dtd/data.ts`

`loadData` and `loadAllData` fire `fetch` calls with no `AbortSignal`. If a component unmounts mid-load, the request continues and (if the signal still exists) writes stale data. Should accept an optional `AbortSignal` so callers can cancel on cleanup.

### CQ4: `setCharField` Uses `as any` — Type Safety Gap

**File:** `src/components/preact/tools/character-sheet/CharacterSheetApp.tsx`

```ts
export function setCharField(field: string, value: any): void {
    updateChar((c) => { (c as any)[field] = value; });
}
```

`field` is unconstrained — any string is accepted with no compile-time check. The type-safe version:

```ts
export function setCharField<K extends keyof CharacterData>(
    field: K, value: CharacterData[K]
): void
```

This propagates to `StatsTab`, `WeaponTable`, `ArmorSection`.

### CQ5: `JSON.parse(JSON.stringify(...))` Deep Clone

**Files:** Character mutation helpers in `CharacterBuilderApp.tsx` and `CharacterSheetApp.tsx`

Works for plain data but silently drops `undefined`, `Date`, `Map`/`Set`, and functions. The modern drop-in replacement is `structuredClone()` (Node ≥ 17, all modern browsers), which is semantically correct and faster. Low risk for current data shape, but worth standardizing.

---

## Consideration: Automated Code Quality Audit Prompt

The issues in section **CQ1–CQ5** above were found by manual code review. To catch this class of problem systematically, the following agent prompt can be reused at any time:

> **Code Quality Audit — Preact/Signals/TypeScript**
>
> Review all files in `src/` for:
>
> 1. **Signal hygiene** — are `signal()` calls inside hook/component bodies stabilized with `useSignal()`? Are orphaned signals or duplicate fetches possible?
> 2. **Reactivity model mixing** — are `@preact/signals` values read inside `useEffect` dep arrays instead of using `effect()`? Are signal subscriptions and hook deps conflated?
> 3. **Async cleanup** — do any `fetch` or async operations lack `AbortController` / cleanup on unmount?
> 4. **Type safety gaps** — are there `as any`, `as unknown`, or unconstrained `string` field accessors where narrower types (`keyof T`) would be safe?
> 5. **Deep clone correctness** — is `JSON.parse(JSON.stringify(...))` used where `structuredClone()` would be more correct?
> 6. **Module-level singleton state** — are signals declared at module scope rather than component scope? Is that intentional and documented?
> 7. **Barrel/import hygiene** — are any files importing through the `core.ts` barrel instead of the specific module?
>
> For each finding: state the file, the pattern, why it matters, and a concrete fix.

Save this prompt in `.github/` as a reusable audit prompt if it becomes a regular workflow step.
