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
9) `run.sh` вызывает `scripts/ensure_env.sh` для интерактивного заполнения `.env` и выбора сценария (reset env / wipe DB / stop).
