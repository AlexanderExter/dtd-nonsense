/**
 * Maintenance Recon — comprehensive project discovery for the maintenance prompt.
 *
 * Scans the project to identify environment, package manager, toolchain, framework,
 * config files, CI setup, and maintenance scripts. Produces a normalized JSON manifest
 * that the project-maintenance prompt consumes to self-assemble its execution plan.
 *
 * Portable — works with any Node.js project regardless of toolchain.
 *
 * Output:
 *   - JSON manifest to stdout (machine-readable)
 *   - ANSI-colored summary to stderr (human-readable)
 *
 * Usage:
 *   node scripts/maintenance-recon.mjs
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

// ─── ANSI Colors (inlined for portability — no external deps) ───────────────

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

// ─── Helpers ────────────────────────────────────────────────────────────────

function heading(text) {
	console.error(`\n${BOLD}${CYAN}${text}${RESET}`);
}
function ok(text) {
	console.error(`  ${GREEN}✓${RESET} ${text}`);
}
function warn(text) {
	console.error(`  ${YELLOW}!${RESET} ${text}`);
}
function fail(text) {
	console.error(`  ${RED}✗${RESET} ${text}`);
}
function info(text) {
	console.error(`  ${DIM}${text}${RESET}`);
}

/** Run a command and return stdout, or null on failure. */
function tryRun(cmd) {
	try {
		return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
	} catch {
		return null;
	}
}

