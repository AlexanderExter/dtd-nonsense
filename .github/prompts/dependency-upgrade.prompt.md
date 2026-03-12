# Dependency Upgrade

//TODO: Given the nature of the project, and as a find out and learn, consider if the lockfiles are truly needed.
//TODO: It could also manage the gitignore and gitattributes
// NOTE: Biome configuration audit is covered by Phase C1.5 (added 2026-03-10).

You are the **upgrade session owner**. You have full authority over this project's dependency versions, pinning strategy, code modernization, and cleanup for the duration of this session. No other agent or session will dispute your work. Your decisions are final.

//Proposed upgrade: This is a CLOSED PROMPT, meaning it is meant to launch ona clean session and is expected to work autonomously to completion.

**Operating principles:**

- **Backwards compatibility is not a concern.** The operator explicitly accepts that this session may introduce breaking changes. Clean, current, idiomatic code is the goal.
- **The branch is the safety net.** If the process fails irrecoverably, the branch is deleted. That's the rollback mechanism — not timidity.
- **`bun run check` passing is the red line.** If the full check suite passes, the upgrade stands.
- **You are an orchestrator.** Leverage `ncu`, `bun`, `bun run check`, `bun run lint:fix`, `npm audit`, and the existing project tooling. Your role is to arbitrate and sequence, not to manually replicate what programmatic tools already do.
- **No preconceptions.** The current pinning strategy, version ranges, and overrides are all open for review. Decide what's best for the project right now.
- **Resolution is the work.** This is not just version bumping — it's resolving the consequences: breaking changes, deprecated API removal, code modernization, dead pattern cleanup.

---

## Phase A — Bootstrap & Ground Truth

### A1. Bootstrap Tools

1. Run `bun run upgrade:recon` and save the JSON manifest (stdout). Read the human summary (stderr) for orientation.
2. **ncu (npm-check-updates):** If the recon report shows ncu is not available, install it: `bun install -D npm-check-updates`. This makes `bunx npm-check-updates` (or `bunx ncu`) available for the session. Always use the full name `bunx npm-check-updates` to avoid collisions with other packages named `ncu`.
3. **Bun:** If available, prefer `bun install` over `bun install` for speed after `package.json` changes. Lockfiles are informational during upgrades — correctness comes from the tree resolver and the test suite, not the lockfile.
4. **Check engine:** Note the current `engines.node` from `package.json`. If any upgrade requires a higher Node version, that's a decision point to address in Phase B.

### A2. Establish Baseline

1. Run `bun run check` and record the full output. This is the **"before"** snapshot. Every subsequent `bun run check` must be compared against this baseline.
2. Note pre-existing warnings (Biome reports ~12 known false positives/intentional CSS). New warnings are regressions; removing old warnings is an improvement.
3. Run `bun pm ls --depth=1` to confirm current tree health.

### A3. Read Context

1. Read `docs/project-conventions.md` — understand stated conventions and version policies.
2. Read the `overrides` and `_comments` sections in `package.json` — understand why each override exists.
3. Read the `engines` field — this constrains what Node-dependent deps can be upgraded to.
4. If `fetch_webpage` is available, fetch migration guides for any framework-tier major bumps reported by recon (Astro, Starlight docs, GitHub releases).
5. Read changelogs or release notes for pinned toolchain deps (Biome) — these are pinned deliberately and deserve changelog review before bumping.

---

## Phase B — Plan

Produce a brief upgrade plan. This is for **transparency, not approval** — state what you intend to do, then do it.

### B1. Upgrade Order

Execute in this order. The rationale: upgrade the tools that validate code before upgrading the code they validate.

1. **Toolchain** (`@biomejs/biome`, `typescript`, `@types/bun`) — the validation and development tools themselves. Upgrading these first means all subsequent `bun run check` runs use the latest lint rules, type checker, and test runner types.
2. **Framework** (`astro`, `@astrojs/starlight`, `@astrojs/vercel`) — the largest blast radius. These are version-coupled via peer dependencies and require coordinated upgrades. Migration guides are essential reading.
3. **Utility** (`zod`, `gray-matter`, `@vercel/analytics`, and any others) — standalone dependencies with low coupling risk.

