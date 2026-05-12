/**
 * Session status — quick git state report.
 *
 * Usage:
 *   node scripts/session-status.mjs
 *
 * Shows: current branch, clean/dirty, commits on branch, all branches.
 */

import { BOLD, CYAN, DIM, GREEN, RED, RESET, run, YELLOW } from "./session-utils.mjs";

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

// Stash check
try {
	const stashList = run("git stash list");
	if (stashList) {
		const stashCount = stashList.split("\n").length;
		console.log(`\n  ${RED}⚠ ${stashCount} orphaned stash(es) — review and drop:${RESET}`);
		for (const line of stashList.split("\n").slice(0, 5)) {
			console.log(`${DIM}    ${line}${RESET}`);
		}
	}
} catch {
	/* no-op */
}

console.log("");
