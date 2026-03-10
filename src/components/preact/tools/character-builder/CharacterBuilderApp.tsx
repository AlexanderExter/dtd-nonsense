import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { useAllData } from "@/hooks/use-data";
import { character } from "@/lib/dtd/character";
import type { CharacterData } from "@/lib/dtd/types";
import { BASE_CHAR_DOT, type BuilderMeta, createDefaultMeta } from "./constants";
import { Sidebar } from "./Sidebar";
import { StepAccordion } from "./StepAccordion";

// =========================================================================
// Module-level signals
// =========================================================================

function createDefaultChar(): CharacterData {
	const ch = character.createDefault();
	for (const key of Object.keys(ch.characteristics) as Array<keyof typeof ch.characteristics>) {
		ch.characteristics[key] = BASE_CHAR_DOT;
	}
	return ch;
}

export const charSignal = signal<CharacterData>(createDefaultChar());
export const metaSignal = signal<BuilderMeta>(createDefaultMeta());
export const gameData = signal<Record<string, any> | null>(null);
export const currentStep = signal(1);

// =========================================================================
// Mutation helpers
// =========================================================================

export function updateChar(fn: (c: CharacterData) => void): void {
	const next = JSON.parse(JSON.stringify(charSignal.value)) as CharacterData;
	fn(next);
	charSignal.value = next;
}

export function updateMeta(fn: (m: BuilderMeta) => void): void {
	const next = {
		...metaSignal.value,
		stepsCompleted: [...metaSignal.value.stepsCompleted],
	};
	fn(next);
	metaSignal.value = next;
}

// =========================================================================
// Root component
// =========================================================================

export function CharacterBuilderApp() {
	const { data, loading, error } = useAllData([
		"races",
		"exaltations",
		"skills",
		"classes",
		"feats",
		"backgrounds",
		"alignments",
		"equipment",
		"weapons",
	]);

	// Sync loaded data into module-level signal
	useEffect(() => {
		if (data.value && !gameData.value) {
			gameData.value = data.value as Record<string, any>;
		}
	}, [data.value]);

	if (loading.value) {
		return <div class="text-center text-text-muted p-xl">Loading game data…</div>;
	}

	if (error.value) {
		return <div class="text-center text-error p-xl">Failed to load data: {error.value}</div>;
	}

	const handleStartOver = () => {
		if (!confirm("Start over? All progress will be lost.")) return;
		charSignal.value = createDefaultChar();
		metaSignal.value = createDefaultMeta();
		currentStep.value = 1;
	};

	return (
		<div class="grid grid-cols-[280px_1fr] gap-lg max-w-[1440px] mx-auto p-md max-[900px]:grid-cols-1">
			<Sidebar />
			<main class="min-w-0">
				<div class="flex items-center justify-between mb-md">
					<h1>Character Builder</h1>
					<button type="button" class="btn btn-danger btn-sm" onClick={handleStartOver}>
						Start Over
					</button>
				</div>
				<StepAccordion />
			</main>
		</div>
	);
}
