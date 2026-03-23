import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabContent, Tabs } from "../Tabs";

const SAMPLE_TABS = [
	{ id: "stats", label: "Stats" },
	{ id: "combat", label: "Combat" },
	{ id: "powers", label: "Powers" },
];

afterEach(() => cleanup());

describe("Tabs", () => {
	it("renders all tab labels", () => {
		render(
			<Tabs activeId="stats" onTabChange={() => {}} tabs={SAMPLE_TABS}>
				<TabContent value="stats">
					<div>Stats content</div>
				</TabContent>
				<TabContent value="combat">
					<div>Combat content</div>
				</TabContent>
				<TabContent value="powers">
					<div>Powers content</div>
				</TabContent>
			</Tabs>,
		);
		expect(screen.getByText("Stats")).toBeTruthy();
		expect(screen.getByText("Combat")).toBeTruthy();
		expect(screen.getByText("Powers")).toBeTruthy();
	});

	it("renders only the active tab content", () => {
		render(
			<Tabs activeId="stats" onTabChange={() => {}} tabs={SAMPLE_TABS}>
				<TabContent value="stats">
					<div>Stats panel</div>
				</TabContent>
				<TabContent value="combat">
					<div>Combat panel</div>
				</TabContent>
			</Tabs>,
		);
		expect(screen.getByText("Stats panel")).toBeTruthy();
		expect(screen.queryByText("Combat panel")).toBeNull();
	});

	it("calls onTabChange with the clicked tab id", async () => {
		const onTabChange = mock(() => {});
		const user = userEvent.setup();
		render(
			<Tabs activeId="stats" onTabChange={onTabChange} tabs={SAMPLE_TABS}>
				<TabContent value="stats">
					<div>Content</div>
				</TabContent>
			</Tabs>,
		);

		await user.click(screen.getByText("Combat"));
		expect(onTabChange).toHaveBeenCalledWith("combat");
	});

	it("renders the active tab with accent styling", () => {
		render(
			<Tabs activeId="combat" onTabChange={() => {}} tabs={SAMPLE_TABS}>
				<TabContent value="combat">
					<div>Content</div>
				</TabContent>
			</Tabs>,
		);
		const activeTab = screen.getByText("Combat");
		expect(activeTab.className).toContain("text-accent");
	});

	it("renders inactive tabs with muted styling", () => {
		render(
			<Tabs activeId="stats" onTabChange={() => {}} tabs={SAMPLE_TABS}>
				<TabContent value="stats">
					<div>Content</div>
				</TabContent>
			</Tabs>,
		);
		const inactiveTab = screen.getByText("Combat");
		expect(inactiveTab.className).toContain("text-text-muted");
	});

	it("applies custom className to the tab list", () => {
		const { container } = render(
			<Tabs activeId="stats" className="custom-tabs" onTabChange={() => {}} tabs={SAMPLE_TABS}>
				<TabContent value="stats">
					<div>Content</div>
				</TabContent>
			</Tabs>,
		);
		expect(container.querySelector(".custom-tabs")).toBeTruthy();
	});
});
