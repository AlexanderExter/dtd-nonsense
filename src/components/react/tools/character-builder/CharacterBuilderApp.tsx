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
			setGameData(data);
		}
	}, [data, gameData, setGameData]);

	if (loading) {
		return <div className="p-xl text-center text-text-muted">Loading game data…</div>;
	}

	if (error) {
		return <div className="p-xl text-center text-error">Failed to load data: {error}</div>;
	}

	const handleStartOver = () => {
		if (!confirm("Start over? All progress will be lost.")) return;
		setChar(createDefaultChar());
		setMeta(createDefaultMeta());
		setCurrentStep(1);
	};

	return (
		<div className="mx-auto grid max-w-[1440px] grid-cols-[280px_1fr] gap-lg p-md max-tool-lg:grid-cols-1">
			<Sidebar />
			<main className="min-w-0">
				<div className="mb-md flex items-center justify-between">
					<h1>Character Builder</h1>
					<Button onClick={handleStartOver} size="sm" variant="danger">
						Start Over
					</Button>
				</div>
				<StepAccordion />
			</main>
			<Toast />
		</div>
	);
}
