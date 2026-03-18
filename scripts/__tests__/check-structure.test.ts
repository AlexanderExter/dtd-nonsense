import { describe, expect, it } from "bun:test";
import * as path from "node:path";
import { Project } from "ts-morph";
import { checkBarrelExports, checkNamedExportsOnly, checkStoreConventions } from "../check-structure.ts";

// ---------------------------------------------------------------------------
// Helpers — the real check functions use the ts-morph Project from
// tsconfig.json and addSourceFilesAtPaths with globs against the real codebase.
// For unit tests we run the checks against the ACTUAL project files
// (integration-style) since the functions are tightly coupled to path globs.
//
// A single shared Project is created once (cold-start ~3-5s on Windows) and
// reused across all tests. This is safe because every check function calls
// addSourceFilesAtPaths which is additive and idempotent.
// ---------------------------------------------------------------------------

const ROOT = path.resolve(import.meta.dir, "../..");
const tsConfigFilePath = path.join(ROOT, "tsconfig.json").replace(/\\/g, "/");

const sharedProject = new Project({
	tsConfigFilePath,
	skipAddingFilesFromTsConfig: true,
});

// ---------------------------------------------------------------------------
// checkStoreConventions
// ---------------------------------------------------------------------------
describe("checkStoreConventions", () => {
	it("passes with current codebase (all 6 stores export use*Store)", () => {
		const result = checkStoreConventions(sharedProject);
		expect(result.passed).toBe(true);
		expect(result.violations).toHaveLength(0);
		expect(result.detail).toContain("6/6");
	});

	it("returns name 'Store Conventions'", () => {
		const result = checkStoreConventions(sharedProject);
		expect(result.name).toBe("Store Conventions");
	});
});

// ---------------------------------------------------------------------------
// checkBarrelExports
// ---------------------------------------------------------------------------
describe("checkBarrelExports", () => {
	it("passes with current codebase (core.ts re-exports all expected modules)", () => {
		const result = checkBarrelExports(sharedProject);
		expect(result.passed).toBe(true);
		expect(result.violations).toHaveLength(0);
	});

	it("returns name 'Barrel Export Completeness'", () => {
		const result = checkBarrelExports(sharedProject);
		expect(result.name).toBe("Barrel Export Completeness");
	});

	it("reports expected module count in detail", () => {
		const result = checkBarrelExports(sharedProject);
		expect(result.detail).toContain("3/3");
	});
});

// ---------------------------------------------------------------------------
// checkNamedExportsOnly
// ---------------------------------------------------------------------------
describe("checkNamedExportsOnly", () => {
	it("passes with current codebase (no default exports in components/lib)", () => {
		const result = checkNamedExportsOnly(sharedProject);
		expect(result.passed).toBe(true);
		expect(result.violations).toHaveLength(0);
	});

	it("returns name 'Named Exports Only'", () => {
		const result = checkNamedExportsOnly(sharedProject);
		expect(result.name).toBe("Named Exports Only");
	});

	it("reports 0 default exports in detail", () => {
		const result = checkNamedExportsOnly(sharedProject);
		expect(result.detail).toBe("0 default exports found");
	});
});
