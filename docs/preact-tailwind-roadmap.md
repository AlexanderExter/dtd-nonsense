# Preact + Tailwind v4 Integration Roadmap

> **Created:** 2026-03-09
> **Status:** Planning — no implementation changes yet
> **Branch:** `claude/preact-tailwind-integration-rewzV`
> **Prerequisites:** Completed Phase 2 TypeScript migration + technical stabilizer pass. Zero TS errors, zero lint errors, all tests passing.

This document is a multi-session roadmap. It captures research findings, blockers, decisions, and phased implementation steps for adding Preact (with compat) and Tailwind CSS v4 to the project, alongside a refresh of the agentic framework.

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Preact mode | **With compat** (`preact/compat`) | Enables React component library usage if needed |
| CSS strategy | **Map tokens to `@theme`** | Single source of truth — existing vars become Tailwind utilities |
| CLAUDE.md | **No** — unify `copilot-instructions.md` | One environment-agnostic instruction file, not two |
| Session scope | **Foundation only** | Install, configure, verify, update docs. No tool migration yet |
| Tailwind version | **v4** via `@tailwindcss/vite` | NOT the deprecated `@astrojs/tailwind` integration |

---

## Critical Blocker: Starlight Version

**Current:** `@astrojs/starlight ^0.32.0`
**Required:** `@astrojs/starlight ^0.34.0` (minimum) — this version added Tailwind v4 compatibility (released April 2025)
**Latest available:** `@astrojs/starlight ^0.37.7` (as of March 2026)

Starlight 0.34+ provides `@astrojs/starlight-tailwind`, a complementary CSS package that:
- Configures Tailwind's `dark:` variant for Starlight's dark mode
- Maps Starlight's `--sl-*` CSS custom properties into Tailwind theme
- Restores essential Preflight reset styles that Starlight's own reset conflicts with
- Defines CSS cascade layers (`base`, `starlight`, `theme`, `components`, `utilities`)

**Without this upgrade, Tailwind v4 will fight Starlight's CSS and break the documentation site.**

### Starlight Upgrade Risks (0.32 → 0.37)

Known breaking changes across this range:

| Version | Breaking Change | Impact on This Project |
|---------|----------------|----------------------|
| 0.37.0 | `overflow-wrap` switched to `break-word` | May affect rules page tables — need to verify |
| 0.37.0 | Tabs component redesign (box-shadow vs border-bottom) | No tabs currently used — low risk |
| 0.37.0 | System font stack dropped `-apple-system`, `BlinkMacSystemFont` | Minimal — ToolLayout uses its own fonts |
| 0.34.0 | Tailwind v4 support via `@astrojs/starlight-tailwind` | This is the feature we need |
| 0.33–0.36 | Various minor changes | Need to review full changelog |

**Key concern:** We override the `Head` component (`src/components/Head.astro`) for Vercel Analytics. Component API changes between 0.32–0.37 could break this override.

**Mitigation:** After upgrade, immediately run `npm run build` and verify:
1. All doc pages render (Starlight theme intact)
2. All tool pages render (ToolLayout unaffected by Starlight changes)
3. Pagefind search works
4. Head.astro override still injects Vercel Analytics
5. `npm run check` passes

---

## Phase 1: Dependencies & Configuration

### 1A — Upgrade Starlight

```bash
npm install @astrojs/starlight@latest
npm run check
npm run build
```

- Review Starlight changelog for 0.33–0.37 before upgrading
- Check `Head.astro` override still works with new Starlight version
- Check sidebar configuration hasn't changed (especially `autogenerate` API)
- Check Content Collection API compatibility
- Verify `--sl-*` CSS custom properties in `custom.css` still resolve

**Verification:** Build + dev server + spot-check doc pages and tool pages.

### 1B — Add Tailwind CSS v4

```bash
npm install tailwindcss @tailwindcss/vite @astrojs/starlight-tailwind
```

Update `astro.config.mjs`:

```js
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // ...existing config...
  integrations: [
    starlight({
      // Replace existing customCss with Tailwind entry + existing custom.css
      customCss: ["./src/styles/tailwind.css", "./src/styles/custom.css"],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Create `src/styles/tailwind.css`:

```css
@layer base, starlight, theme, components, utilities;

@import "@astrojs/starlight-tailwind";
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

**Open question:** Does `custom.css` need to be wrapped in a layer to coexist cleanly with the Starlight Tailwind cascade layers? If Starlight's own styles are in the `starlight` layer and Tailwind utilities are in `utilities`, our custom overrides may need explicit layer placement. Test this.

**Verification:** Build, verify doc pages and tool pages render correctly, verify Tailwind utility classes work (add a test class temporarily).