### B2. Strategy Decisions

For each dependency, decide:

- **Target version:** Latest? Latest compatible? Skip?
- **Pinning:** Should exact-pinned deps (Biome) stay pinned? Should caret deps get pinned? Why?
- **Overrides:** Is each override still needed? Can any be removed after the parent dep upgrades?

### B3. Acknowledgment

State clearly in the plan output:

> "This plan upgrades aggressively. The branch is the safety checkpoint. If the result doesn't pass `bun run check`, the branch can be discarded. The intent is to bring the project to the best possible dependency state — not to preserve the current one."

Then proceed to execution.

---

## Phase C — Execute

### C0. Create Upgrade Branch

```
bun run session:start upgrade-deps-YYYY-MM-DD
```

If the session start script reports a dirty tree or failing baseline, resolve that first.

### C1. Toolchain Tier

Use ncu's doctor mode to safely upgrade toolchain deps with automatic rollback on failure:

```
bunx npm-check-updates --doctor --doctorTest "bun run check" --filter "@biomejs/biome,typescript,@types/bun"
```

**Doctor mode behavior:** For each package, ncu upgrades it, runs the doctor test (`bun run check`), and automatically rolls back any upgrade that breaks the test. This is the programmatic equivalent of manual upgrade-test-rollback cycles.

After doctor mode completes:

1. **Review results.** Which upgrades succeeded? Which were rolled back?
2. **Resolve rollbacks.** For each rolled-back dep, investigate why `bun run check` failed:
    - **New Biome rules:** Run `bun run lint:fix` first — many new rule violations have auto-fixes. For the rest, update code to comply or disable the specific rule with rationale.
    - **TypeScript errors:** Resolve type errors introduced by stricter checking or changed type definitions. Modernize code, don't patch with `any`.
    - After resolving, manually set the version in `package.json` and run `bun install` + `bun run check` to verify.
3. **Tree health:** Run `bun pm ls --depth=1` — confirm no unmet peer deps.
4. **Commit:** `chore: upgrade toolchain (biome, typescript)`

### C1.5. Biome Configuration Audit (run when Biome version changed)

Skip this step if Biome was NOT upgraded in C1. If Biome DID change, complete the full audit before continuing to C2.

**Rationale:** Biome releases frequently add new rules, deprecate config options, rename options, and change their VS Code extension API. A Biome version bump without a config audit leaves the project in an untested configuration state where the schema may be wrong, rules may be silently misconfigured, and the developer experience may have regressed.

#### C1.5.1 — Schema URL

Update `biome.json` `$schema` to match the new version:

```json
"$schema": "https://biomejs.dev/schemas/<NEW_VERSION>/schema.json"
```

The schema URL uses the exact version string, not a range (e.g. `2.5.0`, not `^2.5.0`).

#### C1.5.2 — VS Code Extension Audit

