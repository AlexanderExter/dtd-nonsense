/**
 * TypeScript port of pipeline/linting/ — markdown linter for terminology,
 * formatting, and encoding issues.
 *
 * Usage:
 *   bun run scripts/lint.ts                           # lint all targets
 *   bun run scripts/lint.ts --target books             # lint only books/
 *   bun run scripts/lint.ts --target cleaned-references
 *   bun run scripts/lint.ts --target docs              # lint docs/
 *   bun run scripts/lint.ts --fix                      # apply safe auto-corrections
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SCRIPT_DIR = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/i, "$1"));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const BOOKS_DIR = path.join(PROJECT_ROOT, "books");
const CLEANED_REFS_DIR = path.join(PROJECT_ROOT, "cleaned-references");
const DOCS_DIR = path.join(PROJECT_ROOT, "docs");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LintIssue {
	file: string;
	line: number;
	column: number;
	severity: "error" | "warning" | "info";
	rule: string;
	message: string;
	suggestion?: string;
}

export type Target = "books" | "cleaned-references" | "docs" | "all";

// ---------------------------------------------------------------------------
// Terminology rules
// ---------------------------------------------------------------------------

interface TermRule {
	pattern: RegExp;
	replacement: string;
	reason: string;
}

const TERM_REPLACEMENTS: TermRule[] = [
	{
		pattern: /\bArmour\b/g,
		replacement: "Armor",
		reason: "Use American English spelling 'Armor'",
	},
	{
		pattern: /\bPersuade\b/g,
		replacement: "Persuasion",
		reason: "Canonical skill name is 'Persuasion'",
	},
	{
		pattern: /\bBallistic\b(?!s| [A-Z]| weapon)/gi,
		replacement: "Ballistics",
		reason: "Canonical skill name is 'Ballistics'",
	},
	{
		pattern: /\bFate Points?\b/g,
		replacement: "Hero Points",
		reason: "D:TD uses 'Hero Points', not 'Fate Points'",
	},
	{
		pattern: /\bDifficulty Class\b/g,
		replacement: "Target Number",
		reason: "D:TD uses 'Target Number' (TN), not 'Difficulty Class'",
	},
	{
		pattern: /\b(?<!\w)DC\b(?!\w)/g,
		replacement: "TN",
		reason: "D:TD uses 'TN', not 'DC'",
	},
];

// ---------------------------------------------------------------------------
// Frontmatter / code-block tracking helpers
// ---------------------------------------------------------------------------

export interface BlockTracker {
	inFrontmatter: boolean;
	frontmatterCount: number;
	inCodeBlock: boolean;
}

export function newTracker(): BlockTracker {
	return { inFrontmatter: false, frontmatterCount: 0, inCodeBlock: false };
}

/**
 * Update tracker state for the current line.
 * Returns `true` if the line should be skipped (inside frontmatter or code block).
 */
export function updateTracker(tracker: BlockTracker, stripped: string): boolean {
	if (stripped === "---") {
		tracker.frontmatterCount++;
		if (tracker.frontmatterCount === 1) {
			tracker.inFrontmatter = true;
		} else if (tracker.frontmatterCount === 2) {
			tracker.inFrontmatter = false;
		}
		return true;
	}
	if (tracker.inFrontmatter) return true;

	if (stripped.startsWith("```")) {
		tracker.inCodeBlock = !tracker.inCodeBlock;
		return true;
	}
	return tracker.inCodeBlock;
}

// ---------------------------------------------------------------------------
// 1. Terminology check
// ---------------------------------------------------------------------------

export function checkTerminology(filepath: string, lines: string[]): LintIssue[] {
	const issues: LintIssue[] = [];
	const tracker = newTracker();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const stripped = line.trim();

		if (updateTracker(tracker, stripped)) continue;

		for (const rule of TERM_REPLACEMENTS) {
			for (const match of line.matchAll(rule.pattern)) {
				issues.push({
					file: filepath,
					line: i + 1,
					column: match.index + 1,
					severity: "warning",
					rule: "terminology",
					message: `'${match[0]}' → '${rule.replacement}': ${rule.reason}`,
					suggestion: rule.replacement,
				});
			}
		}
	}

	return issues;
}

// ---------------------------------------------------------------------------
// 2. Dice notation check
// ---------------------------------------------------------------------------

const DICE_PATTERN = /(?<!`)\b(\d+k\d+)\b(?!`)/g;

