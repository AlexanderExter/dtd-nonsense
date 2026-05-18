/**
 * Prebuild script — copies content into Astro's src/content/docs/ structure.
 *
 * Runs before `astro build` to:
 * 1. Inject Starlight frontmatter + copy cleaned-references/ → src/content/docs/rules/
 * 2. Copy books/book-1/ → src/content/docs/books/book-1/
 * 3. Copy books/book-2/ → src/content/docs/books/book-2/
 * 4. Copy data/ → public/data/
 *
 * Frontmatter injection is built-in — no separate `starlight-prep` step needed.
 * For books/ files, existing frontmatter is transformed to Starlight format.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Source directories
const CLEANED_REFS = join(ROOT, "cleaned-references");
const BOOK_1 = join(ROOT, "books", "book-1-dungeons-the-dragoning");
const BOOK_2 = join(ROOT, "books", "book-2-for-a-few-subtitles-more");
const DATA_SRC = join(ROOT, "data");

// Destination directories
const RULES_DEST = join(ROOT, "src", "content", "docs", "rules");
const BOOK_1_DEST = join(ROOT, "src", "content", "docs", "books", "book-1");
const BOOK_2_DEST = join(ROOT, "src", "content", "docs", "books", "book-2");
const DATA_DEST = join(ROOT, "public", "data");

function ensureDir(dir) {
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
}

function copyContentFiles(src, dest, transform = null, lowercaseNames = false) {
	ensureDir(dest);
	const files = readdirSync(src).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
	let count = 0;

	for (const file of files) {
		let content = readFileSync(join(src, file), "utf-8");
		if (transform) {
			content = transform(content, file);
		}
		const outName = lowercaseNames ? file.toLowerCase() : file;
		writeFileSync(join(dest, outName), content, "utf-8");
		count++;
	}
	return count;
}

/**
 * Transform book frontmatter to Starlight-compatible format.
 * Books have: title, book, chapter, order, type
 * Starlight needs: title, sidebar.order, sidebar.label
 */
function transformBookFrontmatter(content, filename) {
	// Check if file has frontmatter
	if (!content.startsWith("---")) {
		// No frontmatter — add minimal Starlight frontmatter
		const title = filename
			.replace(/^\d+-/, "")
			.replace(/\.mdx?$/, "")
			.replace(/-/g, " ")
			.replace(/\b\w/g, (c) => c.toUpperCase());
		const order = Number.parseInt(filename.match(/^(\d+)/)?.[1] || "99", 10);

		return `---\ntitle: "${title}"\nsidebar:\n  order: ${order}\n---\n\n${content}`;
	}

	// Parse existing frontmatter
	const fmEnd = content.indexOf("---", 3);
	if (fmEnd === -1) return content;

	const fmBlock = content.slice(3, fmEnd).trim();
	const body = content.slice(fmEnd + 3);

	// Extract fields from existing frontmatter
	const titleMatch = fmBlock.match(/title:\s*"?([^"\n]+)"?/);
	const orderMatch = fmBlock.match(/order:\s*(\d+)/);
	const chapterMatch = fmBlock.match(/chapter:\s*(\d+)/);

	const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.mdx?$/, "");
	const order = orderMatch
		? Number.parseInt(orderMatch[1], 10)
		: chapterMatch
			? Number.parseInt(chapterMatch[1], 10)
			: 99;

	// Build new Starlight-compatible frontmatter
	const newFm = `---
title: "${title}"
sidebar:
  order: ${order}
  label: "${title}"
---`;

	return newFm + body;
}

// ---------------------------------------------------------------------------
// Starlight frontmatter metadata for cleaned-references
// ---------------------------------------------------------------------------

