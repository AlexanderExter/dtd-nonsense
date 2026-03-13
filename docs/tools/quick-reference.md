# Quick Reference

Searchable, categorized rules reference for at-the-table lookup. Provides rapid access to commonly needed rules, tables, and formulas.

**Phase:** Complete
**Files:** `src/pages/tools/quick-reference.astro`, `src/components/react/tools/quick-reference/` (13 components)
**Pattern:** React Island via `client:only="react"` with module-level Zustand

---

## Features

### Category Tabs

| Tab        | Content                                                     |
| ---------- | ----------------------------------------------------------- |
| Core Rules | Dice mechanics, Tests, Raises/Checks, TN ladder             |
| Combat     | Action economy, attack resolution, damage, critical effects |
| Magic      | Casting Tests, schools, spell list summaries                |
| Conditions | Full condition list with mechanical effects                 |
| Equipment  | Weapon/armor properties, quality keywords                   |
| Formulas   | All derived stat formulas (SD, HP, MD, Initiative, etc.)    |

### Search

- **Global search** — filters across all categories in real time
- **Keyword highlighting** — matched terms highlighted in results
- **Section anchors** — deep-link to specific rule sections via URL hash

### Content Display

- **Collapsible sections** — accordion-style within each tab
- **Tables** — pipe-formatted tables for reference data (TN ladder, action costs, condition effects)
- **Formula blocks** — derived stat formulas with variable breakdowns
- **Cross-references** — links between related rules (e.g., "See Conditions" from Combat)

---

## Architecture

**Dependencies:** None (self-contained Astro page)

### Content Source

Rules content is **hardcoded in HTML** — not loaded from JSON. This is intentional: the Quick Reference is a curated subset of rules optimized for at-table lookup, not a raw data dump.

Content was extracted from `cleaned-references/` files:

- `01-Core-Rules.md` → Core Rules tab
- `14-Combat.md` → Combat tab
- `11-Magic.md` → Magic tab
- `16-Conditions.md` → Conditions tab
- `10-Equipment.md` → Equipment tab
- Formula reference from `copilot-instructions.md` → Formulas tab

### Search Implementation

```javascript
QRef.search = function (query) {
    const sections = document.querySelectorAll(".qref-section");
    sections.forEach((section) => {
        const text = section.textContent.toLowerCase();
        const match = text.includes(query.toLowerCase());
        section.style.display = match ? "" : "none";
        if (match) highlightMatches(section, query);
    });
};
```

Search is client-side text matching — no index, no fuzzy matching. Fast enough for the content volume.

---

## Persistence

| Key            | Content                   |
| -------------- | ------------------------- |
| `dtd-qref-tab` | Last active tab selection |

Minimal persistence — remembers which tab was open.

---

## UI Layout

```
┌──────────────────────────────────────────────────────────┐
│  Search: [________________]                              │
│                                                          │
│  [Core Rules] [Combat] [Magic] [Conditions] [Equip] [F] │
│                                                          │
│  ▾ Dice Mechanics                                        │
│    Roll XkY: roll X d10s, keep Y highest                 │
│    Dice explode on 10 (reroll and add)                   │
│    Raise = every 5 above TN                              │
│    Check = every 5 below TN                              │
│                                                          │
│  ▸ Target Number Ladder                                  │
│  ▸ Test Types                                            │
│  ▾ Action Economy                                        │
│    Full Action: attack, cast, charge                     │
│    Half Action: move, aim, ready                         │
│    ...                                                   │
└──────────────────────────────────────────────────────────┘
```

---

## Design Decisions

| Decision        | Choice           | Rationale                             |
| --------------- | ---------------- | ------------------------------------- |
| Content source  | Hardcoded HTML   | Curated subset, not exhaustive dump   |
| Search approach | Text matching    | Simple, fast, no build step           |
| Tab persistence | localStorage     | Resume where you left off             |
| Formula display | Formatted blocks | Visual clarity for at-table reference |

---

## Verification

1. Search "grapple" → verify combat section appears with highlight
2. Switch tabs → refresh → verify last tab restored
3. All formula blocks → verify they match formula reference in development guide
4. Condition list → verify completeness against `16-Conditions.md`
5. Deep link via URL hash → verify correct section scrolls into view
