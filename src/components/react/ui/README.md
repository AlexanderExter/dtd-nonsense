# UI Primitives

Shared React components backed by [Radix UI](https://www.radix-ui.com/) + Tailwind CSS tokens. Tools import components directly:

```tsx
import { Button } from "@/components/react/ui/Button";
import { Modal } from "@/components/react/ui/Modal";
import { showToast, Toast } from "@/components/react/ui/Toast";
```

**Never import `radix-ui` directly in tool code** — always use these wrappers.

---

## SSR Compatibility

All tool `.astro` pages use `client:only="react"` to avoid SSR issues with client-side state management.

---

## Component Index

### Tier 1 — Pure Styling (no Radix)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button` | Styled button (`.btn` family) | `variant`: primary / secondary / ghost / danger / accent; `size`: xs / sm / md |
| `SectionHeading` | Uppercase accent heading | `as`: h2 / h3 / h4 (default h4) |
| `Badge` | Inline status indicator | `variant`: success / warning / error / info / accent / muted; `size`: sm / md |
| `AddButton` | "+ Add {label}" ghost button | `label`: string |
| `Toast` / `showToast` | Toast notifications | `showToast(msg, duration?)` to trigger; `<Toast />` to render |

### Tier 2 — Radix Core

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Modal` | Dialog with backdrop | `open`, `onClose`, `title?`, `maxWidth?` |
| `AccordionItem` | Collapsible section | `title`, `defaultOpen?`, `open?` + `onToggle?` for controlled mode |
| `Tabs` | Tab navigation | `tabs`: array of `{ id, label }`; `activeId`; `onTabChange` |

### Tier 3 — Radix Complex

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Popover` | Positioned popup | `open`, `onClose`, `anchorRect?`, `title?` |

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
import { showToast, Toast } from "@/components/react/ui";

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

- **× remove buttons** — inline transparent style
- **Mode toggles** — complex conditional active states (Ship Builder)
- **Filter chip groups** — domain-specific filter logic (hull filters, stunt presets)
- **Domain badges** — custom color tokens for dice outcomes, wound status, etc.
- **StepAccordion** (Character Builder) — step wizard with status indicators
