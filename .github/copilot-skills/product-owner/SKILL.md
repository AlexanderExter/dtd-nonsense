---
name: product-owner
description: "Use when making decisions about what to build, prioritize, or cut. Use when strategic context would improve a tactical choice — e.g., 'should this tool exist?', 'is this feature in scope?', 'what matters more: X or Y?'."
---

# Product Owner Context

## Purpose

This skill gives any agent access to the project's strategic context without requiring a dedicated Product Owner session. Read `docs/product-vision.md` before making decisions that affect:

- What gets built or ignored
- How features are prioritized
- Where to invest effort vs. where to cut scope
- Trade-offs between competing approaches

---

## How to Use

1. **Read `docs/product-vision.md`** — this is the authoritative source for project strategy. It contains the mission, user personas, design principles, scope boundaries, success criteria, and feature priorities.

2. **Apply design principles as decision filters.** When choosing between approaches, check which one better aligns with the stated principles. If a principle is relevant, cite it explicitly in your reasoning.

3. **Respect scope boundaries.** The vision document lists what the project deliberately does and doesn't build. If a proposed change crosses a boundary, flag it — don't silently expand scope.

4. **Check feature priorities.** Before starting work, verify the task aligns with "Current Focus" or "Next Up." If it's in "Someday/Maybe" or "Deliberately Deferred," confirm with the user before proceeding.

5. **Surface misalignment.** If you notice current work that conflicts with the vision document, raise it. This isn't blocking — it's valuable signal. The user may update the vision or redirect the work.

---

## When the Vision Document Doesn't Exist

If `docs/product-vision.md` has not been created yet, note this as a gap and suggest running the Product Owner prompt (`.github/prompts/product-owner.prompt.md`) to establish it. In the meantime, use `docs/project-history.md` and the project's existing patterns as proxy strategic context.

---

## Updating the Vision

This skill does not update `docs/product-vision.md` directly. Vision updates happen through:

- **Product Owner sessions** — dedicated dialogue using the PO prompt
- **Session wrapup** — if a session surfaces strategic insights, the session-wrapup prompt can note them as candidates for the next PO session
- **Self-Improvement Loop** — checks framework alignment with the vision

If during normal work you notice the vision document is stale or contradicted by recent decisions, log this in `docs/side-tracks.md` under `investigation: Product vision may need update — [specific observation]`.
