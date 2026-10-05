import { describe, expect, it } from "bun:test";
import { calculateDerived, createDefaultNPC, generateMarkdown } from "./constants";

describe("generateMarkdown", () => {
	it("renders the characteristics row for a default NPC", () => {
		const npc = createDefaultNPC();
		npc.name = "Testing Goblin";
		const md = generateMarkdown(npc, calculateDerived(npc, []), []);

		expect(md).toContain("## Testing Goblin");
		expect(md).toContain("| Str | Dex | Con | Cha | Fel | Cmp | Int | Wis | Wil |");
		expect(md).toContain("**HP:**");
	});
});
