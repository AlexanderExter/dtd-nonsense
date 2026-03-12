---
name: frontend-stack-advisor
description: >
  Use when: making technology choices for frontend projects, evaluating whether a library
  or framework fits a project, setting up a new project, choosing between competing tools,
  reviewing a project's tech stack, or troubleshooting problems that stem from stack
  mismatches. Triggers: "what should I use for", "should I add", "set up a new project",
  "start a new project", "is this the right tool", "tech stack", "which framework",
  "project setup", "init a project", "scaffold", "should I use Next.js", "what goes
  with React", "do I need", "foundation stack", "stack review". Also trigger when the
  user is struggling with a tool and the root cause might be a stack-level mismatch
  (wrong tool for the job, unnecessary complexity, missing foundation piece). This skill
  encodes a specific, opinionated decision framework — not generic advice.
---

# Frontend Stack Advisor

Guide technology decisions using a personal, stress-tested framework. This is not generic "best practices" advice — it's a specific decision philosophy built from real experience.

## Core Axiom

**The cost of carrying unused capability is near zero. The cost of choosing wrong and refactoring is enormous.**

Every decision flows from this. When evaluating whether to include a tool:
- A generous foundation that covers problems you haven't encountered yet is cheaper than a minimal stack that punishes you when requirements change
- Ecosystem depth, cross-compatibility, and wide adoption beat architectural purity
- One tool that does many things well (Bun) beats multiple specialized tools that each do one thing slightly better (Node + npm + Jest + a bundler)
- The carrying cost of unused features is a line in package.json. The cost of discovering you need something mid-project and restructuring is hours or days

## The Four Tiers

Every tool lives in exactly one tier. Tier placement is based on: how often it's needed across projects, how expensive it is to add later versus having from the start, and how much it shapes the development workflow.

### Tier 1: Foundation — Always Installed

These go in every project. No exceptions, no debate. Each one either shapes how code is written daily or prevents a class of problems that are disproportionately expensive to debug solo.

| Tool | Role | Why Foundation |
|------|------|----------------|
| **Bun** | Runtime, package manager, bundler, test runner | One binary replaces Node + npm + Jest. Integrates with itself. Fast. Actively funded (Oven/Anthropic). |
| **React** | UI library | Ecosystem lock-in. Libraries assume React. Tutorials assume React. Alternatives (Preact, Solid) save bundle size but cost compatibility. The Preact lesson: refactoring from a "lighter alternative" costs more than carrying React ever would. |
| **Tailwind CSS** | Utility-first styling | Cognitive simplicity, co-location with components, shares React's mental model. Critical path to shadcn/ui. Never fight CSS specificity again. |
| **Zod** | Schema validation (runtime) | TypeScript catches compile-time errors; Zod catches runtime errors when data crosses boundaries (localStorage, files, APIs, user input). Validates Astro content collections, form inputs, saved data. Without it, bad data enters silently and causes errors three layers deep. |
| **Zustand** | Lightweight state management | 1kb, zero boilerplate. When useState/useContext aren't enough (shared state across unrelated components, interconnected calculations), it's already there. Carrying cost is negligible. |
| **React Hook Form** | Form handling | Character sheets are forms. Config UIs are forms. Integrates with Zod for schema-based validation. Without it, form state management gets painful fast at any scale. |
| **date-fns** | Date/time utilities | JS Date is broken. date-fns is the most widely adopted, tree-shakeable, integrates everywhere. Chosen over dayjs for ecosystem depth. |
| **Lucide React** | Icon library | Almost every UI needs icons. Lucide is what shadcn/ui uses internally — visual consistency guaranteed. One set from the start prevents incoherence. |
| **shadcn/ui** | Pre-styled components (Radix + Tailwind) | Accessible primitives (Radix) + styling (Tailwind) = production-ready, copy-paste components you own. The natural culmination of the React + Tailwind + Lucide stack. |
| **react-markdown** | Markdown rendering in React | For documentation, content-driven projects, and tools with rich text fields. Inside Astro, Markdown is handled natively; in standalone React apps, this is the standard. |

### Tier 2: First Reach — Add When the Project Needs It

Each solves a specific problem. Trivial to add, no restructuring required. Install when the project shape demands it.

| Tool | Role | When to Add |
|------|------|-------------|
| **TanStack Query** | Server data fetching, caching, sync | When the project talks to APIs or a backend. Preferred over SWR for ecosystem and devtools. |
| **React Router** | Client-side routing | When building a standalone multi-page React app. Not needed inside Astro or Next.js (they provide routing). |
| **React Testing Library** | Component testing | When you have working features worth protecting from regressions. Pairs with Bun's test runner. |
| **Framer Motion** | Animation | When smooth transitions, enter/exit animations, or drag interactions are a real requirement. Larger package — justify before adding. |
| **Redux** | Heavy-duty state management | Pending closer review. Zustand covers most needs. Redux has stronger devtools/middleware for complex async. Most projects never need it. |
| **Dexie.js** | IndexedDB wrapper (browser database) | When localStorage isn't enough: multiple records, versioned data, complex queries. Character sheet save/load will outgrow localStorage. |
| **OpenAPI / Type Generation** | Auto-generate types from API specs | When connecting to a backend with a documented API. Not relevant until a backend exists. |

