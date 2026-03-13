# Open Questions

Track ambiguities, contradictions, and unresolved issues discovered during editing.

## Format

Each entry should include:

- **File:** Source file where issue was found
- **Location:** Section or line reference
- **Issue:** Description of the ambiguity or contradiction
- **Interpretations:** Possible readings
- **Status:** Open / Resolved / Closed

---

## Entries

### Entry 1

- **File:** 06-Classes.mdx
- **Location:** Class Track Diagram (Druid Track)
- **Issue:** The source listed "Patriarch" as the Level 5 Druid track class, but the actual class definition is "Grand Hierophant"
- **Interpretations:** May be a rename during development, or two different versions merged
- **Status:** Resolved — Used "Grand Hierophant" as it had the full definition. Applied in 06-Classes.mdx.

### Entry 2

- **File:** 06-Classes.mdx
- **Location:** Class list in introduction
- **Issue:** Several classes mentioned in the introduction don't have definitions: Armsman, Veteran
- **Interpretations:** May be cut content, or defined in a different source/supplement
- **Status:** Resolved — Classes exist in other material; placeholdered in 06-Classes.mdx.

### Entry 3

- **File:** 06-Classes.mdx
- **Location:** Multiple class entries
- **Issue:** Inconsistent optional feat markers — source used both `*` and `_` interchangeably
- **Interpretations:** PDF extraction artifact or inconsistent formatting in source
- **Status:** Resolved — Standardized to use dedicated "Type" column with "Optional" label in table format.

## Contradictions

### Entry 4

- **File:** 14-Combat.mdx, 07-Feats.mdx, 10-Equipment.mdx
- **Location:** Aura/Armor references throughout
- **Issue:** Aura blocks magic damage, Armor blocks physical — but multiple feats used terms interchangeably.
- **Interpretations:** (a) Single combined value; (b) Two separate values for each damage type
- **Status:** Resolved — Each term is context-defined (Aura = magic, Armor = physical). Explicit note added in 14-Combat.mdx.

### Entry 5

- **File:** 14-Combat.mdx, 07-Feats.mdx
- **Location:** Dodge mechanics
- **Issue:** Dodge defined as Dexterity + Acrobatics. Feat "Combat Sense" says "Use Wisdom for Dodge" — unclear if this replaces Dexterity, Acrobatics, or both.
- **Interpretations:** (a) Wisdom replaces Dexterity only; (b) Wisdom replaces both; (c) Add Wisdom as bonus
- **Status:** Resolved — (a) Wisdom replaces Dexterity only. Combat Sense description updated in 07-Feats.mdx to state "Wisdom replaces Dexterity for Dodge Tests."

### Entry 6

- **File:** 11-Magic.mdx, 06-Classes.mdx, 07-Feats.mdx
- **Location:** Spell Focus/Specialization
- **Issue:** Magic.mdx references both "Spell Focus" and "Spell Specialization." Classes require "Weapon Specialization OR Spell Specialization." Feats file only defined "Spell Focus" — no "Spell Specialization."
- **Interpretations:** (a) Same feat, inconsistent naming; (b) Two different feats, one undefined
- **Status:** Resolved — (b) Two distinct feats. Spell Specialization definition added to 07-Feats.mdx.

### Entry 7

- **File:** 05-Exaltations.mdx, 14-Combat.mdx, 07-Feats.mdx
- **Location:** Resource spending vs Hero Points
- **Issue:** Exaltations have Resource Stats that can be spent. Hero Points are separate narrative currency. Some feats say "Spend Resource or gain Fatigue" while others require specifically Hero Points.
- **Interpretations:** (a) Distinct pools with specific uses; (b) Interchangeable in some contexts
- **Status:** Resolved — (a) Distinct pools with specific uses. The two systems are clearly separated in 05-Exaltations.mdx and 14-Combat.mdx.

### Entry 8

