import { useEffect } from "react";
import { Button } from "@/components/react/ui/Button";
import { Toast } from "@/components/react/ui/Toast";
import { useAllData } from "@/hooks/use-data";
import { createDefaultMeta } from "./constants";
import { Sidebar } from "./Sidebar";
import { StepAccordion } from "./StepAccordion";
import { createDefaultChar, useBuilderStore } from "./store";

// =========================================================================
// Root component
// =========================================================================

export function CharacterBuilderApp() {
	const gameData = useBuilderStore((s) => s.gameData);
	const setGameData = useBuilderStore((s) => s.setGameData);
	const setChar = useBuilderStore((s) => s.setChar);
	const setMeta = useBuilderStore((s) => s.setMeta);
	const setCurrentStep = useBuilderStore((s) => s.setCurrentStep);

	const { data, loading, error } = useAllData([
		"races.json",
		"exaltations.json",
		"skills.json",
		"classes.json",
		"feats.json",
		"backgrounds.json",
		"alignments.json",
		"equipment.json",
		"weapons.json",
	]);

	// Sync loaded data into store
	useEffect(() => {
		if (data && !gameData) {
			setGameData(data as Record<string, any>);
		}
	}, [data, gameData, setGameData]);

	if (loading) {
		return <div className="text-center text-text-muted p-xl">Loading game data…</div>;
	}

	if (error) {
		return <div className="text-center text-error p-xl">Failed to load data: {error}</div>;
	}

	const handleStartOver = () => {
		if (!confirm("Start over? All progress will be lost.")) return;
		setChar(createDefaultChar());
		setMeta(createDefaultMeta());
		setCurrentStep(1);
	};

	return (
		<div className="grid grid-cols-[280px_1fr] gap-lg max-w-[1440px] mx-auto p-md max-[900px]:grid-cols-1">
			<Sidebar />
			<main className="min-w-0">
				<div className="flex items-center justify-between mb-md">
					<h1>Character Builder</h1>
					<Button variant="danger" size="sm" onClick={handleStartOver}>
						Start Over
					</Button>
				</div>
				<StepAccordion />
			</main>
			<Toast />
		</div>
	);
}
