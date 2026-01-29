# future/USAGE.md — как использовать шаблоны

1) Скопировать в корень нового проекта:
   - USAGE.md
   - README.md
   - директории meta и scripts
   - .env.example (для локальных/серверных секретов)
2) Убедиться, что meta содержит все служебные документы.
3) Заполнить плейсхолдеры в meta/AGENTS.md, meta/CONTINUITY.md, README.md, meta/Info.md.
   > **ВАЖНО:** В `meta/AGENTS.md` есть блок "CRITICAL: START HERE". Убедитесь, что он на месте.
4) Оставить meta/AGENT_LOG.md и meta/COMMIT_MESSAGE.md в формате шаблона.
5) Запустить полный индекс:
   - rg --files
   - scripts/generate_index_report.sh
6) Обновить Agent Stamp в meta/AGENTS.md и добавить запись в meta/AGENT_LOG.md.
7) Секреты хранить только в `.env` на серверах/локально, не коммитить.
8) Если добавляете новые переменные (rate limit, audit log, prod профили), обновляйте `.env.example` и README.
9) `run.sh` вызывает `scripts/ensure_env.sh` для интерактивного заполнения `.env` и выбора сценария (reset env / wipe DB / stop), а также делает preflight‑проверки.
10) Опционально: `AUTO_DB_PASSWORD=true` и `AUTO_CORS_ORIGINS=true` + `CORS_DOMAIN=example.com`.
11) Если `HTTPS_MODE=domain` и задан `DOMAIN`, скрипт выставит `CORS_DOMAIN` автоматически и перезапишет localhost CORS.
12) При режиме wipe‑db скрипт дополнительно проверяет и удаляет volume БД.
13) Можно передавать env‑переопределения как `VAR=value ./run.sh` или `./run.sh VAR=value`.
14) Авто‑режим доступен в меню скрипта (без длинных параметров).
15) `.env` можно оставлять с пробелами в значениях — скрипт читает безопасно.
16) Курсы валют берутся из Центрального Банка (CBR) 2 раза в сутки через cron внутри сервера.
17) Быстрое обновление контейнеров без интерактива: `RUN_ACTION=update ./run.sh` (доступно и как пункт меню в интерактиве).
