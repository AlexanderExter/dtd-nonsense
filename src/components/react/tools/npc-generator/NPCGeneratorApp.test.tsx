import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { installMockLocalStorage } from "@/lib/dtd/__test-utils__/mock-local-storage";
import { createDefaultNPC } from "./constants";
import { useNPCStore } from "./store";

// ---------------------------------------------------------------------------
// Mock data loading
// ---------------------------------------------------------------------------
mock.module("@/lib/dtd/core.ts", () => ({
	loadData: mock((filename: string) => {
		if (filename === "traits.json") return Promise.resolve([]);
		if (filename === "npc-templates.json") return Promise.resolve([]);
		if (filename === "skills.json") return Promise.resolve({ skills: {} });
		return Promise.resolve({});
	}),
}));

const { NPCGeneratorApp } = await import("./NPCGeneratorApp");

let restoreLocalStorage: () => void;

afterEach(() => {
	cleanup();
	restoreLocalStorage?.();
	useNPCStore.setState({
		npcState: createDefaultNPC(),
		savedList: [],
		traitsData: [],
		templatesList: [],
		skillNames: [],
		dataLoaded: false,
	});
});

describe("NPCGeneratorApp", () => {
	it("shows loading message before data is loaded", () => {
		restoreLocalStorage = installMockLocalStorage();
		render(<NPCGeneratorApp />);
		expect(screen.getByText(/Loading NPC Builder/)).toBeTruthy();
	});

	it("renders header and form after data loads", async () => {
		restoreLocalStorage = installMockLocalStorage();
		render(<NPCGeneratorApp />);
		await waitFor(() => {
			expect(screen.getByText("NPC Stat Block Builder")).toBeTruthy();
		});
	});

	it("renders template selector", async () => {
		restoreLocalStorage = installMockLocalStorage();
		render(<NPCGeneratorApp />);
		await waitFor(() => {
			expect(screen.getByTitle("Load template")).toBeTruthy();
		});
	});

	it("renders action buttons when data is loaded", () => {
		restoreLocalStorage = installMockLocalStorage();
		useNPCStore.setState({ dataLoaded: true });
		render(<NPCGeneratorApp />);
		expect(screen.getByTitle("Save NPC")).toBeTruthy();
		expect(screen.getByTitle("Clear all fields")).toBeTruthy();
	});

	it("renders when immediately provided with dataLoaded state", () => {
		restoreLocalStorage = installMockLocalStorage();
		useNPCStore.setState({ dataLoaded: true });
		render(<NPCGeneratorApp />);
		expect(screen.getByText("NPC Stat Block Builder")).toBeTruthy();
	});
});
