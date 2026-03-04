/**
 * TypeScript port of pipeline/validate.py + pipeline/cli.py (validate command).
 *
 * Validates all 12 JSON data files against Zod schemas and optionally
 * runs cross-reference checks.
 *
 * Usage:
 *   bun run scripts/validate.ts          # validate all
 *   bun run scripts/validate.ts --xref   # also cross-reference check
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { ZodError } from "zod";
import { FILE_SCHEMAS, type SchemaEntry } from "../src/lib/dtd/schemas/index.ts";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SCRIPT_DIR = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/i, "$1"));
const DATA_DIR = path.resolve(SCRIPT_DIR, "..", "data");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationResult {
	file: string;
	ok: boolean;
	recordCount: number;
	errors: string[];
}

// ---------------------------------------------------------------------------
// Record counting
// ---------------------------------------------------------------------------

/** Known top-level array fields that contain the "main" records. */
const LIST_FIELDS = [
	"races",
	"classes",
	"feats",
	"skills",
	"exaltations",
	"backgrounds",
	"alignments",
	"packages",
	"hulls",
	"weapons",
] as const;

export function countRecords(data: unknown): number {
	if (Array.isArray(data)) return data.length;
	if (typeof data !== "object" || data === null) return 0;

	const obj = data as Record<string, unknown>;
	for (const field of LIST_FIELDS) {
		const val = obj[field];
		if (Array.isArray(val)) return val.length;
		// skills.json has nested dicts of arrays
		if (typeof val === "object" && val !== null && !Array.isArray(val)) {
			let total = 0;
			for (const v of Object.values(val)) {
				if (Array.isArray(v)) total += v.length;
			}
			if (total > 0) return total;
		}
	}
	return 0;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateFile(filename: string): ValidationResult {
	const entry: SchemaEntry | undefined = FILE_SCHEMAS[filename];
	if (!entry) {
		return { file: filename, ok: false, recordCount: 0, errors: [`No schema registered for ${filename}`] };
	}

	const filepath = path.join(DATA_DIR, filename);
	if (!fs.existsSync(filepath)) {
		return { file: filename, ok: false, recordCount: 0, errors: [`File not found: ${filepath}`] };
	}

	let raw: unknown;
	try {
		raw = JSON.parse(fs.readFileSync(filepath, "utf-8"));
	} catch (e) {
		return { file: filename, ok: false, recordCount: 0, errors: [`Invalid JSON: ${e}`] };
	}

	const result = entry.schema.safeParse(raw);
	if (result.success) {
		return { file: filename, ok: true, recordCount: countRecords(result.data), errors: [] };
	}

	const zodErr = result.error as ZodError;
	const errors = zodErr.issues.map((issue) => {
		const loc = issue.path.join(".");
		return `    ${loc} — ${issue.message} (${issue.code})`;
	});
	return { file: filename, ok: false, recordCount: 0, errors };
}

export function validateAll(): ValidationResult[] {
	return Object.keys(FILE_SCHEMAS)
		.sort()
		.map((filename) => validateFile(filename));
}

// ---------------------------------------------------------------------------
// Cross-reference checks
// ---------------------------------------------------------------------------

export function loadJson(filename: string): unknown {
	return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), "utf-8"));
}

