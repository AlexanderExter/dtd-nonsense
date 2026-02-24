# Tool Development

**Skill type:** Guide (web tool architecture and development)

**Triggers:** Building, modifying, or debugging web tools, shared modules, JSON data files, CSS styling, tool features, JavaScript code in the DTD toolset

---

## Ecosystem

The DTD toolset exists in **two forms**:

1. **Vanilla JavaScript** (`tools/`) — HTML, CSS, and JS served directly from the filesystem. Nine tools share the `DTD` global namespace, CSS theme, and JSON data files. All state persists via `localStorage`.
2. **Astro/Starlight pages** (`src/pages/tools/`) — ES module-based ports using `ToolLayout.astro`. Import shared code from `src/lib/dtd/core.js` and `dice.js`. Migration in progress — see [docs/astro-migration-roadmap.md](../../docs/astro-migration-roadmap.md).

When editing tools, check which version you're working on. Changes to shared logic must be applied to both `tools/shared/js/` and `src/lib/dtd/` until migration is complete.

## Documentation Map

All technical documentation lives in `docs/`. Read the relevant file before starting work:

| Concern             | Read This                                                        |
| ------------------- | ---------------------------------------------------------------- |
| System architecture | [docs/architecture.md](../../docs/architecture.md)               |
| How-to recipes      | [docs/development-guide.md](../../docs/development-guide.md)     |
| JSON data schemas   | [docs/data-reference.md](../../docs/data-reference.md)           |
| core.js API         | [docs/shared/core-js.md](../../docs/shared/core-js.md)           |
| dice.js API         | [docs/shared/dice-js.md](../../docs/shared/dice-js.md)           |
| Per-tool specs      | [docs/tools/](../../docs/tools/) (9 spec files)                  |
| Project conventions | [docs/project-conventions.md](../../docs/project-conventions.md) |

## Critical Pitfalls

These have each caused real bugs. Memorize them:

1. **`var` not `const`/`let` for DTD namespace** — `const`/`let` at global scope creates lexical bindings invisible to `window`, silently splitting the cross-file namespace. The `DTD` global uses `var` intentionally.

2. **CSS `display` overrides `hidden`** — never set `display: flex` (or similar) on elements using the HTML `hidden` attribute for toggle. Use class-based toggling instead (`.open { display: flex }`).

3. **Always grep all tool directories** when refactoring shared modules — callers in sheet.js, roller.js, builder.js, etc. break silently if not updated. Check HTML `<script>` tags too.

4. **Test the load chain** — scripts must load in order: `core.js` → `dice.js` → tool-specific `.js`. Missing or misordered scripts fail silently.

## Data Sync Rule

JSON data in `tools/shared/data/` must stay in sync with `cleaned-references/`. Before editing any JSON data file:

1. Check [docs/data-reference.md](../../docs/data-reference.md) for the schema
2. Verify changes match the corresponding cleaned-reference content
3. Update the data-reference doc if you change the schema

## When Editing Affects Rules

If a tool change touches game mechanics (formulas, stat calculations, race/class data), also verify consistency with:

- The relevant `cleaned-references/` file
- `docs/project-conventions.md` formula table
- `tools/shared/js/core.js` derived stat implementations
