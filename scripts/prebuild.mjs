/**
 * Prebuild script — copies content into Astro's src/content/docs/ structure.
 *
 * Runs before `astro build` to:
 * 1. Copy cleaned-references/ → src/content/docs/rules/
 * 2. Copy books/book-1/ → src/content/docs/books/book-1/
 * 3. Copy books/book-2/ → src/content/docs/books/book-2/
 * 4. Copy tools/shared/data/ → public/data/
 *
 * Frontmatter must already exist on cleaned-references/ files
 * (run `uv run dtd starlight-prep` first).
 *
 * For books/ files that have non-Starlight frontmatter, this script
 * transforms their existing frontmatter to be Starlight-compatible.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Source directories
const CLEANED_REFS = join(ROOT, "cleaned-references");
const BOOK_1 = join(ROOT, "books", "book-1-dungeons-the-dragoning");
const BOOK_2 = join(ROOT, "books", "book-2-for-a-few-subtitles-more");
const DATA_SRC = join(ROOT, "tools", "shared", "data");

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

function copyMdFiles(src, dest, transform = null, lowercaseNames = false) {
  ensureDir(dest);
  const files = readdirSync(src).filter((f) => f.endsWith(".md"));
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
      .replace(/.md$/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const order = parseInt(filename.match(/^(\d+)/)?.[1] || "99", 10);

    return `---\ntitle: "${title}"\nsidebar:\n  order: ${order}\n---\n\n${content}`;
  }

  // Parse existing frontmatter
  const fmEnd = content.indexOf("---", 3);
  if (fmEnd === -1) return content;

  const fmBlock = content.substring(3, fmEnd).trim();
  const body = content.substring(fmEnd + 3);

  // Extract fields from existing frontmatter
  const titleMatch = fmBlock.match(/title:\s*"?([^"\n]+)"?/);
  const orderMatch = fmBlock.match(/order:\s*(\d+)/);
  const chapterMatch = fmBlock.match(/chapter:\s*(\d+)/);

  const title = titleMatch ? titleMatch[1].trim() : filename.replace(/.md$/, "");
  const order = orderMatch
    ? parseInt(orderMatch[1], 10)
    : chapterMatch
      ? parseInt(chapterMatch[1], 10)
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

// 1. Cleaned references → rules (lowercase filenames for consistent slugs)
const rulesCount = copyMdFiles(CLEANED_REFS, RULES_DEST, null, true);
console.log(`  ✓ ${rulesCount} rules files → src/content/docs/rules/`);

// 2. Books → books/book-1, books/book-2
const book1Count = copyMdFiles(BOOK_1, BOOK_1_DEST, transformBookFrontmatter);
console.log(`  ✓ ${book1Count} Book 1 files → src/content/docs/books/book-1/`);

const book2Count = copyMdFiles(BOOK_2, BOOK_2_DEST, transformBookFrontmatter);
console.log(`  ✓ ${book2Count} Book 2 files → src/content/docs/books/book-2/`);

// 3. Data files → public/data/
const dataCount = copyDataFiles(DATA_SRC, DATA_DEST);
console.log(`  ✓ ${dataCount} JSON data files → public/data/`);

console.log(`\n✅ Prebuild complete — ${rulesCount + book1Count + book2Count} content files, ${dataCount} data files`);
