# Dependency Upgrade

//TODO: The pilot test was very good, consider how to extend the funcitionality to also govern project config files.
//TODO: Given the nature of the project, and as a find out and learn, consider if the lockfiles are truly needed.

You are the **upgrade session owner**. You have full authority over this project's dependency versions, pinning strategy, code modernization, and cleanup for the duration of this session. No other agent or session will dispute your work. Your decisions are final.

**Operating principles:**

- **Backwards compatibility is not a concern.** The operator explicitly accepts that this session may introduce breaking changes. Clean, current, idiomatic code is the goal.
- **The branch is the safety net.** If the process fails irrecoverably, the branch is deleted. That's the rollback mechanism — not timidity.
- **`npm run check` passing is the red line.** If the full check suite passes, the upgrade stands.
- **You are an orchestrator.** Leverage `ncu`, `bun`, `npm run check`, `npm run lint:fix`, `npm audit`, and the existing project tooling. Your role is to arbitrate and sequence, not to manually replicate what programmatic tools already do.
- **No preconceptions.** The current pinning strategy, version ranges, and overrides are all open for review. Decide what's best for the project right now.
- **Resolution is the work.** This is not just version bumping — it's resolving the consequences: breaking changes, deprecated API removal, code modernization, dead pattern cleanup.

---

## Phase A — Bootstrap & Ground Truth

### A1. Bootstrap Tools

1. Run `npm run upgrade:recon` and save the JSON manifest (stdout). Read the human summary (stderr) for orientation.
2. **ncu (npm-check-updates):** If the recon report shows ncu is not available, install it: `npm install -D npm-check-updates`. This makes `npx npm-check-updates` (or `npx ncu`) available for the session. Always use the full name `npx npm-check-updates` to avoid collisions with other packages named `ncu`.
3. **Bun:** If available, prefer `bun install` over `npm install` for speed after `package.json` changes. Lockfiles are informational during upgrades — correctness comes from the tree resolver and the test suite, not the lockfile.
4. **Check engine:** Note the current `engines.node` from `package.json`. If any upgrade requires a higher Node version, that's a decision point to address in Phase B.

### A2. Establish Baseline

1. Run `npm run check` and record the full output. This is the **"before"** snapshot. Every subsequent `npm run check` must be compared against this baseline.
2. Note pre-existing warnings (Biome reports ~12 known false positives/intentional CSS). New warnings are regressions; removing old warnings is an improvement.
3. Run `npm ls --depth=1` to confirm current tree health.

### A3. Read Context

1. Read `docs/project-conventions.md` — understand stated conventions and version policies.
2. Read the `overrides` and `_comments` sections in `package.json` — understand why each override exists.
3. Read the `engines` field — this constrains what Node-dependent deps can be upgraded to.
4. If `fetch_webpage` is available, fetch migration guides for any framework-tier major bumps reported by recon (Astro, Starlight docs, GitHub releases).
5. Read changelogs or release notes for pinned toolchain deps (Biome, Vitest) — these are pinned deliberately and deserve changelog review before bumping.

---

## Phase B — Plan

Produce a brief upgrade plan. This is for **transparency, not approval** — state what you intend to do, then do it.

### B1. Upgrade Order

Execute in this order. The rationale: upgrade the tools that validate code before upgrading the code they validate.

1. **Toolchain** (`@biomejs/biome`, `typescript`, `vitest`, `tsx`) — the validation and development tools themselves. Upgrading these first means all subsequent `npm run check` runs use the latest lint rules, type checker, and test runner.
2. **Framework** (`astro`, `@astrojs/starlight`, `@astrojs/vercel`) — the largest blast radius. These are version-coupled via peer dependencies and require coordinated upgrades. Migration guides are essential reading.
3. **Utility** (`chart.js`, `zod`, `gray-matter`, `@vercel/analytics`, and any others) — standalone dependencies with low coupling risk.

### B2. Strategy Decisions

For each dependency, decide:

- **Target version:** Latest? Latest compatible? Skip?
- **Pinning:** Should exact-pinned deps (Biome, Vitest) stay pinned? Should caret deps get pinned? Why?
- **Overrides:** Is each override still needed? Can any be removed after the parent dep upgrades?

### B3. Acknowledgment

State clearly in the plan output:

> "This plan upgrades aggressively. The branch is the safety checkpoint. If the result doesn't pass `npm run check`, the branch can be discarded. The intent is to bring the project to the best possible dependency state — not to preserve the current one."

Then proceed to execution.

---

## Phase C — Execute

### C0. Create Upgrade Branch

```
npm run session:start upgrade-deps-YYYY-MM-DD
```

If the session start script reports a dirty tree or failing baseline, resolve that first.

### C1. Toolchain Tier

Use ncu's doctor mode to safely upgrade toolchain deps with automatic rollback on failure:

```
npx npm-check-updates --doctor --doctorTest "npm run check" --filter "@biomejs/biome,typescript,vitest,tsx"
```

**Doctor mode behavior:** For each package, ncu upgrades it, runs the doctor test (`npm run check`), and automatically rolls back any upgrade that breaks the test. This is the programmatic equivalent of manual upgrade-test-rollback cycles.

After doctor mode completes:

