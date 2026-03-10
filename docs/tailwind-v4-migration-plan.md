# Tailwind CSS v4 Full Adoption Plan

**Status:** Planning
**Created:** 2026-03-10
**Scope:** Migrate all tool pages and ~97 Preact components from hand-written CSS to Tailwind v4 utilities

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Migration Strategy](#migration-strategy)
3. [Phase 0: Preparation](#phase-0-preparation)
4. [Phase 1: Foundation — Shared Primitives](#phase-1-foundation--shared-primitives)
5. [Phase 2: Pilot — Dice Roller](#phase-2-pilot--dice-roller)
6. [Phase 3: Small Tools](#phase-3-small-tools)
7. [Phase 4: Medium Tools](#phase-4-medium-tools)
8. [Phase 5: Complex Tools](#phase-5-complex-tools)
9. [Phase 6: Cleanup](#phase-6-cleanup)
10. [Conversion Patterns Reference](#conversion-patterns-reference)
11. [Risk Register](#risk-register)
12. [File Inventory](#file-inventory)

---

## Current State Assessment

### What's Already Done (Phase 0 from implementation plan — complete)

Tailwind CSS v4 is **installed and configured**. The foundation layer is fully working:

| Layer | Status | Details |
|-------|--------|---------|
| Dependencies | ✅ Installed | `tailwindcss@^4.2.1`, `@tailwindcss/vite@^4.2.1`, `@astrojs/starlight-tailwind@^4.0.2` |
| Vite plugin | ✅ Configured | `@tailwindcss/vite` in `astro.config.mjs` |
| Starlight bridge | ✅ Working | `@astrojs/starlight-tailwind` with CSS cascade layers |
| `@theme` tokens | ✅ Defined | 30+ tokens in `src/styles/tailwind.css` (colors, spacing, radii) |
| TSX support | ✅ Working | `tsconfig.json` has `jsx: "react-jsx"`, `jsxImportSource: "preact"` |
| Biome | ✅ Configured | `tailwindDirectives: true` in CSS parser |
| Preact integration | ✅ Working | `@astrojs/preact` with compat mode, 97 components built |

### What's NOT Done (the actual Tailwind adoption)

| Layer | Status | Scale |
|-------|--------|-------|
| Tool page `<style>` blocks | ❌ Hand-written CSS | ~5,569 lines across 10 `.astro` files |
| Preact component classes | ❌ Custom class names | ~97 `.tsx` files use custom CSS selectors |
| ToolLayout shared styles | ❌ CSS custom property bridge | ~150 lines of global styles |
| Inline styles in TSX | ⚠️ Partially justified | ~23 instances (dynamic values — many must remain) |

### CSS Line Counts by Tool Page

| Tool Page | Total Lines | Style Lines | Preact Components | Complexity |
|-----------|-------------|-------------|-------------------|------------|
| `character-sheet.astro` | 1,303 | ~1,293 | ~20+ | ★★★★★ |
| `ship-builder.astro` | 967 | ~957 | ~8 | ★★★★☆ |
| `character-builder.astro` | 913 | ~903 | ~15 | ★★★★☆ |
| `combat-tracker.astro` | 767 | ~757 | ~12 | ★★★★☆ |
| `npc-generator.astro` | 639 | ~629 | ~10 | ★★★★☆ |
| `defense-graph.astro` | 440 | ~430 | ~8 | ★★★☆☆ |
| `dice-roller.astro` | 271 | ~261 | 6 | ★★☆☆☆ |
| `quick-reference.astro` | 150 | ~140 | ~8 | ★★☆☆☆ |
| `index.astro` | 149 | ~76 | 0 | ★☆☆☆☆ |
| `success-curves.astro` | 133 | ~123 | ~6 | ★★☆☆☆ |

**Total: ~5,569 lines of CSS to convert.**

---

## Migration Strategy

### Approach: Incremental Page-by-Page

Convert one tool page at a time: move styles out of the `<style>` block and into Tailwind utility classes on the Preact components that consume them. Each page migration is a self-contained unit that can be committed and verified independently.

### Convention Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Attribute name | `class` (not `className`) | Preact convention, shorter, matches HTML |
| Dynamic classes | Template literals or `class` arrays | `class={`panel ${active ? "active" : ""}`}` |
| Conditional classes | Ternary in template literals | Simple, no extra dependency |
| Custom properties | Keep for truly dynamic values only | Chart colors, runtime percentages, animation targets |
| `@apply` usage | Avoid entirely | Defeats the purpose of utility-first; creates hidden coupling |
| Component-scoped styles | Tailwind on every element | No leftover `<style>` blocks per-page |
| Animations | Tailwind `animate-*` + custom `@keyframes` in `tailwind.css` | For `slideIn`, `pulse`, tool-specific animations |

### What Stays as CSS Custom Properties

Some patterns **cannot** or **should not** move to Tailwind utilities:

1. **Dynamic runtime values** — `style={{ width: `${percent}%` }}` for HP bars, progress indicators
2. **Chart.js theming** — Chart.js reads color values programmatically, not via class names
3. **Canvas rendering** — Heatmaps and other `<canvas>` elements styled via JS
4. **Complex pseudo-elements** — `::after` content with runtime data
5. **Starlight theme overrides** — `custom.css` stays as-is (Starlight's own CSS layer)

### Token Mapping Reference

The `@theme` block in `tailwind.css` already maps tokens. Tailwind generates utility classes from these:

| CSS Custom Property | Tailwind Utility | Example |
|---------------------|------------------|---------|
| `var(--bg)` → `--color-bg` | `bg-bg` | `class="bg-bg"` |
| `var(--surface)` → `--color-surface` | `bg-surface` | `class="bg-surface"` |
| `var(--surface-raised)` → `--color-surface-raised` | `bg-surface-raised` | `class="bg-surface-raised"` |
| `var(--border)` → `--color-border` | `border-border` | `class="border-border"` |
| `var(--text)` → `--color-text-primary` | `text-text-primary` | `class="text-text-primary"` |
| `var(--text-muted)` → `--color-text-muted` | `text-text-muted` | `class="text-text-muted"` |
| `var(--text-dim)` → `--color-text-dim` | `text-text-dim` | `class="text-text-dim"` |
| `var(--accent)` → `--color-accent` | `text-accent` / `bg-accent` | `class="text-accent"` |
| `var(--success)` → `--color-success` | `text-success` / `bg-success` | `class="text-success"` |
| `var(--warning)` → `--color-warning` | `text-warning` / `bg-warning` | `class="text-warning"` |
| `var(--error)` → `--color-error` | `text-error` / `bg-error` | `class="text-error"` |
| `var(--space-xs)` | `p-xs`, `m-xs`, `gap-xs` | `class="p-xs gap-xs"` |
| `var(--space-sm)` | `p-sm`, `m-sm`, `gap-sm` | `class="p-sm gap-sm"` |
| `var(--space-md)` | `p-md`, `m-md`, `gap-md` | `class="p-md gap-md"` |
| `var(--space-lg)` | `p-lg`, `m-lg`, `gap-lg` | `class="p-lg gap-lg"` |
| `var(--space-xl)` | `p-xl`, `m-xl`, `gap-xl` | `class="p-xl gap-xl"` |
| `var(--radius-sm)` | `rounded-sm` | `class="rounded-sm"` |
| `var(--radius-md)` / `var(--radius)` | `rounded-md` | `class="rounded-md"` |
| `var(--radius-lg)` | `rounded-lg` | `class="rounded-lg"` |

---

## Phase 0: Preparation

**Goal:** Ensure the token system is complete and add any missing Tailwind theme extensions before starting conversion.

### 0A — Audit `@theme` Completeness

Review all `<style>` blocks across tool pages and identify any values used that don't already have a `@theme` mapping. Common gaps:

- **Font sizes** — `0.7rem`, `0.75rem`, `0.8rem`, `0.85rem`, `0.9rem`, `1.1rem`, `1.25rem`, `1.5rem`, `3rem` appear frequently. Map to `@theme` names or use Tailwind's built-in `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl` etc.
- **Specific widths** — `60px`, `80px`, `320px`, `1200px`, `1400px`. Use Tailwind arbitrary values `w-[60px]` or define as `@theme` tokens if repeated.
- **Opacity patterns** — `rgba()` colors with specific opacity. Some are already in `@theme` (`--color-accent-bg`, `--color-success-bg` etc.), others may need adding.
- **Transition values** — `all 0.15s ease`, `color 0.15s`. Map to Tailwind `transition-all duration-150` or `transition-colors duration-150`.
- **Animations** — `slideIn`, `pulse` defined in tool pages. Move shared animations to `tailwind.css`.

### 0B — Add Missing `@theme` Tokens

Extend `src/styles/tailwind.css` with any missing tokens identified in 0A. Example additions:

```css
@theme {
  /* ...existing tokens... */

  /* Max-widths for tool layouts */
  --max-width-tool: 1200px;
  --max-width-tool-wide: 1400px;
}
```

### 0C — Add Shared Animations to `tailwind.css`

Move reusable `@keyframes` from tool page `<style>` blocks into `tailwind.css`:

```css
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

Tailwind v4 supports custom animations via `@theme`:

```css
@theme {
  --animate-slide-in: slideIn 0.3s ease-out;
  --animate-pulse-once: pulse 0.5s ease;
}
```

### 0D — Verify Token Utilities Generate Correctly

After extending `@theme`, build and verify the generated utilities work:

```powershell
npm run build
```

Temporarily add a test class to any component: `class="bg-surface text-text-primary p-lg rounded-md"` — confirm it renders correctly.

**Session gate:** Commit. Green `npm run check`.

---

## Phase 1: Foundation — Shared Primitives

**Goal:** Convert `ToolLayout.astro` shared styles to Tailwind, creating reusable Tailwind class patterns for `.panel`, `.btn`, etc. that all tools use.

### 1A — Convert ToolLayout Global `<style>` Block

The `ToolLayout.astro` `<style is:global>` block defines shared patterns used across all tools. Two paths:

**Option A — Inline on each element (pure utility, preferred):**
Remove `.panel`, `.btn`, `.btn-primary`, etc. from the global stylesheet. Each Preact component that uses `class="panel"` today would instead use the equivalent Tailwind utilities directly:

```tsx
// Before
<div class="panel">...</div>

// After
<div class="bg-surface border border-border rounded-md p-lg">...</div>
```

**Option B — Keep as Tailwind component classes (if reuse warrants it):**
Define in `tailwind.css` using `@layer components`:

```css
@layer components {
  .panel {
    @apply bg-surface border border-border rounded-md p-lg;
  }
  .btn {
    @apply inline-flex items-center justify-center gap-sm px-md py-sm text-sm font-medium border border-transparent rounded-sm cursor-pointer transition-all duration-150;
  }
}
```

**Recommendation:** Option A for most things. Option B only for `.btn` variants if they appear in 10+ components.

### 1B — Convert ToolLayout Header/Footer

The header and footer markup lives in `ToolLayout.astro`'s HTML. Convert those elements from custom class selectors to Tailwind utilities directly on the markup.

### 1C — Slim Down `:root` Bridge

After converting shared styles, the `:root` bridge block (mapping `--bg` → `var(--color-bg)`) can be reduced. Some tools' CSS still references short aliases like `var(--bg)`. As tools migrate, these aliases can be removed one by one. By the end of Phase 5, the entire bridge block can be deleted.

**Backward compatibility:** Keep the bridge intact until all tools are converted. Remove aliases only for tools that have been fully migrated.

**Session gate:** Commit. All existing tool pages still render correctly (they still consume the bridge vars). Header/footer now uses Tailwind.

---

## Phase 2: Pilot — Dice Roller

**Goal:** Full end-to-end conversion of the simplest tool to validate the pattern.

### Why First

- Smallest tool (271 lines, ~261 CSS, 6 components)
- Self-contained — no data loading, no workers, no persistence
- Clear visual verification criteria

### Steps

1. **Read all 6 component files** in `src/components/preact/tools/dice-roller/`
2. **Map each CSS class** in `dice-roller.astro` `<style>` to Tailwind equivalents
3. **Apply Tailwind classes** to each component's JSX
4. **Remove the `<style>` block** from `dice-roller.astro`
5. **Move `@keyframes slideIn` and `pulse`** to `tailwind.css` (if not done in Phase 0)
6. **Verify** all interactive features work

### Conversion Examples (from `dice-roller.astro`)

**Layout grid:**
```css
/* Before */
.roller-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}
```
```tsx
// After
<div class="grid grid-cols-[1fr_320px] gap-lg max-w-[1200px] mx-auto p-lg max-[900px]:grid-cols-1">
```

**Button:**
```css
.preset-btn {
  background: var(--surface-alt);
  color: var(--text);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.15s ease;
}
.preset-btn:hover { background: var(--accent); color: var(--bg); }
```
```tsx
// After
<button class="bg-surface-alt text-text-primary border border-transparent rounded-sm px-md py-xs font-mono cursor-pointer transition-all duration-150 hover:bg-accent hover:text-bg active:scale-95">
```

**Die display:**
```css
.die {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface);
  border-radius: var(--radius-sm);
  font-weight: bold; font-size: 1.1rem;
  border: 2px solid var(--surface-alt);
  position: relative;
}
.die.kept { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.die.dropped { opacity: 0.4; text-decoration: line-through; }
```
```tsx
// After (using conditional classes)
<div class={`w-10 h-10 flex items-center justify-center bg-surface rounded-sm font-bold text-lg border-2 border-surface-alt relative ${
  kept ? "bg-accent text-bg border-accent" :
  dropped ? "opacity-40 line-through" : ""
}`}>
```

### Verification Checklist

- [ ] All dice rolling works (basic, modifier, rank zero)
- [ ] Exploding dice show 💥 emoji
- [ ] Preset buttons work
- [ ] Target Number / Raises / Checks display
- [ ] History sidebar functional
- [ ] Mobile responsive (≤900px breakpoint)
- [ ] `npm run check` passes
- [ ] `npm run build` succeeds
- [ ] `dice-roller.astro` `<style>` block is empty or deleted

**Session gate:** Commit. This validates the entire conversion pattern for all remaining tools.

---

## Phase 3: Small Tools

**Goal:** Convert the remaining low-complexity tools.

### 3A — Tools Dashboard (`index.astro`) — ~76 style lines

Mostly static. Convert the card grid and link styles to Tailwind. No Preact components involved.

### 3B — Success Curves — ~123 style lines, ~6 components

Chart.js integration — Tailwind handles layout around the canvas, but Chart.js colors remain as JS values. Convert layout, controls, stats table styles.

### 3C — Quick Reference — ~140 style lines, ~8 components

Searchable data tables. Convert table, accordion, search input styles. This is a good test for data-heavy table layouts.

### 3D — Defense Graph — ~430 style lines, ~8 components

5 Chart.js graphs + heatmap canvas. Similar to Success Curves but larger. Convert control panel and layout styles; Chart.js and canvas rendering stay as-is.

**Session gate after each tool.** Run `npm run check` + `npm run build` after each.

---

## Phase 4: Medium Tools

**Goal:** Convert tools with complex state, many components, and heavier styling.

### 4A — Dice Roller (completed in Phase 2)

### 4B — NPC Generator — ~629 style lines, ~10 components

Dynamic forms, template loading, stat calculations, weapon/trait lists. Focus on form styling patterns that will reappear in the builder/sheet.

### 4C — Combat Tracker — ~757 style lines, ~12 components

Initiative list, HP bars, condition management, action budgets. The HP bar width is dynamic (`style={{ width }}`) and must stay as inline style. Rest converts to Tailwind.

**Session gate after each tool.**

---

## Phase 5: Complex Tools

**Goal:** Convert the three largest tools.

### 5A — Character Builder — ~903 style lines, ~15 components

Multi-step wizard with priority allocation. Heavy form styling, step navigation, constraint visualization. This shares many patterns with the Character Sheet.

### 5B — Ship Builder — ~957 style lines, ~8 components

Dual-mode UI (builder + combat). Hull selection, component slots, crew management. Complex grid layouts.

### 5C — Character Sheet — ~1,293 style lines, ~20+ components

The largest migration. 6 tabs, 100+ form fields, import/export, derived stat calculations. This is the final boss.

**Approach for 5C:** Break into sub-phases by tab:
1. Identity tab
2. Characteristics & Skills tab
3. Combat tab
4. Equipment tab
5. Powers tab
6. Notes tab
7. Shared chrome (tabs, header, sidebar)

**Session gate after each tool (or sub-phase for Character Sheet).**

---

## Phase 6: Cleanup

**Goal:** Remove all vestiges of the old CSS system.

### 6A — Delete Bridge Variables

Remove the entire `:root` bridge block from `ToolLayout.astro`:

```css
/* DELETE THIS ENTIRE BLOCK */
:root {
  --bg: var(--color-bg);
  --surface: var(--color-surface);
  /* ...30+ aliases... */
}
```

### 6B — Delete Shared Class Definitions

Remove `.panel`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-sm` from `ToolLayout.astro` if they were converted to inline utilities (Phase 1 Option A) or confirm they're in `@layer components` (Option B).

### 6C — Verify No Orphan `var(--` References

```powershell
Select-String -Path "src/components/preact/**/*.tsx" -Pattern "var\(--" -Recurse
Select-String -Path "src/pages/tools/*.astro" -Pattern "<style" -Recurse
```

Both should return zero results (excluding justified dynamic inline styles).

### 6D — Verify Build

```powershell
npm run check
npm run build
```

### 6E — Update Documentation

| File | Update |
|------|--------|
| `docs/architecture.md` | Note Tailwind utilities are the styling standard |
| `docs/development-guide.md` | Update "Adding a tool" recipe with Tailwind patterns |
| `.github/instructions/astro.instructions.md` | Update CSS conventions section |
| `docs/project-conventions.md` | Add Tailwind utility conventions |
| `docs/preact-implementation-plan.md` | Mark Phase 6 (CSS Token Migration) as complete |

**Session gate:** Final commit. Green baseline. All tools render correctly.

---

## Conversion Patterns Reference

### Common CSS → Tailwind Mappings

| CSS Pattern | Tailwind Equivalent |
|-------------|---------------------|
| `display: flex` | `flex` |
| `display: grid` | `grid` |
| `flex-direction: column` | `flex-col` |
| `flex-wrap: wrap` | `flex-wrap` |
| `align-items: center` | `items-center` |
| `justify-content: center` | `justify-center` |
| `justify-content: space-between` | `justify-between` |
| `gap: var(--space-sm)` | `gap-sm` |
| `gap: var(--space-lg)` | `gap-lg` |
| `padding: var(--space-lg)` | `p-lg` |
| `padding: var(--space-sm) var(--space-md)` | `px-md py-sm` |
| `margin: 0 auto` | `mx-auto` |
| `margin: 0` | `m-0` |
| `margin-bottom: var(--space-md)` | `mb-md` |
| `margin-top: var(--space-lg)` | `mt-lg` |
| `background: var(--surface)` | `bg-surface` |
| `background: var(--bg)` | `bg-bg` |
| `color: var(--text)` | `text-text-primary` |
| `color: var(--text-dim)` | `text-text-dim` |
| `color: var(--text-muted)` | `text-text-muted` |
| `color: var(--accent)` | `text-accent` |
| `border: 1px solid var(--border)` | `border border-border` |
| `border: 1px solid transparent` | `border border-transparent` |
| `border-radius: var(--radius-sm)` | `rounded-sm` |
| `border-radius: var(--radius)` | `rounded-md` |
| `font-weight: bold` / `700` | `font-bold` |
| `font-weight: 600` | `font-semibold` |
| `font-weight: 500` | `font-medium` |
| `font-weight: normal` / `400` | `font-normal` |
| `font-size: 0.75rem` | `text-xs` |
| `font-size: 0.8rem` / `0.85rem` | `text-sm` (~0.875rem) |
| `font-size: 0.9rem` | `text-sm` or `text-[0.9rem]` |
| `font-size: 1rem` | `text-base` |
| `font-size: 1.1rem` / `1.125rem` | `text-lg` (~1.125rem) |
| `font-size: 1.25rem` | `text-xl` |
| `font-size: 1.5rem` | `text-2xl` |
| `font-size: 3rem` | `text-5xl` (~3rem) |
| `font-family: var(--font-mono)` | `font-mono` |
| `text-align: center` | `text-center` |
| `text-transform: uppercase` | `uppercase` |
| `letter-spacing: 0.05em` | `tracking-wide` |
| `letter-spacing: 0.5px` | `tracking-wider` or `tracking-[0.5px]` |
| `line-height: 1.6` | `leading-relaxed` |
| `opacity: 0.4` | `opacity-40` |
| `text-decoration: line-through` | `line-through` |
| `cursor: pointer` | `cursor-pointer` |
| `transition: all 0.15s ease` | `transition-all duration-150` |
| `transition: color 0.15s` | `transition-colors duration-150` |
| `overflow-y: auto` | `overflow-y-auto` |
| `position: relative` | `relative` |
| `position: absolute` | `absolute` |
| `position: sticky` | `sticky` |
| `white-space: nowrap` | `whitespace-nowrap` |
| `grid-template-columns: 1fr 320px` | `grid-cols-[1fr_320px]` |
| `max-width: 1200px` | `max-w-[1200px]` |
| `width: 40px` | `w-10` |
| `height: 40px` | `h-10` |
| `:hover` pseudo | `hover:` prefix |
| `:focus` pseudo | `focus:` prefix |
| `:active` pseudo | `active:` prefix |
| `@media (max-width: 900px)` | `max-[900px]:` |
| `@media (max-width: 768px)` | `max-md:` (768px) |
| `@media (max-width: 640px)` | `max-sm:` (640px) |

### Patterns That Must Stay as Inline Styles

```tsx
// Dynamic runtime percentages
style={{ width: `${hpPercent}%` }}

// Runtime positioning (tooltips, popups)
style={{ position: "fixed", top: `${y}px`, left: `${x}px` }}

// Chart.js color swatches
style={{ background: POOL_COLORS[index] }}
```

### Conditional Class Pattern

```tsx
// Simple boolean
<div class={`flex ${isActive ? "border-accent" : "border-transparent"}`}>

// Multiple conditions
<div class={[
  "flex items-center p-sm rounded-sm",
  isKept && "bg-accent text-bg",
  isDropped && "opacity-40 line-through",
  isExploded && "border-gold animate-pulse-once",
].filter(Boolean).join(" ")}>
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tailwind utility names collide with Starlight classes | Low | Medium | Starlight uses scoped `sl-*` prefix. Test after each conversion. |
| CSS specificity issues (Tailwind < inline CSS) | Medium | Low | Tailwind utilities use single-class specificity. If overridden, add `!important` via `!` prefix: `!bg-surface`. |
| Responsive breakpoints don't match old media queries | Medium | Medium | Audit all `@media` queries first. Map to Tailwind breakpoints or use arbitrary `max-[900px]:` syntax. |
| Component re-renders cause className flash | Low | Low | Preact Signals are synchronous — no flash expected. |
| Tailwind CSS purge removes needed classes | Low | High | Tailwind v4 uses Vite and detects classes in `.tsx`/`.astro` files automatically. No manual safelist needed unless classes are constructed dynamically from variables. |
| Token names conflict with Tailwind defaults | Medium | Low | Verify that `@theme` names like `--spacing-sm` don't clash with Tailwind's default `--spacing-*` scale. Test the generated utilities. |
| Dynamic class construction breaks purge | Medium | Medium | Never construct class names via string interpolation of the utility part: `bg-${color}` won't work. Use full class strings: `isError ? "bg-error" : "bg-surface"`. |
| Build size increases from verbose utility strings | Low | Low | Tailwind v4's atomic CSS is typically smaller than component CSS. Monitor with `npm run build`. |

---

## File Inventory

### Files to Modify (Styles → Tailwind)

| Phase | File | Action |
|-------|------|--------|
| 0 | `src/styles/tailwind.css` | Extend `@theme`, add animations |
| 1 | `src/layouts/ToolLayout.astro` | Convert global styles, slim bridge |
| 2 | `src/pages/tools/dice-roller.astro` | Delete `<style>` block |
| 2 | `src/components/preact/tools/dice-roller/*.tsx` (6 files) | Add Tailwind classes |
| 3A | `src/pages/tools/index.astro` | Convert inline styles |
| 3B | `src/pages/tools/success-curves.astro` | Delete `<style>` block |
| 3B | `src/components/preact/tools/success-curves/*.tsx` | Add Tailwind classes |
| 3C | `src/pages/tools/quick-reference.astro` | Delete `<style>` block |
| 3C | `src/components/preact/tools/quick-reference/*.tsx` | Add Tailwind classes |
| 3D | `src/pages/tools/defense-graph.astro` | Delete `<style>` block |
| 3D | `src/components/preact/tools/defense-graph/*.tsx` | Add Tailwind classes |
| 4B | `src/pages/tools/npc-generator.astro` | Delete `<style>` block |
| 4B | `src/components/preact/tools/npc-generator/*.tsx` | Add Tailwind classes |
| 4C | `src/pages/tools/combat-tracker.astro` | Delete `<style>` block |
| 4C | `src/components/preact/tools/combat-tracker/*.tsx` | Add Tailwind classes |
| 5A | `src/pages/tools/character-builder.astro` | Delete `<style>` block |
| 5A | `src/components/preact/tools/character-builder/*.tsx` | Add Tailwind classes |
| 5B | `src/pages/tools/ship-builder.astro` | Delete `<style>` block |
| 5B | `src/components/preact/tools/ship-builder/*.tsx` | Add Tailwind classes |
| 5C | `src/pages/tools/character-sheet.astro` | Delete `<style>` block |
| 5C | `src/components/preact/tools/character-sheet/*.tsx` | Add Tailwind classes |
| 6 | `src/layouts/ToolLayout.astro` | Delete bridge block |
| 6 | Docs (5 files) | Update conventions |

### Files That Stay Unchanged

| File | Reason |
|------|--------|
| `src/styles/custom.css` | Starlight theme — separate CSS layer, not tool styling |
| `src/lib/dtd/**` | Pure logic, no CSS |
| `src/hooks/**` | Pure logic, no CSS |
| `src/workers/**` | Web Workers, no CSS |
| `src/components/Head.astro` | Vercel Analytics injection only |
| All `books/`, `cleaned-references/`, `data/` | Content, not code |

### Estimated Effort

| Phase | Tools | CSS Lines | Components | Sessions |
|-------|-------|-----------|------------|----------|
| 0 | — | ~20 new | — | 1 |
| 1 | Layout | ~150 | — | 1 |
| 2 | Dice Roller | ~261 | 6 | 1 |
| 3 | Index + Curves + QRef + Defense | ~769 | ~22 | 2 |
| 4 | NPC Gen + Combat | ~1,386 | ~22 | 2 |
| 5 | Builder + Ship + Sheet | ~3,153 | ~43 | 4–6 |
| 6 | Cleanup + docs | — | — | 1 |
| **Total** | **10 tools** | **~5,569** | **~97** | **~12–14** |
