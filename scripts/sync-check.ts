/**
 * TypeScript port of pipeline/parsers/ — sync checker that compares
 * markdown content in cleaned-references/ against JSON data in data/
 * to detect drift.
 *
 * Usage:
 *   bun run scripts/sync-check.ts              # check all sources
 *   bun run scripts/sync-check.ts --source races
 *   bun run scripts/sync-check.ts --source classes
 *   bun run scripts/sync-check.ts --source feats
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SCRIPT_DIR = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/i, "$1"));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const CLEANED_REFS_DIR = path.join(PROJECT_ROOT, "cleaned-references");
const DATA_DIR = path.join(PROJECT_ROOT, "data");

// ---------------------------------------------------------------------------
// Base parser types & utilities (port of parsers/base.py)
// ---------------------------------------------------------------------------

export interface ParsedSection {
	heading: string;
	level: number;
	content: string;
	lineStart: number;
}

/**
 * Split markdown into sections at the given heading level.
 * Each section spans from its heading to the next heading at the same level (or EOF).
 */
export function extractSections(text: string, targetLevel: number = 2): ParsedSection[] {
	const hashes = "#".repeat(targetLevel);
	const pattern = new RegExp(`^${hashes}\\s+(.+)$`, "gm");
	const sections: ParsedSection[] = [];

	const matches: { index: number; end: number; heading: string }[] = [];
	for (const m of text.matchAll(pattern)) {
		matches.push({
			index: m.index,
			end: m.index + m[0].length,
			heading: m[1].trim(),
		});
	}

	for (let i = 0; i < matches.length; i++) {
		const start = matches[i].end;
		const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
		const content = text.slice(start, end).trim();
		const lineStart = text.slice(0, matches[i].index).split("\n").length;

		sections.push({
			heading: matches[i].heading,
			level: targetLevel,
			content,
			lineStart,
		});
	}

	return sections;
}

/**
 * Extract value of a **Field Name:** pattern, stopping at | or end of line.
 * Example: "**Size:** 5 | **Languages:** Trade" → for "Size" returns "5".
 */
export function extractBoldField(content: string, fieldName: string): string | null {
	const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const pattern = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*(.+?)(?:\\s*\\||\\s*$)`, "m");
	const match = content.match(pattern);
	return match ? match[1].trim() : null;
}

/**
 * Extract the full line value after a **Field Name:** pattern.
 */
export function extractBoldFieldFullLine(content: string, fieldName: string): string | null {
	const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const pattern = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*(.+)$`, "m");
	const match = content.match(pattern);
	return match ? match[1].trim() : null;
}

/**
 * Parse a markdown pipe table into an array of {header: value} objects.
 *
 * Expects:
 *   | Header1 | Header2 |
 *   | ---     | ---     |
 *   | val1    | val2    |
 */
export function extractPipeTable(content: string): Record<string, string>[] {
	const lines = content.split("\n");
	const tableLines = lines.map((ln) => ln.trim()).filter((ln) => ln.startsWith("|") && ln.endsWith("|"));

	if (tableLines.length < 3) return [];

	const headers = tableLines[0]
		.split("|")
		.slice(1, -1)
		.map((c) => c.trim());

	// Skip separator row (index 1)
	const rows: Record<string, string>[] = [];
	for (const line of tableLines.slice(2)) {
		const cells = line
			.split("|")
			.slice(1, -1)
			.map((c) => c.trim());
		if (cells.length === headers.length) {
			const row: Record<string, string> = {};
			for (let j = 0; j < headers.length; j++) {
				row[headers[j]] = cells[j];
			}
			rows.push(row);
		}
	}

	return rows;
}

// ---------------------------------------------------------------------------
// Race parser (port of parsers/races.py)
// ---------------------------------------------------------------------------

export interface ParsedRace {
	name: string;
	size: number | null;
	languages: string[];
	charBonus: string | null;
	skillBonus: string | null;
	powerName: string | null;
	powerDescription: string | null;
}

