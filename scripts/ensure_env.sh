#!/usr/bin/env bash
set -euo pipefail
set +H

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"
EXAMPLE_FILE="${EXAMPLE_FILE:-$ROOT_DIR/.env.example}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.yml}"
COMPOSE_CMD="${COMPOSE_CMD:-}"
ENV_SETUP_MODE="${ENV_SETUP_MODE:-}"
AUTO_DB_PASSWORD="${AUTO_DB_PASSWORD:-}"
AUTO_CORS_ORIGINS="${AUTO_CORS_ORIGINS:-}"
CORS_DOMAIN="${CORS_DOMAIN:-}"
AUTO_MODE="${AUTO_MODE:-}"
AUTO_JWT_SECRET="${AUTO_JWT_SECRET:-}"

is_tty() {
  [ -t 0 ]
}

resolve_compose_cmd() {
  if [ -n "$COMPOSE_CMD" ]; then
    return 0
  fi
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
    return 0
  fi
  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
    return 0
  fi
  return 1
}

compose_project_name() {
  if [ -n "${COMPOSE_PROJECT_NAME:-}" ]; then
    echo "$COMPOSE_PROJECT_NAME"
  else
    basename "$ROOT_DIR"
  fi
}

remove_db_volume() {
  local project volume removed=0
  project="$(compose_project_name)"
  volume="${project}_postgres_data"

  if docker volume ls --format '{{.Name}}' 2>/dev/null | grep -qx "$volume"; then
    docker volume rm "$volume" >/dev/null 2>&1 || true
    removed=1
  elif command -v sudo >/dev/null 2>&1; then
    if sudo docker volume ls --format '{{.Name}}' 2>/dev/null | grep -qx "$volume"; then
      sudo docker volume rm "$volume" >/dev/null 2>&1 || true
      removed=1
    fi
  fi

  if [ "$removed" -eq 1 ]; then
    echo "[INFO] Удалён volume БД: $volume"
  fi
}

compose_down() {
  local extra="${1-}"
  if ! resolve_compose_cmd; then
    echo "[WARN] Docker Compose недоступен; пропускаю действия с compose." >&2
    return 1
  fi
  local cmd_parts=()
  read -r -a cmd_parts <<< "$COMPOSE_CMD"
  "${cmd_parts[@]}" -f "$COMPOSE_FILE" down $extra
}

