# Astro Migration Roadmap

> **Last updated:** 2026-02-25
> Build: **89 pages in ~9s** · Pagefind: **78 pages, 12,928 words** · All green.
> **Status:** **9/9 tools ported.** All tool migration complete.

---

## 1 · Current State

### What's Done

| Phase                     | Status | Detail                                                                                                                      |
| ------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| **1 — Scaffold**          | ✅     | `package.json`, `astro.config.mjs`, `tsconfig.json`, `content.config.ts`                                                    |
| **2 — Content Pipeline**  | ✅     | `starlight-prep` (24 cleaned-refs), `prebuild.mjs` (77 content + 12 data files)                                             |
| **3 — Theme**             | ✅     | `custom.css` (WH40K dark/gold)                                                                                              |
| **4A — Shared Modules**   | ✅     | `core.js` + `dice.js` ES module ports in `src/lib/dtd/`                                                                     |
| **4B — Pilot Tools**      | ✅     | **dice-roller**, **quick-reference** (fully ported)                                                                         |
| **4C — Stub Pages**       | ✅     | All 9 tool pages created and ported                                                                                         |
| **5A — Tool Ports**       | ✅     | **success-curves**, **npc-generator**, **defense-graph**, **combat-tracker**, **ship-builder**                              |
| **5D — Final Tool Ports** | ✅     | **character-sheet**, **character-builder** (copy+edit approach: JS as ES modules in `src/lib/tools/`, CSS in `src/styles/`) |
| **5B — Infrastructure**   | ✅     | GitHub URL configured, npm audit clean (0 vulns), CI workflow, README                                                       |
| **5C — Style Cleanup**    | ✅     | Removed dead `tool-components.css` (deleted entirely; all tools self-contained)                                             |

### What's Not Done

| Item                   | Detail                    |
| ---------------------- | ------------------------- |
| **Favicon / OG image** | Starlight defaults in use |

---

## 2 · Resolved Issues

### 2.1 — npm Audit Vulnerabilities ✅

Resolved via `npm audit fix --force` (upgraded `@astrojs/vercel` to 8.0.4+) plus `overrides` in `package.json` for `path-to-regexp`. Build passes with 0 vulnerabilities.

### 2.2 — Placeholder Social URL ✅

Updated to `https://github.com/AlexanderExter/dtd-nonsense`.

### 2.3 — Chart.js Strategy ✅

Using npm import via dynamic `import('chart.js/auto')` in success-curves and defense-graph. Vite bundles it (~208 KB, ~71 KB gzip). No CDN dependency.

---

## 3 · Tool Porting Plan

### Port Order (easiest → hardest)

| #   | Tool                  | LOC   | Data Files                              | Key Complexity                                              | Status    |
| --- | --------------------- | ----- | --------------------------------------- | ----------------------------------------------------------- | --------- |
| 1   | **success-curves**    | 1,398 | 0                                       | Chart.js + separate Web Worker, URL hash sharing            | ✅ Ported |
| 2   | **npc-generator**     | 1,730 | 3 (`traits`, `npc-templates`, `skills`) | localStorage save/load, Markdown export                     | ✅ Ported |
| 3   | **defense-graph**     | 1,823 | 0                                       | Chart.js + inline Blob Worker + Canvas 2D heatmap           | ✅ Ported |
| 4   | **combat-tracker**    | 2,204 | 0 (inline data)                         | Heavy core.js usage (6+ APIs), cross-tool import from Sheet | ✅ Ported |
| 5   | **ship-builder**      | 2,298 | 1 (`ships`)                             | Dual-mode UI, JSON import/export, combat sidebar            | ✅ Ported |
| 6   | **character-sheet**   | 3,497 | 8                                       | 5-tab system, massive DOM gen, full persistence layer       | ✅ Ported |
| 7   | **character-builder** | 2,569 | 9                                       | 11-step wizard, XP budgeting, **depends on sheet**          | ✅ Ported |