Check biome.json VS Code extension version by looking at `%USERPROFILE%\.vscode\extensions\` for `biomejs.biome-*`. If the extension is behind the new CLI version, note it in the briefing — the developer should update the extension manually.

Check `.vscode/settings.json` for deprecated Biome extension settings:
- `biome.lspBin` → deprecated since v3 extension, use `biome.lsp.bin`
- `biome.requireConfigFile` → deprecated, use `biome.requireConfiguration`
- `quickfix.biome` in `codeActionsOnSave` → old pattern, use `source.fixAll.biome`
- `source.organizeImports.biome` → still current, keep

Fix any deprecated settings in `.vscode/settings.json`.

#### C1.5.3 — Config Validity

Run `bunx biome check . --reporter=summary` and read the output carefully.

**Parse errors in biome.json itself** → the config file has syntax problems (e.g. JS comments in a `.json` file — use `.jsonc` if comments are needed, or remove them).

**"Unknown option" warnings** → a rule or config key was renamed or removed. Check the changelog and update.

**New violations from upgraded rules** → run `bun run lint:fix` first for auto-fixable issues. For remaining violations, decide: fix the code, or disable the specific rule with a documented rationale.

#### C1.5.4 — Domains Review

Biome v2 introduced [linter domains](https://biomejs.dev/linter/domains/) — framework-aware rule sets activated by declared dependencies. Check if any new domains are now relevant to this project's stack (`react`, `test`, `project`, etc.) and aren't already declared in `biome.json`:

```bash
# Check which domains Biome would auto-detect based on package.json
# Then compare against what's declared in linter.domains
```

Declared domains make intent explicit and survive dependency tree changes.

#### C1.5.5 — HTML/Astro Support

Check that `html.experimentalFullSupportEnabled` is set and that `html.formatter.enabled: false` is also set (the Astro VS Code extension owns `.astro` formatting — Biome's HTML formatter should stay off). If Biome's HTML/Astro support matured from experimental to stable in this version, update accordingly.

#### C1.5.6 — Run Final Check

```
bunx biome check . --reporter=summary
```

Must report *zero* errors. Warnings are acceptable if they are pre-existing or intentionally suppressed with overrides.

**Commit:** `chore: sync biome config to new version`

---

### C2. Framework Tier

**Do NOT use ncu doctor for framework deps.** Astro, Starlight, and the Vercel adapter are version-coupled via `peerDependencies`. They must be upgraded as a coordinated set.

1. **Check compatibility.** The recon manifest includes `frameworkCompat` with peer dep ranges. Use `npm view @astrojs/starlight@latest peerDependencies --json` and `npm view @astrojs/vercel@latest peerDependencies --json` to find versions compatible with each other.
2. **Choose a compatible version set.** All three packages must agree on the Astro version.
3. **Update `package.json`** with the chosen versions.
4. **Install:** `bun install` (or `bun install`).
    - If install fails due to peer dep conflicts: read the error, adjust versions to find a compatible set. **Never use `--legacy-peer-deps` or `--force`** — these hide problems.
5. **Tree health:** `bun pm ls --depth=1` — must show no unmet peers.
6. **Migration guide:** If a major Astro version bump occurred, follow the migration guide step by step. Apply config changes, remove deprecated APIs, adopt new patterns.
7. **Build:** `bun run build` — Astro build catches template and config issues.
8. **Full check:** `bun run check` — if failures occur, resolve them:
    - Remove deprecated configuration options
    - Update import paths that changed
    - Adopt new APIs replacing deprecated ones
    - **Modernize, don't patch around.** If Astro deprecated a pattern, adopt the new one. Don't suppress the warning.
9. **Commit:** `chore: upgrade astro ecosystem + resolve breaking changes`

### C3. Utility Tier

Use ncu doctor for everything not in toolchain or framework:

```
bunx npm-check-updates --doctor --doctorTest "bun run check" --reject "astro,@astrojs/*,@biomejs/*,typescript,@types/bun"
```

1. **Review results** — resolve any rollbacks as in C1.
2. **Commit:** `chore: upgrade utility dependencies`

### C4. Overrides Review

For each override in `package.json`:

1. **Check if still needed.** Does the parent dependency now include the fix in its own transitive deps?
    - Run `bun pm ls <overridden-package>` to see who depends on it and what version they'd pull without the override.
    - Check the parent's changelog or release notes for whether the vulnerability/bug the override addresses has been fixed upstream.
2. **Remove stale overrides.** Update `package.json`, run `bun install`, then `bun pm ls` + `bun run check` to verify.
3. **Keep necessary overrides.** If the override is still needed, update the comment explaining why.
4. **Commit:** `chore: clean up stale dependency overrides` (or note that all overrides are still required)

### C5. Pinning Review

Review all version specifiers in `package.json`:

- **Exact pins** (e.g., `"2.4.5"`): Are these still appropriate? Were they pinned for a reason that still holds?
- **Carets** (e.g., `"^5.3.0"`): Should any of these be pinned after this upgrade?
- **Decision criteria:** Pin tools where specific behavior matters (linters, formatters, test runners). Use carets for libraries where minor updates are safe.

Apply changes if any. Commit separately if pinning strategy changes.

### C6. Post-Install Validation

1. **Tree health:** `bun pm ls` — must show no unmet peer deps, no invalid entries, no extraneous packages.
2. **Engine check:** If any upgrade required raising `engines.node`, update it in `package.json`. Note that this affects CI (GitHub Actions Node version) and deployment.

---

## Phase D — Validate & Clean

Final validation pass — this must be fully green before generating the briefing.

1. **`bun run check`** — full suite. Must pass with zero new errors.
2. **`npm audit`** — compare with the pre-upgrade audit from Phase A. Note improvements and any remaining advisories.
3. **`bun run build`** — production build must succeed. This is the definitive "does the site work" check.
4. **`bun run lint:fix`** — final cleanup pass. Commit any auto-fixed changes.
5. **Compare with baseline:** Did the number of pre-existing Biome warnings change? Note improvements (fewer warnings thanks to upgraded rules) or regressions (new warnings introduced).

If any check fails that passed in the baseline, something went wrong. Debug and resolve before proceeding. Owning the process means owning the errors.

---

## Phase E — Briefing

Create `docs/whats-new/YYYY-MM-DD.md` (using today's date). This is the primary deliverable of the upgrade session — a briefing that tells subsequent sessions what changed and what new capabilities are available.

### Briefing Structure

```markdown
# Upgrade Briefing — YYYY-MM-DD

