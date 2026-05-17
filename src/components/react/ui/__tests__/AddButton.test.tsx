import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddButton } from "../AddButton";

afterEach(() => cleanup());

describe("AddButton", () => {
	it("renders with the label text", () => {
		render(<AddButton label="Weapon" />);
		expect(screen.getByRole("button", { name: "+ Add Weapon" })).toBeTruthy();
	});

	it("passes additional className", () => {
		const { container } = render(<AddButton className="mt-4" label="Feat" />);
		const button = container.querySelector("button");
		expect(button?.className).toContain("mt-4");
	});

	it("fires onClick handler", async () => {
		const user = userEvent.setup();
		let clicked = false;
		render(
			<AddButton
				label="Item"
				onClick={() => {
					clicked = true;
				}}
			/>,
		);
		await user.click(screen.getByRole("button"));
		expect(clicked).toBe(true);
	});

	it("can be disabled", () => {
		render(<AddButton disabled label="Skill" />);
		expect(screen.getByRole("button")).toBeDisabled();
	});
});