- **File:** 10-Equipment.mdx, 07-Feats.mdx, 06-Classes.mdx
- **Location:** Weapon Proficiency
- **Issue:** Many classes grant "Weapon Proficiency (Any)" as optional feat. Unclear if this means one proficiency category of player's choice, or all proficiency categories.
- **Interpretations:** (a) One category chosen at time of gain; (b) All categories
- **Status:** Resolved — (a) One category chosen at time of gain. The feat's Choices list in 07-Feats.mdx implies selection from: Basic, Melee 1, Melee 2, Melee 3, Ranged 1, Ranged 2, Thrown.

### Entry 9

- **File:** 14-Combat.mdx, 07-Feats.mdx, 10-Equipment.mdx
- **Location:** Full Auto/Burst mechanics
- **Issue:** Full Auto adds +1k0 per raise, capped by RoF. "Storm" weapon property says +2k0 per raise. Unclear if Storm replaces base rule or stacks (+3k0 per raise).
- **Interpretations:** (a) Storm replaces (+2k0); (b) Storm stacks (+3k0)
- **Status:** Resolved — (a) Storm replaces, not additive. Explicit non-stacking note added in 14-Combat.mdx.

### Entry 10

- **File:** 19-Antagonists.mdx
- **Location:** Full stat blocks vs Minion rules
- **Issue:** File contains detailed NPC stat blocks AND abstract Minion Squad rules. No guidance on when to use which system.
- **Interpretations:** (a) SM discretion; (b) Minions for mooks, full stats for named NPCs
- **Status:** Resolved — (b) Minions for mooks, full stats for named NPCs. Clarification note added in 22-SM-Reference.mdx.

---

## Errors

### Entry 11

- **File:** 06-Classes.mdx, 07-Feats.mdx
- **Location:** Various class entries (Witch-Sniper L5, Master Sorcerer L5, Bishop L5)
- **Issue:** References feats not defined in Feats file: Touch Spell Specialization, Archmage Tradition, Spell Mastery, Greater Spell Penetration, Purge the Unclean
- **Interpretations:** (a) Defined in supplement not extracted; (b) Renamed feats; (c) Cut content
- **Status:** Resolved — Feat definitions extracted from source and added to 07-Feats.mdx.

### Entry 12

- **File:** 10-Equipment.mdx
- **Location:** Weapon creation mod table
- **Issue:** Table uses "OLPMBSE" column codes but legend only partially explained them.
- **Interpretations:** Likely weapon category codes — needs full legend
- **Status:** Resolved — Compatibility code legends added for both Melee Mods and Ranged Mods sections.

### Entry 13

- **File:** 17-Vehicles.mdx
- **Location:** Reactor section
- **Issue:** "Cost" column showed "-" for all reactor entries. Missing cost data.
- **Interpretations:** (a) Reactors don't have separate cost; (b) Data missing from source
- **Status:** Resolved — Reactor costs found in Book 2 source and added. XL Engine Rating 5 slot count also corrected.

### Entry 14

- **File:** 03-Characteristics-Skills.mdx, 06-Classes.mdx, 07-Feats.mdx, and others
- **Location:** Throughout
- **Issue:** Inconsistent skill names: "Persuade" vs "Persuasion", "Performer" vs "Perform", "Ballistic" vs "Ballistics"
- **Interpretations:** Standardize to: Persuasion, Performer, Ballistics (per 03-Characteristics-Skills.mdx canonical definitions)
- **Status:** Resolved — Standardized across all processed-sources files including 04-Races.mdx.

### Entry 15

- **File:** 17-Vehicles.mdx
- **Location:** Cyborg T-Rex sample stat block
- **Issue:** Static Defense values were listed as "0 / 8(9) / 16(18) / 24(26)" which didn't match the SD formula.
- **Interpretations:** (a) Calculation error; (b) Additional modifiers not shown
- **Status:** Resolved — SD values recalculated and corrected in 17-Vehicles.mdx to match `SD = 10 + Maneuver - (2 × Size) + (Speed × Momentum Tier)`.

---

## Gray Areas

### Entry 16