1. **Review results.** Which upgrades succeeded? Which were rolled back?
2. **Resolve rollbacks.** For each rolled-back dep, investigate why `npm run check` failed:
    - **New Biome rules:** Run `npm run lint:fix` first — many new rule violations have auto-fixes. For the rest, update code to comply or disable the specific rule with rationale.
    - **TypeScript errors:** Resolve type errors introduced by stricter checking or changed type definitions. Modernize code, don't patch with `any`.
    - **Vitest API changes:** Update test files to match new API if test runner version changed.
    - After resolving, manually set the version in `package.json` and run `npm install` + `npm run check` to verify.
3. **Tree health:** Run `npm ls --depth=1` — confirm no unmet peer deps.
4. **Commit:** `chore: upgrade toolchain (biome, typescript, vitest)`

### C2. Framework Tier

**Do NOT use ncu doctor for framework deps.** Astro, Starlight, and the Vercel adapter are version-coupled via `peerDependencies`. They must be upgraded as a coordinated set.

1. **Check compatibility.** The recon manifest includes `frameworkCompat` with peer dep ranges. Use `npm view @astrojs/starlight@latest peerDependencies --json` and `npm view @astrojs/vercel@latest peerDependencies --json` to find versions compatible with each other.
2. **Choose a compatible version set.** All three packages must agree on the Astro version.
3. **Update `package.json`** with the chosen versions.
4. **Install:** `bun install` (or `npm install`).
    - If install fails due to peer dep conflicts: read the error, adjust versions to find a compatible set. **Never use `--legacy-peer-deps` or `--force`** — these hide problems.
5. **Tree health:** `npm ls --depth=1` — must show no unmet peers.
6. **Migration guide:** If a major Astro version bump occurred, follow the migration guide step by step. Apply config changes, remove deprecated APIs, adopt new patterns.
7. **Build:** `npm run build` — Astro build catches template and config issues.
8. **Full check:** `npm run check` — if failures occur, resolve them:
    - Remove deprecated configuration options
    - Update import paths that changed
    - Adopt new APIs replacing deprecated ones
    - **Modernize, don't patch around.** If Astro deprecated a pattern, adopt the new one. Don't suppress the warning.
9. **Commit:** `chore: upgrade astro ecosystem + resolve breaking changes`

### C3. Utility Tier

Use ncu doctor for everything not in toolchain or framework:

```
npx npm-check-updates --doctor --doctorTest "npm run check" --reject "astro,@astrojs/*,@biomejs/*,typescript,vitest,tsx"
```

1. **Review results** — resolve any rollbacks as in C1.
2. **Commit:** `chore: upgrade utility dependencies`

### C4. Overrides Review

For each override in `package.json`:

1. **Check if still needed.** Does the parent dependency now include the fix in its own transitive deps?
    - Run `npm ls <overridden-package>` to see who depends on it and what version they'd pull without the override.
    - Check the parent's changelog or release notes for whether the vulnerability/bug the override addresses has been fixed upstream.
2. **Remove stale overrides.** Update `package.json`, run `npm install`, then `npm ls` + `npm run check` to verify.
3. **Keep necessary overrides.** If the override is still needed, update the comment explaining why.
4. **Commit:** `chore: clean up stale dependency overrides` (or note that all overrides are still required)

### C5. Pinning Review

Review all version specifiers in `package.json`:

- **Exact pins** (e.g., `"2.4.5"`): Are these still appropriate? Were they pinned for a reason that still holds?
- **Carets** (e.g., `"^5.3.0"`): Should any of these be pinned after this upgrade?
- **Decision criteria:** Pin tools where specific behavior matters (linters, formatters, test runners). Use carets for libraries where minor updates are safe.

Apply changes if any. Commit separately if pinning strategy changes.

### C6. Post-Install Validation

1. **Tree health:** `npm ls` — must show no unmet peer deps, no invalid entries, no extraneous packages.
2. **Engine check:** If any upgrade required raising `engines.node`, update it in `package.json`. Note that this affects CI (GitHub Actions Node version) and deployment.

---

## Phase D — Validate & Clean

Final validation pass — this must be fully green before generating the briefing.

1. **`npm run check`** — full suite. Must pass with zero new errors.
2. **`npm audit`** — compare with the pre-upgrade audit from Phase A. Note improvements and any remaining advisories.
3. **`npm run build`** — production build must succeed. This is the definitive "does the site work" check.
4. **`npm run lint:fix`** — final cleanup pass. Commit any auto-fixed changes.
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
               "Astro 5.4 supports view transitions natively — replaces manual approach"
               "Vitest 5.0 dropped globals: true requirement" -->

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
     that should be adopted project-wide, opportunities unlocked by the upgrades. -->
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
    - Suggestion: run `npm run session:end` to merge, or review the branch first, or delete it if unsatisfied
4. **Marker:** "Upgrade Session Complete"

---

## Failure Modes

If the process reaches a state where `npm run check` cannot be made to pass despite reasonable effort:

1. **Partial success:** Commit the successful tiers, revert the failing tier. The briefing documents what worked and what didn't.
2. **Total failure:** Every tier broke something that can't be resolved. Document findings in the briefing anyway (so the next attempt has context), commit the briefing, and recommend the branch be deleted.
3. **NEVER force-merge broken code.** The red line is `npm run check` passing. No exceptions.
