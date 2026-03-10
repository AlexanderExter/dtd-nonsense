/**
 * Shared utilities for session scripts (start, end, status).
 */

import { execSync } from "node:child_process";

export const RESET = "\x1b[0m";
export const GREEN = "\x1b[32m";
export const RED = "\x1b[31m";
export const YELLOW = "\x1b[33m";
export const CYAN = "\x1b[36m";
export const BOLD = "\x1b[1m";
export const DIM = "\x1b[2m";

export function run(cmd) {
	return execSync(cmd, { encoding: "utf-8" }).trim();
}

export function heading(text) {
	console.log(`\n${BOLD}${CYAN}${text}${RESET}`);
}

export function ok(text) {
	console.log(`  ${GREEN}✓${RESET} ${text}`);
}

export function fail(text) {
	console.log(`  ${RED}✗${RESET} ${text}`);
}
