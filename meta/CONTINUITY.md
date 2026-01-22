# CONTINUITY CHECKLIST

## ✅ Completed
- [x] Initial Project Setup (React/Node).
- [x] Dockerization (Client/Server/DB).
- [x] **Visual Overhaul**: "Obsidian & Gold" Theme (Slate-950, Indigo, Glassmorphism).
- [x] **Feature**: Advanced Transactions (Search, Filter, Edit, Delete).
- [x] **Feature**: Budget Dashboard (Month selector + overview endpoint).
- [x] **Feature**: Monthly Budget Planning (per-category limits + planned income).
- [x] **Feature**: Debts & Loans tracking page (CRUD).
- [x] **Feature**: Payment Schedule page + upcoming notifications endpoint.
- [x] **Integration**: n8n workflow template for Telegram reminders.
- [x] **Performance**: Staggered Animations (Framer Motion) & Optimized Tooltips (Tremor).
- [x] **Testing**: Integration tests passed (`npm test` in `server`).
- [x] **Localization**: Full RU/EN/DE support via `LanguageContext` (Login, Register, Dashboard, Landing).
- [x] **Refactor**: Fixed Auth API endpoint (`/auth/login`) and cleaned up `Login.jsx`.
- [x] **Assets**: Fixed "Futuristic Dashboard" image on Landing page and restored TrendingUp icon color.
- [x] **Indexing**: Generated index report in meta/INDEX_REPORT.md.
- [x] **Ops**: Updated run.sh with auto-install checks and Ubuntu remote access prep.
- [x] **Ops Fix**: Added Docker service start + sudo fallback for fresh Ubuntu hosts.
- [x] **Ops Fix**: Added public IP detection and remote URL output in run.sh.

## 🚧 In Progress / Next Steps (For Codex Agent)
- [ ] **Migrations**: Run `prisma db push` / migrations to apply new models (BudgetMonth, BudgetItem, Debt, ScheduleItem).
- [ ] **QA**: Verify tests still pass with server running (`npm test`).
- [ ] **Code Cleanup**: Remove any remaining unused CSS utility classes or legacy "Teal" styles if found.
- [ ] **Refinement**: Improve the mobile responsiveness of the Transaction table if needed.
- [ ] **UX Polish**: Add confirmation/toast feedback for schedule/debt edits.
- [ ] **Deployment**: Prepare Docker Compose for production (set `NODE_ENV=production`, valid secrets).
- [ ] **CI/CD**: Set up GitHub Actions or similar if repository is pushed.

## Critical Warnings
- `BudgetWeb.jsx` serves as the main Dashboard container.
- `Transactions.jsx` handles the full CRUD table.
- `Debts.jsx` and `Schedule.jsx` are new premium pages relying on `/api/debts` and `/api/schedules`.
- `LanguageContext.jsx` manages all translations. Add new keys here first.
- Use `npm test` in `server/` to verify backend logic before major refactors.
- The `index.css` contains the global "Obsidian" theme variables and scrollbar styles.