export function parseRaces(content: string): ParsedRace[] {
	const sections = extractSections(content, 2);
	const races: ParsedRace[] = [];

	const skipHeadings = new Set(["Racial Traits Overview", "Summary Table", "Racial Traits Summary"]);

	for (const section of sections) {
		if (skipHeadings.has(section.heading)) continue;

		const sizeStr = extractBoldField(section.content, "Size");
		const size = sizeStr && /^\d+$/.test(sizeStr) ? Number.parseInt(sizeStr, 10) : null;

		const langStr = extractBoldField(section.content, "Languages");
		const languages = langStr ? langStr.split(",").map((l) => l.trim()) : [];

		let charBonus = extractBoldField(section.content, "Characteristic Modifiers");
		if (!charBonus) {
			charBonus = extractBoldField(section.content, "Characteristic Bonus");
		}

		let skillBonus = extractBoldField(section.content, "Skill Bonus");
		if (!skillBonus) {
			skillBonus = extractBoldField(section.content, "Skill Bonuses");
		}

		// Racial power: two formats
		let powerName: string | null = null;
		let powerDescription: string | null = null;

		// Format 1: nested bullet — **Racial Power:** \n - **Name:** description
		const nestedMatch = section.content.match(
			/\*\*(?:Racial Power|Power):\*\*\s*\n-\s*\*\*(.+?):\*\*\s*(.+?)(?=\n\n|\n-|$)/s,
		);
		if (nestedMatch) {
			powerName = nestedMatch[1].trim();
			powerDescription = nestedMatch[2].trim();
		} else {
			// Format 2: simple — **Racial Power:** description
			const simpleMatch = section.content.match(/\*\*Racial Power:\*\*\s*(.+?)(?=\n\n|$)/s);
			if (simpleMatch) {
				powerDescription = simpleMatch[1].trim();
			}
		}

		races.push({
			name: section.heading,
			size,
			languages,
			charBonus,
			skillBonus,
			powerName,
			powerDescription,
		});
	}

	return races;
}

// ---------------------------------------------------------------------------
// Class parser (port of parsers/classes.py)
// ---------------------------------------------------------------------------

export interface ParsedClass {
	name: string;
	level: number | null;
	prerequisites: string | null;
	characteristics: string[];
	skills: string[];
	feats: Record<string, string>[];
	completionBonus: string | null;
	suggestedExits: string[];
}

export function parseClasses(content: string): ParsedClass[] {
	const sections = extractSections(content, 2);
	const classes: ParsedClass[] = [];

	const skipPatterns = new Set([
		"Class Rules",
		"Free Study",
		"Leveling Procedure",
		"Class Tracks",
		"Level 1 Classes",
		"Level 2 Classes",
		"Level 3 Classes",
		"Level 4 Classes",
		"Level 5 Classes",
		"Standalone Classes",
	]);

	for (const section of sections) {
		if (skipPatterns.has(section.heading)) continue;
		if (section.heading.endsWith("Track")) continue;

		const levelStr = extractBoldFieldFullLine(section.content, "Level");
		const level = levelStr && /^\d+$/.test(levelStr) ? Number.parseInt(levelStr, 10) : null;

		const prerequisites = extractBoldFieldFullLine(section.content, "Prerequisites");

		const charsStr = extractBoldFieldFullLine(section.content, "Characteristics");
		const characteristics = charsStr ? charsStr.split(",").map((c) => c.trim()) : [];

		const skillsStr = extractBoldFieldFullLine(section.content, "Skills");
		const skills = skillsStr ? skillsStr.split(",").map((s) => s.trim()) : [];

		const feats = extractPipeTable(section.content);

		let completionBonus = extractBoldFieldFullLine(section.content, "Bonus for Completion");
		if (!completionBonus) {
			completionBonus = extractBoldFieldFullLine(section.content, "Completion Bonus");
		}

		const exitsStr = extractBoldFieldFullLine(section.content, "Suggested Exits");
		const suggestedExits = exitsStr ? exitsStr.split(",").map((e) => e.trim()) : [];

		classes.push({
			name: section.heading,
			level,
			prerequisites,
			characteristics,
			skills,
			feats,
			completionBonus,
			suggestedExits,
		});
	}

	return classes;
}

// ---------------------------------------------------------------------------
// Feat parser (port of parsers/feats.py)
// ---------------------------------------------------------------------------

export interface ParsedFeat {
	name: string;
	category: string | null;
	effect: string | null;
	multipleAllowed: boolean;
	groups: string[] | null;
	prerequisites: string | null;
}