sanitize_env_file() {
  if [ ! -f "$ENV_FILE" ]; then
    return 0
  fi
  local tmp
  tmp="$(mktemp)"
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
      printf '%s\n' "$line" >> "$tmp"
      continue
    fi
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      local key value
      key="${line%%=*}"
      value="${line#*=}"
      value="${value#"${value%%[![:space:]]*}"}"
      value="${value%"${value##*[![:space:]]}"}"
      if [[ "$value" =~ [[:space:]] ]] && [[ ! "$value" =~ ^\".*\"$ ]] && [[ ! "$value" =~ ^\'.*\'$ ]]; then
        printf '%s="%s"\n' "$key" "$value" >> "$tmp"
      else
        printf '%s\n' "$line" >> "$tmp"
      fi
    else
      printf '# INVALID: %s\n' "$line" >> "$tmp"
    fi
  done < "$ENV_FILE"
  mv "$tmp" "$ENV_FILE"
}

ensure_env_file() {
  if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$EXAMPLE_FILE" ]; then
      cp "$EXAMPLE_FILE" "$ENV_FILE"
    else
      : > "$ENV_FILE"
    fi
  fi
}

load_env() {
  sanitize_env_file
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
      continue
    fi
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      local key value
      key="${line%%=*}"
      value="${line#*=}"
      value="${value#"${value%%[![:space:]]*}"}"
      value="${value%"${value##*[![:space:]]}"}"
      if [[ "$value" =~ ^\".*\"$ ]]; then
        value="${value:1:${#value}-2}"
      elif [[ "$value" =~ ^\'.*\'$ ]]; then
        value="${value:1:${#value}-2}"
      fi
      export "$key=$value"
    fi
  done < "$ENV_FILE"
}

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
    return
  fi
  od -An -tx1 -N32 /dev/urandom | tr -d ' \n'
}

write_env_kv() {
  local key="$1"
  local value="$2"
  local tmp
  tmp="$(mktemp)"
  local found=0
  if [[ "$value" =~ [[:space:]] ]] && [[ ! "$value" =~ ^\".*\"$ ]] && [[ ! "$value" =~ ^\'.*\'$ ]]; then
    value="\"$value\""
  fi
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ "$line" == "$key="* ]]; then
      printf '%s=%s\n' "$key" "$value" >> "$tmp"
      found=1
    else
      printf '%s\n' "$line" >> "$tmp"
    fi
  done < "$ENV_FILE"

  if [ "$found" -eq 0 ]; then
    printf '%s=%s\n' "$key" "$value" >> "$tmp"
  fi

  mv "$tmp" "$ENV_FILE"
}

prompt_value() {
  local key="$1"
  local prompt="$2"
  local default="${3-}"
  local secret="${4-}"
  local value=""

  if [ "${AUTO_MODE:-}" == "true" ] && [ -n "$default" ] && [ "$secret" != "secret" ]; then
    write_env_kv "$key" "$default"
    export "$key=$default"
    return
  fi

  if ! is_tty; then
    echo "[ERROR] Нет $key и нет TTY. Укажи в $ENV_FILE." >&2
    exit 1
  fi

  if [ -n "$default" ]; then
    prompt="$prompt [$default]"
  fi

  if [ "$secret" == "secret" ]; then
    read -r -s -p "$prompt: " value
    echo ""
  else
    read -r -p "$prompt: " value
  fi

  if [ -z "$value" ] && [ -n "$default" ]; then
    value="$default"
  fi

  write_env_kv "$key" "$value"
  export "$key=$value"
}

prompt_yes_no() {
  local prompt="$1"
  local default_yes="${2-}"
  local value=""
  local default="N"
  if [ "$default_yes" == "yes" ]; then
    default="Y"
  fi
  if ! is_tty; then
    if [ "$default" == "Y" ]; then
      return 0
    fi
    return 1
  fi
  read -r -p "$prompt [${default}/n]: " value
  value="${value:-$default}"
  if [[ "$value" =~ ^[Yy]$ ]]; then
    return 0
  fi
  return 1
}

normalize_bool() {
  local key="$1"
  local default="$2"
  local val="${!key:-}"
  local lowered=""
  lowered="$(printf '%s' "$val" | tr '[:upper:]' '[:lower:]')"
  case "$lowered" in
    true|false)
      if [ "$lowered" != "$val" ]; then
        write_env_kv "$key" "$lowered"
        export "$key=$lowered"
      fi
      return 0
      ;;
  esac
  if [ -n "$val" ]; then
    echo "[WARN] Некорректное значение $key=$val. Устанавливаю $default."
  fi
  write_env_kv "$key" "$default"
  export "$key=$default"
}

normalize_int() {
  local key="$1"
  local default="$2"
  local val="${!key:-}"
  if [[ "$val" =~ ^[0-9]+$ ]]; then
    return 0
  fi
  if [ -n "$val" ]; then
    echo "[WARN] Некорректное число $key=$val. Устанавливаю $default."
  fi
  write_env_kv "$key" "$default"
  export "$key=$default"
}

ensure_jwt_strength() {
  local val="${JWT_SECRET:-}"
  if [ -z "$val" ]; then
    return 0
  fi
  if [ "${#val}" -ge 32 ]; then
    return 0
  fi
  if [ "$AUTO_JWT_SECRET" == "true" ] || ! is_tty; then
    jwt_secret="$(generate_secret)"
    write_env_kv "JWT_SECRET" "$jwt_secret"
    export JWT_SECRET="$jwt_secret"
    return 0
  fi
  if prompt_yes_no "JWT_SECRET слишком короткий. Сгенерировать новый?" "yes"; then
    jwt_secret="$(generate_secret)"
    write_env_kv "JWT_SECRET" "$jwt_secret"
    export JWT_SECRET="$jwt_secret"
  else
    echo "[WARN] JWT_SECRET слишком короткий — рекомендуется заменить."
  fi
}

set_cors_from_domain() {
  local domain="$1"
  domain="${domain#https://}"
  domain="${domain#http://}"
  if [ -z "$domain" ]; then
    return 1
  fi
  write_env_kv "CORS_ORIGINS" "https://$domain"
  export CORS_ORIGINS="https://$domain"
  return 0
}

detect_nginx_proxy() {
  local conf="$ROOT_DIR/client/nginx.conf"
  if [ -f "$conf" ] && grep -q "proxy_pass http://server:4000" "$conf"; then
    return 0
  fi
  return 1
}

show_menu() {
  if ! is_tty; then
    return 0
  fi

  echo ""
  echo "=== Настройка окружения ==="
  echo "1) Использовать существующий .env (заполнить только пропуски)"
  echo "2) Пересоздать .env из .env.example и заполнить"
  echo "3) Снести БД (volume) и пересоздать .env (ОПАСНО)"
  echo "4) Авто‑режим (минимум вопросов, больше автогенерации)"
  echo "5) Остановить контейнеры и выйти"
  echo "6) Выйти без изменений"
  echo ""
  local choice=""
  read -r -p "Выберите вариант [1-6]: " choice

  case "$choice" in
    1|"")
      ENV_SETUP_MODE="keep"
      ;;
    2)
      ENV_SETUP_MODE="reset-env"
      ;;
    3)
      ENV_SETUP_MODE="wipe-db"
      ;;
    4)
      ENV_SETUP_MODE="auto"
      ;;
    5)
      ENV_SETUP_MODE="stop"
      ;;
    6)
      ENV_SETUP_MODE="exit"
      ;;
    *)
      echo "[WARN] Неизвестный выбор, использую вариант 1."
      ENV_SETUP_MODE="keep"
      ;;
  esac
}

