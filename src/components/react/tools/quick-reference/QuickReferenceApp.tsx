import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/react/ui/Button";
import { Toast } from "@/components/react/ui/Toast";
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
import { useQuickRefStore } from "./store";
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

interface SectionDef {
	count: string;
	id: string;
	matchFn: (words: string[]) => boolean;
	title: string;
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

export function QuickReferenceApp() {
	const searchInputRef = useRef<HTMLInputElement | null>(null);

	const {
		searchQuery,
		activeTypeFilters,
		activeSubtypeFilters,
		openSections,
		setSearchQuery,
		toggleSection,
		expandAll,
		collapseAll,
	} = useQuickRefStore();

	const searchWords = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return [] as string[];
		return q.split(/\s+/).filter(Boolean);
	}, [searchQuery]);

	const filteredSections = useMemo(() => {
		if (searchWords.length === 0) return new Set(SECTION_IDS);
		const visible = new Set<string>();
		for (const sec of sectionDefs) {
			const titleText = sec.title.toLowerCase();
			if (searchWords.every((w) => titleText.includes(w))) {
				visible.add(sec.id);
				continue;
			}
			if (sec.matchFn(searchWords)) {
				visible.add(sec.id);
			}
		}
		return visible;
	}, [searchWords]);

	// Auto-expand matching sections when searching, collapse when clearing
	const autoExpandedSections = useMemo(() => {
		if (searchWords.length === 0) return new Set<string>();
		return filteredSections;
	}, [searchWords, filteredSections]);

	function isSectionOpen(id: string): boolean {
		if (searchWords.length > 0) {
			return autoExpandedSections.has(id);
		}
		return openSections.has(id);
	}

	function isSectionHidden(id: string): boolean {
		if (searchWords.length === 0) return false;
		return !filteredSections.has(id);
	}

	useEffect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if ((e.key === "/" || (e.ctrlKey && e.key === "k")) && document.activeElement !== searchInputRef.current) {
				e.preventDefault();
				searchInputRef.current?.focus();
				searchInputRef.current?.select();
			}
			if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
				setSearchQuery("");
				collapseAll();
				searchInputRef.current?.blur();
			}
		}
		document.addEventListener("keydown", handleKeydown);
		return () => document.removeEventListener("keydown", handleKeydown);
	}, [setSearchQuery, collapseAll]);

	useEffect(() => {
		searchInputRef.current?.focus();
	}, []);

	const words = searchWords;

	return (
		<div className="mx-auto max-w-[1200px] p-md max-[600px]:p-sm">
			<header className="no-print sticky top-0 z-[100] mb-lg border-border border-b bg-bg py-md">
				<h1 className="mb-md text-center text-2xl text-accent">Quick Reference</h1>
				<SearchBar inputRef={searchInputRef} query={searchQuery} setQuery={setSearchQuery} />
			</header>

			<div className="no-print mb-sm flex justify-end gap-sm">
				<Button onClick={() => expandAll([...SECTION_IDS])} variant="ghost">
					Expand All
				</Button>
				<Button onClick={collapseAll} variant="ghost">
					Collapse All
				</Button>
			</div>

			<div className="grid grid-cols-[240px_1fr] items-start gap-lg max-[820px]:grid-cols-1">
				<aside className="sticky top-[110px] max-h-[calc(100vh-130px)] overflow-y-auto max-[820px]:static max-[820px]:grid max-[820px]:max-h-none max-[600px]:grid-cols-1 max-[820px]:grid-cols-2 max-[820px]:gap-md">
					<SidebarPanel title="Target Numbers">
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-[0.82rem]">
								<thead>
									<tr>
										<th className="sticky top-0 border-border border-b bg-surface px-[6px] py-[4px] text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px]">
											TN
										</th>
										<th className="sticky top-0 border-border border-b bg-surface px-[6px] py-[4px] text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px]">
											Difficulty
										</th>
									</tr>
								</thead>
								<tbody>
									{QREF_DATA.tnTable.map((t) => (
										<tr className="even:bg-stripe hover:bg-surface" key={t.tn}>
											<td className="border-border border-b px-[6px] py-[4px] text-left">
												<strong>{t.tn}</strong>
											</td>
											<td className="border-border border-b px-[6px] py-[4px] text-left">
												{t.diff}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p className="mt-md text-[0.85rem] text-text-muted">
							<strong>Raises:</strong> Every 5 above TN. <strong>Checks:</strong> Every 5 below TN.
						</p>
					</SidebarPanel>
					<SidebarPanel title="Hit Location">
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-[0.82rem]">
								<thead>
									<tr>
										<th className="sticky top-0 border-border border-b bg-surface px-[6px] py-[4px] text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px]">
											d10 Roll
										</th>
										<th className="sticky top-0 border-border border-b bg-surface px-[6px] py-[4px] text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px]">
											Location
										</th>
									</tr>
								</thead>
								<tbody>
									{QREF_DATA.hitLocations.map((h) => (
										<tr className="even:bg-stripe hover:bg-surface" key={h.roll}>
											<td className="border-border border-b px-[6px] py-[4px] text-left">
												<strong>{h.roll}</strong>
											</td>
											<td className="border-border border-b px-[6px] py-[4px] text-left">
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
						count={`${QREF_DATA.actions.length} actions`}
						id="actions"
						isHidden={isSectionHidden("actions")}
						isOpen={isSectionOpen("actions")}
						onToggle={() => toggleSection("actions")}
						title="Actions Reference"
					>
						<ActionsSection
							onToggleSubtype={useQuickRefStore.getState().toggleSubtypeFilter}
							onToggleType={useQuickRefStore.getState().toggleTypeFilter}
							searchWords={words}
							subtypeFilters={activeSubtypeFilters}
							typeFilters={activeTypeFilters}
						/>
					</AccordionSection>

					<AccordionSection
						count={`${QREF_DATA.conditions.length} conditions`}
						id="conditions"
						isHidden={isSectionHidden("conditions")}
						isOpen={isSectionOpen("conditions")}
						onToggle={() => toggleSection("conditions")}
						title="Conditions"
					>
						<ConditionsSection searchWords={words} />
					</AccordionSection>

					<AccordionSection
						count=""
						id="modifiers"
						isHidden={isSectionHidden("modifiers")}
						isOpen={isSectionOpen("modifiers")}
						onToggle={() => toggleSection("modifiers")}
						title="Combat Modifiers"
					>
						<CombatModifiersSection searchWords={words} />
					</AccordionSection>

					<AccordionSection
						count={`${QREF_DATA.magicSchools.length} schools`}
						id="magic"
						isHidden={isSectionHidden("magic")}
						isOpen={isSectionOpen("magic")}
						onToggle={() => toggleSection("magic")}
						title="Magic Schools"
					>
						<MagicSchoolsSection searchWords={words} />
					</AccordionSection>

					<AccordionSection
						count={`${QREF_DATA.swordSchools.length} schools`}
						id="swords"
						isHidden={isSectionHidden("swords")}
						isOpen={isSectionOpen("swords")}
						onToggle={() => toggleSection("swords")}
						title="Sword Schools"
					>
						<SchoolCardsSection
							footer={
								<p className="m-0">
									<strong>Martial Adept Level</strong> = highest Sword School dots purchased. The max
									Style Points on a single attack = your Martial Adept Level. Each technique costs{" "}
									<strong>50 XP per Style Point used</strong> (not the net sum). Example: a 3-SP
									technique costs 150 XP.
								</p>
							}
							schools={QREF_DATA.swordSchools}
							searchWords={words}
						/>
					</AccordionSection>

					<AccordionSection
						count={`${QREF_DATA.gunKata.length} schools`}
						id="gunkata"
						isHidden={isSectionHidden("gunkata")}
						isOpen={isSectionOpen("gunkata")}
						onToggle={() => toggleSection("gunkata")}
						title="Gun Kata"
					>
						<SchoolCardsSection
							footer={
								<p className="m-0">
									<strong>Gunslinger Level</strong> = highest Gun Kata dots purchased. The max Style
									Points on a single Trick Shot = your Gunslinger Level. Each technique costs{" "}
									<strong>50 XP per Style Point used</strong> (not the net sum). Example: a 2-SP trick
									shot costs 100 XP.
								</p>
							}
							schools={QREF_DATA.gunKata}
							searchWords={words}
						/>
					</AccordionSection>

					<AccordionSection
						count={`${QREF_DATA.weaponProperties.length} properties`}
						id="properties"
						isHidden={isSectionHidden("properties")}
						isOpen={isSectionOpen("properties")}
						onToggle={() => toggleSection("properties")}
						title="Weapon Properties"
					>
						<WeaponPropertiesSection searchWords={words} />
					</AccordionSection>

					<AccordionSection
						count=""
						id="formulas"
						isHidden={isSectionHidden("formulas")}
						isOpen={isSectionOpen("formulas")}
						onToggle={() => toggleSection("formulas")}
						title="Formula Quick Reference"
					>
						<FormulasSection searchWords={words} />
					</AccordionSection>
				</main>
			</div>

			<footer className="p-lg text-center text-[0.8rem] text-text-dim">
				Data from <em>Dungeons the Dragoning 40,000: 7th Edition</em> and <em>For a Few Subtitles More</em>.
			</footer>
			<Toast />
		</div>
	);
}