export function checkDiceNotation(filepath: string, lines: string[]): LintIssue[] {
	const issues: LintIssue[] = [];
	const tracker = newTracker();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const stripped = line.trim();

		if (updateTracker(tracker, stripped)) continue;

		for (const match of line.matchAll(DICE_PATTERN)) {
			// Don't flag if already inside inline code (odd number of backticks before match)
			const before = line.slice(0, match.index);
			if (before.split("`").length % 2 === 0) continue;

			issues.push({
				file: filepath,
				line: i + 1,
				column: match.index + 1,
				severity: "info",
				rule: "dice-notation",
				message: `Dice notation '${match[1]}' should be in backticks: \`${match[1]}\``,
				suggestion: `\`${match[1]}\``,
			});
		}
	}

	return issues;
}

// ---------------------------------------------------------------------------
// 3. Formula symbol check
// ---------------------------------------------------------------------------

const FORMULA_INDICATORS = /(?:Static Defense|Hit Points|Mental Defense|Speed|Resilience|Initiative)/;
const MULT_X_PATTERN = /(?<=\d)\s*x\s*(?=\d)/g;

export function checkFormulaSymbols(filepath: string, lines: string[]): LintIssue[] {
	const issues: LintIssue[] = [];
	const tracker = newTracker();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const stripped = line.trim();

		if (updateTracker(tracker, stripped)) continue;

		if (!FORMULA_INDICATORS.test(line)) continue;

		for (const match of line.matchAll(MULT_X_PATTERN)) {
			issues.push({
				file: filepath,
				line: i + 1,
				column: match.index + 1,
				severity: "warning",
				rule: "formula-symbol",
				message: "Use '\u00d7' (multiplication sign) instead of 'x' in formulas",
				suggestion: "\u00d7",
			});
		}
	}

	return issues;
}

// ---------------------------------------------------------------------------
// 4. Heading hierarchy check
// ---------------------------------------------------------------------------

const HEADING_PATTERN = /^(#{1,6})\s/;

export function checkHeadingHierarchy(filepath: string, lines: string[]): LintIssue[] {
	const issues: LintIssue[] = [];
	const tracker = newTracker();
	let lastLevel = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const stripped = line.trim();

		if (updateTracker(tracker, stripped)) continue;

		const headingMatch = HEADING_PATTERN.exec(line);
		if (headingMatch) {
			const level = headingMatch[1].length;
			if (lastLevel > 0 && level > lastLevel + 1) {
				issues.push({
					file: filepath,
					line: i + 1,
					column: 1,
					severity: "warning",
					rule: "heading-hierarchy",
					message: `Heading level skipped: H${lastLevel} \u2192 H${level} (expected H${lastLevel + 1})`,
				});
			}
			lastLevel = level;
		}
	}

	return issues;
}

// ---------------------------------------------------------------------------
// 5. Empty table cell check
// ---------------------------------------------------------------------------

const SEPARATOR_ROW = /^\|[\s\-:|]+\|$/;

export function checkEmptyTableCells(filepath: string, lines: string[]): LintIssue[] {
	const issues: LintIssue[] = [];
	const tracker = newTracker();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const stripped = line.trim();

		if (updateTracker(tracker, stripped)) continue;

		// Skip separator rows
		if (SEPARATOR_ROW.test(stripped)) continue;

		// Check table rows
		if (stripped.startsWith("|") && stripped.endsWith("|")) {
			const cells = stripped.split("|").slice(1, -1); // drop first/last empty from split
			for (let col = 0; col < cells.length; col++) {
				if (cells[col].trim() === "") {
					issues.push({
						file: filepath,
						line: i + 1,
						column: 1,
						severity: "info",
						rule: "empty-table-cell",
						message: `Empty table cell in column ${col + 1} \u2014 use '\u2014' or 'N/A'`,
						suggestion: "\u2014",
					});
				}
			}
		}
	}

	return issues;
}

// ---------------------------------------------------------------------------
// 6. Encoding corruption check
// ---------------------------------------------------------------------------

interface CorruptionRule {
	pattern: RegExp;
	message: string;
}

