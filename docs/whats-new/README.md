# What's New

Per-session upgrade briefings. Each file documents what was upgraded, what breaking changes were resolved, and what opportunities the upgrades create for subsequent sessions.

**Created by:** The `dependency-upgrade` prompt (`.github/prompts/dependency-upgrade.prompt.md`)

**Naming:** `YYYY-MM-DD.md` — one file per upgrade session, dated.

**Audience:** The next session's agent (or human). Written as actionable intelligence, not a changelog.

**Lifecycle:** Date files are consumed (read, acted upon, then deleted) by the next session. Actionable items get absorbed into `docs/side-tracks.md` or resolved directly. The `2026-03-09.md` briefing was consumed on 2026-03-11 — dependency override tracking and Zod v4 blocker moved to side-tracks.
