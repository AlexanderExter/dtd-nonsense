import { afterEach, beforeEach, describe, expect, it, jest, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { installMockLocalStorage } from "@/lib/dtd/__test-utils__/mock-local-storage";
import { TEST_COOL_SHIP } from "../../__test-utils__/mock-characters";
import { createDefaultShip } from "./constants";
import { useShipStore } from "./store";

// ---------------------------------------------------------------------------
// Mock data loading — intercept useAllData hook
// ---------------------------------------------------------------------------
let mockUseAllData = () => ({ data: null, loading: true, error: null });

mock.module("@/hooks/use-data", () => ({
	useAllData: (..._args: unknown[]) => mockUseAllData(),
}));

const { ShipBuilderApp } = await import("./ShipBuilderApp");

let restoreLocalStorage: () => void;

beforeEach(() => {
	jest.useFakeTimers();
});

afterEach(() => {
	// Flush any pending autosave timers to prevent leak into other test files
	jest.runAllTimers();
	jest.useRealTimers();
	cleanup();
	restoreLocalStorage?.();
	useShipStore.setState({
		ship: createDefaultShip(),
		shipData: null,
		shipList: [],
		mode: "builder",
		dataLoaded: false,
	});
	mockUseAllData = () => ({ data: null, loading: true, error: null });
});

describe("ShipBuilderApp", () => {
	it("shows loading message before data is loaded", () => {
		restoreLocalStorage = installMockLocalStorage();
		render(<ShipBuilderApp />);
		expect(screen.getByText(/Loading ship data/)).toBeTruthy();
	});

	it("renders main UI when data is loaded", () => {
		restoreLocalStorage = installMockLocalStorage();
		useShipStore.setState({ dataLoaded: true });
		render(<ShipBuilderApp />);
		expect(screen.getByText("+ New")).toBeTruthy();
	});

	it("renders Builder/Sheet mode toggle", async () => {
		restoreLocalStorage = installMockLocalStorage();
		useShipStore.setState({ dataLoaded: true });
		render(<ShipBuilderApp />);
		expect(screen.getByText("Builder")).toBeTruthy();
		expect(screen.getByText("Sheet")).toBeTruthy();
	});

	it("renders ship management buttons", () => {
		restoreLocalStorage = installMockLocalStorage();
		useShipStore.setState({ dataLoaded: true });
		render(<ShipBuilderApp />);
		expect(screen.getByTitle("New ship")).toBeTruthy();
		expect(screen.getByTitle("Delete ship")).toBeTruthy();
		expect(screen.getByText("Import")).toBeTruthy();
		expect(screen.getByText("Export")).toBeTruthy();
	});

	it("renders ship switcher dropdown", () => {
		restoreLocalStorage = installMockLocalStorage();
		useShipStore.setState({
			dataLoaded: true,
			shipList: [{ id: "ship-1", name: "HMS Victory" }],
		});
		render(<ShipBuilderApp />);
		expect(screen.getByTitle("Switch ship")).toBeTruthy();
		expect(screen.getByText("HMS Victory")).toBeTruthy();
	});

	it("renders The Regression Runner ship from fixture", () => {
		restoreLocalStorage = installMockLocalStorage();
		useShipStore.setState({
			dataLoaded: true,
			ship: TEST_COOL_SHIP,
			shipList: [{ id: TEST_COOL_SHIP.id, name: TEST_COOL_SHIP.name }],
		});
		render(<ShipBuilderApp />);
		expect(screen.getByDisplayValue("The Regression Runner")).toBeTruthy();
	});
});
