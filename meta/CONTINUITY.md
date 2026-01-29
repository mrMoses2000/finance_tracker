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
- [x] **Localization**: Full RU/EN/DE support via `LanguageContext` (Login, Register, Dashboard, Landing).
- [x] **Assets**: Fixed "Futuristic Dashboard" image on Landing page and restored TrendingUp icon color.
- [x] **Indexing**: Generated index report in meta/INDEX_REPORT.md.
- [x] **Ops**: Updated run.sh with auto-install checks and Ubuntu remote access prep.
- [x] **Ops Fix**: Added Docker service start + sudo fallback for fresh Ubuntu hosts.
- [x] **Ops Fix**: Added public IP detection and remote URL output in run.sh.
- [x] **UX**: Два дашборда (Факт/План) с предупреждением о лимитах и отклонением от плана.
- [x] **UI**: FullCalendar для календарей (драг‑дроп, список по клику, иконки категорий).
- [x] **Finance**: Единая валюта по всему UI (отображение и ввод с конвертацией).
- [x] **Theme**: Переключатель светлой/темной темы + новая палитра (emerald/amber).
- [x] **Polish**: Исправлены цвета диаграммы/легенды и переименованы «Транзакции» → «Операции».
- [x] **Build**: Зафиксирован FullCalendar v5 и подключены корректные CSS стили для сборки.
- [x] **Ops**: В run.sh добавлено определение публичного IP через AWS IMDSv2.
- [x] **UX**: Добавлен менеджер категорий (создание/редактирование/удаление) и удаление бюджетных записей.
- [x] **UI**: В центре донат‑диаграмм отображается сумма, добавлена валюта EUR.
- [x] **Theme**: Унифицирован шрифт и исправлена читаемость в светлой теме.
- [x] **HTTPS**: run.sh поддерживает интерактивный HTTPS_MODE, short‑lived сертификаты и авто‑renew.
- [x] **Clawd Fix**: Исправлены `/api/clawd/*` (BudgetMonth) и добавлена конвертация валюты.
- [x] **Security**: JWT expiry + CORS config + ownership checks для всех сущностей.
- [x] **Refactor**: Бэкенд разбит на модули (routes/middleware/services/utils).
- [x] **Testing**: Обновлены Jest тесты (auth/expenses/ownership/clawd).
- [x] **Config**: Секреты вынесены в `.env` и добавлен `.env.example`.
- [x] **Data**: Денежные поля переведены на Prisma Decimal + миграция.
- [x] **Ops**: Добавлен `docker-compose.prod.yml` и режим `RUN_MODE=prod`.
- [x] **Security**: Rate limiting для API и auth.
- [x] **Observability**: AuditLog для всех mutating эндпоинтов.
- [x] **Ops**: Добавлен интерактивный `scripts/ensure_env.sh` для заполнения .env.
- [x] **Ops**: Добавлено меню сценариев (reset env / wipe DB / stop) перед запуском.
- [x] **Ops**: Добавлены preflight проверки зависимостей, .env и несовпадения кредов БД.
- [x] **Ops**: Добавлены опциональные авто‑флаги `AUTO_DB_PASSWORD` и `AUTO_CORS_ORIGINS`.
- [x] **Ops**: Интерактивные вопросы скриптов переведены на русский.
- [x] **Ops**: Безопасный парсинг .env без `source` (поддержка значений с пробелами).
- [x] **Plan**: Добавлен документ с планом интеграции clawd.bot, API и мессенджеров.
- [x] **Ops**: Нормализация .env (bool/int), авто‑CORS от HTTPS домена, поддержка `VAR=value` аргументов `run.sh`.
- [x] **Ops**: Авто‑CORS перезаписывает localhost CORS при заданном домене.
- [x] **Ops**: Wipe‑DB удаляет volume БД после compose down, чтобы не оставались старые креды.

## 🚧 In Progress / Next Steps (For Codex Agent)
- [ ] **Clawd.bot Deployment**: SSH into Stockholm server (16.171.28.19) and run deployment
- [ ] **Telegram Bot**: Create bot via @BotFather, configure token
- [ ] **API Token**: Generate secure token for Clawd.bot → Finance API communication
- [ ] **Testing**: Verify expense parsing via Telegram messages
- [ ] **Deployment**: Применить миграцию в проде (`npx prisma migrate deploy`).
- [ ] **Deployment**: Запуск в прод-режиме (`RUN_MODE=prod ./run.sh`).

## Clawd.bot Integration
**Domains**:
- Finance App: `moneycheckos.duckdns.org` → 18.184.198.233 (Frankfurt)
- Clawd.bot: `clawdmoneycheckos.duckdns.org` → 16.171.28.19 (Stockholm)

**API Endpoints** (implemented in `server/routes/clawd.js`):
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/clawd/expense` | POST | Add expense from natural language |
| `/api/clawd/summary` | GET | Monthly financial summary |
| `/api/clawd/alerts` | GET | Budget limit warnings (80%/95%/100%) |
| `/api/clawd/categories` | GET | Available categories with keywords |

**Related Repository**: `~/clawdbot-config` - deployment configuration for Clawd.bot

## Critical Warnings
- `BudgetWeb.jsx` serves as the main Dashboard container.
- `Transactions.jsx` handles the full CRUD table.
- `Debts.jsx` and `Schedule.jsx` are premium pages relying on `/api/debts` and `/api/schedules`.
- `LanguageContext.jsx` manages all translations. Add new keys here first.
- Use `npm test` in `server/` to verify backend logic before major refactors.
- The `index.css` contains the global "Obsidian" theme variables and scrollbar styles.
- **Clawd.bot API** endpoints live in `server/routes/clawd.js`.
