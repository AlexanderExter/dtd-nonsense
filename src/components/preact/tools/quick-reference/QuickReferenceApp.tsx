import { computed, signal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { AccordionSection } from "./AccordionSection";
import { ActionsSection } from "./ActionsSection";
import { CombatModifiersSection } from "./CombatModifiersSection";
import { ConditionsSection } from "./ConditionsSection";
import { FormulasSection } from "./FormulasSection";
import { MagicSchoolsSection } from "./MagicSchoolsSection";
import { QREF_DATA } from "./qref-data";
import { SchoolCardsSection } from "./SchoolCardsSection";
import { SearchBar } from "./SearchBar";
import { SidebarPanel } from "./SidebarPanel";
import { WeaponPropertiesSection } from "./WeaponPropertiesSection";

const SECTION_IDS = [
	"actions",
	"conditions",
	"modifiers",
	"magic",
	"swords",
	"gunkata",
	"properties",
	"formulas",
] as const;

const searchQuery = signal("");
const activeTypeFilters = signal<Set<string>>(new Set());
const activeSubtypeFilters = signal<Set<string>>(new Set());
const openSections = signal<Set<string>>(new Set());

const searchWords = computed(() => {
	const q = searchQuery.value.toLowerCase().trim();
	if (!q) return [] as string[];
	return q.split(/\s+/).filter(Boolean);
});

interface SectionDef {
	id: string;
	title: string;
	count: string;
	matchFn: (words: string[]) => boolean;
}

function matchesAny(words: string[], items: readonly { [key: string]: unknown }[], fields: string[]): boolean {
	return items.some((item) => {
		const text = fields
			.map((f) => String(item[f] ?? ""))
			.join(" ")
			.toLowerCase();
		return words.every((w) => text.includes(w));
	});
}

const sectionDefs: SectionDef[] = [
	{
		id: "actions",
		title: "Actions Reference",
		count: `${QREF_DATA.actions.length} actions`,
		matchFn: (words) => matchesAny(words, QREF_DATA.actions, ["name", "desc", "subtypes"]),
	},
	{
		id: "conditions",
		title: "Conditions",
		count: `${QREF_DATA.conditions.length} conditions`,
		matchFn: (words) => matchesAny(words, QREF_DATA.conditions, ["name", "effect", "duration"]),
	},
	{
		id: "modifiers",
		title: "Combat Modifiers",
		count: "",
		matchFn: (words) =>
			matchesAny(words, QREF_DATA.rangeBands, ["band", "range", "mod"]) ||
			matchesAny(words, QREF_DATA.meleeModifiers, ["situation", "mod"]) ||
			matchesAny(words, QREF_DATA.coverAP, ["cover", "ap"]),
	},
	{
		id: "magic",
		title: "Magic Schools",
		count: `${QREF_DATA.magicSchools.length} schools`,
		matchFn: (words) => matchesAny(words, QREF_DATA.magicSchools, ["school", "char", "theme"]),
	},
	{
		id: "swords",
		title: "Sword Schools",
		count: `${QREF_DATA.swordSchools.length} schools`,
		matchFn: (words) => matchesAny(words, QREF_DATA.swordSchools, ["school", "skill", "weapon", "action", "blurb"]),
	},
	{
		id: "gunkata",
		title: "Gun Kata",
		count: `${QREF_DATA.gunKata.length} schools`,
		matchFn: (words) => matchesAny(words, QREF_DATA.gunKata, ["school", "skill", "weapon", "action", "blurb"]),
	},
	{
		id: "properties",
		title: "Weapon Properties",
		count: `${QREF_DATA.weaponProperties.length} properties`,
		matchFn: (words) => matchesAny(words, QREF_DATA.weaponProperties, ["name", "desc"]),
	},
	{
		id: "formulas",
		title: "Formula Quick Reference",
		count: "",
		matchFn: (words) => matchesAny(words, QREF_DATA.formulas, ["metric", "formula"]),
	},
];

const filteredSections = computed(() => {
	const words = searchWords.value;
	if (words.length === 0) return new Set(SECTION_IDS);
	const visible = new Set<string>();
	for (const sec of sectionDefs) {
		// Title match
		const titleText = sec.title.toLowerCase();
		if (words.every((w) => titleText.includes(w))) {
			visible.add(sec.id);
			continue;
		}
		// Content match
		if (sec.matchFn(words)) {
			visible.add(sec.id);
		}
	}
	return visible;
});

// Auto-expand matching sections when searching, collapse when clearing
const autoExpandedSections = computed(() => {
	const words = searchWords.value;
	if (words.length === 0) return new Set<string>();
	return filteredSections.value;
});

function expandAll() {
	openSections.value = new Set(SECTION_IDS);
}

function collapseAll() {
	openSections.value = new Set<string>();
}

function toggleSection(id: string) {
	const next = new Set(openSections.value);
	if (next.has(id)) next.delete(id);
	else next.add(id);
	openSections.value = next;
}

function isSectionOpen(id: string): boolean {
	// When searching, matching sections are auto-expanded
	if (searchWords.value.length > 0) {
		return autoExpandedSections.value.has(id);
	}
	return openSections.value.has(id);
}

function isSectionHidden(id: string): boolean {
	if (searchWords.value.length === 0) return false;
	return !filteredSections.value.has(id);
}

export function QuickReferenceApp() {
	const searchInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		// Clear filters when search changes
		if (searchQuery.value) {
			activeTypeFilters.value = new Set();
			activeSubtypeFilters.value = new Set();
		}
	}, []);

	useEffect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if ((e.key === "/" || (e.ctrlKey && e.key === "k")) && document.activeElement !== searchInputRef.current) {
				e.preventDefault();
				searchInputRef.current?.focus();
				searchInputRef.current?.select();
			}
			if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
				searchQuery.value = "";
				collapseAll();
				searchInputRef.current?.blur();
			}
		}
		document.addEventListener("keydown", handleKeydown);
		return () => document.removeEventListener("keydown", handleKeydown);
	}, []);

	useEffect(() => {
		searchInputRef.current?.focus();
	}, []);

	const words = searchWords.value;

	return (
		<div class="dtd-tool qref-app">
			<header class="qref-header no-print">
				<h1>Quick Reference</h1>
				<SearchBar query={searchQuery} inputRef={searchInputRef} />
			</header>

			<div class="controls no-print">
				<button type="button" class="btn btn-ghost" onClick={expandAll}>
					Expand All
				</button>
				<button type="button" class="btn btn-ghost" onClick={collapseAll}>
					Collapse All
				</button>
			</div>

			<div class="qref-layout">
				<aside class="qref-sidebar">
					<SidebarPanel title="Target Numbers">
						<div class="table-wrap">
							<table class="qref-table">
								<thead>
									<tr>
										<th>TN</th>
										<th>Difficulty</th>
									</tr>
								</thead>
								<tbody>
									{QREF_DATA.tnTable.map((t) => (
										<tr key={t.tn}>
											<td>
												<strong>{t.tn}</strong>
											</td>
											<td>{t.diff}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p style="margin-top:var(--space-md);color:var(--text-muted);font-size:0.85rem">
							<strong>Raises:</strong> Every 5 above TN. <strong>Checks:</strong> Every 5 below TN.
						</p>
					</SidebarPanel>
					<SidebarPanel title="Hit Location">
						<div class="table-wrap">
							<table class="qref-table">
								<thead>
									<tr>
										<th>d10 Roll</th>
										<th>Location</th>
									</tr>
								</thead>
								<tbody>
									{QREF_DATA.hitLocations.map((h) => (
										<tr key={h.roll}>
											<td>
												<strong>{h.roll}</strong>
											</td>
											<td>{h.location}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</SidebarPanel>
				</aside>

				<main>
					<AccordionSection
						id="actions"
						title="Actions Reference"
						count={`${QREF_DATA.actions.length} actions`}
						isOpen={isSectionOpen("actions")}
						onToggle={() => toggleSection("actions")}
						isHidden={isSectionHidden("actions")}
					>
						<ActionsSection
							searchWords={words}
							typeFilters={activeTypeFilters}
							subtypeFilters={activeSubtypeFilters}
						/>
					</AccordionSection>

					<AccordionSection
						id="conditions"
						title="Conditions"
						count={`${QREF_DATA.conditions.length} conditions`}
						isOpen={isSectionOpen("conditions")}
						onToggle={() => toggleSection("conditions")}
						isHidden={isSectionHidden("conditions")}
					>
						<ConditionsSection searchWords={words} />
					</AccordionSection>

					<AccordionSection
						id="modifiers"
						title="Combat Modifiers"
						count=""
						isOpen={isSectionOpen("modifiers")}
						onToggle={() => toggleSection("modifiers")}
						isHidden={isSectionHidden("modifiers")}
					>
						<CombatModifiersSection searchWords={words} />
					</AccordionSection>

					<AccordionSection
						id="magic"
						title="Magic Schools"
						count={`${QREF_DATA.magicSchools.length} schools`}
						isOpen={isSectionOpen("magic")}
						onToggle={() => toggleSection("magic")}
						isHidden={isSectionHidden("magic")}
					>
						<MagicSchoolsSection searchWords={words} />
					</AccordionSection>

					<AccordionSection
						id="swords"
						title="Sword Schools"
						count={`${QREF_DATA.swordSchools.length} schools`}
						isOpen={isSectionOpen("swords")}
						onToggle={() => toggleSection("swords")}
						isHidden={isSectionHidden("swords")}
					>
						<SchoolCardsSection
							schools={QREF_DATA.swordSchools}
							searchWords={words}
							footerNote="Martial Adept Level = highest Sword School dots. Style Points per attack = Adept Level. Cost: 50 XP per Style Point."
						/>
					</AccordionSection>

					<AccordionSection
						id="gunkata"
						title="Gun Kata"
						count={`${QREF_DATA.gunKata.length} schools`}
						isOpen={isSectionOpen("gunkata")}
						onToggle={() => toggleSection("gunkata")}
						isHidden={isSectionHidden("gunkata")}
					>
						<SchoolCardsSection
							schools={QREF_DATA.gunKata}
							searchWords={words}
							footerNote="Gunslinger Level = highest Gun Kata dots. Trick Shot cost: 50 XP per Style Point."
						/>
					</AccordionSection>

					<AccordionSection
						id="properties"
						title="Weapon Properties"
						count={`${QREF_DATA.weaponProperties.length} properties`}
						isOpen={isSectionOpen("properties")}
						onToggle={() => toggleSection("properties")}
						isHidden={isSectionHidden("properties")}
					>
						<WeaponPropertiesSection searchWords={words} />
					</AccordionSection>

					<AccordionSection
						id="formulas"
						title="Formula Quick Reference"
						count=""
						isOpen={isSectionOpen("formulas")}
						onToggle={() => toggleSection("formulas")}
						isHidden={isSectionHidden("formulas")}
					>
						<FormulasSection searchWords={words} />
					</AccordionSection>
				</main>
			</div>

			<footer style="text-align: center; padding: var(--space-lg); color: var(--text-dim); font-size: 0.8rem">
				Data from <em>Dungeons the Dragoning 40,000: 7th Edition</em> and <em>For a Few Subtitles More</em>.
			</footer>
		</div>
	);
}
