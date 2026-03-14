import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "../Tabs";

const SAMPLE_TABS = [
	{ id: "stats", label: "Stats" },
	{ id: "combat", label: "Combat" },
	{ id: "powers", label: "Powers" },
];

afterEach(() => cleanup());

describe("Tabs", () => {
	it("renders all tab labels", () => {
		render(
			<Tabs tabs={SAMPLE_TABS} activeId="stats" onTabChange={() => {}}>
				<div>Tab content</div>
			</Tabs>,
		);
		expect(screen.getByText("Stats")).toBeTruthy();
		expect(screen.getByText("Combat")).toBeTruthy();
		expect(screen.getByText("Powers")).toBeTruthy();
	});

	it("renders children", () => {
		render(
			<Tabs tabs={SAMPLE_TABS} activeId="stats" onTabChange={() => {}}>
				<div>Panel content</div>
			</Tabs>,
		);
		expect(screen.getByText("Panel content")).toBeTruthy();
	});

	it("calls onTabChange with the clicked tab id", async () => {
		const onTabChange = mock(() => {});
		const user = userEvent.setup();
		render(
			<Tabs tabs={SAMPLE_TABS} activeId="stats" onTabChange={onTabChange}>
				<div>Content</div>
			</Tabs>,
		);

		await user.click(screen.getByText("Combat"));
		expect(onTabChange).toHaveBeenCalledWith("combat");
	});

	it("renders the active tab with accent styling", () => {
		render(
			<Tabs tabs={SAMPLE_TABS} activeId="combat" onTabChange={() => {}}>
				<div>Content</div>
			</Tabs>,
		);
		const activeTab = screen.getByText("Combat");
		expect(activeTab.className).toContain("text-accent");
	});

	it("renders inactive tabs with muted styling", () => {
		render(
			<Tabs tabs={SAMPLE_TABS} activeId="stats" onTabChange={() => {}}>
				<div>Content</div>
			</Tabs>,
		);
		const inactiveTab = screen.getByText("Combat");
		expect(inactiveTab.className).toContain("text-text-muted");
	});

	it("applies custom className to the tab list", () => {
		const { container } = render(
			<Tabs tabs={SAMPLE_TABS} activeId="stats" onTabChange={() => {}} className="custom-tabs">
				<div>Content</div>
			</Tabs>,
		);
		expect(container.querySelector(".custom-tabs")).toBeTruthy();
	});
});
