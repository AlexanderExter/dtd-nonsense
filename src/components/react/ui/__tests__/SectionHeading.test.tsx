import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { SectionHeading } from "../SectionHeading";

afterEach(() => cleanup());

describe("SectionHeading", () => {
	it("renders children text", () => {
		render(<SectionHeading>Characteristics</SectionHeading>);
		expect(screen.getByText("Characteristics")).toBeTruthy();
	});

	it("renders as h4 by default", () => {
		render(<SectionHeading>Title</SectionHeading>);
		const heading = screen.getByText("Title");
		expect(heading.tagName).toBe("H4");
	});

	it("renders as h2 when specified", () => {
		render(<SectionHeading as="h2">Big Title</SectionHeading>);
		const heading = screen.getByText("Big Title");
		expect(heading.tagName).toBe("H2");
	});

	it("renders as h3 when specified", () => {
		render(<SectionHeading as="h3">Medium Title</SectionHeading>);
		const heading = screen.getByText("Medium Title");
		expect(heading.tagName).toBe("H3");
	});

	it("applies additional className", () => {
		render(<SectionHeading className="mt-lg">Styled</SectionHeading>);
		const heading = screen.getByText("Styled");
		expect(heading.className).toContain("mt-lg");
	});

	it("passes through additional HTML attributes", () => {
		render(<SectionHeading data-testid="heading">Test</SectionHeading>);
		expect(screen.getByTestId("heading")).toBeTruthy();
	});
});