- **File:** (None — system-wide gap)
- **Location:** N/A
- **Issue:** No universal stacking rules defined for: multiple armor sources, multiple damage bonuses, multiple penalties to same roll.
- **Interpretations:** (a) Nothing stacks unless stated; (b) Different sources stack, same source doesn't
- **Status:** Resolved — No general rule exists in source material. Per-instance adjudication. Magic effects explicitly don't stack (11-Magic.mdx). Not editorialized beyond source.

### Entry 17

- **File:** 14-Combat.mdx
- **Location:** Action economy sections
- **Issue:** How many Free Actions per turn? How many Reaction Actions per round?
- **Interpretations:** (a) Unlimited free actions; (b) One of each type; (c) SM discretion
- **Status:** Resolved — One Reaction per round (rules-stated). Free Actions at SM discretion (clarification note in 22-SM-Reference.mdx suggests 2-3 without question).

### Entry 18

- **File:** 11-Magic.mdx
- **Location:** Focus Power tests
- **Issue:** Casting uses "Focus Power" test. Which characteristic? Arcana + what?
- **Interpretations:** (a) Arcana + Willpower; (b) Arcana + school-specific stat; (c) Defined per spell
- **Status:** Resolved — (c) Defined per spell. Each magic school has a default characteristic listed in 11-Magic.mdx.

### Entry 19

- **File:** 05-Exaltations.mdx
- **Location:** Resource stat entries
- **Issue:** Resource stats "refresh" but timing inconsistent across exaltations.
- **Interpretations:** Varies by exaltation but needs explicit statement for each
- **Status:** Resolved — Each exaltation section in 05-Exaltations.mdx defines its own refresh timing.

### Entry 20

- **File:** 17-Vehicles.mdx, 18-Ships.mdx, 14-Combat.mdx
- **Location:** Damage systems
- **Issue:** Personal, Vehicle, and Ship weapon scales use different formats. No conversion factor between scales defined.
- **Interpretations:** (a) Scales don't interact; (b) Ratios exist
- **Status:** Resolved — (a) Scales don't interact directly. Clarification note in 22-SM-Reference.mdx.

### Entry 21

- **File:** 06-Classes.mdx, 07-Feats.mdx
- **Location:** Class progression tables
- **Issue:** If you already have a mandatory feat from another source, do you skip it, get it again, or get an alternative?
- **Interpretations:** (a) Skip, no benefit; (b) Choose replacement; (c) Cannot take class
- **Status:** Resolved — (b) Choose replacement. Clarification note added in 06-Classes.mdx.

### Entry 22

- **File:** 14-Combat.mdx
- **Location:** Combat sections
- **Issue:** Combat flow procedure unclear: What triggers Reaction Actions? When do conditions apply/end? How does simultaneous damage resolve?
- **Interpretations:** Needs procedural combat round outline
- **Status:** Resolved — Each game event is discrete and sequential. SM determines order. No truly simultaneous actions. Clarification note in 22-SM-Reference.mdx.

---

## Editorial Pass Findings (February 2026)

### Entry 36

- **File:** 16-Conditions.mdx
- **Location:** Helpless condition
- **Issue:** Previous version referenced "Coup de Grace" — a term not in D:TD source material. The actual Helpless mechanic is: auto-hit, roll damage twice and add results.
- **Status:** Resolved — "Coup de Grace" removed. Helpless description updated to match extracted source.

### Entry 37

- **File:** 05-Exaltations.mdx
- **Location:** Resource Point spending list
- **Issue:** Book 1 says "Recover from being Dazed" but Book 2 says "Recover from being Dazzled." The Shock Table defines "Dazed" as a compound of Dazzled + no Concentration actions — not a standalone condition.
- **Status:** Resolved — Changed to "Dazzled" per Book 2 errata.

### Entry 38