### Dependency Chain

```
success-curves ─────────┐
npc-generator ──────────┤
defense-graph ──────────┤ (independent, any order)
ship-builder ───────────┤
                        │
combat-tracker ─────────┤
                        │
character-sheet ────────┤ ← must port before builder
character-builder ──────┘ ← depends on sheet (cross-tool export)
```

**Practical porting sequence:** Do success-curves + npc-generator first (establishes Chart.js pattern and data-loading pattern). Then defense-graph (second Chart.js tool). Then ship-builder and combat-tracker in either order. Finally character-sheet, then character-builder.

### Porting Patterns to Establish

Each tool port follows the same pattern:

1. Copy HTML structure into `<ToolLayout>` in `.astro` file
2. Convert `DTD.*` global calls → ES module imports from `@/lib/dtd/core.js` and `@/lib/dtd/dice.js`
3. Move inline `<style>` into a `<style>` block in the `.astro` file (scoped or global as needed)
4. Move `<script>` logic into a client-side `<script>` block
5. For Web Workers: use `new Worker(new URL('./worker.js', import.meta.url))` or inline Blob
6. For Chart.js: `const { Chart } = await import('chart.js/auto')`
7. Update `src/pages/tools/index.astro` badge from "Porting" → "Ready"

---

## 4 · Stabilizing Actions (Pre-Deploy)

### 4.1 — Commit Strategy

Current state has **24 modified** files (cleaned-references with Starlight frontmatter) and **~30 new** files (entire Astro stack). This needs to be committed in logical chunks on a feature branch.

**Recommended commit sequence:**

```
git checkout -b astro-migration

# Commit 1: Infrastructure
git add .gitignore package.json package-lock.json tsconfig.json astro.config.mjs scripts/prebuild.mjs src/content.config.ts
git commit -m "feat: scaffold Astro + Starlight project"

# Commit 2: Content pipeline
git add cleaned-references/ src/content/docs/
git commit -m "feat: Starlight frontmatter injection + prebuild pipeline"

# Commit 3: Theme
git add src/styles/
git commit -m "feat: WH40K dark/gold theme for Starlight"

# Commit 4: Shared modules + layouts
git add src/lib/ src/layouts/ src/pages/tools/index.astro
git commit -m "feat: ES module ports of core.js/dice.js, ToolLayout, tools index"

# Commit 5: Ported tools
git add src/pages/tools/dice-roller.astro src/pages/tools/quick-reference.astro
git commit -m "feat: port dice-roller and quick-reference tools"

# Commit 6: Stub pages
git add src/pages/tools/
git commit -m "feat: stub pages for 7 remaining tools"

# Commit 7: Landing page
git add src/content/docs/index.mdx
git commit -m "feat: Starlight landing page"
```

### 4.2 — Build Verification Checklist

Before each commit batch, verify:

- [ ] `node scripts/prebuild.mjs` succeeds (77 content + 12 data)
- [ ] `npx astro build` succeeds (89 pages, 0 errors)
- [ ] `uv run dtd validate` still passes (JSON schemas)
- [ ] `uv run dtd lint` still passes (terminology)
- [ ] Dev server (`npx astro dev`) renders correctly: landing, a rules page, dice-roller, quick-reference

### 4.3 — Content Integrity

The prebuild script copies files at build time. The generated directories are in `.gitignore`:

- `src/content/docs/rules/` (generated from `cleaned-references/`)
- `src/content/docs/books/` (generated from `books/`)
- `public/data/` (generated from `tools/shared/data/`)

**Verify:** Run `git status` after build and confirm no generated files leak into commits.

---

## 5 · Tech Debt

### 5.1 — Style Duplication ✅

Resolved: `tool-components.css` has been completely deleted. All 9 tools are self-contained with their own CSS. `ToolLayout.astro` keeps its own `:root` token declarations for the standalone HTML shell.