### 1C — Add Preact Integration

```bash
npm install @astrojs/preact preact
```

Update `astro.config.mjs`:

```js
import preact from "@astrojs/preact";

export default defineConfig({
  integrations: [
    preact({ compat: true }),
    starlight({ /* ... */ }),
  ],
});
```

**Open question:** Integration order in the `integrations` array — does Preact need to come before or after Starlight? The Astro docs don't specify; test both if issues arise.

**Verification:** Build, verify nothing broke. Create a minimal test component to confirm Preact islands work:

```tsx
// src/components/preact/HelloTest.tsx (temporary — delete after verification)
export default function HelloTest() {
  return <p>Preact is working</p>;
}
```

Import in a tool page with `client:load` and verify it renders.

### 1D — Biome Configuration

Biome needs to handle `.tsx` files. Check `biome.json`:
- Does the current `include` pattern cover `src/**/*.tsx`?
- Are there any JSX-specific rules needed?
- Preact uses `class` (not `className`) by default — but with compat mode, either works. Decide on convention.

---

## Phase 2: CSS Token Migration

Map existing CSS custom properties from `ToolLayout.astro` and `custom.css` into Tailwind's `@theme` system.

### Current Token Locations

| Source | Tokens | Scope |
|--------|--------|-------|
| `ToolLayout.astro` `:root` | `--bg`, `--surface`, `--surface-raised`, `--border`, `--text`, `--text-dim`, `--accent`, `--success`, `--warning`, `--error`, `--xs`–`--xl` spacing, `--radius-sm`/`--radius-md`/`--radius-lg`, `--font-sans`/`--font-mono` | Tool pages only |
| `custom.css` | `--sl-color-*` overrides, `--sl-font-*` | Starlight doc pages |
| `sheet.css`, `builder.css` | Additional tool-specific tokens | Per-tool |

### Migration Approach

Add to `src/styles/tailwind.css` after the imports:

```css
@theme {
  /* Map existing ToolLayout tokens */
  --color-bg: var(--bg, #0d0d0f);
  --color-surface: var(--surface, #16161a);
  --color-surface-raised: var(--surface-raised, #1e1e24);
  --color-border: var(--border, #2a2a32);
  --color-text: var(--text, #e8e6e3);
  --color-text-dim: var(--text-dim, #9e9e9e);
  --color-accent: var(--accent, #d4a84b);
  --color-success: var(--success, #4ade80);
  --color-warning: var(--warning, #fbbf24);
  --color-error: var(--error, #f87171);
}
```

**Open question:** Can `@theme` reference `var()` from `:root`? Tailwind v4 may require literal values in `@theme`. If so, the ToolLayout `:root` block becomes the consumer of Tailwind's theme, not the other way around. This needs testing — the direction of the mapping matters.

**Alternative if `var()` doesn't work in `@theme`:**
1. Define literal values in `@theme` (single source of truth)
2. Update `ToolLayout.astro` `:root` to reference Tailwind's generated custom properties
3. Existing CSS files (`builder.css`, `sheet.css`) continue using `var(--bg)` etc. — just change where the vars are defined

### Backwards Compatibility

Existing CSS files reference `var(--bg)`, `var(--surface)`, etc. These must continue working during incremental migration. Two strategies:

1. **Bridge vars:** Keep `:root { --bg: var(--color-bg); }` in ToolLayout until all CSS is migrated
2. **Alias in @theme:** If Tailwind generates `--color-bg`, also generate `--bg` as an alias

The first approach is simpler and more explicit.

---

## Phase 3: Agentic Framework Refresh

### 3A — `copilot-instructions.md`: Make Environment-Agnostic

The current file assumes **Windows + PowerShell** exclusively (hard-coded environment section, PowerShell command equivalents table). Sessions now also run in Claude Code on Linux.

**Changes:**
- Replace the "Environment" section: note that sessions may run in VS Code on Windows (PowerShell) OR in Claude Code on Linux (bash)
- Keep the PowerShell pitfalls (encoding, `&&`, stderr) — they're hard-won — but frame as "When running on Windows"
- Update architecture section: add Preact and Tailwind to the stack description
- Update the architecture tree to show new files (`src/styles/tailwind.css`, `src/components/preact/`)
- Update the skills table if skill triggers or descriptions change

### 3B — `astro.instructions.md`: Update for Preact + Tailwind

Currently says:
- "No React/Vue/Svelte — all interactivity is vanilla TypeScript"
- "No client directives (`client:load`, etc.) — tools use plain `<script>` tags, not Islands"

**Update to document two valid patterns:**

