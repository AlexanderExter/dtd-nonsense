# Quick Reference

Categorized rules reference for at-the-table lookup. Provides rapid access to commonly needed rules, tables, and formulas.

**Phase:** Complete (migrated to Starlight MDX)
**File:** `cleaned-references/00-Quick-Reference.mdx`
**URL:** `/rules/00-quick-reference/`

---

## Migration History

The Quick Reference was originally a React island tool (`src/pages/tools/quick-reference.astro` + 13 React components + Zustand store). It was migrated to a native Starlight MDX page to:

- **Eliminate maintenance drift** — content was hardcoded in TypeScript and had to be manually synced with cleaned-references
- **Leverage Pagefind** — Ctrl+K search across the entire site now includes QRef content
- **Reduce bundle size** — zero client-side JavaScript instead of a React island
- **Unify UX** — same sidebar, theme, TOC, and navigation as all other rules pages

---

## Features

### Category Tabs

Uses Starlight `<Tabs>` with `syncKey="qref-section"` for 8 categories:

| Tab | Content |
| --- | --- |
| Actions | 34 combat/utility actions with type, tags, and effect |
| Conditions | 14 status effects with mechanical effects and duration |
| Combat Mods | Range bands, melee modifiers, cover AP, hit locations |
| Formulas | All derived stat formulas + TN difficulty ladder |
| Magic | 9 magic schools with characteristic and theme |
| Sword Schools | 9 melee combat disciplines with skill/weapon/action |
| Gun Kata | 6 ranged combat disciplines |
| Weapon Props | 31 weapon property keywords with mechanical effects |
| Warp Perils | Psychic Phenomena + Perils of the Warp tables |

### Cross-References

Each tab includes a "See [full page]" link to the corresponding cleaned-reference for deeper reading.

---

## Content Source

Content is authored directly in MDX — **single source of truth**. No data duplication, no sync required.

Content corresponds to:

- `14-Combat.mdx` → Actions tab, Combat Mods tab
- `16-Conditions.mdx` → Conditions tab
- `03-Characteristics-Skills.mdx` → Formulas tab
- `11-Magic.mdx` → Magic tab, Warp Perils tab
- `12-Sword-Schools.mdx` → Sword Schools tab
- `13-Gun-Kata.mdx` → Gun Kata tab
- `10-Equipment.mdx` → Weapon Props tab

---

## Verification

1. Navigate to `/rules/00-quick-reference/` → page loads with tabs
2. Switch between all 8 tabs → content renders correctly
3. Use Ctrl+K search → QRef content appears in global search results
4. "See [page]" links in each tab → navigate to correct full reference page
5. Print the page → tables render cleanly
