/**
 * Structural convention checks using ts-morph (TypeScript-aware AST analysis).
 *
 * Checks (run sequentially, all failures reported):
 *   1. Store Conventions     — every tool store.ts exports a use*Store function
 *   2. Barrel Export Completeness — core.ts re-exports all expected sub-modules
 *   3. Named Exports Only    — no default exports in components or lib
 *
 * Usage:
 *   bun run scripts/check-structure.ts
 *   bun run scripts/check-structure.ts --json    machine-readable JSON output
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = one or more checks failed
 */

import * as path from "node:path";
import { Project } from "ts-morph";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SCRIPT_DIR = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/i, "$1"));
const ROOT = path.resolve(SCRIPT_DIR, "..");

// Normalize to forward slashes for glob patterns (ts-morph uses fast-glob)
const glob = (...parts: string[]) => path.join(ROOT, ...parts).replace(/\\/g, "/");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CheckResult {
	detail: string;
	name: string;
	passed: boolean;
	violations: string[];
}

// ---------------------------------------------------------------------------
// Check 1: Store Conventions
// ---------------------------------------------------------------------------
// Every tool store.ts must export at least one function/const named use*Store.
// Tools: character-builder, character-sheet, combat-tracker, npc-generator,
//         quick-reference, ship-builder (6 stores total).

export function checkStoreConventions(project: Project): CheckResult {
	const STORE_NAME_RE = /^use[A-Z]\w+Store$/;

	const files = project.addSourceFilesAtPaths(glob("src/components/react/tools/*/store.ts"));

	const violations: string[] = [];

	for (const file of files) {
		const relPath = path.relative(ROOT, file.getFilePath()).replace(/\\/g, "/");
		const exportNames = [...file.getExportedDeclarations().keys()];
		const storeExports = exportNames.filter((name) => STORE_NAME_RE.test(name));

		if (storeExports.length === 0) {
			violations.push(`${relPath} — no use*Store export found (exports: ${exportNames.join(", ") || "none"})`);
		}
	}

	return {
		name: "Store Conventions",
		passed: violations.length === 0,
		detail: `${files.length - violations.length}/${files.length} tool stores export a use*Store function`,
		violations,
	};
}

// ---------------------------------------------------------------------------
// Check 2: Barrel Export Completeness
// ---------------------------------------------------------------------------
// core.ts is the barrel for src/lib/dtd/. It must re-export each sub-module.
// Verified specifiers must match the exact string used in the source file
// (including .ts extension, since that is what core.ts uses).

export function checkBarrelExports(project: Project): CheckResult {
	const EXPECTED: string[] = ["./character.ts", "./data.ts", "./derived.ts"];

	const coreFile = project.addSourceFileAtPath(glob("src/lib/dtd/core.ts"));

	const actualSpecifiers = coreFile
		.getExportDeclarations()
		.map((e) => e.getModuleSpecifierValue())
		.filter((s): s is string => s !== undefined);

	const missing = EXPECTED.filter((expected) => !actualSpecifiers.includes(expected));
	const violations = missing.map((m) => `core.ts is missing re-export of "${m}"`);

	return {
		name: "Barrel Export Completeness",
		passed: violations.length === 0,
		detail: `core.ts re-exports ${EXPECTED.length - missing.length}/${EXPECTED.length} expected sub-modules`,
		violations,
	};
}

// ---------------------------------------------------------------------------
// Check 3: Named Exports Only
// ---------------------------------------------------------------------------
// src/components/react/**/*.tsx and src/lib/dtd/**/*.ts must not use
// `export default`. All public API must be named for reliable tree-shaking
// and auto-import resolution.

export function checkNamedExportsOnly(project: Project): CheckResult {
	const files = project.addSourceFilesAtPaths([glob("src/components/react/**/*.tsx"), glob("src/lib/dtd/**/*.ts")]);

	const violations: string[] = [];

	for (const file of files) {
		// Test files, schema files and type declaration files are exempt
		const fp = file.getFilePath();
		if (fp.includes(".test.") || fp.includes("/schemas/")) continue;

		const relPath = path.relative(ROOT, fp).replace(/\\/g, "/");
		if (file.getExportedDeclarations().has("default")) {
			violations.push(`${relPath} — has a default export`);
		}
	}

	return {
		name: "Named Exports Only",
		passed: violations.length === 0,
		detail: violations.length === 0 ? "0 default exports found" : `${violations.length} default export(s) found`,
		violations,
	};
}

// ---------------------------------------------------------------------------
// Runner — only executes when run directly (not when imported by tests)
// ---------------------------------------------------------------------------

if (import.meta.main) {
	const IS_JSON = process.argv.includes("--json");

	const project = new Project({
		tsConfigFilePath: glob("tsconfig.json"),
		skipAddingFilesFromTsConfig: true,
	});

	const results: CheckResult[] = [
		checkStoreConventions(project),
		checkBarrelExports(project),
		checkNamedExportsOnly(project),
	];

	const allPassed = results.every((r) => r.passed);

	if (IS_JSON) {
		console.log(JSON.stringify({ passed: allPassed, checks: results }, null, 2));
	} else {
		console.log("\n── check-structure ──────────────────────────────────────────\n");
		for (const result of results) {
			const icon = result.passed ? "✔" : "✖";
			const label = result.passed ? "PASS" : "FAIL";
			console.log(`  ${icon} ${label} ${result.name}: ${result.detail}`);
			for (const v of result.violations) {
				console.log(`       ↳ ${v}`);
			}
		}
		console.log();
		if (allPassed) {
			console.log("  ✔ All structural checks passed.\n");
		} else {
			const failCount = results.filter((r) => !r.passed).length;
			console.log(`  ✖ ${failCount} check(s) failed.\n`);
		}
	}

	process.exit(allPassed ? 0 : 1);
}