| Pattern | When to Use |
|---------|-------------|
| **Vanilla TS** (existing) | Simple tools, direct DOM manipulation, tools already built this way |
| **Preact Island** (new) | Reactive UI components, complex state management, new tools |

Add:
- Preact (with compat) is available via `@astrojs/preact`
- Client directives (`client:load`, `client:visible`, `client:idle`) available for Preact components
- Tailwind CSS v4 utilities available alongside existing CSS custom properties
- Convention for Preact component file location: `src/components/preact/`

### 3C — `tool-development.md` Skill: Add Preact/Tailwind Patterns

Add new sections:
- **Preact Component Pattern** alongside the existing vanilla TS tool pattern
- When to use Preact vs. vanilla TS (decision guide)
- Tailwind utility conventions (when to use utilities vs. CSS custom properties)
- Update "Adding a New Tool" recipe to include the Preact option

### 3D — Skills Frontmatter Standardization

Current skills use informal markdown metadata. Standardize to include structured metadata:

```markdown
# Skill Name

**Skill type:** [Guide | Doctrine | Workflow | Technique]
**Triggers:** [when to auto-load]
**Last reviewed:** [date]
**Dependencies:** [other skills or docs this skill references]
**Handover actions:** [what to update/check when this skill's domain changes]

---
```

The **Handover actions** field is the key addition. It answers: "If something changes in this skill's domain, what other files need updating?" This makes documentation cascade explicit rather than relying on agents to discover it.

**Example for `tool-development.md`:**
```markdown
**Handover actions:**
- After adding/removing a tool: update `astro.config.mjs` sidebar, `docs/architecture.md` key files table, tool specs in `docs/tools/`
- After changing shared modules: verify all tool imports, update `docs/shared/core-js.md`
- After changing CSS conventions: update `astro.instructions.md`, `ToolLayout.astro`
```

Apply to all 5 skills:
- `tool-development.md` — tool architecture changes cascade to architecture.md, astro.instructions.md
- `product-owner.md` — vision changes cascade to instructions routing, design principles
- `dtd-source-hierarchy.md` — source tier changes cascade to project-conventions.md
- `open-question-manager.md` — workflow changes cascade to project-conventions.md source hierarchy section
- `ttrpg-rules-editor/SKILL.md` — formatting changes cascade to astro.instructions.md, project-conventions.md

### 3E — Prompts Frontmatter Standardization

**Issue 1: Inconsistent wrapping.** `self-improvement-loop.prompt.md` uses 3-backtick `` ```prompt ``. Others use 4-backtick ```` ````prompt ````. Standardize to 4 backticks.

**Issue 2: No structured metadata.** Prompts lack machine-readable metadata about prerequisites, outputs, and handover actions. Add a structured header inside the prompt fence:

```markdown
````prompt
# Prompt Name

Brief description.

**Last reviewed:** 2026-03-09
**Prerequisites:** [project state required before running]
**Outputs:** [artifacts this prompt produces or modifies]
**Handover actions:** [what to update after running this prompt]

---
```

**Specific prompt issues found:**

| Prompt | Issue | Fix |
|--------|-------|-----|
| `session-wrapup.prompt.md` | No `````prompt` fence wrapper at all — raw markdown | Add 4-backtick fence |
| `session-wrapup.prompt.md` | Hardcodes "VS Code on Windows with PowerShell terminals" in environment reminder | Make environment-agnostic |
| `self-improvement-loop.prompt.md` | Uses 3-backtick fence | Change to 4-backtick |
| `sanity-check.prompt.md` | Hardcoded baseline counts ("~19 warnings, ~884 info") | Replace with "compare against last known baseline in session-handover.md" or "run and compare" |
| `technical-stabilizer.prompt.md` | No fence wrapper at all — raw markdown | Add 4-backtick fence |
| All prompts | No `Last reviewed`, `Prerequisites`, `Outputs`, or `Handover actions` metadata | Add structured headers |

### 3F — `Opus Custom.agent.md`: Review

References Copilot-specific features:
- `#runSubagent` — Copilot agent dispatch syntax
- `#context7 MCP Server` — external MCP tool, may not be available in all environments

