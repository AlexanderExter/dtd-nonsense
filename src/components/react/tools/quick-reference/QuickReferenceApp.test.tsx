import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useQuickRefStore } from "./store";

// No data loading needed — QuickReferenceApp uses hardcoded QREF_DATA
const { QuickReferenceApp } = await import("./QuickReferenceApp");

afterEach(() => {
	cleanup();
	useQuickRefStore.setState({
		searchQuery: "",
		activeTypeFilters: new Set(),
		activeSubtypeFilters: new Set(),
		openSections: new Set(),
	});
});

describe("QuickReferenceApp", () => {
	it("renders the heading", () => {
		render(<QuickReferenceApp />);
		expect(screen.getByText("Quick Reference")).toBeTruthy();
	});

	it("renders Expand All and Collapse All buttons", () => {
		render(<QuickReferenceApp />);
		expect(screen.getByText("Expand All")).toBeTruthy();
		expect(screen.getByText("Collapse All")).toBeTruthy();
	});

	it("renders section titles", () => {
		render(<QuickReferenceApp />);
		expect(screen.getByText("Actions Reference")).toBeTruthy();
		expect(screen.getByText("Conditions")).toBeTruthy();
		expect(screen.getByText("Combat Modifiers")).toBeTruthy();
		expect(screen.getByText("Formula Quick Reference")).toBeTruthy();
	});

	it("renders sidebar reference tables", () => {
		render(<QuickReferenceApp />);
		expect(screen.getByText("Target Numbers")).toBeTruthy();
		expect(screen.getByText("Hit Location")).toBeTruthy();
	});

	it("renders the search input", () => {
		render(<QuickReferenceApp />);
		const input = screen.getByPlaceholderText(/search/i);
		expect(input).toBeTruthy();
	});

	it("expands a section when clicked", async () => {
		const user = userEvent.setup();
		render(<QuickReferenceApp />);
		// Click the Actions Reference section to expand it
		const actionButton = screen.getByText("Actions Reference");
		await user.click(actionButton);
		// After expansion, the store should reflect the open section
		expect(useQuickRefStore.getState().openSections.has("actions")).toBe(true);
	});

	it("collapses all sections when Collapse All is clicked", async () => {
		const user = userEvent.setup();
		// Pre-expand some sections
		useQuickRefStore.setState({
			openSections: new Set(["actions", "conditions", "modifiers"]),
		});
		render(<QuickReferenceApp />);
		await user.click(screen.getByText("Collapse All"));
		expect(useQuickRefStore.getState().openSections.size).toBe(0);
	});

	it("filters sections when search query is set", () => {
		// Set search query directly (bypasses debounced input)
		useQuickRefStore.getState().setSearchQuery("attack");
		render(<QuickReferenceApp />);
		// "Actions Reference" should match (contains "attack" actions)
		expect(screen.getByText("Actions Reference")).toBeTruthy();
	});
});
