import { beforeEach, describe, expect, it } from "bun:test";
import { useQuickRefStore } from "./store";

describe("quick-reference store", () => {
	beforeEach(() => {
		useQuickRefStore.setState({
			searchQuery: "",
			activeTypeFilters: new Set<string>(),
			activeSubtypeFilters: new Set<string>(),
			openSections: new Set<string>(),
		});
	});

	// -----------------------------------------------------------------------
	// setSearchQuery
	// -----------------------------------------------------------------------
	describe("setSearchQuery", () => {
		it("sets the search query string", () => {
			useQuickRefStore.getState().setSearchQuery("fireball");
			expect(useQuickRefStore.getState().searchQuery).toBe("fireball");
		});

		it("clears the search query when set to empty", () => {
			useQuickRefStore.getState().setSearchQuery("test");
			useQuickRefStore.getState().setSearchQuery("");
			expect(useQuickRefStore.getState().searchQuery).toBe("");
		});
	});

	// -----------------------------------------------------------------------
	// toggleTypeFilter
	// -----------------------------------------------------------------------
	describe("toggleTypeFilter", () => {
		it("adds a type filter when not present", () => {
			useQuickRefStore.getState().toggleTypeFilter("action");
			expect(useQuickRefStore.getState().activeTypeFilters.has("action")).toBe(true);
		});

		it("removes a type filter when already present", () => {
			useQuickRefStore.getState().toggleTypeFilter("action");
			useQuickRefStore.getState().toggleTypeFilter("action");
			expect(useQuickRefStore.getState().activeTypeFilters.has("action")).toBe(false);
		});

		it("supports multiple concurrent filters", () => {
			useQuickRefStore.getState().toggleTypeFilter("action");
			useQuickRefStore.getState().toggleTypeFilter("condition");
			expect(useQuickRefStore.getState().activeTypeFilters.size).toBe(2);
		});
	});

	// -----------------------------------------------------------------------
	// toggleSubtypeFilter
	// -----------------------------------------------------------------------
	describe("toggleSubtypeFilter", () => {
		it("adds a subtype filter when not present", () => {
			useQuickRefStore.getState().toggleSubtypeFilter("melee");
			expect(useQuickRefStore.getState().activeSubtypeFilters.has("melee")).toBe(true);
		});

		it("removes a subtype filter when already present", () => {
			useQuickRefStore.getState().toggleSubtypeFilter("melee");
			useQuickRefStore.getState().toggleSubtypeFilter("melee");
			expect(useQuickRefStore.getState().activeSubtypeFilters.has("melee")).toBe(false);
		});
	});

	// -----------------------------------------------------------------------
	// toggleSection
	// -----------------------------------------------------------------------
	describe("toggleSection", () => {
		it("opens a section when closed", () => {
			useQuickRefStore.getState().toggleSection("actions");
			expect(useQuickRefStore.getState().openSections.has("actions")).toBe(true);
		});

		it("closes a section when open", () => {
			useQuickRefStore.getState().toggleSection("actions");
			useQuickRefStore.getState().toggleSection("actions");
			expect(useQuickRefStore.getState().openSections.has("actions")).toBe(false);
		});
	});

	// -----------------------------------------------------------------------
	// expandAll / collapseAll
	// -----------------------------------------------------------------------
	describe("expandAll", () => {
		it("opens all default sections when called without args", () => {
			useQuickRefStore.getState().expandAll();
			const sections = useQuickRefStore.getState().openSections;
			expect(sections.has("actions")).toBe(true);
			expect(sections.has("conditions")).toBe(true);
			expect(sections.has("formulas")).toBe(true);
		});

		it("opens custom section IDs when provided", () => {
			useQuickRefStore.getState().expandAll(["custom1", "custom2"]);
			const sections = useQuickRefStore.getState().openSections;
			expect(sections.has("custom1")).toBe(true);
			expect(sections.has("custom2")).toBe(true);
			expect(sections.size).toBe(2);
		});
	});

	describe("collapseAll", () => {
		it("closes all sections", () => {
			useQuickRefStore.getState().expandAll();
			useQuickRefStore.getState().collapseAll();
			expect(useQuickRefStore.getState().openSections.size).toBe(0);
		});
	});
});