### 5.2 — core.js Coverage Gaps

The ES module port of `core.js` exports 12 functions but not every function from the original is verified:

- `exportCharacterJSON` and `importCharacterJSON` are referenced by character-sheet but may need updates for the Astro context
- `loadData` / `loadAllData` fetch from `/data/` — verified working from Astro pages at `/tools/*`

**Action:** When porting character-sheet, audit `core.js` exports vs original tool usage, fix any gaps.

### 5.3 — No Tests ⚠️

CI workflow (`.github/workflows/build.yml`) now runs `npm ci && npm run build` as a smoke test. No unit tests for ES modules or prebuild script yet.

**Action:** Consider Vitest unit tests for `core.js` and `dice.js` ES modules.

### 5.4 — No Favicon / OG Image

Starlight defaults in use. No custom favicon or social sharing image.

### 5.5 — Documentation Drift ✅

Docs have been updated: `architecture.md`, `development-guide.md`, `project-conventions.md` all reference Astro. `copilot-instructions.md` reflects the new structure.

### 5.6 — Unused Original Tools Directory

After character-sheet and character-builder are ported, the original `tools/` directory becomes fully archival. `tools/shared/data/*.json` remains the canonical JSON source (used by prebuild).

---

## 6 · Pre-GitHub Checklist

Everything needed before pushing to GitHub:

### 6.1 — Create GitHub Repository

- [x] URL configured in `astro.config.mjs`: `https://github.com/AlexanderExter/dtd-nonsense`
- [ ] Create repo on GitHub: `AlexanderExter/dtd-nonsense`
- [ ] Add remote: `git remote add origin https://github.com/AlexanderExter/dtd-nonsense.git`

### 6.2 — Git History Reset

Old history is obsolete (pre-Astro, local-only, no collaborators). Plan:

1. Back up `.git`: `Copy-Item -Recurse .git ../.git-backup-dtd`
2. Reinitialize: `Remove-Item -Recurse -Force .git; git init; git add -A; git commit -m "feat: Astro/Starlight site with 9/9 play tools ported"`
3. Add remote and push

### 6.3 — Repository Hygiene

- [x] `.gitignore` excludes generated content, `node_modules/`, `dist/`, `.vercel/`, `.astro/`, `__pycache__/`
- [x] `package-lock.json` is committed
- [x] `README.md` with description, prerequisites, build/dev commands
- [x] No secrets in tracked files
- [x] npm audit: 0 vulnerabilities (overrides for `path-to-regexp`)
- [x] CI workflow: `.github/workflows/build.yml`

### 6.4 — License

No license file — fan content makes licensing ambiguous.

---

## 7 · Vercel Deployment ✅

The site is live at **https://dtd-nonsense.vercel.app** via Vercel's GitHub integration.

| Setting               | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| Production URL        | `https://dtd-nonsense.vercel.app`                          |
| Framework             | Astro (auto-detected)                                      |
| Build command         | `npm run build`                                            |
| Output                | Static (`@astrojs/vercel` adapter, static output mode)     |
| Preview deployments   | Auto-created for every PR, unique URL posted as PR comment |
| Production deploys    | Triggered when commits land on `main`                      |
| Environment variables | None required                                              |

Vercel runs its own build independently of GitHub Actions CI. A PR can have a working preview deployment even while CI checks are still running.

See [docs/architecture.md — Deployment & CI](architecture.md#deployment--ci) for the full CI pipeline description.

---

## 8 · Remaining Priorities

1. ~~**Port character-sheet**~~ — Done (copy+edit approach, ES module imports)
2. ~~**Port character-builder**~~ — Done (copy+edit approach, ES module imports)
3. **Performance audit** — Lighthouse, Core Web Vitals
4. **Favicon / OG image** — custom branding for social sharing
5. **Cleanup original tools/** — archive or remove vanilla JS versions after all ports verified