export function crossReferenceCheck(): string[] {
	const issues: string[] = [];

	// 1. classes → skills
	try {
		const skillsRaw = loadJson("skills.json") as Record<string, unknown>;
		const skillNames = new Set<string>();
		const skillsMap = (skillsRaw.skills ?? {}) as Record<string, Array<{ name: string }>>;
		for (const groupList of Object.values(skillsMap)) {
			for (const skill of groupList) {
				skillNames.add(skill.name);
			}
		}

		const classesRaw = loadJson("classes.json") as Record<string, unknown>;
		const classes = (classesRaw.classes ?? []) as Array<{ name: string; skills: string[] }>;
		for (const cls of classes) {
			for (const skillName of cls.skills ?? []) {
				if (!skillNames.has(skillName)) {
					issues.push(`classes.json: class '${cls.name}' references unknown skill '${skillName}'`);
				}
			}
		}
	} catch (e) {
		issues.push(`Cross-ref check (classes→skills) failed: ${e}`);
	}

	// 2. classes → feats
	try {
		const featsRaw = loadJson("feats.json") as Record<string, unknown>;
		const featsArr = (featsRaw.feats ?? []) as Array<{ name: string }>;
		const featNames = new Set(featsArr.map((f) => f.name));

		const classesRaw = loadJson("classes.json") as Record<string, unknown>;
		const classes = (classesRaw.classes ?? []) as Array<{
			name: string;
			feats: Array<string | { name: string }>;
		}>;

		for (const cls of classes) {
			for (const featEntry of cls.feats ?? []) {
				const featName = typeof featEntry === "string" ? featEntry : featEntry.name;

				// Handle "Two Weapon Fighting OR Far Shot" OR-alternatives
				if (featName.includes(" OR ")) {
					const alternatives = featName.split(" OR ").map((s) => s.trim());
					const foundAny = alternatives.some((alt) => {
						const base = alt.includes(" (") ? alt.split(" (")[0] : alt;
						return featNames.has(base) || featNames.has(alt);
					});
					if (!foundAny) {
						issues.push(`classes.json: class '${cls.name}' references unknown feat '${featName}'`);
					}
					continue;
				}

				// Strip parenthetical variants like "Skill Focus (Any Lore)"
				const baseName = featName.includes(" (") ? featName.split(" (")[0] : featName;
				if (!featNames.has(baseName) && !featNames.has(featName)) {
					issues.push(`classes.json: class '${cls.name}' references unknown feat '${featName}'`);
				}
			}
		}
	} catch (e) {
		issues.push(`Cross-ref check (classes→feats) failed: ${e}`);
	}

	// 3. npcs → traits
	try {
		const traitsRaw = loadJson("traits.json") as Array<{ id: string; name: string }>;
		const traitNames = new Set(traitsRaw.map((t) => t.name));
		const traitIds = new Set(traitsRaw.map((t) => t.id));

		const npcsRaw = loadJson("npc-templates.json") as Array<{
			name: string;
			traits: Array<string | { id: string; param?: unknown }>;
		}>;

		for (const npc of npcsRaw) {
			for (const traitRef of npc.traits ?? []) {
				if (typeof traitRef === "object" && traitRef !== null) {
					const traitId = (traitRef as { id: string }).id ?? "";
					if (!traitIds.has(traitId)) {
						issues.push(`npc-templates.json: NPC '${npc.name}' references unknown trait id '${traitId}'`);
					}
				} else {
					// String refs may have parameters like "Fear (3)" — strip those
					const baseTrait =
						typeof traitRef === "string" && traitRef.includes(" (")
							? traitRef.split(" (")[0]
							: String(traitRef);
					if (!traitNames.has(baseTrait)) {
						issues.push(`npc-templates.json: NPC '${npc.name}' references unknown trait '${traitRef}'`);
					}
				}
			}
		}
	} catch (e) {
		issues.push(`Cross-ref check (npcs→traits) failed: ${e}`);
	}

	return issues;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main(): void {
	const args = process.argv.slice(2);
	const xref = args.includes("--xref");

	// ── Schema validation ──────────────────────────────────────────────
	const results = validateAll();

	console.log("\nSchema Validation");
	console.log("─".repeat(50));

	let allOk = true;
	for (const r of results) {
		const padded = r.file.padEnd(24);
		if (r.ok) {
			console.log(`  ${padded} ✓   ${r.recordCount} records`);
		} else {
			allOk = false;
			console.log(`  ${padded} ✗`);
			for (const err of r.errors.slice(0, 5)) {
				console.log(err);
			}
			if (r.errors.length > 5) {
				console.log(`    ... and ${r.errors.length - 5} more`);
			}
		}
	}

	// ── Cross-reference checks ─────────────────────────────────────────
	if (xref) {
		console.log("\nCross-reference checks:");
		const issues = crossReferenceCheck();
		if (issues.length > 0) {
			for (const issue of issues) {
				console.log(`  ⚠ ${issue}`);
			}
			allOk = false;
		} else {
			console.log("  ✓ All cross-references valid");
		}
	}

	// ── Summary ────────────────────────────────────────────────────────
	const passed = results.filter((r) => r.ok).length;
	const total = results.length;

	if (allOk) {
		console.log(`\nAll ${total} files validated successfully.\n`);
	} else {
		console.log(`\n${total - passed}/${total} files failed validation.\n`);
		process.exit(1);
	}
}

// Only run when executed directly (not imported by tests)
const isDirectRun = process.argv[1] && /validate\.ts$/.test(process.argv[1]);
if (isDirectRun) {
	main();
}
