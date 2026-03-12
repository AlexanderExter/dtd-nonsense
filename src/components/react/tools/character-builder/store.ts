import { create } from "zustand";
import { character } from "@/lib/dtd/character";
import type { CharacterData } from "@/lib/dtd/types";
import { BASE_CHAR_DOT, type BuilderMeta, createDefaultMeta } from "./constants";

// =========================================================================
// Default character factory
// =========================================================================

function createDefaultChar(): CharacterData {
	const ch = character.createDefault();
	for (const key of Object.keys(ch.characteristics) as Array<keyof typeof ch.characteristics>) {
		ch.characteristics[key] = BASE_CHAR_DOT;
	}
	return ch;
}

// =========================================================================
// Store interface
// =========================================================================

interface BuilderStore {
	char: CharacterData;
	meta: BuilderMeta;
	gameData: Record<string, any> | null;
	currentStep: number;

	setChar: (ch: CharacterData) => void;
	setMeta: (m: BuilderMeta) => void;
	setGameData: (d: Record<string, any>) => void;
	setCurrentStep: (step: number) => void;
	updateChar: (fn: (c: CharacterData) => void) => void;
	updateMeta: (fn: (m: BuilderMeta) => void) => void;
}

// =========================================================================
// Store
// =========================================================================

export const useBuilderStore = create<BuilderStore>((set) => ({
	char: createDefaultChar(),
	meta: createDefaultMeta(),
	gameData: null,
	currentStep: 1,

	setChar: (ch) => set({ char: ch }),
	setMeta: (m) => set({ meta: m }),
	setGameData: (d) => set({ gameData: d }),
	setCurrentStep: (step) => set({ currentStep: step }),

	updateChar: (fn) =>
		set((state) => {
			const next = structuredClone(state.char);
			fn(next);
			return { char: next };
		}),

	updateMeta: (fn) =>
		set((state) => {
			const next = {
				...state.meta,
				stepsCompleted: [...state.meta.stepsCompleted],
			};
			fn(next);
			return { meta: next };
		}),
}));

// =========================================================================
// Re-export factory for "Start Over" buttons
// =========================================================================

export { createDefaultChar };