### Tier 3: Best Practice — Process and Quality

Don't build features. Protect the features you've built. Set up early in any project that will grow.

| Tool | Role | Notes |
|------|------|-------|
| **TypeScript (strict)** | Compile-time type safety | If writing .tsx, already implicit. Make it explicit: strict mode, no lazy `any`. Pairs with Zod (compile-time + runtime = complete safety net). |
| **Biome** | Linter + formatter | Replaces ESLint + Prettier. Written in Rust, fast, integrated. Same philosophy as Bun — one tool, sensible defaults. |
| **rumdl** | Markdown/MDX linter + formatter | Written in Rust. 70+ rules, auto-detects flavors (.mdx gets MDX treatment). Catches broken headings, inconsistent formatting, structural issues. Biome handles code; rumdl handles content. |
| **Knip** | Finds unused files, deps, exports | As the foundation has 10 pieces and projects grow, dead weight accumulates. Knip catches it. Run periodically. |
| **Storybook** | Component dev environment | Develop/test components in isolation. Worth it when component count justifies it; overkill for simple projects. |

### Tier 4: Specialized — Clear Justification Required

High complexity cost. Only add when the project genuinely has the problems these solve.

| Tool | Role | When Justified |
|------|------|----------------|
| **Next.js** | Full framework (SSR, SSG, API routes) | Only for: public-facing pages needing SEO + authenticated app sections + API routes in one codebase. Not for doc sites (Astro), standalone tools (foundation alone), or internal dashboards (no SSR needed). |

---

## Use-Case Decision Framework

When starting a project, identify which use case it matches. The foundation is always present. What changes is the layers above it.

### Documentation Site
**Stack:** Foundation + Astro + Starlight
- Astro: static-first framework, ships zero JS by default, islands architecture
- Starlight: Astro plugin providing sidebar, search (Pagefind), TOC, i18n, dark mode
- React powers interactive islands (character sheets, dice rollers) within otherwise static pages
- Zod validates Astro content collection schemas natively
- **Pitfall:** Don't `client:load` everything. If most components are hydrated, you're fighting the framework.

### Interactive Tool (character sheet, calculator, tracker)
**Stack:** Foundation alone
- No framework needed. Bun handles builds. React drives the UI.
- This is where the foundation proves itself — nothing to add, nothing to decide
- RHF handles inputs, Zustand manages interconnected state, Zod validates save/load data
- **First reach when needed:** Dexie.js for persistence beyond localStorage
- **Pitfall:** Reaching for Next.js or Astro because you're "using React." A standalone tool is one page of rich interactivity. Frameworks solve problems you don't have.

### Dashboard / Internal App
**Stack:** Foundation + React Router + TanStack Query
- Two first-reach additions above foundation. Still no framework needed.
- shadcn/ui is in its designed-for use case here (tables, forms, modals, command palettes)
- Zustand manages cross-panel state; date-fns formats timestamps and ranges
- **Pitfall:** Adding Redux when Zustand is already in the foundation. Zustand covers most dashboard state needs.

### Full SaaS Product
**Stack:** Foundation + Next.js + TanStack Query + auth library
- This is where Next.js genuinely earns its complexity
- Marketing pages: statically generated (SEO). Dashboard: client-rendered (behind auth). API routes: same codebase.
- Auth library: NextAuth/Clerk/Lucia for login and session handling
- **Caution:** Next.js is primarily tested against Node. Bun may need to yield as runtime; can still serve as package manager.
- **Pitfall:** Starting here while learning. SaaS is the most expensive classroom — every layer's concepts interact with every other layer's. Graduate to this from simpler use cases.

---

## Decision Principles

When evaluating any tool not already in this framework:

1. **Does it solve a problem I've already encountered?** If yes, consider foundation or first-reach.
2. **How expensive is it to add later versus having from the start?** If adding later requires restructuring, it belongs in the foundation. If it's a `bun add` and five minutes of setup, it's first-reach.
3. **Does it have wide ecosystem adoption and React compatibility?** Prefer the most adopted, most compatible option. A slightly better tool with a thinner ecosystem is a worse choice.
4. **Does one tool cover what multiple tools do?** Prefer integrated solutions (Bun over Node+npm+Jest, Biome over ESLint+Prettier).
5. **What's the carrying cost?** A line in package.json is free. A conceptual model you have to maintain in your head is expensive.

## Anti-Patterns to Flag

Watch for these and intervene:
- **Framework for a tool-tier problem:** Using Next.js or Astro for a standalone interactive app
- **Lighter alternative trap:** Choosing Preact/Solid/etc. for bundle savings, losing ecosystem compatibility
- **Premature optimization:** Adding Redux, complex state management, or heavy architecture before the project needs it
- **Stack tourism:** Trying a new framework/library because it's trending rather than because the current stack can't handle a real requirement
- **Multiple tools for one job:** Using both a CSS-in-JS library and Tailwind, or both Zustand and Redux, or both SWR and TanStack Query
