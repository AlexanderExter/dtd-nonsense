import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccordionItem } from "../Accordion";

afterEach(() => cleanup());

describe("AccordionItem", () => {
	it("renders the title", () => {
		render(<AccordionItem title="Details">Content</AccordionItem>);
		expect(screen.getByText("Details")).toBeTruthy();
	});

	it("renders the count badge when provided", () => {
		render(
			<AccordionItem count="5" title="Items">
				Content
			</AccordionItem>,
		);
		expect(screen.getByText("5")).toBeTruthy();
	});

	it("does not render count badge when omitted", () => {
		const { container } = render(<AccordionItem title="Items">Content</AccordionItem>);
		// The count is a span with specific classes; when absent, no ml-auto span
		const countSpans = container.querySelectorAll("span.ml-auto");
		expect(countSpans.length).toBe(0);
	});

	describe("uncontrolled mode", () => {
		it("is closed by default", () => {
			render(<AccordionItem title="Closed">Hidden content</AccordionItem>);
			// Radix Collapsible hides content when closed
			expect(screen.queryByText("Hidden content")).toBeNull();
		});

		it("is open when defaultOpen is true", () => {
			render(
				<AccordionItem defaultOpen title="Open">
					Visible content
				</AccordionItem>,
			);
			expect(screen.getByText("Visible content")).toBeTruthy();
		});

		it("toggles open/closed on trigger click", async () => {
			const user = userEvent.setup();
			render(<AccordionItem title="Toggle">Toggled content</AccordionItem>);

			// Initially closed
			expect(screen.queryByText("Toggled content")).toBeNull();

			// Click to open
			await user.click(screen.getByRole("button", { name: /Toggle/i }));
			expect(screen.getByText("Toggled content")).toBeTruthy();

			// Click to close
			await user.click(screen.getByRole("button", { name: /Toggle/i }));
			expect(screen.queryByText("Toggled content")).toBeNull();
		});
	});

	describe("controlled mode", () => {
		it("renders content when open is true", () => {
			const onToggle = () => {};
			render(
				<AccordionItem onToggle={onToggle} open={true} title="Controlled">
					Controlled content
				</AccordionItem>,
			);
			expect(screen.getByText("Controlled content")).toBeTruthy();
		});

		it("hides content when open is false", () => {
			const onToggle = () => {};
			render(
				<AccordionItem onToggle={onToggle} open={false} title="Controlled">
					Hidden controlled
				</AccordionItem>,
			);
			expect(screen.queryByText("Hidden controlled")).toBeNull();
		});
	});

	it("applies custom className", () => {
		const { container } = render(
			<AccordionItem className="my-custom-class" title="Custom">
				Content
			</AccordionItem>,
		);
		const wrapper = container.querySelector(".my-custom-class");
		expect(wrapper).toBeTruthy();
	});
});
