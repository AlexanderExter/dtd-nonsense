import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { BASE_CHAR_DOT, createDefaultMeta } from "./constants";
import { createDefaultChar, useBuilderStore } from "./store";

describe("character-builder store", () => {
	beforeEach(() => {
		// Reset store to defaults before each test
		useBuilderStore.setState({
			char: createDefaultChar(),
			meta: createDefaultMeta(),
			gameData: null,
			currentStep: 1,
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// -----------------------------------------------------------------------
	// createDefaultChar
	// -----------------------------------------------------------------------
	describe("createDefaultChar", () => {
		it("returns a CharacterData with all characteristics set to BASE_CHAR_DOT", () => {
			const ch = createDefaultChar();
			for (const key of Object.keys(ch.characteristics)) {
				expect(ch.characteristics[key as keyof typeof ch.characteristics]).toBe(BASE_CHAR_DOT);
			}
		});

		it("returns independent copies", () => {
			const a = createDefaultChar();
			const b = createDefaultChar();
			a.name = "changed";
			expect(b.name).not.toBe("changed");
		});
	});

	// -----------------------------------------------------------------------
	// Simple setters
	// -----------------------------------------------------------------------
	describe("setters", () => {
		it("setChar replaces the character", () => {
			const ch = createDefaultChar();
			ch.name = "Test Hero";
			useBuilderStore.getState().setChar(ch);
			expect(useBuilderStore.getState().char.name).toBe("Test Hero");
		});

		it("setMeta replaces the meta state", () => {
			const meta = createDefaultMeta();
			meta.step = 5;
			useBuilderStore.getState().setMeta(meta);
			expect(useBuilderStore.getState().meta.step).toBe(5);
		});

		it("setGameData sets the game data", () => {
			const data = { skills: [] };
			useBuilderStore.getState().setGameData(data);
			expect(useBuilderStore.getState().gameData).toBe(data);
		});

		it("setCurrentStep updates the step number", () => {
			useBuilderStore.getState().setCurrentStep(7);
			expect(useBuilderStore.getState().currentStep).toBe(7);
		});
	});

	// -----------------------------------------------------------------------
	// updateChar (deep clone + mutation)
	// -----------------------------------------------------------------------
	describe("updateChar", () => {
		it("applies mutation to a deep clone of the character", () => {
			useBuilderStore.getState().updateChar((c) => {
				c.name = "Mutated";
			});
			expect(useBuilderStore.getState().char.name).toBe("Mutated");
		});

		it("does not mutate the previous state reference", () => {
			const before = useBuilderStore.getState().char;
			useBuilderStore.getState().updateChar((c) => {
				c.name = "New Name";
			});
			// The original reference should be unchanged
			expect(before.name).not.toBe("New Name");
		});

		it("preserves other fields when mutating one", () => {
			useBuilderStore.getState().updateChar((c) => {
				c.name = "Hero";
			});
			// Characteristics should still be at BASE_CHAR_DOT
			expect(useBuilderStore.getState().char.characteristics.strength).toBe(BASE_CHAR_DOT);
		});
	});

	// -----------------------------------------------------------------------
	// updateMeta
	// -----------------------------------------------------------------------
	describe("updateMeta", () => {
		it("applies mutation to meta state", () => {
			useBuilderStore.getState().updateMeta((m) => {
				m.step = 3;
			});
			expect(useBuilderStore.getState().meta.step).toBe(3);
		});

		it("preserves stepsCompleted array independently", () => {
			const before = useBuilderStore.getState().meta.stepsCompleted;
			useBuilderStore.getState().updateMeta((m) => {
				m.stepsCompleted[0] = true;
			});
			// The original reference should be unchanged (new array was created)
			expect(before[0]).toBe(false);
			expect(useBuilderStore.getState().meta.stepsCompleted[0]).toBe(true);
		});
	});
});