## Executive Summary

<!-- Total deps upgraded, files changed, security posture change. 2-3 sentences. -->

## Upgrade Manifest

| Package | From | To  | Bump | Tier | Notes |
| ------- | ---- | --- | ---- | ---- | ----- |

<!-- One row per upgraded dep -->

## Actionable Intelligence

<!-- Per-dep "what's now possible" — not just version numbers.
     Examples: "Biome 2.5 adds noUnusedTypes rule — consider enabling"
               "Astro 5.4 supports view transitions natively — replaces manual approach" -->

## Resolution Log

<!-- Breaking changes encountered and how they were resolved.
     Code that was modernized, deprecated patterns removed, configs updated. -->

## Security

<!-- Vulnerabilities resolved by the upgrade.
     Overrides removed, added, or retained.
     Remaining advisories (if any) with assessment. -->

## Pinning Decisions

<!-- What was pinned/unpinned and the rationale. -->

## Tree Health

<!-- Peer dep state post-upgrade. Engine requirements. -->

## Recommendations

<!-- Config changes to consider, new rules to enable, deprecated patterns
     that should be adopted project-wide, opportunities unlocked by the upgrades.

     If Biome was upgraded, include a sub-section:
     ### Biome
     - Schema URL updated to <new version>
     - New rules now available: list any newly enabled or worth-enabling rules
     - Domains in use: list active linter.domains and what they cover
     - html.experimentalFullSupportEnabled status (experimental / stable in this version)
     - Extension version alignment: CLI <x> / Extension <y> -->
```

**Tone:** This is a briefing, not a changelog. Be opinionated, actionable, and forward-looking. Write for the next session's agent who needs to understand what changed and why it matters.

---

## Phase F — Commit & Close

1. **Stage the briefing:** `git add docs/whats-new/`
2. **Commit:** `docs: add upgrade briefing for YYYY-MM-DD`
3. **Final status report** to the user:
    - Total packages upgraded (by tier and bump type)
    - Breaking changes resolved
    - Security improvements
    - Any packages that could NOT be upgraded (and why)
    - Suggestion: run `bun run session:end` to merge, or review the branch first, or delete it if unsatisfied
4. **Marker:** "Upgrade Session Complete"

---

## Failure Modes

If the process reaches a state where `bun run check` cannot be made to pass despite reasonable effort:

1. **Partial success:** Commit the successful tiers, revert the failing tier. The briefing documents what worked and what didn't.
2. **Total failure:** Every tier broke something that can't be resolved. Document findings in the briefing anyway (so the next attempt has context), commit the briefing, and recommend the branch be deleted.
3. **NEVER force-merge broken code.** The red line is `bun run check` passing. No exceptions.
