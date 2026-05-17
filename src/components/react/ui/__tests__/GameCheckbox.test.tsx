import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameCheckbox } from "../GameCheckbox";

afterEach(() => cleanup());

describe("GameCheckbox", () => {
	it("renders a checkbox without label", () => {
		render(<GameCheckbox />);
		expect(screen.getByRole("checkbox")).toBeTruthy();
	});

	it("renders with a label", () => {
		render(<GameCheckbox label="Proficient" />);
		expect(screen.getByText("Proficient")).toBeTruthy();
		expect(screen.getByRole("checkbox")).toBeTruthy();
	});

	it("is unchecked by default", () => {
		render(<GameCheckbox label="Trained" />);
		expect(screen.getByRole("checkbox")).not.toBeChecked();
	});

	it("can be checked", () => {
		render(<GameCheckbox checked label="Active" onChange={() => {}} />);
		expect(screen.getByRole("checkbox")).toBeChecked();
	});

	it("fires onChange handler", async () => {
		const user = userEvent.setup();
		let changed = false;
		render(
			<GameCheckbox
				label="Toggle"
				onChange={() => {
					changed = true;
				}}
			/>,
		);
		await user.click(screen.getByRole("checkbox"));
		expect(changed).toBe(true);
	});

	it("can be disabled", () => {
		render(<GameCheckbox disabled label="Locked" />);
		expect(screen.getByRole("checkbox")).toBeDisabled();
	});

	it("applies className to the input", () => {
		const { container } = render(<GameCheckbox className="custom-class" />);
		const input = container.querySelector("input");
		expect(input?.className).toContain("custom-class");
	});
});
