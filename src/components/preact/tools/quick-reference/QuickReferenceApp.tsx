import { computed, signal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { Button } from "@/components/preact/ui";
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
		<div class="max-w-[1200px] mx-auto p-md max-[600px]:p-sm">
			<header class="sticky top-0 z-[100] bg-bg py-md border-b border-border mb-lg no-print">
				<h1 class="text-center text-accent text-2xl mb-md">Quick Reference</h1>
				<SearchBar query={searchQuery} inputRef={searchInputRef} />
			</header>

			<div class="flex gap-sm justify-end mb-sm no-print">
				<Button variant="ghost" onClick={expandAll}>
					Expand All
				</Button>
				<Button variant="ghost" onClick={collapseAll}>
					Collapse All
				</Button>
			</div>

			<div class="grid grid-cols-[240px_1fr] gap-lg items-start max-[820px]:grid-cols-1">
				<aside class="sticky top-[110px] max-h-[calc(100vh-130px)] overflow-y-auto max-[820px]:static max-[820px]:max-h-none max-[820px]:grid max-[820px]:grid-cols-2 max-[820px]:gap-md max-[600px]:grid-cols-1">
					<SidebarPanel title="Target Numbers">
						<div class="overflow-x-auto">
							<table class="w-full border-collapse text-[0.82rem]">
								<thead>
									<tr>
										<th class="px-[6px] py-[4px] text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0">
											TN
										</th>
										<th class="px-[6px] py-[4px] text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0">
											Difficulty
										</th>
									</tr>
								</thead>
								<tbody>
									{QREF_DATA.tnTable.map((t) => (
										<tr key={t.tn} class="even:bg-stripe hover:bg-surface">
											<td class="px-[6px] py-[4px] text-left border-b border-border">
												<strong>{t.tn}</strong>
											</td>
											<td class="px-[6px] py-[4px] text-left border-b border-border">{t.diff}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p class="mt-md text-text-muted text-[0.85rem]">
							<strong>Raises:</strong> Every 5 above TN. <strong>Checks:</strong> Every 5 below TN.
						</p>
					</SidebarPanel>
					<SidebarPanel title="Hit Location">
						<div class="overflow-x-auto">
							<table class="w-full border-collapse text-[0.82rem]">
								<thead>
									<tr>
										<th class="px-[6px] py-[4px] text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0">
											d10 Roll
										</th>
										<th class="px-[6px] py-[4px] text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0">
											Location
										</th>
									</tr>
								</thead>
								<tbody>
									{QREF_DATA.hitLocations.map((h) => (
										<tr key={h.roll} class="even:bg-stripe hover:bg-surface">
											<td class="px-[6px] py-[4px] text-left border-b border-border">
												<strong>{h.roll}</strong>
											</td>
											<td class="px-[6px] py-[4px] text-left border-b border-border">
												{h.location}
											</td>
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
							footer={
								<p class="m-0">
									<strong>Martial Adept Level</strong> = highest Sword School dots purchased. The max
									Style Points on a single attack = your Martial Adept Level. Each technique costs{" "}
									<strong>50 XP per Style Point used</strong> (not the net sum). Example: a 3-SP
									technique costs 150 XP.
								</p>
							}
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
							footer={
								<p class="m-0">
									<strong>Gunslinger Level</strong> = highest Gun Kata dots purchased. The max Style
									Points on a single Trick Shot = your Gunslinger Level. Each technique costs{" "}
									<strong>50 XP per Style Point used</strong> (not the net sum). Example: a 2-SP trick
									shot costs 100 XP.
								</p>
							}
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

			<footer class="text-center p-lg text-text-dim text-[0.8rem]">
				Data from <em>Dungeons the Dragoning 40,000: 7th Edition</em> and <em>For a Few Subtitles More</em>.
			</footer>
		</div>
	);
}
