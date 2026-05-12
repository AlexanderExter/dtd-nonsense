# Product Vision

This document captures the project's strategic direction: what it is, who it's for, what it should become, and what it should never become. It is the output of Product Owner dialogue sessions and serves as the north star for all decision-making.

---

## Mission

DTD Nonsense is a web-based reference companion for Dungeons the Dragoning 7th Edition — transforming two messy amateur PDFs into a searchable, navigable, corrected rules site with interactive tools that lower the barrier to play for the entire D:TD community.

---

## Users & Context

**Primary audience:** The D:TD community — a niche tabletop RPG hobbyist community playing a game that blends Warhammer 40K aesthetics with D&D and World of Darkness mechanics.

**Usage context:** The site is a table companion. Players and Story Masters open it on a laptop, phone, or tablet during play sessions. It gets consulted for rule lookups, character management, and NPC prep — then set aside. It does not try to be the center of the action.

**Key use cases:**

- **Mid-session rule lookup** — a player searches for a ruling instead of flipping through a PDF
- **Character creation** — a new or returning player builds a character using the Builder without needing to understand the full system first
- **Session prep** — a Story Master builds NPCs, reviews encounter balance, or checks ship stats before a session
- **New player onboarding** — someone discovering D:TD can read the cleaned rules and understand what they need to play

**The "aha moment":** A player uses Astro's search to find a ruling in seconds and realizes they never need to hunt through the PDF again. Then they discover the tools already handle the tedious parts they expected to do manually.

---

## Design Principles

Ordered by priority. When principles conflict, higher-numbered principles yield to lower-numbered ones.

1. **Reference First** — When something could be a reference lookup or an interactive tool, default to reference. Tools support the reference, not the other way around.
2. **Table Companion, Not Table Center** — The site assists play but never demands attention. Fast lookups, low friction, zero onboarding required. As approachable as a hobby book on a shelf.
3. **Build on the Source** — The original PDFs remain available for reference, but this project is a creative derivative — corrected, reorganized, and enhanced for the web. Fidelity to the source is a starting point, not a constraint. This means rewording for clarity, restructuring for scannability, condensing redundancy, and adding cross-references — while never inventing game mechanics or altering the original tone and voice.
4. **Honor the Culture** — D:TD's satirical WH40K identity isn't decoration. Design, tone, and aesthetics reflect the game's irreverent spirit.
5. **Approachable Complexity** — D:TD is inherently complex. The site makes that complexity navigable without simplifying the game itself.
6. **Ship a Book, Not a Platform** — This is a finite product with a done state, not an evolving service. Every feature moves toward completion, not scope expansion.

---

## Scope Boundaries

### We Build

- Searchable, corrected rules reference (both books, 24 topic files)
- Character lifecycle tools (Sheet, Builder, NPC Generator)
- Gameplay utilities (Combat Tracker, Quick Reference)
- Ship subsystem tool (Ship Builder)
- Mobile-responsive static site with WH40K-themed visual identity
- Data validation pipeline ensuring correctness

### We Don't Build

- Virtual tabletop or real-time multiplayer features
- User accounts, cloud storage, or backend services
- Rules automation that replaces player/SM judgment
- Original game content or homebrew
- Anything that demands the user's attention or presence

---

## Success Criteria

- A new player can create a character using the Builder without reading the PDF
- Any rule can be found in under 10 seconds via search
- The site works on a phone at the gaming table without friction
- The D:TD community recognizes it as a useful resource
- The site keeps working with zero active maintenance (static hosting)

---

## Feature Priorities

### Current Focus

Road to Deployment: We are adding fine polish to all aspects of the app, but all the features and content are in place.

---

## Editorial Architecture

The project uses a single editorial direction: creative derivative.

- **`books/`** — Per-chapter source material in `.mdx`, annotated and corrected. Formatting fixes, structural improvements, and clarity edits are applied, but tone and voice are preserved. Serves as the authoritative source for game mechanics.
- **`cleaned-references/`** — Web-native reference documentation organized by topic. These are the **canonical reading experience** — restructured for scannability, condensed to eliminate redundancy, and enriched with cross-references and summaries. Heavy editorial treatment is expected and encouraged.

Both paths use MDX, enabling interactive React component embedding directly in rules content. The canonicity question is settled: this project builds something new from the original source, not a preservation effort. The [original PDFs are available online](https://static.wikitide.net/1d6chanwiki/f/fc/Dungeons_the_Dragoning.pdf) for anyone who wants the unmodified text.
