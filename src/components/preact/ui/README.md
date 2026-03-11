# UI Primitives

Shared Preact components backed by [Ariakit](https://ariakit.org/) + Tailwind CSS tokens. All tools import from the barrel:

```tsx
import { Button, Modal, Toast, showToast } from "@/components/preact/ui";
```

**Never import `@ariakit/react` directly in tool code** — always use these wrappers.

---

## SSR Compatibility

Ariakit's store system (`useSyncExternalStore`) crashes during `preact-render-to-string`. All tool `.astro` pages **must** use `client:only="preact"` instead of `client:load`.

---

## Component Index

### Tier 1 — Pure Styling (no Ariakit)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button` | Styled button (`.btn` family) | `variant`: primary / secondary / ghost / danger / accent; `size`: xs / sm / md |
| `Panel` | Card container (`.panel` class) | Standard div props |
| `SectionHeading` | Uppercase accent heading | `as`: h2 / h3 / h4 (default h4) |
| `Badge` | Inline status indicator | `variant`: success / warning / error / info / accent / muted; `size`: sm / md |
| `CloseButton` | × dismiss button with aria-label | `size`: sm / md |
| `AddButton` | "+ Add {label}" ghost button | `label`: string |
| `NumberInput` | Styled number input | `width`: xs / sm / md; `label`: optional |
| `FormGroup` | Label + input wrapper | `label`: string; `layout`: vertical / inline |
| `PresetGroup` | Chip-style toggle buttons | `presets`: array; `activeValue`: current; `onSelect`: callback |
| `Toast` / `showToast` | Signal-driven toast notifications | `showToast(msg, duration?)` to trigger; `<Toast />` to render |

### Tier 2 — Ariakit Core

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Modal` | Dialog with backdrop | `open`, `onClose`, `title?`, `maxWidth?` |
| `AccordionItem` | Collapsible section | `title`, `defaultOpen?`, `open?` + `onToggle?` for controlled mode |
| `Tabs` / `TabPanel` | Tab navigation | `tabs`: array of `{ id, label }`; `activeId`; `onTabChange` |

### Tier 3 — Ariakit Complex

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Select` | Dropdown | `value`, `onChange`, `options`, `label?` |
| `Popover` | Positioned popup | `open`, `onClose`, `anchorRect?`, `title?` |
| `Tooltip` | Hover/focus tooltip | `content`: string; `placement?` |
| `Combobox` | Searchable dropdown | `value`, `onChange`, `options`, `placeholder?` |
| `Menu` | Action dropdown | `trigger`: children; `items`: array of `{ label, onClick, danger? }` |

---

## Patterns

### Conditional Classes

All components use the project standard:

```tsx
const classes = ["base-class", condition && "conditional-class", cls]
  .filter(Boolean)
  .join(" ");
```

### Toast Usage

Call `showToast()` from any module — no component ref needed:

```tsx
import { showToast, Toast } from "@/components/preact/ui";

// In any handler, anywhere:
showToast("Character saved!");

// Mount once in root *App.tsx:
export function MyToolApp() {
  return (
    <div>
      {/* tool content */}
      <Toast />
    </div>
  );
}
```

### Controlled vs Uncontrolled Accordion

```tsx
// Uncontrolled (manages own open/close state):
<AccordionItem title="Details" defaultOpen>...</AccordionItem>

// Controlled (parent manages state for expand/collapse all):
<AccordionItem title="Details" open={isOpen} onToggle={toggle}>...</AccordionItem>
```

---

## Not Covered

These patterns remain as tool-local implementations (intentionally not abstracted):

- **× remove buttons** — inline transparent style, different from `CloseButton`
- **Mode toggles** — complex conditional active states (Ship Builder)
- **Filter chip groups** — domain-specific filter logic (hull filters, stunt presets)
- **Domain badges** — custom color tokens for dice outcomes, wound status, etc.
- **AccordionSection** (Quick Reference) — controlled accordion with expand/collapse all
- **StepAccordion** (Character Builder) — step wizard with status indicators
