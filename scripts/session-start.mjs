/**
 * Session start — deterministic branch setup + baseline verification.
 *
 * Usage:
 *   node scripts/session-start.mjs                  # creates session-YYYY-MM-DD
 *   node scripts/session-start.mjs my-feature       # creates my-feature branch
 *
 * What it does:
 *   1. Reports current git state (branch, clean/dirty, recent commits)
 *   2. Warns about orphaned stashes (stashes are banned — changes belong on branches)
 *   3. Creates or switches to the target branch
 *   4. If the working tree was dirty, carries changes into the session branch
 *      via an automatic "wip: carry uncommitted changes" commit
 *   5. Runs `bun run check` for green baseline
 *
 * What it does NOT do:
 *   - Stash anything (stashes lose work into limbo — never use git stash)
 *   - Force anything (no --force, no reset)
 *   - Fix failing checks (reports and exits)
 */

import { execSync } from "node:child_process";
import { BOLD, DIM, GREEN, heading, ok, RED, RESET, run, YELLOW } from "./session-utils.mjs";

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
let hadDirtyTree = false;
if (status) {
	console.log(`${YELLOW}  ⚠ Working tree has uncommitted changes:${RESET}`);
	const lines = status.split("\n");
	for (const line of lines.slice(0, 10)) {
		console.log(`${DIM}    ${line}${RESET}`);
	}
	if (lines.length > 10) {
		console.log(`${DIM}    ... and ${lines.length - 10} more${RESET}`);
	}
	hadDirtyTree = true;
	console.log(`${DIM}  Changes will be carried into the session branch.${RESET}`);
} else {
	ok("Working tree clean");
}

// Check for orphaned stashes
try {
	const stashList = run("git stash list");
	if (stashList) {
		const stashCount = stashList.split("\n").length;
		console.log(`\n${RED}  ⚠ ${stashCount} orphaned stash(es) found:${RESET}`);
		for (const line of stashList.split("\n").slice(0, 5)) {
			console.log(`${DIM}    ${line}${RESET}`);
		}
		console.log(`${YELLOW}  Stashes lose work into limbo. Review and apply or drop them:${RESET}`);
		console.log(`${DIM}    git stash pop   # apply most recent stash${RESET}`);
		console.log(`${DIM}    git stash drop  # discard most recent stash${RESET}`);
	}
} catch {
	/* stash list can't really fail, but don't block session start */
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
	if (hadDirtyTree) {
		// Stage everything so checkout can carry changes
		run("git add -A");
	}
	run(`git checkout ${targetBranch}`);
	ok(`Switched to existing branch: ${targetBranch}`);
} else {
	// Create from main — dirty tree rides along automatically
	if (currentBranch !== "main") {
		if (hadDirtyTree) {
			run("git add -A");
		}
		run("git checkout main");
	}
	run(`git checkout -b ${targetBranch}`);
	ok(`Created new branch: ${targetBranch} (from main)`);
}

// If we carried a dirty tree, commit it as WIP on the session branch
if (hadDirtyTree) {
	run("git add -A");
	try {
		run('git commit --no-verify -m "wip: carry uncommitted changes from previous session"');
		ok("Committed pre-existing changes to session branch");
	} catch {
		// Nothing to commit (changes may have been empty after checkout)
		ok("No changes to carry (already clean after branch switch)");
	}
}

// ─── 3. Baseline verification ───────────────────────────────────────────────

heading("3. Baseline Verification (bun run check)");
console.log("");

try {
	execSync("bun run check", { stdio: "inherit" });
	console.log(`\n${GREEN}${BOLD}✓ Baseline green — ready to work.${RESET}`);
} catch {
	console.log(`\n${RED}${BOLD}✗ Baseline check failed.${RESET}`);
	console.log("Fix failing checks before starting work.");
	process.exit(1);
}
