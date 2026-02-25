# DTD Tools — Technical Documentation

Internal documentation for the **Dungeons the Dragoning 40,000: 7th Edition** web toolset. This covers architecture, per-tool specifications, shared modules, data schemas, and project history.

**Audience:** Contributors and AI agents maintaining or extending the tools.

---

## Quick Links

| Resource                                              | Description                                   |
| ----------------------------------------------------- | --------------------------------------------- |
| [Project Conventions](project-conventions.md)         | Git workflow, terminology, formulas, pitfalls |
| [Tools Dashboard](../tools/index.html)                | Launch any tool                               |
| [Architecture](architecture.md)                       | System design, data flow, namespaces          |
| [Development Guide](development-guide.md)             | How to add features, conventions              |
| [Data Reference](data-reference.md)                   | JSON schemas and sync strategy                |
| [Pipeline](pipeline.md)                               | Python CLI: validation, linting, Astro prep   |
| [Astro Migration Roadmap](astro-migration-roadmap.md) | Astro/Starlight porting status and next steps |
| [Project History](project-history.md)                 | Roadmap narrative, decisions, lessons         |
| [Session Handover](session-handover.md)               | Latest session context and next steps         |
| [Side Tracks](side-tracks.md)                         | Observed tech debt and deferred items          |

---

## Tool Documentation

| Tool                                              | Phase | Description                                                  |
| ------------------------------------------------- | ----- | ------------------------------------------------------------ |
| [Character Sheet](tools/character-sheet.md)       | 4     | Freeform editable sheet — primary character tool             |
| [Character Builder](tools/character-builder.md)   | 1.2   | 11-step guided creation wizard with XP tracking              |
| [Dice Roller](tools/dice-roller.md)               | 0.1   | XkY rolling with overflow, explosions, history               |
| [Combat Tracker](tools/combat-tracker.md)         | 1.1   | Initiative, HP/resource/condition tracking                   |
| [Quick Reference](tools/quick-reference.md)       | 1.3   | Searchable rules index for gameplay                          |
| [NPC Stat Block Builder](tools/npc-generator.md)  | 2.1   | Manual stat blocks with auto-derived stats and 40+ templates |
| [Ship Builder](tools/ship-builder.md)             | 2.2   | Ship construction + combat sheet with dual-mode UI           |
| [Success Curve Analyzer](tools/success-curves.md) | 3.1   | Monte Carlo probability visualizer for XkY pools             |
| [Defense Graph Simulator](tools/defense-graph.md) | 3.2   | Damage mitigation pipeline visualizer                        |

## Shared Module Documentation

| Module                       | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| [core.js](shared/core-js.md) | `DTD` namespace, `DTD.character`, `DTD.derived`, XP |
| [dice.js](shared/dice-js.md) | `DTD.dice` — rolling, overflow, notation parsing    |

---

## Project Structure

```
docs/                          ← You are here
├── README.md                  Table of contents (this file)
├── architecture.md            System architecture and data flow
├── astro-migration-roadmap.md Astro/Starlight porting status
├── data-reference.md          JSON data files, schemas, sync strategy
├── development-guide.md       Contributor conventions and patterns
├── pipeline.md                Python CLI: validation, linting, Astro prep
├── project-conventions.md     Cross-cutting conventions (single source of truth)
├── project-history.md         Roadmap, decisions, lessons learned
├── session-handover.md        Latest session context and next steps
├── side-tracks.md             Observed tech debt and deferred items
├── tools/                     Per-tool specifications
│   ├── character-sheet.md
│   ├── character-builder.md
│   ├── dice-roller.md
│   ├── combat-tracker.md
│   ├── quick-reference.md
│   ├── npc-generator.md
│   ├── ship-builder.md
│   ├── success-curves.md
│   └── defense-graph.md
└── shared/                    Shared module API reference
    ├── core-js.md
    └── dice-js.md
```

See also:

- [books/README.md](../books/README.md) — Rulebook source material structure
- [books/open-questions.md](../books/open-questions.md) — Tracked ambiguities
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) — Agent instructions (lean router to skills and docs)
