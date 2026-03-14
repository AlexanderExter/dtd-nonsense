import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { createDefaultNPC } from "./constants";
import { useNPCStore } from "./store";

describe("npc-generator store", () => {
	beforeEach(() => {
		useNPCStore.setState({
			npcState: createDefaultNPC(),
			savedList: [],
			traitsData: [],
			templatesList: [],
			skillNames: [],
			dataLoaded: false,
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// -----------------------------------------------------------------------
	// createDefaultNPC
	// -----------------------------------------------------------------------
	describe("createDefaultNPC", () => {
		it("returns an NPC with default characteristics at 2", () => {
			const npc = createDefaultNPC();
			expect(npc.characteristics.strength).toBe(2);
			expect(npc.characteristics.dexterity).toBe(2);
			expect(npc.characteristics.willpower).toBe(2);
		});

		it("returns independent copies", () => {
			const a = createDefaultNPC();
			const b = createDefaultNPC();
			a.name = "changed";
			expect(b.name).toBe("");
		});

		it("has empty collections by default", () => {
			const npc = createDefaultNPC();
			expect(npc.skills).toEqual([]);
			expect(npc.feats).toEqual([]);
			expect(npc.traits).toEqual([]);
			expect(npc.weapons).toEqual([]);
			expect(npc.armor).toEqual([]);
			expect(npc.abilities).toEqual([]);
		});
	});

	// -----------------------------------------------------------------------
	// Simple setters
	// -----------------------------------------------------------------------
	describe("setters", () => {
		it("setNpcState replaces the NPC", () => {
			const npc = createDefaultNPC();
			npc.name = "Goblin";
			useNPCStore.getState().setNpcState(npc);
			expect(useNPCStore.getState().npcState.name).toBe("Goblin");
		});

		it("setSavedList replaces the saved list", () => {
			useNPCStore.getState().setSavedList(["npc1", "npc2"]);
			expect(useNPCStore.getState().savedList).toEqual(["npc1", "npc2"]);
		});

		it("setTraitsData sets trait definitions", () => {
			const traits = [{ id: "big", name: "Big", parameterized: false }];
			useNPCStore.getState().setTraitsData(traits);
			expect(useNPCStore.getState().traitsData).toHaveLength(1);
		});

		it("setTemplatesList sets templates", () => {
			useNPCStore.getState().setTemplatesList([]);
			expect(useNPCStore.getState().templatesList).toEqual([]);
		});

		it("setSkillNames sets skill names", () => {
			useNPCStore.getState().setSkillNames(["Athletics", "Brawl"]);
			expect(useNPCStore.getState().skillNames).toEqual(["Athletics", "Brawl"]);
		});

		it("setDataLoaded flags data as loaded", () => {
			useNPCStore.getState().setDataLoaded(true);
			expect(useNPCStore.getState().dataLoaded).toBe(true);
		});
	});

	// -----------------------------------------------------------------------
	// updateNpc (functional updater)
	// -----------------------------------------------------------------------
	describe("updateNpc", () => {
		it("applies a functional update to the NPC", () => {
			useNPCStore.getState().updateNpc((npc) => ({
				...npc,
				name: "Updated Goblin",
				level: 5,
			}));
			expect(useNPCStore.getState().npcState.name).toBe("Updated Goblin");
			expect(useNPCStore.getState().npcState.level).toBe(5);
		});

		it("preserves other NPC fields not in the update", () => {
			useNPCStore.getState().updateNpc((npc) => ({
				...npc,
				name: "Boss",
			}));
			expect(useNPCStore.getState().npcState.characteristics.strength).toBe(2);
		});
	});
});