export function parseFeats(content: string): ParsedFeat[] {
	const feats: ParsedFeat[] = [];
	const seen = new Set<string>();
	let currentCategory: string | null = null;
	let currentH3: string | null = null;

	const categoryMap: Record<string, string> = {
		"General Feats": "general",
		"Racial Feats": "racial",
		"Supplementary Feats": "supplementary",
		Assets: "assets",
		"Exalted Assets": "exaltedAssets",
		Hindrances: "hindrances",
		"Additional Feats": "supplementary",
	};

	/** Table separator row pattern: |---|---| */
	const TABLE_SEP = /^\|[\s\-:|]+\|$/;

	function addFeat(name: string, category: string | null, multiple: boolean, effect: string | null = null): void {
		// Apply "Sin: " prefix for Daemonhost Sin Assets
		const resolvedName = currentH3 === "Daemonhost Sin Assets" ? `Sin: ${name}` : name;
		if (seen.has(resolvedName)) return;
		seen.add(resolvedName);
		feats.push({
			name: resolvedName,
			category,
			effect,
			multipleAllowed: multiple,
			groups: null,
			prerequisites: null,
		});
	}

	const lines = content.split(/\r?\n/);

	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const line = lines[lineNum];

		// Track H2 headings for category
		const h2Match = line.match(/^##\s+(.+)$/);
		if (h2Match) {
			const heading = h2Match[1].trim();
			if (heading in categoryMap) {
				currentCategory = categoryMap[heading];
			}
			currentH3 = null;
			continue;
		}

		// Track H3 headings for sub-section context
		const h3Match = line.match(/^###\s+(.+)$/);
		if (h3Match) {
			currentH3 = h3Match[1].trim();
			continue;
		}

		// Match pipe table data rows: | Name | Effect |
		if (line.trim().startsWith("|") && line.trim().endsWith("|") && !TABLE_SEP.test(line.trim())) {
			const cells = line.split("|").slice(1, -1);
			if (cells.length >= 2) {
				const rawName = cells[0].trim().replace(/\\\*/g, "*");
				// Skip header rows (they typically contain "Feat", "Asset", "Hindrance", etc.)
				if (/^(Feat|Asset|Hindrance|Name)$/i.test(rawName)) continue;
				if (rawName.length === 0) continue;
				// Strip trailing * for "multiple allowed" marker
				const multiple = rawName.endsWith("*");
				const name = multiple ? rawName.slice(0, -1).trim() : rawName;
				if (name.length > 0) {
					const effectText = cells[1]?.trim() || null;
					addFeat(name, currentCategory, multiple, effectText);
				}
			}
			continue;
		}

		// Match **Feat Name** or **Feat Name\***
		const boldMatch = line.match(/^\*\*(.+?)(\\\*)?\*\*\s*$/);
		if (!boldMatch) continue;

		const name = boldMatch[1].trim();

		// Skip section-style headers (e.g. "Wizard Traditions", "Archmage Traditions")
		// whose singular counterparts already exist from table rows
		if (name.endsWith("Traditions")) continue;

		const multiple = boldMatch[2] !== undefined;

		// Look ahead for description, groups, prerequisites
		const remainingLines = lines.slice(lineNum + 1);
		const descriptionParts: string[] = [];
		let groups: string[] | null = null;
		let prereqs: string | null = null;

		for (const nextLine of remainingLines) {
			const trimmed = nextLine.trim();
			if (trimmed === "" && descriptionParts.length > 0) break;
			if (trimmed.startsWith("**")) break;
			if (trimmed.startsWith("_Groups:")) {
				const groupsStr = trimmed.replace(/^_/, "").replace(/_$/, "").replace("Groups:", "").trim();
				groups = groupsStr.split(",").map((g) => g.trim());
				continue;
			}
			if (trimmed.startsWith("_Prerequisites:")) {
				prereqs = trimmed.replace(/^_/, "").replace(/_$/, "").replace("Prerequisites:", "").trim();
				continue;
			}
			if (trimmed) {
				descriptionParts.push(trimmed);
			}
		}

		// Apply Sin prefix and dedup
		const resolvedName = currentH3 === "Daemonhost Sin Assets" ? `Sin: ${name}` : name;
		if (seen.has(resolvedName)) continue;
		seen.add(resolvedName);

		feats.push({
			name: resolvedName,
			category: currentCategory,
			effect: descriptionParts.length > 0 ? descriptionParts.join(" ") : null,
			multipleAllowed: multiple,
			groups,
			prerequisites: prereqs,
		});
	}

	return feats;
}

// ---------------------------------------------------------------------------
// Sync sources & comparison (port of parsers/sync.py)
// ---------------------------------------------------------------------------

const SYNC_SOURCES: Record<string, { mdFile: string; jsonFile: string }> = {
	races: { mdFile: "04-Races.md", jsonFile: "races.json" },
	classes: { mdFile: "06-Classes.md", jsonFile: "classes.json" },
	feats: { mdFile: "07-Feats.md", jsonFile: "feats.json" },
};

export function extractNamesFromMarkdown(source: string, content: string): string[] {
	if (source === "races") return parseRaces(content).map((r) => r.name);
	if (source === "classes") return parseClasses(content).map((c) => c.name);
	if (source === "feats") return parseFeats(content).map((f) => f.name);
	return [];
}

export function extractNamesFromJson(source: string, data: Record<string, unknown>): string[] {
	const key = source; // "races", "classes", "feats" — matches top-level key
	const list = data[key];
	if (!Array.isArray(list)) return [];
	return list.map((item: Record<string, unknown>) => item.name as string);
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** Pad string to width (right-pad). */
export function pad(str: string, width: number): string {
	return str.length >= width ? str : str + " ".repeat(width - str.length);
}

export interface SyncResult {
	matched: string[];
	onlyMd: string[];
	onlyJson: string[];
}

export function checkSync(source: string): SyncResult | null {
	if (!(source in SYNC_SOURCES)) {
		console.error(`Unknown source type: ${source}`);
		console.error(`Available: ${Object.keys(SYNC_SOURCES).join(", ")}`);
		return null;
	}

	const { mdFile, jsonFile } = SYNC_SOURCES[source];
	const mdPath = path.join(CLEANED_REFS_DIR, mdFile);
	const jsonPath = path.join(DATA_DIR, jsonFile);

	if (!fs.existsSync(mdPath)) {
		console.error(`Markdown file not found: ${mdPath}`);
		return null;
	}
	if (!fs.existsSync(jsonPath)) {
		console.error(`JSON file not found: ${jsonPath}`);
		return null;
	}

	const mdContent = fs.readFileSync(mdPath, "utf-8");
	const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

	const mdNames = extractNamesFromMarkdown(source, mdContent);
	const jsonNames = extractNamesFromJson(source, jsonData);

	const mdSet = new Set(mdNames);
	const jsonSet = new Set(jsonNames);

	const onlyMd = [...mdSet].filter((n) => !jsonSet.has(n)).sort();
	const onlyJson = [...jsonSet].filter((n) => !mdSet.has(n)).sort();
	const matched = [...mdSet].filter((n) => jsonSet.has(n)).sort();

	return { matched, onlyMd, onlyJson };
}

function displayResult(source: string, result: SyncResult): void {
	const divider = "\u2500".repeat(30);
	console.log(`\nSync Check: ${source}`);
	console.log(divider);

	// Find max name width for alignment
	const allNames = [...result.matched, ...result.onlyMd, ...result.onlyJson];
	const maxWidth = Math.max(...allNames.map((n) => n.length), 10);

	for (const name of result.matched) {
		console.log(`  \u2713 matched   ${pad(name, maxWidth)}`);
	}
	for (const name of result.onlyMd) {
		console.log(`  + new       ${pad(name, maxWidth)}  markdown only`);
	}
	for (const name of result.onlyJson) {
		console.log(`  - missing   ${pad(name, maxWidth)}  JSON only`);
	}

	const { matched, onlyMd, onlyJson } = result;
	console.log(
		`\nSummary: ${matched.length} matched, ${onlyMd.length} in markdown only, ${onlyJson.length} in JSON only`,
	);

	if (onlyMd.length === 0 && onlyJson.length === 0) {
		console.log("\u2713 Markdown and JSON are in sync (by name).");
	}
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): { sources: string[] } {
	const args = process.argv.slice(2);
	const sources: string[] = [];

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--source" && i + 1 < args.length) {
			sources.push(args[i + 1]);
			i++;
		}
	}

	// Default: check all sources
	if (sources.length === 0) {
		sources.push(...Object.keys(SYNC_SOURCES));
	}

	return { sources };
}

function main(): void {
	const { sources } = parseArgs();
	let hasIssues = false;

	for (const source of sources) {
		const result = checkSync(source);
		if (!result) {
			hasIssues = true;
			continue;
		}
		displayResult(source, result);
		if (result.onlyMd.length > 0 || result.onlyJson.length > 0) {
			hasIssues = true;
		}
	}

	if (hasIssues) {
		process.exit(1);
	}
}

// Only run when executed directly (not imported by tests)
const isDirectRun = process.argv[1] && /sync-check\.ts$/.test(process.argv[1]);
if (isDirectRun) {
	main();
}