/** Run a command and parse JSON stdout, or return null on failure. */
function tryJson(cmd) {
	const raw = tryRun(cmd);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

/** Check if a file is tracked by git. */
function isGitTracked(filePath) {
	return tryRun(`git ls-files --error-unmatch "${filePath}"`) !== null;
}

/** Try to parse a JSON/JSONC file and return the parsed object, or null. */
function tryReadJson(filePath) {
	try {
		const content = readFileSync(filePath, "utf-8");
		// Try strict JSON first (handles URLs with // in strings correctly)
		try {
			return JSON.parse(content);
		} catch {
			// Fallback: strip JSONC comments while preserving quoted strings
			const stripped = content
				.replace(/("(?:[^"\\]|\\.)*")|\/\/.*$/gm, (_m, str) => str ?? "")
				.replace(/("(?:[^"\\]|\\.)*")|\/\*[\s\S]*?\*\//g, (_m, str) => str ?? "");
			return JSON.parse(stripped);
		}
	} catch {
		return null;
	}
}

/** Extract notes from a config file for the manifest. */
function getConfigNotes(filePath) {
	const notes = [];
	try {
		const content = readFileSync(filePath, "utf-8");

		if (filePath.endsWith(".json") || filePath.endsWith(".jsonc")) {
			const parsed = tryReadJson(filePath);
			if (parsed) {
				if (parsed.$schema) notes.push(`schema: ${parsed.$schema}`);
				if (parsed.extends) notes.push(`extends: ${parsed.extends}`);
			}
		}

		if (filePath === ".gitattributes") {
			if (content.includes("text=auto")) notes.push("text=auto set");
			if (content.includes("eol=lf")) notes.push("eol=lf enforced");
		}

		if (filePath === ".gitignore") {
			const patterns = content.split("\n").filter((l) => l.trim() && !l.startsWith("#")).length;
			notes.push(`${patterns} patterns`);
		}
	} catch {
		/* file unreadable — noted via parseable field */
	}

	return notes.length > 0 ? notes.join("; ") : null;
}

// ─── Config File Patterns ───────────────────────────────────────────────────

const CONFIG_PATTERNS = [
	// Version control
	{ path: ".gitignore", category: "vcs" },
	{ path: ".gitattributes", category: "vcs" },

	// Editor & IDE
	{ path: ".editorconfig", category: "editor" },
	{ path: ".vscode/settings.json", category: "editor" },
	{ path: ".vscode/extensions.json", category: "editor" },

	// Linter
	{ path: "biome.json", category: "linter" },
	{ path: "biome.jsonc", category: "linter" },
	{ path: ".eslintrc.json", category: "linter" },
	{ path: ".eslintrc.js", category: "linter" },
	{ path: ".eslintrc.cjs", category: "linter" },
	{ path: ".eslintrc.yml", category: "linter" },
	{ path: "eslint.config.js", category: "linter" },
	{ path: "eslint.config.mjs", category: "linter" },
	{ path: "eslint.config.ts", category: "linter" },

	// Formatter
	{ path: ".prettierrc", category: "formatter" },
	{ path: ".prettierrc.json", category: "formatter" },
	{ path: ".prettierrc.js", category: "formatter" },
	{ path: ".prettierrc.cjs", category: "formatter" },
	{ path: "prettier.config.js", category: "formatter" },
	{ path: "prettier.config.mjs", category: "formatter" },
	{ path: "prettier.config.cjs", category: "formatter" },

	// TypeScript
	{ path: "tsconfig.json", category: "typescript" },
	{ path: "jsconfig.json", category: "typescript" },

	// Framework
	{ path: "astro.config.mjs", category: "framework" },
	{ path: "astro.config.ts", category: "framework" },
	{ path: "astro.config.js", category: "framework" },
	{ path: "next.config.js", category: "framework" },
	{ path: "next.config.mjs", category: "framework" },
	{ path: "next.config.ts", category: "framework" },
	{ path: "svelte.config.js", category: "framework" },
	{ path: "nuxt.config.ts", category: "framework" },
	{ path: "nuxt.config.js", category: "framework" },
	{ path: "vite.config.ts", category: "framework" },
	{ path: "vite.config.js", category: "framework" },
	{ path: "vite.config.mjs", category: "framework" },

	// Package manager
	{ path: "bunfig.toml", category: "package-manager" },
	{ path: ".npmrc", category: "package-manager" },
	{ path: ".yarnrc.yml", category: "package-manager" },

	// Test runner
	{ path: "vitest.config.ts", category: "test" },
	{ path: "vitest.config.js", category: "test" },
	{ path: "vitest.config.mjs", category: "test" },
	{ path: "jest.config.js", category: "test" },
	{ path: "jest.config.ts", category: "test" },
	{ path: "jest.config.cjs", category: "test" },

	// Code quality
	{ path: "knip.json", category: "quality" },
	{ path: "knip.ts", category: "quality" },
	{ path: ".dependency-cruiser.cjs", category: "quality" },
	{ path: ".dependency-cruiser.js", category: "quality" },

	// Content linting
	{ path: ".rumdl.toml", category: "content" },
	{ path: ".markdownlint.json", category: "content" },
	{ path: ".markdownlint.jsonc", category: "content" },
	{ path: ".markdownlint.yaml", category: "content" },
	{ path: ".markdownlint-cli2.jsonc", category: "content" },

	// CI (non-directory patterns)
	{ path: ".gitlab-ci.yml", category: "ci" },
	{ path: ".circleci/config.yml", category: "ci" },
	{ path: ".travis.yml", category: "ci" },

	// Deploy
	{ path: "vercel.json", category: "deploy" },
	{ path: "netlify.toml", category: "deploy" },
	{ path: "wrangler.toml", category: "deploy" },

	// Hooks
	{ path: ".githooks/pre-commit", category: "hooks" },
	{ path: ".husky/pre-commit", category: "hooks" },

	// Lockfiles
	{ path: "bun.lock", category: "lockfile" },
	{ path: "bun.lockb", category: "lockfile" },
	{ path: "package-lock.json", category: "lockfile" },
	{ path: "yarn.lock", category: "lockfile" },
	{ path: "pnpm-lock.yaml", category: "lockfile" },
];

// ═══════════════════════════════════════════════════════════════════════════
// 1. ENVIRONMENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════

heading("Environment");

const environment = {
	os: process.platform,
	arch: process.arch,
	shell: "unknown",
	shellVersion: null,
	cwd: process.cwd(),
	isVSCode: process.env.TERM_PROGRAM === "vscode" || !!process.env.VSCODE_PID,
};

// Shell detection
if (process.platform === "win32") {
	// On Windows, cmd.exe sets the PROMPT env var (e.g. "$P$G").
	// PowerShell does NOT set PROMPT — it uses a prompt function instead.
	// Git Bash / MSYS sets SHELL (e.g. "/usr/bin/bash").
	if (process.env.SHELL) {
		environment.shell = basename(process.env.SHELL);
	} else if (process.env.PROMPT) {
		environment.shell = "cmd";
	} else {
		environment.shell = "powershell";
		const psVer = tryRun('powershell -NoProfile -Command "$PSVersionTable.PSVersion.ToString()"');
		if (psVer) environment.shellVersion = psVer;
	}
} else {
	environment.shell = process.env.SHELL ? basename(process.env.SHELL) : "unknown";
	const shellVer = tryRun(`${process.env.SHELL || "sh"} --version 2>&1 | head -1`);
	if (shellVer) environment.shellVersion = shellVer;
}

info(`OS: ${environment.os} (${environment.arch})`);
info(`Shell: ${environment.shell}${environment.shellVersion ? ` v${environment.shellVersion}` : ""}`);
info(`CWD: ${environment.cwd}`);
if (environment.isVSCode) info("Running inside VS Code");

if (process.platform === "win32" && environment.shell === "cmd") {
	warn("cmd.exe detected — PowerShell is strongly recommended");
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. PACKAGE MANAGER DETECTION
// ═══════════════════════════════════════════════════════════════════════════

heading("Package Manager");

function detectPackageManager() {
	const lockfiles = [
		{ file: "bun.lock", name: "bun", cmd: "bun --version" },
		{ file: "bun.lockb", name: "bun", cmd: "bun --version" },
		{ file: "pnpm-lock.yaml", name: "pnpm", cmd: "pnpm --version" },
		{ file: "yarn.lock", name: "yarn", cmd: "yarn --version" },
		{ file: "package-lock.json", name: "npm", cmd: "npm --version" },
	];

	for (const lf of lockfiles) {
		if (existsSync(lf.file)) {
			const version = tryRun(lf.cmd);
			return {
				name: lf.name,
				version: version || "not installed",
				lockfile: lf.file,
				lockfileCommitted: isGitTracked(lf.file),
			};
		}
	}

	// No lockfile — detect from CLI availability
	for (const pm of ["bun", "pnpm", "yarn", "npm"]) {
		const ver = tryRun(`${pm} --version`);
		if (ver) return { name: pm, version: ver, lockfile: null, lockfileCommitted: false };
	}

	return { name: "npm", version: tryRun("npm --version") || "unknown", lockfile: null, lockfileCommitted: false };
}

const packageManager = detectPackageManager();

ok(`${packageManager.name} v${packageManager.version}`);
if (packageManager.lockfile) {
	info(`Lockfile: ${packageManager.lockfile} (${packageManager.lockfileCommitted ? "git-tracked" : "not tracked"})`);
} else {
	warn("No lockfile found");
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. PACKAGE.JSON & SCRIPTS
// ═══════════════════════════════════════════════════════════════════════════

heading("Package.json & Scripts");

let pkg;
try {
	pkg = JSON.parse(readFileSync("package.json", "utf-8"));
} catch (e) {
	fail(`Cannot read package.json: ${e.message}`);
	console.log(JSON.stringify({ error: "no package.json" }, null, 2));
	process.exit(1);
}

const allScripts = pkg.scripts || {};
const scriptNames = Object.keys(allScripts);

// Detect key maintenance scripts by checking multiple naming conventions
function hasScript(...names) {
	return names.some((n) => n in allScripts);
}

const scripts = {
	hasCheck: hasScript("check"),
	hasLint: hasScript("lint"),
	hasLintFix: hasScript("lint:fix", "lint-fix"),
	hasBuild: hasScript("build"),
	hasTest: hasScript("test"),
	hasKnip: hasScript("knip"),
	hasCheckDeps: hasScript("check:deps", "check-deps"),
	hasCheckStructure: hasScript("check:structure", "check-structure"),
	hasValidate: hasScript("validate"),
	hasLintData: hasScript("lint:data", "lint-data"),
	hasLintMd: hasScript("lint:md", "lint-md"),
	hasSyncCheck: hasScript("sync-check", "sync:check"),
	hasUpgradeRecon: hasScript("upgrade:recon", "upgrade-recon"),
	hasMaintenanceRecon: hasScript("maintenance:recon", "maintenance-recon"),
	hasSessionStart: hasScript("session:start", "session-start"),
	hasSessionEnd: hasScript("session:end", "session-end"),
	all: allScripts,
};

ok(`${scriptNames.length} scripts defined`);

const keyFlags = Object.entries(scripts)
	.filter(([k, v]) => k.startsWith("has") && v === true)
	.map(([k]) =>
		k
			.replace("has", "")
			.replace(/([A-Z])/g, " $1")
			.trim(),
	);

if (keyFlags.length > 0) {
	info(`Key scripts: ${keyFlags.join(", ")}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. STACK DETECTION
// ═══════════════════════════════════════════════════════════════════════════

heading("Stack Detection");

const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

function detectStack() {
	// Framework
	let framework = "none";
	let frameworkVersion = null;
	const frameworks = [
		{ pkg: "astro", name: "astro" },
		{ pkg: "next", name: "next" },
		{ pkg: "@sveltejs/kit", name: "sveltekit" },
		{ pkg: "nuxt", name: "nuxt" },
		{ pkg: "@remix-run/react", name: "remix" },
		{ pkg: "gatsby", name: "gatsby" },
	];
	for (const fw of frameworks) {
		if (allDeps[fw.pkg]) {
			framework = fw.name;
			frameworkVersion = allDeps[fw.pkg];
			break;
		}
	}

	// If no framework detected but vite is present, it's a vite project
	if (framework === "none" && allDeps.vite) {
		framework = "vite";
		frameworkVersion = allDeps.vite;
	}

	// Linter
	let linter = "none";
	let linterVersion = null;
	if (allDeps["@biomejs/biome"]) {
		linter = "biome";
		linterVersion = allDeps["@biomejs/biome"];
	} else if (allDeps.oxlint) {
		linter = "oxlint";
		linterVersion = allDeps.oxlint;
	} else if (allDeps.eslint) {
		linter = "eslint";
		linterVersion = allDeps.eslint;
	}

	// Formatter (often overlaps with linter)
	let formatter = "none";
	if (linter === "biome") formatter = "biome";
	if (allDeps.prettier) formatter = formatter === "none" ? "prettier" : `${formatter}+prettier`;

	// Test runner
	let testRunner = "none";
	if (allDeps.vitest) {
		testRunner = "vitest";
	} else if (allDeps.jest) {
		testRunner = "jest";
	} else if (existsSync("bunfig.toml")) {
		try {
			const toml = readFileSync("bunfig.toml", "utf-8");
			if (toml.includes("[test]")) testRunner = "bun:test";
		} catch {
			/* ignore */
		}
	}

	// CSS framework
	let cssFramework = "none";
	if (allDeps.tailwindcss) cssFramework = "tailwindcss";
	else if (allDeps.unocss || allDeps["@unocss/core"]) cssFramework = "unocss";

	// UI library
	let uiLibrary = "none";
	if (allDeps.react) uiLibrary = "react";
	else if (allDeps.preact) uiLibrary = "preact";
	else if (allDeps.vue) uiLibrary = "vue";
	else if (allDeps.svelte) uiLibrary = "svelte";
	else if (allDeps["solid-js"]) uiLibrary = "solid";

	// State manager
	let stateManager = "none";
	if (allDeps.zustand) stateManager = "zustand";
	else if (allDeps["@reduxjs/toolkit"] || allDeps.redux) stateManager = "redux";
	else if (allDeps.pinia) stateManager = "pinia";
	else if (allDeps.jotai) stateManager = "jotai";

	// Deploy target
	let deployTarget = "none";
	if (allDeps["@astrojs/vercel"] || existsSync("vercel.json")) deployTarget = "vercel";
	else if (allDeps["@astrojs/netlify"] || existsSync("netlify.toml")) deployTarget = "netlify";
	else if (allDeps["@astrojs/cloudflare"] || existsSync("wrangler.toml")) deployTarget = "cloudflare";

	return {
		framework,
		frameworkVersion,
		linter,
		linterVersion,
		formatter,
		testRunner,
		cssFramework,
		uiLibrary,
		stateManager,
		deployTarget,
	};
}

const stack = detectStack();

info(`Framework: ${stack.framework}${stack.frameworkVersion ? ` (${stack.frameworkVersion})` : ""}`);
info(`Linter: ${stack.linter}${stack.linterVersion ? ` (${stack.linterVersion})` : ""}`);
info(`Formatter: ${stack.formatter}`);
info(`Test runner: ${stack.testRunner}`);
info(`CSS: ${stack.cssFramework}`);
info(`UI: ${stack.uiLibrary}`);
info(`State: ${stack.stateManager}`);
info(`Deploy: ${stack.deployTarget}`);

// ═══════════════════════════════════════════════════════════════════════════
// 5. CONFIG FILE DISCOVERY
// ═══════════════════════════════════════════════════════════════════════════

heading("Config Files");

const configFiles = [];

for (const pattern of CONFIG_PATTERNS) {
	if (!existsSync(pattern.path)) continue;

	const entry = {
		path: pattern.path,
		category: pattern.category,
		exists: true,
		parseable: null,
		notes: null,
	};

	// JSON parse check for JSON files
	if (pattern.path.endsWith(".json") || pattern.path.endsWith(".jsonc")) {
		entry.parseable = tryReadJson(pattern.path) !== null;
	}

	entry.notes = getConfigNotes(pattern.path);
	configFiles.push(entry);
}

// Special: check .github/workflows/ directory
if (existsSync(".github/workflows")) {
	try {
		const workflows = readdirSync(".github/workflows").filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
		for (const w of workflows) {
			configFiles.push({
				path: `.github/workflows/${w}`,
				category: "ci",
				exists: true,
				parseable: null,
				notes: null,
			});
		}
	} catch {
		/* directory read failed */
	}
}

ok(`${configFiles.length} config files found`);

const byCategory = {};
for (const cf of configFiles) {
	if (!byCategory[cf.category]) byCategory[cf.category] = [];
	byCategory[cf.category].push(cf.path);
}
for (const [cat, files] of Object.entries(byCategory)) {
	info(`${cat}: ${files.join(", ")}`);
}

// Report parse failures
const unparseable = configFiles.filter((cf) => cf.parseable === false);
if (unparseable.length > 0) {
	for (const cf of unparseable) {
		fail(`${cf.path} — JSON parse error`);
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. CI DETECTION
// ═══════════════════════════════════════════════════════════════════════════

heading("CI/CD");

function detectCI() {
	const ci = { system: "none", workflows: [], details: {} };

	if (existsSync(".github/workflows")) {
		ci.system = "github-actions";
		try {
			ci.workflows = readdirSync(".github/workflows").filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
		} catch {
			ci.workflows = [];
		}

		for (const file of ci.workflows) {
			try {
				const content = readFileSync(join(".github/workflows", file), "utf-8");

				// Extract action versions
				const actions = {};
				const actionRegex = /uses:\s*([^@\s]+)@([^\s]+)/g;
				let match = actionRegex.exec(content);
				while (match !== null) {
					actions[match[1]] = match[2];
					match = actionRegex.exec(content);
				}

				// Extract node version
				const nodeMatch = content.match(/node-version:\s*['"]?(\d+)['"]?/);
				// Extract bun version
				const bunMatch = content.match(/bun-version:\s*['"]?([^\s'"]+)['"]?/);

				ci.details[file] = {
					actions,
					nodeVersion: nodeMatch ? nodeMatch[1] : null,
					bunVersion: bunMatch ? bunMatch[1] : null,
				};
			} catch {
				/* file read failed */
			}
		}
	} else if (existsSync(".gitlab-ci.yml")) {
		ci.system = "gitlab-ci";
		ci.workflows = [".gitlab-ci.yml"];
	} else if (existsSync(".circleci/config.yml")) {
		ci.system = "circleci";
		ci.workflows = [".circleci/config.yml"];
	} else if (existsSync(".travis.yml")) {
		ci.system = "travis";
		ci.workflows = [".travis.yml"];
	}

	return ci;
}

const ci = detectCI();

if (ci.system === "none") {
	warn("No CI system detected");
} else {
	ok(`${ci.system} — ${ci.workflows.length} workflow(s): ${ci.workflows.join(", ")}`);
	for (const [file, details] of Object.entries(ci.details)) {
		const parts = [];
		if (details.nodeVersion) parts.push(`Node ${details.nodeVersion}`);
		if (details.bunVersion) parts.push(`Bun ${details.bunVersion}`);
		const actionCount = Object.keys(details.actions).length;
		if (actionCount > 0) parts.push(`${actionCount} actions`);
		if (parts.length > 0) info(`  ${file}: ${parts.join(", ")}`);
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. DEPENDENCY HEALTH (light — upgrade-recon handles the deep dive)
// ═══════════════════════════════════════════════════════════════════════════

heading("Dependency Health");

const dependencies = {
	engineNode: pkg.engines?.node || "not specified",
	totalDeps: Object.keys(pkg.dependencies || {}).length,
	totalDevDeps: Object.keys(pkg.devDependencies || {}).length,
	overridesCount: pkg.overrides ? Object.keys(pkg.overrides).length : 0,
	outdatedCount: null,
	treeHealthy: null,
};

// Quick outdated check
const outdatedRaw = tryJson("npm outdated --json 2>nul");
if (outdatedRaw && typeof outdatedRaw === "object") {
	dependencies.outdatedCount = Object.keys(outdatedRaw).length;
} else {
	dependencies.outdatedCount = 0;
}

// Tree health check (using detected package manager)
if (packageManager.name === "bun") {
	const tree = tryJson("bun pm ls --json --depth=1 2>nul");
	dependencies.treeHealthy = tree ? !(tree.problems && tree.problems.length > 0) : null;
} else {
	const lsOut = tryRun("npm ls --depth=1 --json 2>nul");
	if (lsOut) {
		try {
			const parsed = JSON.parse(lsOut);
			dependencies.treeHealthy = !parsed.problems || parsed.problems.length === 0;
		} catch {
			dependencies.treeHealthy = null;
		}
	}
}

info(`Engine: node ${dependencies.engineNode}`);
info(`Dependencies: ${dependencies.totalDeps} prod, ${dependencies.totalDevDeps} dev`);
if (dependencies.overridesCount > 0) warn(`${dependencies.overridesCount} dependency override(s)`);
if (dependencies.outdatedCount > 0) {
	warn(`${dependencies.outdatedCount} outdated package(s)`);
} else {
	ok("All packages up to date");
}
if (dependencies.treeHealthy === true) ok("Dependency tree healthy");
else if (dependencies.treeHealthy === false) fail("Dependency tree has problems");

// ═══════════════════════════════════════════════════════════════════════════
// 8. TOOLS AVAILABILITY
// ═══════════════════════════════════════════════════════════════════════════

heading("Tool Versions");

const tools = {
	node: tryRun("node --version") || "unknown",
	npm: tryRun("npm --version") || "unknown",
	bun: tryRun("bun --version") || null,
	ncu: tryRun("bunx npm-check-updates --version 2>nul") || tryRun("npx npm-check-updates --version 2>nul") || null,
	typescript: allDeps.typescript ? allDeps.typescript : null,
};

info(`Node: ${tools.node}`);
info(`npm: ${tools.npm}`);
if (tools.bun) info(`Bun: ${tools.bun}`);
if (tools.ncu) info(`ncu: ${tools.ncu}`);
if (tools.typescript) info(`TypeScript: ${tools.typescript} (from package.json)`);

// ═══════════════════════════════════════════════════════════════════════════
// BUILD & OUTPUT MANIFEST
// ═══════════════════════════════════════════════════════════════════════════

const manifest = {
	timestamp: new Date().toISOString(),
	environment,
	packageManager,
	tools,
	scripts,
	stack,
	configFiles,
	ci,
	dependencies,
};

// JSON manifest to stdout
console.log(JSON.stringify(manifest, null, 2));

// Final summary to stderr
heading("Summary");

const checks = [
	environment.shell !== "cmd" ? "shell" : null,
	packageManager.name !== "unknown" ? "package-manager" : null,
	configFiles.length > 0 ? "configs" : null,
	ci.system !== "none" ? "ci" : null,
	dependencies.treeHealthy !== false ? "tree" : null,
];
const passed = checks.filter(Boolean);
const total = checks.length;

console.error(`  ${passed.length === total ? GREEN : YELLOW}${passed.length}/${total}${RESET} health indicators green`);
console.error(`  ${BOLD}${configFiles.length}${RESET} config files discovered`);
console.error(`  ${BOLD}${scriptNames.length}${RESET} npm scripts available`);
console.error(`  Stack: ${stack.framework} + ${stack.linter} + ${stack.testRunner} + ${stack.uiLibrary}`);
console.error("");
