# План интеграции clawd.bot, сервера и сообщений

Цель: единое хранилище данных (Postgres на сервере) и единый API (наш backend на :4000), к которому могут безопасно обращаться и веб-клиент, и clawd.bot (Gemini CLI), и будущие мессенджеры.

## 0) Решение по хранилищу
- Оставляем локальный Postgres на AWS. Это достаточно для t3.small и проще в обслуживании.
- Supabase может быть опционален как внешний managed-провайдер, но не обязателен для текущего масштаба.
- Условие: все записи идут через наш backend, а не напрямую в БД.

## 1) Единая точка доступа: Backend API
- Весь ввод (web и bot) идет в наш backend, который:
  - валидирует JSON,
  - нормализует валюту/категории,
  - пишет в БД,
  - пишет аудит-лог.
- Nginx принимает HTTPS (443) и проксирует на http://localhost:4000.

## 2) Bot-API и схема действий
Добавить отдельный, строгий endpoint, например:
- POST /api/bot/actions

Схема действий (пример):
- action = "create_expense"
- action = "create_income"
- action = "set_budget_item"
- action = "get_summary"

Строгие поля:
- action: string
- payload: object (по каждому действию своя схема)
- idempotency_key: string (защита от дублей)

Пример payload:
- create_expense: { text, date?, currency? }
- create_income: { text, date?, currency? }
- set_budget_item: { month, category_id, planned_amount, currency? }
- get_summary: { month?, currency? }

## 3) Валидация и ошибки
- Ввести JSON Schema или Zod/AJV для каждого action.
- Ошибки должны быть детальными и машиночитаемыми:
  - { error: "validation_error", details: [...] }
- Любой неверный запрос = 400.

## 4) Аутентификация и права
- Оставляем JWT, но добавляем отдельный "bot token" на пользователя:
  - таблица api_tokens (user_id, token_hash, name, scopes, expires_at)
- Для bot-токенов отдельная проверка:
  - не через /auth/login, а по header X-Bot-Token.
- Scopes для действий:
  - expenses:write, budgets:write, summaries:read

## 5) Prompt для Gemini CLI
Сделать строгий системный промпт:
- возвращать ТОЛЬКО JSON
- не добавлять пояснений
- использовать только описанную схему
- добавлять idempotency_key

Пример (для action create_expense):
```
Ты помощник. Возвращай только JSON.
Схема:
{ "action": "create_expense", "payload": {"text": "...", "date": "YYYY-MM-DD"? , "currency": "USD"? }, "idempotency_key": "uuid" }
Не добавляй комментариев или текста.
```

## 6) Мессенджеры и верификация пользователя
Варианты:
A) Через Telegram бот (самый простой):
- В личном кабинете генерируем одноразовый код.
- Пользователь пишет боту: /link <код>
- Сервер связывает telegram_id с user_id.

B) Через WhatsApp (дороже, сложнее):
- Использовать WhatsApp Business API / Twilio.
- Аналогичная схема linking-кода.

Хранение:
- таблица user_contacts (user_id, telegram_id, whatsapp_id, phone)
- таблица conversations/messages (для контекста диалога)

## 7) Логирование и безопасность
- Все bot-запросы пишутся в audit_log (source=bot).
- Лимиты по rate-limit для bot endpoint.
- Отдельный key для clawd.bot (переиспользуем api_tokens).
- Ротация токенов.

## 8) Минимальный MVP
1) Добавить endpoint /api/bot/actions.
2) Реализовать 4 действия: create_expense, create_income, set_budget_item, get_summary.
3) Схема валидации + понятные ошибки.
4) Генерация bot-token в личном кабинете.
5) Простейший prompt для Gemini CLI.

## 9) Расширение
- Контекст диалогов + хранение истории
- Интеграция Telegram/WhatsApp
- Управление напоминаниями (cron)

## 10) Открытые вопросы
- Нужен ли multi-user режим (несколько клиентов)?
- Нужен ли общий доступ на семью/организацию?
- Список действий для MVP (что приоритетнее всего?)

