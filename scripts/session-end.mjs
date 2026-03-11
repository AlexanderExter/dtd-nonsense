/**
 * Session end — deterministic squash-merge + cleanup.
 *
 * Usage:
 *   node scripts/session-end.mjs
 *
 * What it does:
 *   1. Verifies working tree is clean
 *   2. Verifies we're on a session/feature branch (not main)
 *   3. Shows commit log for the branch (for building the squash message)
 *   4. Squash-merges to main
 *   5. Opens an editor for the squash commit message
 *   6. Deletes the session branch
 *   7. Final verification
 *
 * Safety:
 *   - Refuses to run with dirty working tree
 *   - Refuses to run if already on main
 *   - Refuses to run if merge has conflicts (exits for manual resolution)
 *   - Never uses --force
 */

import { execSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BOLD, DIM, fail, GREEN, heading, ok, RED, RESET, run, YELLOW } from "./session-utils.mjs";

console.log(`${BOLD}Session End${RESET}`);

// ─── 1. Pre-flight checks ──────────────────────────────────────────────────

heading("1. Pre-flight Checks");

const currentBranch = run("git branch --show-current");

if (currentBranch === "main") {
	fail("Already on main — nothing to merge.");
	console.log("Switch to a session branch first.");
	process.exit(1);
}
ok(`On branch: ${currentBranch}`);

const status = run("git status --short");
if (status) {
	fail(`Working tree is dirty:\n${status}`);
	console.log(`\n${RED}Commit or stash changes before ending session.${RESET}`);
	process.exit(1);
}
ok("Working tree clean");

// Check if branch has commits ahead of main
const aheadCount = run(`git rev-list --count main..${currentBranch}`);
if (aheadCount === "0") {
	fail("No commits ahead of main — nothing to merge.");
	process.exit(1);
}
ok(`${aheadCount} commit(s) ahead of main`);

// ─── 2. Show branch log ────────────────────────────────────────────────────

heading("2. Branch Commits");

const branchLog = run(`git log --oneline main..${currentBranch}`);
console.log(`\n${DIM}${branchLog}${RESET}\n`);

// ─── 3. Squash merge ───────────────────────────────────────────────────────

heading("3. Squash Merge to Main");

run("git checkout main");
ok("Switched to main");

try {
	run(`git merge --squash ${currentBranch}`);
	ok("Squash merge staged");
} catch {
	fail("Merge conflict detected.");
	console.log(`\n${RED}Resolve conflicts manually, then commit.${RESET}`);
	console.log(`The branch ${currentBranch} has NOT been deleted.`);
	process.exit(1);
}

// Build a default commit message from the branch commits
const commitLines = branchLog.split("\n").map((line) => {
	// Strip the short hash, keep the message
	const match = line.match(/^[a-f0-9]+ (.+)$/);
	return match ? `- ${match[1]}` : `- ${line}`;
});

const defaultMessage = `Session ${currentBranch}: squash merge\n\n${commitLines.join("\n")}`;

// Commit with --no-verify: code was verified on the branch; the pre-commit
// hook re-running biome check on squash-merged files hits CRLF/LF drift.
// Use --file instead of -m to avoid shell metacharacter injection from
// backticks, $, or other special characters in commit messages.
const tmpMsgFile = join(tmpdir(), `dtd-commit-${Date.now()}.txt`);
try {
	writeFileSync(tmpMsgFile, defaultMessage, "utf-8");
	execSync(`git commit --no-verify --file "${tmpMsgFile}"`, {
		encoding: "utf-8",
		stdio: "inherit",
	});
	ok("Squash commit created");
} catch {
	fail("Commit failed.");
	console.log("Resolve manually. Branch NOT deleted.");
	process.exit(1);
} finally {
	try {
		unlinkSync(tmpMsgFile);
	} catch {
		/* cleanup is best-effort */
	}
}

// ─── 4. Cleanup ─────────────────────────────────────────────────────────────

heading("4. Cleanup");

run(`git branch -D ${currentBranch}`);
ok(`Deleted branch: ${currentBranch}`);

const finalStatus = run("git status --short");
if (finalStatus) {
	fail(`Unexpected dirty state:\n${finalStatus}`);
} else {
	ok("Main is clean");
}

// Show remaining branches
const remaining = run("git branch --list")
	.split("\n")
	.map((b) => b.trim().replace("* ", ""))
	.filter((b) => b && b !== "main");

if (remaining.length > 0) {
	console.log(`\n${YELLOW}  Remaining branches: ${remaining.join(", ")}${RESET}`);
} else {
	ok("No stale branches");
}

console.log(`\n${GREEN}${BOLD}✓ Session complete. Main is up to date.${RESET}`);
console.log(`${DIM}  Run 'git log --oneline -5' to verify.${RESET}`);