const CORRUPTION_PATTERNS: CorruptionRule[] = [
	{
		pattern: /\u00c3\u2014/g,
		message: "Likely corrupted '\u00d7' (multiplication sign) \u2014 possible encoding issue",
	},
	{
		pattern: /\u00e2\u20ac\u201d/g,
		message: "Likely corrupted '\u2014' (em-dash)",
	},
	{
		pattern: /\u00e2\u20ac\u2122/g,
		message: "Likely corrupted '\u2019' (right single quote)",
	},
	{ pattern: /\u00c2\u00bd/g, message: "Likely corrupted '\u00bd' (one-half)" },
];

export function checkEncodingMarkers(filepath: string, lines: string[]): LintIssue[] {
	const issues: LintIssue[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		for (const rule of CORRUPTION_PATTERNS) {
			for (const match of line.matchAll(rule.pattern)) {
				issues.push({
					file: filepath,
					line: i + 1,
					column: match.index + 1,
					severity: "error",
					rule: "encoding",
					message: rule.message,
				});
			}
		}
	}

	return issues;
}

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------

export function collectMarkdownFiles(target: Target): string[] {
	const files: string[] = [];

	if (target === "books" || target === "all") {
		files.push(...walkDir(BOOKS_DIR));
	}
	if (target === "cleaned-references" || target === "all") {
		files.push(...globDir(CLEANED_REFS_DIR));
	}
	if (target === "docs" || target === "all") {
		files.push(...walkDir(DOCS_DIR));
	}

	return files.sort();
}

/** Recursively collect *.md and *.mdx files from a directory. */
function walkDir(dir: string): string[] {
	const results: string[] = [];
	if (!fs.existsSync(dir)) return results;

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...walkDir(full));
		} else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
			results.push(full);
		}
	}
	return results;
}

/** Collect *.md and *.mdx files in a single directory (non-recursive). */
function globDir(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir)
		.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
		.map((f) => path.join(dir, f));
}

// ---------------------------------------------------------------------------
// Run all checks on one file
// ---------------------------------------------------------------------------

export function runChecks(filepath: string): LintIssue[] {
	const content = fs.readFileSync(filepath, "utf-8");
	const lines = content.split(/\r?\n/);

	const issues: LintIssue[] = [];
	issues.push(...checkTerminology(filepath, lines));
	issues.push(...checkDiceNotation(filepath, lines));
	issues.push(...checkFormulaSymbols(filepath, lines));
	issues.push(...checkHeadingHierarchy(filepath, lines));
	issues.push(...checkEmptyTableCells(filepath, lines));
	issues.push(...checkEncodingMarkers(filepath, lines));

	return issues;
}

// ---------------------------------------------------------------------------
// Auto-fix
// ---------------------------------------------------------------------------

export function applyFixes(filepath: string, issues: LintIssue[]): number {
	const fixable = issues.filter(
		(i) => i.suggestion != null && (i.rule === "terminology" || i.rule === "dice-notation"),
	);
	if (fixable.length === 0) return 0;

	const content = fs.readFileSync(filepath, "utf-8");
	const lines = content.split(/\r?\n/);
	let fixesApplied = 0;

	// Apply fixes in reverse order (bottom-up) to preserve line numbers
	const sorted = [...fixable].sort((a, b) => {
		if (a.line !== b.line) return b.line - a.line;
		return b.column - a.column;
	});

	for (const issue of sorted) {
		const lineIdx = issue.line - 1;
		if (lineIdx >= lines.length) continue;

		const line = lines[lineIdx];
		const col = issue.column - 1;

		// Extract the problematic term from the message ('old' → 'new')
		const msgMatch = issue.message.match(/^'([^']+)'/);
		if (!msgMatch) continue;
		const oldTerm = msgMatch[1];

		if (line.slice(col, col + oldTerm.length) === oldTerm && issue.suggestion) {
			lines[lineIdx] = line.slice(0, col) + issue.suggestion + line.slice(col + oldTerm.length);
			fixesApplied++;
		}
	}

	if (fixesApplied > 0) {
		fs.writeFileSync(filepath, lines.join("\n"), "utf-8");
	}

	return fixesApplied;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

function relativePath(filepath: string): string {
	return path.relative(PROJECT_ROOT, filepath).replace(/\\/g, "/");
}

