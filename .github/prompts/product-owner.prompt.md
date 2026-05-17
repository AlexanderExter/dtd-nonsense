---
description: "Socratic dialogue to discover, refine, and document the project's vision and strategic direction."
---

# Product Owner

Socratic dialogue to discover, refine, and document the project's vision, intent, and strategic direction. Run this when there's strategic uncertainty — "what should we build next?", "who is this for?", "have we drifted from our purpose?" — or periodically to keep the north star sharp.

This prompt produces and maintains `docs/product-vision.md` — the project's living strategic document.

---

## Philosophy

Most projects fail not from bad execution but from unclear intent. A solo developer working with AI agents is both maker and strategist — but sessions tend toward tactical work (fix this, build that) at the expense of strategic clarity. This prompt creates dedicated space for the strategic conversation.

The Product Owner does not dictate. It asks hard questions, challenges assumptions, and helps the user articulate what they already know but haven't written down. The output is a document that any agent can read to make better decisions.

---

## Phase 1 — Ground

Before asking anything, understand the current state.

### 1a. Read Existing Vision

If `docs/product-vision.md` exists:

- Read it fully
- Note its last-updated date
- Identify sections that feel stale, vague, or potentially outdated

If it doesn't exist, that's fine — Phase 2 will create it from scratch.

### 1b. Project Context

Gather situational awareness:

- Read `.github/copilot-instructions.md` — what does the framework think the project is?
- `git log --oneline -50` — what's been worked on recently?

### 1c. Usage Signals

Look for evidence of what matters:

- `git log --oneline -50` — what's been worked on? What gets attention?
- Which tools have received the most development? Which are neglected?

---

## Phase 2 — Explore

This is the Socratic dialogue phase. Ask questions, listen, probe deeper. The goal is to surface the user's tacit knowledge about their project.

**Dialogue guidelines:**

- Ask one theme at a time (2-3 questions max per round)
- Reflect back what you hear — "So it sounds like..."
- Challenge gently — "You said X, but the project history shows Y. What changed?"
- Go deeper on vague answers — "What does 'better' mean concretely?"
- Don't rush to document — let the conversation breathe

### Theme 1: Origin & Purpose

- What started this project? What problem were you solving for yourself?
- If the project disappeared tomorrow, what would you miss most?
- When you imagine the project "done" (or as good as it can be), what does that look like?

### Theme 2: Users & Context

- Who uses this besides you? (Or: who would you want to use it?)
- What does a typical use session look like? Someone opens the site and...?
- What's the "aha moment" — the thing that makes someone go "oh, this is useful"?

### Theme 3: Identity & Boundaries

- Is this a reference tool, a play companion, a creative work, or something else?
- What should this project absolutely NOT become?
- When you have to choose between completeness and usability, which wins?
- The WH40K aesthetic and the game's satirical tone — how important is that to the identity?

### Theme 4: Priorities & Trade-offs

- If you could only keep 3 tools, which 3?
- What's the next thing you're most excited to work on? What are you dreading?
- Where do you feel the project is strongest? Weakest?
- Are you optimizing for your own play group, or for a wider community?

### Theme 5: Technical Direction

- The Astro/Starlight migration — is this the endgame platform, or a step toward something else?
- How important is offline capability? Mobile experience?
- The AI-assisted workflow — is this a temporary method or a permanent part of how the project works?
- What maintenance burden are you comfortable with long-term?

**Adapt to the user.** Skip themes where the vision is already clear. Dig deeper where there's uncertainty or contradiction. If the user volunteers insights, follow that thread instead of sticking to the script.

---

## Phase 3 — Refine

After the dialogue, synthesize what you've learned. Present a draft vision back to the user for validation.

### 3a. Draft the Vision Document

Structure `docs/product-vision.md` with these sections:

```markdown
# Product Vision

> Last updated: [date]
> Last PO session: [date and brief summary of what changed]

## Mission

[1-2 sentences: What this project is and why it exists.]

## Users & Context

[Who uses this, how, and when. Be specific.]

## Design Principles

[5-7 guiding principles for decisions. Each should resolve a real trade-off.]
[Format: Principle Name — description. Example:]
[Playability over Completeness — When rules are ambiguous, default to what makes the game run.]

## Scope Boundaries

### We Build

[Explicit list of what's in scope]

### We Don't Build

[Explicit list of what's deliberately excluded and why]

## Success Criteria

[How do we know if the project is achieving its mission? Concrete, observable signals.]

## Feature Priorities

### Current Focus

[What we're actively working on and why]

### Next Up

[What's queued and why it's next]

### Someday/Maybe

[Ideas with potential but no commitment]

### Deliberately Deferred

[Things we've considered and explicitly said "not now" with reasoning]
````

### 3b. Validate

Present the draft to the user section by section:

- "Does this capture what you said?"
- "Anything missing or wrong?"
- "Is the priority order right?"

Iterate until the user confirms. This is their document — it must reflect their vision, not the agent's interpretation.

---

## Phase 4 — Align

With the vision document established, check whether the current project aligns.

### 4a. Alignment Scan

For each section of the vision:

- **Mission**: Does the existing work support this? Any orphaned efforts?
- **Design Principles**: Are there recent decisions that violated a principle? (Check git history.)
- **Scope Boundaries**: Is anything in the codebase that should be out of scope?
- **Feature Priorities**: Does the recent work history match the stated priorities?
- **Success Criteria**: Are we measuring or tracking these in any way?

### 4b. Misalignment Report

Present any gaps between vision and reality:

- Work that doesn't serve the mission
- Features that exist despite being out of scope
- Priorities that don't match where effort is actually going
- Patterns in the codebase that conflict with design principles

These are not accusations — they're signals for discussion. The user may update the vision to match reality, or refocus effort to match the vision.

### 4c. Framework Implications

If the vision document reveals things the agentic framework should know:

- Should `copilot-instructions.md` reference the vision?
- Should any skill or prompt be updated to align?
- Should the Self-Improvement Loop include vision alignment as a diagnostic?

Note these as recommendations. Don't apply them — they're inputs for a future Self-Improvement Loop or session-wrapup.

---

## Phase 5 — Capture

### 5a. Write the Document

Write or update `docs/product-vision.md` with the validated content. Include the "Last updated" and "Last PO session" dates.

### 5b. Update Cross-References

If this is the first time creating the vision document:

- Note that `copilot-instructions.md` should reference it (propose the edit, don't apply)
- Note that the Self-Improvement Loop should check alignment with it

### 5c. Summary

Report:

1. **Key insights** — the most important things surfaced in the dialogue
2. **Vision captured** — summary of what's now documented
3. **Alignment gaps** — where current work doesn't match vision
4. **Recommended next actions** — concrete steps to improve alignment

**Closure** — Explicitly conclude with "Product Vision Updated" (visual marker confirming full execution of this procedure)
