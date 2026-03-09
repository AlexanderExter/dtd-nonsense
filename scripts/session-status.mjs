/**
 * Session status — quick git state report.
 *
 * Usage:
 *   node scripts/session-status.mjs
 *
 * Shows: current branch, clean/dirty, commits on branch, all branches.
 */

import { execSync } from "node:child_process";

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function run(cmd) {
	return execSync(cmd, { encoding: "utf-8" }).trim();
}

console.log(`${BOLD}Session Status${RESET}`);

// Current branch
const branch = run("git branch --show-current");
console.log(`\n  Branch: ${CYAN}${branch}${RESET}`);

// Clean/dirty
const status = run("git status --short");
if (status) {
	console.log(`  State:  ${RED}dirty${RESET}`);
	const lines = status.split("\n");
	for (const line of lines.slice(0, 10)) {
		console.log(`${DIM}          ${line}${RESET}`);
	}
	if (lines.length > 10) {
		console.log(`${DIM}          ... and ${lines.length - 10} more${RESET}`);
	}
} else {
	console.log(`  State:  ${GREEN}clean${RESET}`);
}

// Commits ahead of main (if not on main)
if (branch !== "main") {
	try {
		const ahead = run(`git rev-list --count main..${branch}`);
		console.log(`  Ahead:  ${ahead} commit(s) over main`);
	} catch {
		console.log(`  Ahead:  ${YELLOW}(main branch not found)${RESET}`);
	}
}

// Recent commits
console.log(`\n  ${BOLD}Recent commits:${RESET}`);
const log = run("git log --oneline -5");
for (const line of log.split("\n")) {
	console.log(`${DIM}    ${line}${RESET}`);
}

// All branches
const branches = run("git branch --list")
	.split("\n")
	.map((b) => b.trim());
console.log(`\n  ${BOLD}Branches:${RESET}`);
for (const b of branches) {
	if (b.startsWith("* ")) {
		console.log(`    ${CYAN}${b}${RESET}`);
	} else {
		console.log(`    ${b}`);
	}
}

console.log("");