const SEVERITY_COLORS: Record<LintIssue["severity"], string> = {
	error: "\x1b[31m", // red
	warning: "\x1b[33m", // yellow
	info: "\x1b[36m", // cyan
};
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main(): void {
	const args = process.argv.slice(2);
	const fix = args.includes("--fix");

	let target: Target = "all";
	const targetIdx = args.indexOf("--target");
	if (targetIdx !== -1 && targetIdx + 1 < args.length) {
		const val = args[targetIdx + 1];
		if (val === "books" || val === "cleaned-references" || val === "docs" || val === "all") {
			target = val;
		} else {
			console.error(`Unknown target '${val}'. Use: books, cleaned-references, docs, all`);
			process.exit(1);
		}
	}

	// ── Collect files ─────────────────────────────────────────────────
	const files = collectMarkdownFiles(target);
	if (files.length === 0) {
		console.log(`No markdown files found for target '${target}'.`);
		return;
	}

	console.log(`Linting ${files.length} markdown files...\n`);

	// ── Run checks ────────────────────────────────────────────────────
	const allIssues: LintIssue[] = [];
	let totalFixes = 0;

	for (const filepath of files) {
		const issues = runChecks(filepath);
		if (issues.length > 0) {
			allIssues.push(...issues);
			if (fix) {
				totalFixes += applyFixes(filepath, issues);
			}
		}
	}

	if (allIssues.length === 0) {
		console.log("No issues found!");
		return;
	}

	// ── Group by file ─────────────────────────────────────────────────
	const byFile = new Map<string, LintIssue[]>();
	for (const issue of allIssues) {
		const rel = relativePath(issue.file);
		if (!byFile.has(rel)) byFile.set(rel, []);
		byFile.get(rel)!.push(issue);
	}

	// ── Summary table ─────────────────────────────────────────────────
	console.log(`${BOLD}Lint Results${RESET}`);
	console.log("\u2500".repeat(38));

	const sortedFiles = [...byFile.keys()].sort();
	for (const relPath of sortedFiles) {
		const issues = byFile.get(relPath)!;
		const errors = issues.filter((i) => i.severity === "error").length;
		const warnings = issues.filter((i) => i.severity === "warning").length;
		const infos = issues.filter((i) => i.severity === "info").length;

		const errStr = errors > 0 ? `${SEVERITY_COLORS.error}${errors} errors${RESET}` : "0 errors";
		const warnStr = warnings > 0 ? `${SEVERITY_COLORS.warning}${warnings} warnings${RESET}` : "0 warnings";
		const infoStr = infos > 0 ? `${SEVERITY_COLORS.info}${infos} info${RESET}` : "0 info";

		console.log(`  ${relPath.padEnd(50)} ${errStr}  ${warnStr}  ${infoStr}`);
	}

	// ── Detail listing ────────────────────────────────────────────────
	const severityFilter = args.includes("--severity") ? args[args.indexOf("--severity") + 1] : undefined;
	const filtered = severityFilter ? allIssues.filter((i) => i.severity === severityFilter) : allIssues;
	const detailLimit = 20;
	const showing = Math.min(filtered.length, detailLimit);
	const label = severityFilter ? `${severityFilter}-only details` : `Details`;
	console.log(`\n${BOLD}${label} (showing first ${showing} of ${filtered.length}):${RESET}`);

	for (const issue of filtered.slice(0, detailLimit)) {
		const rel = relativePath(issue.file);
		const color = SEVERITY_COLORS[issue.severity];
		console.log(
			`  ${color}${issue.severity.padStart(7)}${RESET} ` +
				`${rel}:${issue.line}:${issue.column} ` +
				`${DIM}(${issue.rule})${RESET} ${issue.message}`,
		);
	}

	// ── Summary line ──────────────────────────────────────────────────
	const totalErrors = allIssues.filter((i) => i.severity === "error").length;
	const totalWarnings = allIssues.filter((i) => i.severity === "warning").length;
	const totalInfos = allIssues.filter((i) => i.severity === "info").length;

	console.log(
		`\n${BOLD}${allIssues.length} issues:${RESET} ` +
			`${totalErrors} errors, ${totalWarnings} warnings, ${totalInfos} info`,
	);

	if (fix && totalFixes > 0) {
		console.log(`${totalFixes} auto-fixes applied.`);
	} else if (fix) {
		console.log("No auto-fixable issues found.");
	}

	// Exit 1 only on errors
	if (totalErrors > 0) {
		process.exit(1);
	}
}

// Only run when executed directly (not imported by tests)
const isDirectRun = process.argv[1] && /lint\.ts$/.test(process.argv[1]);
if (isDirectRun) {
	main();
}