**Options:**
1. Keep as Copilot-specific (it's in `.github/agents/` which is a Copilot convention)
2. Add notes about which directives are environment-specific
3. Generalize the principles while keeping the Copilot syntax

**Recommendation:** Option 1 — leave it as Copilot-specific since it lives in the Copilot agents directory. The universal principles (coding principles, verification, documentation updates) are already captured in `copilot-instructions.md` and `project-conventions.md`.

---

## Phase 4: Hooks & Scripts

### 4A — Current State (Healthy)

| Hook/Script | Status | Notes |
|-------------|--------|-------|
| `.githooks/pre-commit` | Working | Runs `npm run check` before every commit |
| `session:start` | Working | Creates/switches to session branch |
| `session:end` | Working | Squash-merges to main |
| `session:status` | Working | Quick git state report |
| `npm run prepare` | Working | Sets `core.hooksPath` on install |

### 4B — Considered Additions

| Addition | Value | Effort | Verdict |
|----------|-------|--------|---------|
| Post-checkout hook (auto `npm install` on package.json change) | Medium — prevents stale node_modules across branches | Low | **Consider** — useful now that we're adding deps |
| `.claude/settings.json` | Low — Claude Code permission defaults | Low | **Defer** — not needed until Claude Code usage patterns are established |
| `npm run verify` (build-only, no tests) | Low — `npm run build` already exists | Trivial | **Skip** — use `npm run build` directly |
| Staleness check script (scan for `Last reviewed` dates older than N days) | Medium — automates staleness detection | Medium | **Log in side-tracks** — nice-to-have, not urgent |

### 4C — Documentation Staleness Doctrine

Add to `docs/project-conventions.md` under a new section:

```markdown
## Documentation Freshness

All documentation should be assumed stale until verified against the codebase.

### Staleness Signals
- **No `Last reviewed` date** — treat the file as unverified
- **Hardcoded counts** (test counts, file counts, warning baselines) — run the actual command
- **Technology claims** (framework versions, available tools) — check `package.json` and `astro.config.mjs`
- **Environment assumptions** (OS, shell, editor) — check what environment is actually running

### After Structural Changes
After any change that affects project structure (new dependencies, new patterns, file moves):
1. Check the **Handover actions** field on relevant skills
2. Run through the doc sync table in the sanity-check prompt
3. Update `Last reviewed` dates on affected files
```

---

## Phase 5: Documentation Updates

After implementation, update these files:

| File | What to Update |
|------|----------------|
| `docs/architecture.md` | Add Preact + Tailwind to Technology Stack table; add `@tailwindcss/vite`, `@astrojs/preact`, `@astrojs/starlight-tailwind` to dependency list; update key files table (add `tailwind.css`, `src/components/preact/`) |
| `docs/development-guide.md` | Add "Creating a Preact Component" recipe; add Tailwind utility patterns; update CSS section |
| `docs/session-handover.md` | Update for this session's work |
| `docs/side-tracks.md` | Update Phase 3 Reactivity Layer section — Preact decision made, framework installed. Remove from "open consideration." Log any new items discovered. |

---

## Open Questions

These need answers during implementation, not upfront:

1. **CSS layer ordering:** Does `custom.css` need a `@layer` declaration to coexist with the Starlight Tailwind cascade layers?
2. **`@theme` + `var()` interop:** Can Tailwind v4's `@theme` reference CSS custom properties, or must values be literal? This determines the direction of the token migration.
3. **Preact integration order:** Does `preact()` need to come before or after `starlight()` in the `integrations` array?
4. **Head.astro override:** Does Starlight 0.37's component override API still work the same way as 0.32?
5. **Biome + JSX:** Does the current Biome config handle `.tsx` files without changes?

---

## Execution Notes

- **Session boundaries:** Phase 1 (deps + config) should be a single session. Phase 2 (CSS migration) can be a separate session. Phase 3–5 (framework refresh) can be parallelized or batched.
- **Rollback plan:** Each phase starts with a working build. If a phase breaks the build, revert the phase entirely rather than debugging mid-merge.
- **Verification cadence:** Run `npm run check` + `npm run build` after every sub-phase (1A, 1B, 1C, etc.). Don't batch.
- **Documentation timing:** Update docs during the same session as the implementation change — not "later." Deferred doc updates become drift.

---

## Sources

- [Tailwind CSS Astro Installation Guide](https://tailwindcss.com/docs/installation/framework-guides/astro)
- [Astro Tailwind Integration Docs](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
- [Starlight CSS & Tailwind Guide (GitHub source)](https://github.com/withastro/starlight/blob/main/docs/src/content/docs/guides/css-and-tailwind.mdx)
- [Starlight Tailwind v4 Support Issue #2862](https://github.com/withastro/starlight/issues/2862)
- [Starlight 0.34 Release (Tailwind v4 support)](https://astro.build/blog/starlight-034/)
- [How to Use Tailwind CSS v4 in Astro](https://dipankarmaikap.com/how-to-use-tailwind-css-v4-in-astro/)
- [Upgrade Astro to Tailwind v4](https://bhdouglass.com/blog/how-to-upgrade-your-astro-site-to-tailwind-v4/)
