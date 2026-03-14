import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { getMockStorage, installMockLocalStorage } from "@/lib/dtd/__test-utils__/mock-local-storage";
import { createDefaultShip, STORAGE_LIST_KEY, STORAGE_PREFIX } from "./constants";
import { saveShipNow, useShipStore } from "./store";

describe("ship-builder store", () => {
	let restoreLS: () => void;

	beforeEach(() => {
		jest.useFakeTimers();
		restoreLS = installMockLocalStorage();
		useShipStore.setState({
			shipData: null,
			ship: createDefaultShip(),
			shipList: [],
			mode: "builder",
			dataLoaded: false,
		});
	});

	afterEach(() => {
		jest.runAllTimers();
		jest.useRealTimers();
		restoreLS();
		jest.restoreAllMocks();
	});

	// -----------------------------------------------------------------------
	// createDefaultShip
	// -----------------------------------------------------------------------
	describe("createDefaultShip", () => {
		it("returns a ShipState with a generated id", () => {
			const ship = createDefaultShip();
			expect(ship.id).toBeTruthy();
			expect(ship.id.startsWith("ship_")).toBe(true);
		});

		it("returns independent copies", () => {
			const a = createDefaultShip();
			const b = createDefaultShip();
			a.name = "changed";
			expect(b.name).toBe("");
		});

		it("initializes with empty weapons and consoles", () => {
			const ship = createDefaultShip();
			expect(ship.weapons.forward).toEqual([]);
			expect(ship.weapons.rear).toEqual([]);
			expect(ship.consoles).toEqual({});
		});
	});

	// -----------------------------------------------------------------------
	// Simple setters
	// -----------------------------------------------------------------------
	describe("setters", () => {
		it("setShipData sets the ship data", () => {
			const data = { hulls: [], consoles: [], weapons: [] } as any;
			useShipStore.getState().setShipData(data);
			expect(useShipStore.getState().shipData).toBe(data);
		});

		it("setShip replaces the ship state", () => {
			const ship = createDefaultShip();
			ship.name = "USS Enterprise";
			useShipStore.getState().setShip(ship);
			expect(useShipStore.getState().ship.name).toBe("USS Enterprise");
		});

		it("setShipList replaces the list", () => {
			const list = [{ id: "s1", name: "Ship 1" }];
			useShipStore.getState().setShipList(list);
			expect(useShipStore.getState().shipList).toEqual(list);
		});

		it("setMode switches between builder and sheet", () => {
			useShipStore.getState().setMode("sheet");
			expect(useShipStore.getState().mode).toBe("sheet");
		});

		it("setDataLoaded flags data as loaded", () => {
			useShipStore.getState().setDataLoaded(true);
			expect(useShipStore.getState().dataLoaded).toBe(true);
		});
	});

	// -----------------------------------------------------------------------
	// updateShip
	// -----------------------------------------------------------------------
	describe("updateShip", () => {
		it("applies an updater function to the ship", () => {
			useShipStore.getState().updateShip((s) => ({
				...s,
				name: "Updated Ship",
			}));
			expect(useShipStore.getState().ship.name).toBe("Updated Ship");
		});

		it("preserves other ship fields on update", () => {
			const originalId = useShipStore.getState().ship.id;
			useShipStore.getState().updateShip((s) => ({
				...s,
				name: "New Name",
			}));
			expect(useShipStore.getState().ship.id).toBe(originalId);
		});
	});

	// -----------------------------------------------------------------------
	// saveShipNow (localStorage persistence)
	// -----------------------------------------------------------------------
	describe("saveShipNow", () => {
		it("does nothing when shipData is null", () => {
			saveShipNow();
			expect(Object.keys(getMockStorage())).toHaveLength(0);
		});

		it("saves ship to localStorage with correct key when shipData is set", () => {
			const ship = createDefaultShip();
			ship.name = "My Ship";
			useShipStore.setState({
				shipData: { hulls: [], consoles: [], weapons: [] } as any,
				ship,
				shipList: [],
			});

			saveShipNow();

			const stored = getMockStorage()[STORAGE_PREFIX + ship.id];
			expect(stored).toBeDefined();
			expect(JSON.parse(stored).name).toBe("My Ship");
		});

		it("updates the ship list in localStorage", () => {
			const ship = createDefaultShip();
			ship.name = "Test Ship";
			useShipStore.setState({
				shipData: { hulls: [] } as any,
				ship,
				shipList: [],
			});

			saveShipNow();

			const listStr = getMockStorage()[STORAGE_LIST_KEY];
			expect(listStr).toBeDefined();
			const list = JSON.parse(listStr);
			expect(list).toHaveLength(1);
			expect(list[0].name).toBe("Test Ship");
		});

		it("updates existing entry in ship list", () => {
			const ship = createDefaultShip();
			ship.name = "Original";
			useShipStore.setState({
				shipData: { hulls: [] } as any,
				ship,
				shipList: [{ id: ship.id, name: "Original" }],
			});

			ship.name = "Renamed";
			useShipStore.setState({ ship });
			saveShipNow();

			const list = JSON.parse(getMockStorage()[STORAGE_LIST_KEY]);
			expect(list).toHaveLength(1);
			expect(list[0].name).toBe("Renamed");
		});
	});
});
