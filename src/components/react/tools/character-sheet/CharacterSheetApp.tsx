import { useEffect, useMemo } from "react";
import { Tabs } from "@/components/react/ui/Tabs";
import { useAllData } from "@/hooks/use-data";
import { character as characterAPI } from "@/lib/dtd/character";
import { CharacterManager } from "./CharacterManager";
import { calculateAllDerived, type DerivedStats, TAB_LABELS, type TabId } from "./constants";
import { SheetHeader } from "./SheetHeader";
import { createNewCharacter, loadCharacter, useCharSheetStore } from "./store";
import { CombatTab } from "./tabs/CombatTab";
import { FeaturesTab } from "./tabs/FeaturesTab";
import { IdentityTab } from "./tabs/IdentityTab";
import { PowersTab } from "./tabs/PowersTab";
import { StatsTab } from "./tabs/StatsTab";
import { XpTab } from "./tabs/XpTab";

// =========================================================================
// Root component
// =========================================================================

export function CharacterSheetApp() {
	const char = useCharSheetStore((s) => s.char);
	const activeTab = useCharSheetStore((s) => s.activeTab);
	const gameData = useCharSheetStore((s) => s.gameData);
	const saveStatus = useCharSheetStore((s) => s.saveStatus);
	const setActiveTab = useCharSheetStore((s) => s.setActiveTab);
	const setGameData = useCharSheetStore((s) => s.setGameData);
	const setCharList = useCharSheetStore((s) => s.setCharList);

	const { data, loading, error } = useAllData([
		"races.json",
		"exaltations.json",
		"alignments.json",
		"classes.json",
		"feats.json",
		"skills.json",
		"weapons.json",
		"backgrounds.json",
	]);

	// Derived stats — recomputed when char or gameData changes
	const derivedStats = useMemo<DerivedStats>(() => {
		if (!gameData) return calculateAllDerived(char, null, null);
		return calculateAllDerived(char, gameData.races, gameData.exaltations);
	}, [char, gameData]);

	// Sync loaded data into store
	useEffect(() => {
		if (data && !gameData) {
			setGameData(data as Record<string, any>);
		}
	}, [data, gameData, setGameData]);

	// Initialize character list from localStorage once gameData is ready
	useEffect(() => {
		if (!gameData) return;
		const list = characterAPI.list();
		if (list.length === 0) {
			createNewCharacter();
		} else {
			setCharList(list);
			const params = new URLSearchParams(window.location.search);
			const requestedId = params.get("id");
			const target = requestedId && list.find((c) => c.id === requestedId) ? requestedId : list[0].id;
			loadCharacter(target);
		}
	}, [gameData, setCharList]);

	if (loading) {
		return <div className="text-center py-xl text-text-muted">Loading game data…</div>;
	}

	if (error) {
		return <div className="text-center py-xl text-error">Failed to load data: {error}</div>;
	}

	const tab = activeTab;

	return (
		<div className="block p-md max-w-[1200px] mx-auto">
			<CharacterManager />
			<SheetHeader derivedStats={derivedStats} />
			<Tabs
				tabs={TAB_LABELS}
				activeId={tab}
				onTabChange={(id) => {
					setActiveTab(id as TabId);
				}}
			>
				{tab === "identity" && <IdentityTab derivedStats={derivedStats} />}
				{tab === "stats" && <StatsTab derivedStats={derivedStats} />}
				{tab === "combat" && <CombatTab />}
				{tab === "powers" && <PowersTab derivedStats={derivedStats} />}
				{tab === "features" && <FeaturesTab />}
				{tab === "xp" && <XpTab />}
			</Tabs>
			<div
				className={[
					"save-status fixed bottom-md right-md px-md py-xs rounded-sm text-xs font-semibold uppercase tracking-[0.5px] z-[200] transition-all duration-300",
					saveStatus === "saving"
						? "bg-accent/20 border border-accent text-accent"
						: saveStatus === "error"
							? "bg-error/20 border border-error text-error"
							: "bg-surface border border-border text-text-muted",
				]
					.filter(Boolean)
					.join(" ")}
			>
				{saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Save error" : "Saved"}
			</div>
		</div>
	);
}