apply_mode() {
  case "$ENV_SETUP_MODE" in
    "" )
      show_menu
      ;;
  esac

  case "$ENV_SETUP_MODE" in
    keep)
      ;;
    reset-env)
      if [ -f "$EXAMPLE_FILE" ]; then
        cp "$EXAMPLE_FILE" "$ENV_FILE"
      else
        : > "$ENV_FILE"
      fi
      ;;
    wipe-db)
      if is_tty; then
        read -r -p "Это удалит данные БД (volume). Продолжить? [y/N]: " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
          echo "[INFO] Удаление отменено."
        else
          compose_down "-v" || true
          remove_db_volume || true
          if [ -f "$EXAMPLE_FILE" ]; then
            cp "$EXAMPLE_FILE" "$ENV_FILE"
          else
            : > "$ENV_FILE"
          fi
        fi
      else
        compose_down "-v" || true
        remove_db_volume || true
        if [ -f "$EXAMPLE_FILE" ]; then
          cp "$EXAMPLE_FILE" "$ENV_FILE"
        else
          : > "$ENV_FILE"
        fi
      fi
      ;;
    auto)
      if is_tty; then
        read -r -p "Запустить авто‑режим (минимум вопросов)? [y/N]: " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
          ENV_SETUP_MODE="keep"
        else
          AUTO_MODE="true"
          AUTO_DB_PASSWORD="true"
          AUTO_CORS_ORIGINS="true"
          AUTO_JWT_SECRET="true"
          if [ -f "$EXAMPLE_FILE" ]; then
            cp "$EXAMPLE_FILE" "$ENV_FILE"
          else
            : > "$ENV_FILE"
          fi
        fi
      else
        AUTO_MODE="true"
        AUTO_DB_PASSWORD="true"
        AUTO_CORS_ORIGINS="true"
        AUTO_JWT_SECRET="true"
        if [ -f "$EXAMPLE_FILE" ]; then
          cp "$EXAMPLE_FILE" "$ENV_FILE"
        else
          : > "$ENV_FILE"
        fi
      fi
      ;;
    stop)
      compose_down "" || true
      exit 0
      ;;
    exit)
      exit 0
      ;;
  esac
}

ensure_env_file
apply_mode
load_env

# Helpers to detect placeholders
is_placeholder() {
  local val="$1"
  case "$val" in
    ""|change_me|change_me_secure|admin@example.com|user|password|dev_secret_for_tests)
      return 0
      ;;
  esac
  return 1
}

is_default_cors() {
  local val="$1"
  case "$val" in
    "http://localhost:3000,http://localhost:5173"|\
    "http://localhost:3000, http://localhost:5173"|\
    "http://localhost:5173,http://localhost:3000"|\
    "http://localhost:5173, http://localhost:3000")
      return 0
      ;;
  esac
  return 1
}

# Database credentials
if is_placeholder "${POSTGRES_USER:-}"; then
  prompt_value "POSTGRES_USER" "Пользователь Postgres" "budget_user"