- **File:** 02-Char-Creation.mdx
- **Location:** Step 9 example (Traya's HP)
- **Issue:** HP was listed as 6 but should be 12 per formula `(Con × 2) + (Wil × 2)` with Con 4, Wil 2.
- **Status:** Resolved — HP corrected to 12.

### Entry 39

- **File:** 19-Antagonists.mdx
- **Location:** NPC stat blocks throughout
- **Issue:** NPC stat blocks consistently use HP = Con + Wil (without ×2). Book 2 states "Exalts, by virtue of their doubled hit points" — suggesting ×2 may be Exalt-only.
- **Interpretations:** (a) ×2 is Exalt-only; NPC blocks correct as-is; (b) NPC blocks have errors; (c) Simplified values for SM convenience
- **Status:** Resolved — (c) Simplified values for SM convenience. NPC blocks use a simplified HP calculation for ease of reference, while player characters and Exalts use the full formula with doubling. Clarification note added in 19-Antagonists.mdx.

### Entry 40

- **File:** 12-Sword-Schools.mdx, 13-Gun-Kata.mdx
- **Location:** All technique tables (Effect column)
- **Issue:** Effect column cells contain 200-300+ character descriptions, creating word-wall rows that render poorly in narrow viewports.
- **Interpretations:** (a) Acceptable as-is; (b) Restructure with short summaries + detailed prose below
- **Status:** Resolved — (a) Acceptable as-is. This is primarily a book and not meant to be read in narrow view. No change made.

### Entry 41

- **File:** 14-Combat.mdx
- **Location:** HP formula prose description
- **Issue:** Source text said "Constitution and Willpower" without mentioning doubling, but the formula and character sheet both show ×2.
- **Status:** Resolved — Prose updated to explicitly include "double his Constitution plus double his Willpower."

---

## Editorial Pass Findings (Phase 1-6)

### Entry 42

- **File:** 02-character-creation.mdx
- **Location:** Step Nine character example (Traya), ~L271
- **Issue:** Entry 38 resolved HP from 6 to 12 assuming Con 4, Wil 2. However, the character sheet shows Con 3 and Wil 3 — not Con 4 / Wil 2 as assumed. The narrative said "increasing it to 4" (a typo). Full reconstruction: the character sheet values (Con 3, Wil 3) produce HP = (3+3) × 2 = 12, matching both the sheet's HP line and the narrative's inline calculation. The "increasing it to 4" is the sole error; no stats or HP need changing.
- **Resolution:** Corrected narrative from "increasing it to 4" to "increasing it to 3." Added EDITOR comment documenting this and other minor arithmetic inconsistencies in the example (Social/Mental priority swap, Size 5 vs Tiefling racial 4). HP 12 confirmed correct.
- **Status:** Resolved

### Entry 43

- **File:** book-2-for-a-few-subtitles-more/18-appendix-f-vehicles.mdx
- **Location:** Appendix F (Vehicles), Size section
- **Issue:** Text said "Use the following formula" for Vehicle Static Defense but no formula followed — likely a PDF extraction loss or layout artifact.
- **Status:** Resolved — Formula `Vehicle SD = 10 + Maneuver − (2 × Size) + (Speed × Momentum Tier)` added, matching the Quick Reference and cleaned-references.

### Entry 44

- **File:** book-1-dungeons-the-dragoning/ (various chapters)
- **Location:** Various appendix cross-references
- **Issue:** Six references in Book 1 point to appendix content described as planned but never published: "Astropaths" (wanted Appendix E but was F), "Ships" (Appendix G — no such appendix exists in either book), "Advanced Maneuvers" (Appendix G — same), "Drugs" (Appendix G — same), "Hacking" (Appendix H), "Madness" (Appendix I — became Appendix C which covers Insanity, so partially exists under different scope).
- **Status:** Resolved — All six annotated with `<!-- EDITOR: -->` comments identifying the planned-but-unpublished status. No content invented.

---

## Go-Live Content Alignment (February 2026)

### Entry 45

- **File:** book-1-dungeons-the-dragoning/11-alignment.mdx, book-2-for-a-few-subtitles-more/10-alignment.mdx
- **Location:** Gray Council deity entries (Acererak / Acerath)
- **Issue:** Book 1 consistently uses "Acererak" (the D&D lich name). Book 2 consistently uses "Acerath." Both spellings trace to the original PDFs — this is a cross-book authorial discrepancy, not an extraction error.
- **Interpretations:** (a) Use "Acererak" (Book 1 / Tier 1 priority); (b) Use "Acerath" (Book 2 spelling)
- **Status:** Resolved — (a) Standardized to "Acererak" per Tier 1 source priority. Book 2 occurrences updated with `<!-- EDITOR: -->` annotation noting original spelling was "Acerath."

---

## Pipeline Linter — Terminology Rules Under Review

### Entry 46

- **File:** `scripts/lint.ts` (rule), flagged in `cleaned-references/05-Exaltations.mdx`, `07-Feats.mdx`, `books/book-1-dungeons-the-dragoning/05-exaltation.mdx`
- **Location:** Terminology rule: `\bAction Points?\b` → "Hero Points"
- **Issue:** The linter flags all "Action Points" as wrong, suggesting "Hero Points." However, **Action Points are the canonical Paragon resource stat** — a distinct game mechanic from Hero Points. The original book (05-exaltation.mdx L382–389, L406) consistently uses "Action Points" for the Paragon's resource pool. Feats also reference them (07-Feats.mdx: "Recover 1 spent action point", "+2 Action Points at start of each session").
- **Interpretations:**
  - (a) Remove the `Action Points → Hero Points` rule entirely — Action Points is a valid game term for the Paragon exaltation
  - (b) Refine the rule to only flag "Action Points" when not in a Paragon/Exaltation context (complex, likely not worth the effort)
  - (c) Keep the rule but add an allowlist/ignore comment mechanism for known valid usages
- **Status:** Resolved — (a) Rule removed from `scripts/lint.ts`. Action Points is a valid Paragon resource stat, distinct from Hero Points.

### Entry 47

- **File:** `scripts/lint.ts` (rule), flagged in `cleaned-references/05-Exaltations.mdx`, `books/book-1-dungeons-the-dragoning/05-exaltation.mdx`
- **Location:** Terminology rule: `\bPerform\b(?!er|ance)` → "Performer"
- **Issue:** The linter flags the English verb "Perform" as a misspelling of the skill name "Performer." All 5 flagged instances in `05-Exaltations.mdx` are the verb form: "Perform a special ritual" (L197), "Perform a 6-hour ritual" (L399), "perform minor magical tricks" (L144), etc. The regex negative lookahead `(?!er|ance)` excludes "Performer" and "Performance" but not the bare verb.
- **Interpretations:**
  - (a) Remove the `Perform → Performer` rule — the verb is far more common than the skill name typo
  - (b) Refine to only flag "Perform" when preceded by skill-context words (e.g., after characteristic names, in skill lists, in `+Xk0` contexts)
  - (c) Add a word-boundary check for common verb patterns: skip when followed by "a ", "the ", "this ", "their ", or preceded by "may ", "to ", "can ", "must "
- **Status:** Resolved — (a) Rule removed from `scripts/lint.ts`. The bare verb "Perform" is far more common than the skill-name typo; removing avoids false positives.

---

## Tool Bugs

### Entry 48

- **File:** `tools/character-sheet/sheet.js` line 142
- **Location:** Weapon loading in `_loadWeapons()` method
- **Issue:** Code accesses `this.data.weapons.weapons?.exotic` but `weapons.json` has no top-level `exotic` array — exotic weapons have `"category": "exotic"` within the `melee` array. The `|| []` fallback silently hides the bug, meaning exotic weapons are never displayed on the character sheet.
- **Fix:** Replace `.exotic` access with a filter: `data.weapons.weapons.melee.filter(w => w.category === 'exotic')`, or merge all weapon arrays and filter by category.
- **Status:** Resolved — Addressed during Phase 7. The character builder now correctly looks up exotic weapon proficiency by weapon name rather than by a fixed "Exotic" skill.
