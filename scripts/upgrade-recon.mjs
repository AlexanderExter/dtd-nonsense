/**
 * Upgrade Recon — gather dependency state, tree health, audit results, and tool availability.
 *
 * Usage:
 *   node scripts/upgrade-recon.mjs
 *   bun run upgrade:recon
 *
 * Output:
 *   - JSON manifest to stdout (machine-readable for the upgrade prompt)
 *   - ANSI-colored summary to stderr (human-readable)
 *
 * No external dependencies — uses npm CLI commands and parses JSON output.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { BOLD, CYAN, DIM, GREEN, RED, RESET, YELLOW } from "./session-utils.mjs";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Write heading to stderr (human-readable output). */
function heading(text) {
	console.error(`\n${BOLD}${CYAN}${text}${RESET}`);
}

/** Write success to stderr. */
function ok(text) {
	console.error(`  ${GREEN}✓${RESET} ${text}`);
}

/** Write failure to stderr. */
function fail(text) {
	console.error(`  ${RED}✗${RESET} ${text}`);
}

/** Run a command and return stdout, or null on failure. */
function tryRun(cmd) {
	try {
		return execSync(cmd, {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
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

/** Classify a dep into a tier based on package name. */
function classifyDep(name) {
	const framework = ["astro", "@astrojs/starlight", "@astrojs/vercel"];
	const toolchain = ["@biomejs/biome", "typescript", "vitest", "tsx"];
	if (framework.includes(name)) return "framework";
	if (toolchain.includes(name)) return "toolchain";
	return "utility";
}

/** Determine bump type from two semver strings. */
function bumpType(current, latest) {
	if (!current || !latest) return "unknown";
	const [cMaj, cMin] = current.split(".").map(Number);
	const [lMaj, lMin] = latest.split(".").map(Number);
	if (lMaj > cMaj) return "major";
	if (lMin > cMin) return "minor";
	return "patch";
}

/** Check if a version specifier is pinned (exact, no range prefix). */
function isPinned(specifier) {
	if (!specifier) return false;
	return /^\d/.test(specifier);
}

// ─── Tool Detection ──────────────────────────────────────────────────────────

heading("Upgrade Recon");

const tools = {};

// Node version
const nodeVersion = tryRun("node --version");
tools.node = nodeVersion || "unknown";

// npm version
const npmVersion = tryRun("npm --version");
tools.npm = npmVersion || "unknown";

// ncu (npm-check-updates) — use the full package name to avoid collisions
const ncuVersion = tryRun("bunx npm-check-updates --version");
tools.ncu = ncuVersion || null;

// Bun
const bunVersion = tryRun("bun --version");
tools.bun = bunVersion || null;

console.error(`  ${DIM}Node:${RESET} ${tools.node}`);
console.error(`  ${DIM}npm:${RESET}  ${tools.npm}`);
console.error(`  ${DIM}ncu:${RESET}  ${tools.ncu || `${RED}not found${RESET}`}`);
console.error(`  ${DIM}Bun:${RESET}  ${tools.bun || `${YELLOW}not found${RESET}`}`);

// ─── Read package.json ───────────────────────────────────────────────────────

let pkg;
try {
	pkg = JSON.parse(readFileSync("package.json", "utf-8"));
} catch (e) {
	console.error(`${RED}Failed to read package.json: ${e.message}${RESET}`);
	process.exit(1);
}

const engineNode = pkg.engines?.node || "not specified";

// ─── Outdated Packages ──────────────────────────────────────────────────────

heading("Outdated Packages");

// npm outdated --json exits non-zero when packages are outdated, so we catch that
const outdatedRaw = tryJson("npm outdated --json");
const outdated = [];

if (outdatedRaw && typeof outdatedRaw === "object") {
	const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

	for (const [name, info] of Object.entries(outdatedRaw)) {
		const current = info.current || "missing";
		const wanted = info.wanted || current;
		const latest = info.latest || wanted;
		const specifier = allDeps[name] || "";
		const isDev = name in (pkg.devDependencies || {});

		const entry = {
			name,
			current,
			wanted,
			latest,
			bumpType: bumpType(current, latest),
			pinned: isPinned(specifier),
			specifier,
			tier: classifyDep(name),
			dev: isDev,
		};
		outdated.push(entry);
	}
}

if (outdated.length === 0) {
	ok("All packages up to date");
} else {
	const majors = outdated.filter((d) => d.bumpType === "major");
	const minors = outdated.filter((d) => d.bumpType === "minor");
	const patches = outdated.filter((d) => d.bumpType === "patch");

	console.error(
		`  ${BOLD}${outdated.length}${RESET} outdated: ${RED}${majors.length} major${RESET}, ${YELLOW}${minors.length} minor${RESET}, ${GREEN}${patches.length} patch${RESET}`,
	);

	for (const dep of outdated) {
		const color = dep.bumpType === "major" ? RED : dep.bumpType === "minor" ? YELLOW : GREEN;
		const pin = dep.pinned ? " (pinned)" : "";
		console.error(
			`  ${color}${dep.bumpType.padEnd(5)}${RESET} ${dep.name} ${DIM}${dep.current} → ${dep.latest}${RESET} [${dep.tier}]${pin}`,
		);
	}
}

// ─── Tree Health ─────────────────────────────────────────────────────────────

heading("Tree Health");

const treeHealth = { valid: true, problems: [] };

// bun pm ls --json can be very large; we just check for problems
const treeRaw = tryJson("bun pm ls --json --depth=1");
if (treeRaw) {
	if (treeRaw.problems && Array.isArray(treeRaw.problems)) {
		treeHealth.valid = false;
		treeHealth.problems = treeRaw.problems;
	}
}

if (treeHealth.valid) {
	ok("Dependency tree healthy — no unmet peers or invalid entries");
} else {
	fail(`${treeHealth.problems.length} tree problem(s)`);
	for (const p of treeHealth.problems.slice(0, 10)) {
		console.error(`    ${DIM}${p}${RESET}`);
	}
}

// ─── Security Audit ──────────────────────────────────────────────────────────

heading("Security Audit");

const audit = {
	total: 0,
	critical: 0,
	high: 0,
	moderate: 0,
	low: 0,
	info: 0,
	advisories: [],
};

// npm audit --json exits non-zero when vulnerabilities exist
const auditRaw = tryJson("npm audit --json");
if (auditRaw) {
	const meta = auditRaw.metadata?.vulnerabilities || {};
	audit.critical = meta.critical || 0;
	audit.high = meta.high || 0;
	audit.moderate = meta.moderate || 0;
	audit.low = meta.low || 0;
	audit.info = meta.info || 0;
	audit.total = audit.critical + audit.high + audit.moderate + audit.low + audit.info;

	// Extract advisory summaries
	if (auditRaw.vulnerabilities) {
		for (const [name, vuln] of Object.entries(auditRaw.vulnerabilities)) {
			audit.advisories.push({
				name,
				severity: vuln.severity,
				title: vuln.via?.[0]?.title || vuln.via?.[0] || "unknown",
				fixAvailable: vuln.fixAvailable || false,
			});
		}
	}
}

if (audit.total === 0) {
	ok("No known vulnerabilities");
} else {
	const parts = [];
	if (audit.critical) parts.push(`${RED}${audit.critical} critical${RESET}`);
	if (audit.high) parts.push(`${RED}${audit.high} high${RESET}`);
	if (audit.moderate) parts.push(`${YELLOW}${audit.moderate} moderate${RESET}`);
	if (audit.low) parts.push(`${DIM}${audit.low} low${RESET}`);
	console.error(`  ${audit.total} vulnerabilities: ${parts.join(", ")}`);
}

// ─── Overrides ───────────────────────────────────────────────────────────────

heading("Dependency Overrides");

const overrides = [];
if (pkg.overrides) {
	for (const [parent, constraint] of Object.entries(pkg.overrides)) {
		if (typeof constraint === "object") {
			for (const [depName, version] of Object.entries(constraint)) {
				overrides.push({
					parent,
					package: depName,
					constraint: version,
					comment: pkg._comments?.overrides || null,
				});
			}
		} else {
			overrides.push({
				parent: null,
				package: parent,
				constraint,
				comment: pkg._comments?.overrides || null,
			});
		}
	}
}

if (overrides.length === 0) {
	ok("No dependency overrides");
} else {
	for (const o of overrides) {
		const via = o.parent ? ` (via ${o.parent})` : "";
		console.error(`  ${YELLOW}override${RESET} ${o.package}: ${o.constraint}${via}`);
		if (o.comment) {
			console.error(`    ${DIM}${o.comment}${RESET}`);
		}
	}
}

// ─── Framework Compatibility ─────────────────────────────────────────────────

heading("Framework Compatibility");

const frameworkDeps = outdated.filter((d) => d.tier === "framework");
const frameworkCompat = [];

for (const dep of frameworkDeps) {
	const entry = {
		name: dep.name,
		from: dep.current,
		to: dep.latest,
		migrationGuides: [],
	};

	// Check peer deps for Starlight → Astro coupling
	if (dep.name === "@astrojs/starlight") {
		const peers = tryJson(`npm view @astrojs/starlight@${dep.latest} peerDependencies --json`);
		if (peers?.astro) {
			entry.requiredAstro = peers.astro;
		}
		entry.migrationGuides.push("https://starlight.astro.build/guides/upgrade/");
		entry.migrationGuides.push(
			`https://github.com/withastro/starlight/releases/tag/%40astrojs%2Fstarlight%40${dep.latest}`,
		);
	}

	if (dep.name === "astro" && dep.bumpType === "major") {
		const majorVersion = dep.latest.split(".")[0];
		entry.migrationGuides.push(`https://docs.astro.build/en/guides/upgrade-to/v${majorVersion}/`);
	}

	if (dep.name === "@astrojs/vercel") {
		const peers = tryJson(`npm view @astrojs/vercel@${dep.latest} peerDependencies --json`);
		if (peers?.astro) {
			entry.requiredAstro = peers.astro;
		}
	}

	frameworkCompat.push(entry);
}

if (frameworkCompat.length === 0) {
	ok("Framework packages up to date — no compatibility check needed");
} else {
	for (const fc of frameworkCompat) {
		console.error(`  ${CYAN}${fc.name}${RESET} ${fc.from} → ${fc.to}`);
		if (fc.requiredAstro) {
			console.error(`    ${DIM}requires astro: ${fc.requiredAstro}${RESET}`);
		}
		for (const url of fc.migrationGuides) {
			console.error(`    ${DIM}guide: ${url}${RESET}`);
		}
	}
}

// ─── Engine Requirements ─────────────────────────────────────────────────────

heading("Engine Requirements");

const engineIssues = [];
const majorBumps = outdated.filter((d) => d.bumpType === "major");

for (const dep of majorBumps) {
	const engines = tryJson(`npm view ${dep.name}@${dep.latest} engines --json`);
	if (engines?.node) {
		// Simple check: extract minimum version from engines.node (e.g., ">=22" → 22)
		const match = engines.node.match(/(\d+)/);
		if (match) {
			const required = Number.parseInt(match[1], 10);
			// Extract current minimum from package.json engines.node
			const currentMatch = engineNode.match(/(\d+)/);
			const current = currentMatch ? Number.parseInt(currentMatch[1], 10) : 0;

			if (required > current) {
				engineIssues.push({
					package: dep.name,
					version: dep.latest,
					requiredNode: engines.node,
					currentEngine: engineNode,
				});
			}
		}
	}
}

if (engineIssues.length === 0) {
	ok(`All upgrades compatible with current engine requirement (node ${engineNode})`);
} else {
	for (const issue of engineIssues) {
		fail(`${issue.package}@${issue.version} requires node ${issue.requiredNode} (current: ${issue.currentEngine})`);
	}
}

// ─── Build Manifest ──────────────────────────────────────────────────────────

const manifest = {
	timestamp: new Date().toISOString(),
	tools,
	engineNode,
	outdated,
	treeHealth,
	audit,
	overrides,
	frameworkCompat,
	engineIssues,
};

// Output JSON manifest to stdout
console.log(JSON.stringify(manifest, null, 2));

// Final summary to stderr
console.error(`\n${BOLD}${CYAN}Summary${RESET}`);
console.error(`  ${DIM}Outdated:${RESET}   ${outdated.length} packages`);
console.error(`  ${DIM}Audit:${RESET}      ${audit.total} vulnerabilities`);
console.error(`  ${DIM}Overrides:${RESET}  ${overrides.length}`);
console.error(`  ${DIM}Tree:${RESET}       ${treeHealth.valid ? "healthy" : `${treeHealth.problems.length} problems`}`);
console.error(
	`  ${DIM}Engine:${RESET}     ${engineIssues.length === 0 ? "compatible" : `${engineIssues.length} conflicts`}`,
);
console.error(`  ${DIM}ncu:${RESET}        ${tools.ncu ? "available" : "not installed — prompt will bootstrap"}`);
console.error(`  ${DIM}Bun:${RESET}        ${tools.bun ? "available" : "not found"}`);
console.error("");