fi
if is_placeholder "${POSTGRES_PASSWORD:-}"; then
  if [ "$AUTO_DB_PASSWORD" == "true" ]; then
    db_pass="$(generate_secret)"
    write_env_kv "POSTGRES_PASSWORD" "$db_pass"
    export POSTGRES_PASSWORD="$db_pass"
  else
    if [ "$AUTO_DB_PASSWORD" == "false" ]; then
      prompt_value "POSTGRES_PASSWORD" "Пароль Postgres" "" "secret"
    else
      if prompt_yes_no "Сгенерировать пароль БД автоматически?" "yes"; then
        db_pass="$(generate_secret)"
        write_env_kv "POSTGRES_PASSWORD" "$db_pass"
        export POSTGRES_PASSWORD="$db_pass"
      else
        prompt_value "POSTGRES_PASSWORD" "Пароль Postgres" "" "secret"
      fi
    fi
  fi
fi
if is_placeholder "${POSTGRES_DB:-}"; then
  prompt_value "POSTGRES_DB" "Имя базы Postgres" "budget_app"
fi

# JWT
if is_placeholder "${JWT_SECRET:-}"; then
  if [ "$AUTO_JWT_SECRET" == "true" ]; then
    jwt_secret="$(generate_secret)"
    write_env_kv "JWT_SECRET" "$jwt_secret"
    export JWT_SECRET="$jwt_secret"
  elif is_tty; then
    local_choice=""
    read -r -p "Сгенерировать JWT_SECRET автоматически? [Y/n]: " local_choice
    local_choice="${local_choice:-Y}"
    if [[ "$local_choice" =~ ^[Yy]$ ]]; then
      jwt_secret="$(generate_secret)"
      write_env_kv "JWT_SECRET" "$jwt_secret"
      export JWT_SECRET="$jwt_secret"
    else
      prompt_value "JWT_SECRET" "JWT секрет (длинная случайная строка)" "" "secret"
    fi
  else
    jwt_secret="$(generate_secret)"
    write_env_kv "JWT_SECRET" "$jwt_secret"
    export JWT_SECRET="$jwt_secret"
  fi
fi

if is_placeholder "${JWT_EXPIRES_IN:-}"; then
  write_env_kv "JWT_EXPIRES_IN" "7d"
  export JWT_EXPIRES_IN="7d"
fi
ensure_jwt_strength

# CORS
if is_placeholder "${CORS_ALLOW_ALL:-}"; then
  write_env_kv "CORS_ALLOW_ALL" "false"
  export CORS_ALLOW_ALL="false"
fi
normalize_bool "CORS_ALLOW_ALL" "false"

if [ -n "$CORS_DOMAIN" ] || [ "$AUTO_CORS_ORIGINS" == "true" ]; then
  if [ -z "$CORS_DOMAIN" ]; then
    prompt_value "CORS_DOMAIN" "Домен для CORS (пример: moneycheckos.duckdns.org)" ""
    CORS_DOMAIN="${CORS_DOMAIN:-}"
  fi
  if set_cors_from_domain "$CORS_DOMAIN"; then
    :
  elif is_placeholder "${CORS_ORIGINS:-}" || is_default_cors "${CORS_ORIGINS:-}"; then
    prompt_value "CORS_ORIGINS" "Разрешённые CORS домены (через запятую)" "http://localhost:3000,http://localhost:5173"
  fi
elif [ "$AUTO_CORS_ORIGINS" == "false" ]; then
  if is_placeholder "${CORS_ORIGINS:-}" || is_default_cors "${CORS_ORIGINS:-}"; then
    prompt_value "CORS_ORIGINS" "Разрешённые CORS домены (через запятую)" "http://localhost:3000,http://localhost:5173"
  fi
else
  if is_placeholder "${CORS_ORIGINS:-}" || is_default_cors "${CORS_ORIGINS:-}"; then
    if prompt_yes_no "Автонастройка CORS по домену?" "no"; then
      prompt_value "CORS_DOMAIN" "Домен для CORS (пример: moneycheckos.duckdns.org)" ""
      CORS_DOMAIN="${CORS_DOMAIN:-}"
      if ! set_cors_from_domain "$CORS_DOMAIN"; then
        prompt_value "CORS_ORIGINS" "Разрешённые CORS домены (через запятую)" "http://localhost:3000,http://localhost:5173"
      fi
    else
      prompt_value "CORS_ORIGINS" "Разрешённые CORS домены (через запятую)" "http://localhost:3000,http://localhost:5173"
    fi
  fi
