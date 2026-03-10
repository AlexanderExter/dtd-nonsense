/**
 * Session start — deterministic branch setup + baseline verification.
 *
 * Usage:
 *   node scripts/session-start.mjs                  # creates session-YYYY-MM-DD
 *   node scripts/session-start.mjs my-feature       # creates my-feature branch
 *
 * What it does:
 *   1. Reports current git state (branch, clean/dirty, recent commits)
 *   2. Creates or switches to the target branch
 *   3. Runs `npm run check` for green baseline
 *
 * What it does NOT do:
 *   - Handle dirty working trees (reports and exits — agent/user decides)
 *   - Fix failing checks (reports and exits)
 *   - Force anything (no --force, no stash, no reset)
 */

import { execSync } from "node:child_process";
import { BOLD, DIM, fail, GREEN, heading, ok, RED, RESET, run } from "./session-utils.mjs";

// ─── Determine target branch name ───────────────────────────────────────────

const customName = process.argv[2];
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const targetBranch = customName || `session-${today}`;

console.log(`${BOLD}Session Start${RESET}  ${DIM}target: ${targetBranch}${RESET}`);

// ─── 1. Report git state ────────────────────────────────────────────────────

heading("1. Git State");

const currentBranch = run("git branch --show-current");
ok(`Current branch: ${currentBranch}`);

const status = run("git status --short");
if (status) {
	fail(`Working tree is dirty:\n${status}`);
	console.log(`\n${RED}Cannot start session with uncommitted changes.${RESET}`);
	console.log("Commit, stash, or discard changes first, then re-run.");
	process.exit(1);
} else {
	ok("Working tree clean");
}

const recentCommits = run("git log --oneline -5");
console.log(`\n${DIM}  Recent commits:${RESET}`);
for (const line of recentCommits.split("\n")) {
	console.log(`    ${DIM}${line}${RESET}`);
}

// ─── 2. Branch setup ────────────────────────────────────────────────────────

heading("2. Branch Setup");

const allBranches = run("git branch --list")
	.split("\n")
	.map((b) => b.trim().replace("* ", ""));

if (currentBranch === targetBranch) {
	ok(`Already on ${targetBranch}`);
} else if (allBranches.includes(targetBranch)) {
	run(`git checkout ${targetBranch}`);
	ok(`Switched to existing branch: ${targetBranch}`);
} else {
	// Create from main
	if (currentBranch !== "main") {
		run("git checkout main");
	}
	run(`git checkout -b ${targetBranch}`);
	ok(`Created new branch: ${targetBranch} (from main)`);
}

// ─── 3. Baseline verification ───────────────────────────────────────────────

heading("3. Baseline Verification (npm run check)");
console.log("");

try {
	execSync("npm run check", { stdio: "inherit" });
	console.log(`\n${GREEN}${BOLD}✓ Baseline green — ready to work.${RESET}`);
} catch {
	console.log(`\n${RED}${BOLD}✗ Baseline check failed.${RESET}`);
	console.log("Fix failing checks before starting work.");
	process.exit(1);
}
