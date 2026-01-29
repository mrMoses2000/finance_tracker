# Agent Log

| Date | Agent | Action | Result |
|------|-------|--------|--------|
| 2026-01-29 | Codex | Env Auto-Fill Script | Added scripts/ensure_env.sh and run.sh hook for interactive .env setup. |
| 2026-01-28 | Codex | Decimal + Audit + Rate Limit + Prod Compose | Money fields to Decimal, audit logs, API rate limiting, docker-compose.prod.yml. |
| 2026-01-28 | Codex | Security + Clawd Currency + Refactor | Modular server, currency conversion for Clawd, ownership checks, new tests. |
| 2026-01-22 | Antigravity | Full Stack Refactor | Split into Client/Server, added Auth, Dockerized. |
| 2026-01-22 | Antigravity | Visual Upgrade | Implemented Dark Glass theme + Tremor. |
| 2026-01-22 | Antigravity | Fix Build | Downgraded to Node 22/Prisma 5 to fix Docker. |
| 2026-01-23 | Antigravity | **Project Rescue (Premium Upgrade)** | Replaced "Teal" theme with "Obsidian & Gold". Added full CRUD Transactions, Edit Modal, Staggered Animations. |
| 2026-01-23 | Antigravity | **Optimization** | Applied Context7 patterns (Staggered List, Custom Tooltips). |
| 2026-01-23 | Antigravity | **Quality Assurance** | Added Live Integration Tests (`server/test/live.test.js`). Verified 100% Pass. |
| 2026-01-23 | Codex | **Architecture Expansion** | Added month-based budgeting, schedules/debts, new API endpoints, and n8n workflow template. |
| 2026-01-23 | Codex | **Ops Script** | Extended run.sh to auto-install dependencies and prep Ubuntu for remote access. |
| 2026-01-23 | Codex | **Ops Script Fix** | Added Docker service start + sudo fallback for first-run on Ubuntu. |
| 2026-01-23 | Codex | **Ops Script Fix** | Added public IP detection and remote URL output in run.sh. |
| 2026-01-23 | Codex | **UX/Theme Overhaul** | Added actual/plan dashboards, FullCalendar drag‑drop calendar, currency conversion, theme toggle, and updated labels. |
| 2026-01-23 | Codex | **Build Fix** | Pinned FullCalendar to v5 and corrected CSS imports to restore Vite build. |
| 2026-01-23 | Codex | **Ops Script Fix** | Added IMDSv2-aware public IP detection for AWS in run.sh. |
| 2026-01-23 | Codex | **UX + HTTPS Upgrade** | Added category management, budget item removal, EUR, donut totals, unified typography, light theme fixes, and HTTPS automation in run.sh. |
- **[2026-01-23] Final Polish (Antigravity)**: Fixed critical Login syntax error, restored correct API endpoint, corrected Landing Page dashboard image, and completed full localization (RU/EN/DE) for Auth screens.
- **[2026-01-23] Architecture Expansion (Codex)**: Implemented monthly budget flows, schedule/debt tracking UI/API, and n8n notification workflow JSON.
- **[2026-01-23] Ops Script (Codex)**: Updated run.sh with auto-install and safe remote-access prep for Ubuntu.
- **[2026-01-23] Ops Script Fix (Codex)**: Start Docker service automatically and use sudo if group permissions not active.
- **[2026-01-23] Ops Script Fix (Codex)**: Print remote access URL when running on Linux.
- **[2026-01-23] UX/Theme Overhaul (Codex)**: Added actual/plan dashboard tabs, FullCalendar calendar UX, currency conversion, theme toggle, and renamed Transactions to Operations.
- **[2026-01-23] Build Fix (Codex)**: Pinned FullCalendar to v5 and fixed CSS imports for a clean build.
- **[2026-01-23] Ops Script Fix (Codex)**: Updated run.sh to detect AWS public IP via IMDSv2.
- **[2026-01-23] UX + HTTPS Upgrade (Codex)**: Category management, budget item removal, EUR currency, donut total label, unified fonts, light theme fixes, and HTTPS automation in run.sh.
- **[2026-01-27] Default Categories Localization (Antigravity)**: Added `labelKey` to Category model, created DEFAULT_CATEGORIES for new users, implemented `getCategoryLabel` helper, localized all category displays (RU/EN/DE).
- **[2026-01-28] Clawd.bot Integration (Antigravity)**: Added `/api/clawd/*` endpoints for expense parsing, monthly summaries, budget alerts, and category listing. Added DuckDNS support to run.sh. Created separate `clawdbot-config` repository for Stockholm server deployment.
- **[2026-01-28] Security + Currency + Refactor (Codex)**: Fixed Clawd budget endpoints + currency conversion, added ownership checks/CORS/JWT expiry, modularized server routes, replaced tests.
- **[2026-01-28] Decimal + Audit + Rate Limit + Prod Compose (Codex)**: Converted money fields to Prisma Decimal with migration, added audit logs + rate limiting, and introduced `docker-compose.prod.yml`.