fi

# Proxy
if is_placeholder "${TRUST_PROXY:-}"; then
  if detect_nginx_proxy; then
    prompt_value "TRUST_PROXY" "Backend за reverse‑proxy (nginx/Cloudflare)? (true/false)" "true"
  else
    prompt_value "TRUST_PROXY" "Backend за reverse‑proxy (nginx/Cloudflare)? (true/false)" "false"
  fi
fi

normalize_bool "TRUST_PROXY" "false"

# Rate limiting
if is_placeholder "${RATE_LIMIT_ENABLED:-}"; then
  write_env_kv "RATE_LIMIT_ENABLED" "true"
  export RATE_LIMIT_ENABLED="true"
fi
if is_placeholder "${RATE_LIMIT_WINDOW_MS:-}"; then
  write_env_kv "RATE_LIMIT_WINDOW_MS" "900000"
  export RATE_LIMIT_WINDOW_MS="900000"
fi
if is_placeholder "${RATE_LIMIT_MAX:-}"; then
  write_env_kv "RATE_LIMIT_MAX" "300"
  export RATE_LIMIT_MAX="300"
fi
if is_placeholder "${RATE_LIMIT_AUTH_WINDOW_MS:-}"; then
  write_env_kv "RATE_LIMIT_AUTH_WINDOW_MS" "900000"
  export RATE_LIMIT_AUTH_WINDOW_MS="900000"
fi
if is_placeholder "${RATE_LIMIT_AUTH_MAX:-}"; then
  write_env_kv "RATE_LIMIT_AUTH_MAX" "20"
  export RATE_LIMIT_AUTH_MAX="20"
fi

normalize_bool "RATE_LIMIT_ENABLED" "true"
normalize_int "RATE_LIMIT_WINDOW_MS" "900000"
normalize_int "RATE_LIMIT_MAX" "300"
normalize_int "RATE_LIMIT_AUTH_WINDOW_MS" "900000"
normalize_int "RATE_LIMIT_AUTH_MAX" "20"

# Audit log
if is_placeholder "${AUDIT_LOG_ENABLED:-}"; then
  write_env_kv "AUDIT_LOG_ENABLED" "true"
  export AUDIT_LOG_ENABLED="true"
fi
normalize_bool "AUDIT_LOG_ENABLED" "true"

# Seed admin (optional)
if is_placeholder "${SEED_ADMIN:-}"; then
  write_env_kv "SEED_ADMIN" "false"
  export SEED_ADMIN="false"
fi
normalize_bool "SEED_ADMIN" "false"
if is_placeholder "${SEED_ADMIN_EMAIL:-}"; then
  write_env_kv "SEED_ADMIN_EMAIL" "admin@example.com"
  export SEED_ADMIN_EMAIL="admin@example.com"
fi
if is_placeholder "${SEED_ADMIN_PASSWORD:-}"; then
  write_env_kv "SEED_ADMIN_PASSWORD" "change_me_secure"
  export SEED_ADMIN_PASSWORD="change_me_secure"
fi
if is_placeholder "${SEED_ADMIN_NAME:-}"; then
  write_env_kv "SEED_ADMIN_NAME" "Admin User"
  export SEED_ADMIN_NAME="Admin User"
fi

validate_required() {
  local missing=()
  local key

  for key in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB JWT_SECRET; do
    if is_placeholder "${!key:-}"; then
      missing+=("$key")
    fi
  done

  if [[ "${CORS_ALLOW_ALL:-false}" != "true" ]]; then
    if is_placeholder "${CORS_ORIGINS:-}"; then
      missing+=("CORS_ORIGINS")
    fi
  fi

  if [ "${#missing[@]}" -gt 0 ]; then
    echo "[ERROR] В .env отсутствуют или стоят заглушки: ${missing[*]}" >&2
    echo "[HINT] Запусти с ENV_SETUP_MODE=reset-env или поправь .env вручную." >&2
    exit 1
  fi
}

validate_required

echo "[OK] Файл окружения готов: $ENV_FILE"
echo "[INFO] Если меняли креды БД при старом volume, выполните:"
echo "       docker compose down -v && docker compose up -d --build"