/** @type {Record<string, {title: string, description: string, group: string}>} */
const CONTENT_METADATA = {
	"00-About.mdx": {
		title: "About This Project",
		description: "Project information, source material links, and community resources",
		group: "About",
	},
	"01-Core-Rules.mdx": {
		title: "Core Rules",
		description: "Dice system, Tests, Raises, and Checks",
		group: "Rules",
	},
	"02-Char-Creation.mdx": {
		title: "Character Creation",
		description: "10-step character creation process",
		group: "Character",
	},
	"03-Characteristics-Skills.mdx": {
		title: "Characteristics & Skills",
		description: "9 characteristics and full skill list",
		group: "Character",
	},
	"04-Races.mdx": {
		title: "Races",
		description: "16 playable races with traits, bonuses, and racial powers",
		group: "Character",
	},
	"05-Exaltations.mdx": {
		title: "Exaltations",
		description: "Supernatural types — Vampire, Werewolf, and more",
		group: "Character",
	},
	"06-Classes.mdx": {
		title: "Classes",
		description: "50+ classes with progression tracks and feat tables",
		group: "Character",
	},
	"07-Feats.mdx": {
		title: "Feats, Assets & Hindrances",
		description: "Complete feat list with effects and prerequisites",
		group: "Character",
	},
	"08-Backgrounds.mdx": {
		title: "Backgrounds",
		description: "Background dots — Allies, Wealth, Holdings, and more",
		group: "Character",
	},
	"09-Alignments.mdx": {
		title: "Alignments",
		description: "Pantheons, devotion mechanics, and sin tables",
		group: "Character",
	},
	"10-Equipment.mdx": {
		title: "Equipment",
		description: "Weapons, armor, gear, and starting packages",
		group: "Equipment",
	},
	"11-Magic.mdx": {
		title: "Magic",
		description: "Sorcery system and spell schools",
		group: "Powers",
	},
	"12-Sword-Schools.mdx": {
		title: "Sword Schools",
		description: "9 melee combat disciplines",
		group: "Powers",
	},
	"13-Gun-Kata.mdx": {
		title: "Gun Kata",
		description: "6 ranged combat disciplines",
		group: "Powers",
	},
	"14-Combat.mdx": {
		title: "Combat",
		description: "Combat rules, action economy, and initiative",
		group: "Rules",
	},
	"15-Social-Combat.mdx": {
		title: "Social Combat",
		description: "Social interaction mechanics",
		group: "Rules",
	},
	"16-Conditions.mdx": {
		title: "Conditions",
		description: "Status effects and their mechanical impact",
		group: "Rules",
	},
	"17-Vehicles.mdx": {
		title: "Vehicles",
		description: "Vehicle rules and combat",
		group: "Advanced",
	},
	"18-Ships.mdx": {
		title: "Ships",
		description: "Spelljammer-style space vessels",
		group: "Advanced",
	},
	"19-Antagonists.mdx": {
		title: "Antagonists",
		description: "NPC creation and 40+ stat blocks",
		group: "Storytelling",
	},
	"20-Artifacts.mdx": {
		title: "Artifacts",
		description: "Magical items and their properties",
		group: "Equipment",
	},
	"21-Advanced-Rules.mdx": {
		title: "Advanced Rules",
		description: "Optional and supplemental rules",
		group: "Advanced",
	},
	"22-SM-Reference.mdx": {
		title: "Story Master Reference",
		description: "Story Master tools and guidelines",
		group: "Storytelling",
	},
	"23-Setting-Lore.mdx": {
		title: "Setting & Lore",
		description: "The Great Wheel, crystal spheres, and factions",
		group: "Storytelling",
	},
};

/**
 * Inject Starlight-compatible frontmatter into a cleaned-references file.
 * Uses gray-matter to parse/serialize YAML frontmatter.
 * Preserves extra keys from source frontmatter (e.g. tableOfContents).
 */
function injectStarlightFrontmatter(content, filename) {
	const meta = CONTENT_METADATA[filename];
	if (!meta) return content; // Unknown file — pass through unchanged

	const order = Number.parseInt(filename.match(/^(\d+)/)?.[1] || "99", 10);
	const parsed = matter(content);

	const targetFm = {
		title: meta.title,
		description: meta.description,
		sidebar: {
			order,
			label: meta.title,
		},
	};

	// Preserve extra Starlight keys from the source frontmatter
	const PRESERVED_KEYS = ["tableOfContents", "head", "pagefind", "draft"];
	for (const key of PRESERVED_KEYS) {
		if (parsed.data[key] !== undefined) {
			targetFm[key] = parsed.data[key];
		}
	}

	parsed.data = targetFm;
	return matter.stringify(parsed.content, parsed.data);
}

function copyDataFiles(src, dest) {
	ensureDir(dest);
	const files = readdirSync(src).filter((f) => f.endsWith(".json"));
	let count = 0;

	for (const file of files) {
		const content = readFileSync(join(src, file));
		writeFileSync(join(dest, file), content);
		count++;
	}
	return count;
}

// ============================================================================
// Main
// ============================================================================

console.log("🔧 DTD Prebuild — copying content to Astro structure\n");

// 1. Cleaned references → rules (inject frontmatter + lowercase filenames)
const rulesCount = copyContentFiles(CLEANED_REFS, RULES_DEST, injectStarlightFrontmatter, true);
console.log(`  ✓ ${rulesCount} rules files → src/content/docs/rules/ (frontmatter injected)`);

// 2. Books → books/book-1, books/book-2
const book1Count = copyContentFiles(BOOK_1, BOOK_1_DEST, transformBookFrontmatter);
console.log(`  ✓ ${book1Count} Book 1 files → src/content/docs/books/book-1/`);

const book2Count = copyContentFiles(BOOK_2, BOOK_2_DEST, transformBookFrontmatter);
console.log(`  ✓ ${book2Count} Book 2 files → src/content/docs/books/book-2/`);

// 3. Data files → public/data/
const dataCount = copyDataFiles(DATA_SRC, DATA_DEST);
console.log(`  ✓ ${dataCount} JSON data files → public/data/`);

console.log(`\n✅ Prebuild complete — ${rulesCount + book1Count + book2Count} content files, ${dataCount} data files`);
