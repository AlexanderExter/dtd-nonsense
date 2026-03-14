import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../Modal";

afterEach(() => cleanup());

describe("Modal", () => {
	it("renders nothing when open is false", () => {
		render(
			<Modal open={false} onClose={() => {}}>
				<p>Modal content</p>
			</Modal>,
		);
		expect(screen.queryByText("Modal content")).toBeNull();
	});

	it("renders children when open is true", () => {
		render(
			<Modal open={true} onClose={() => {}}>
				<p>Modal content</p>
			</Modal>,
		);
		expect(screen.getByText("Modal content")).toBeTruthy();
	});

	it("renders the title when provided", () => {
		render(
			<Modal open={true} onClose={() => {}} title="Import Data">
				Content
			</Modal>,
		);
		expect(screen.getByText("Import Data")).toBeTruthy();
	});

	it("renders a close button with accessible label when title is present", () => {
		render(
			<Modal open={true} onClose={() => {}} title="Settings">
				Content
			</Modal>,
		);
		expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
	});

	it("does not render close button or title header when title is omitted", () => {
		render(
			<Modal open={true} onClose={() => {}}>
				Content only
			</Modal>,
		);
		expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
	});

	it("calls onClose when the close button is clicked", async () => {
		const onClose = mock(() => {});
		const user = userEvent.setup();
		render(
			<Modal open={true} onClose={onClose} title="Test">
				Content
			</Modal>,
		);

		await user.click(screen.getByRole("button", { name: "Close" }));
		expect(onClose).toHaveBeenCalled();
	});

	it("calls onClose on escape key", async () => {
		const onClose = mock(() => {});
		const user = userEvent.setup();
		render(
			<Modal open={true} onClose={onClose} title="Escape Test">
				Content
			</Modal>,
		);

		await user.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalled();
	});

	it("applies custom className", () => {
		render(
			<Modal open={true} onClose={() => {}} className="custom-modal">
				Content
			</Modal>,
		);
		const content = document.querySelector(".custom-modal");
		expect(content).toBeTruthy();
	});
});
