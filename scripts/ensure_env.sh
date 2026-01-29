#!/usr/bin/env bash
set -euo pipefail
set +H

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"
EXAMPLE_FILE="${EXAMPLE_FILE:-$ROOT_DIR/.env.example}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.yml}"
COMPOSE_CMD="${COMPOSE_CMD:-}"
ENV_SETUP_MODE="${ENV_SETUP_MODE:-}"

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

compose_down() {
  local extra="${1-}"
  if ! resolve_compose_cmd; then
    echo "[WARN] Docker Compose not available; skipping compose actions." >&2
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
      printf '%s\n' "$line" >> "$tmp"
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
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
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

  if ! is_tty; then
    echo "[ERROR] Missing $key and no TTY available. Set it in $ENV_FILE." >&2
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

show_menu() {
  if ! is_tty; then
    return 0
  fi

  echo ""
  echo "=== Environment Setup ==="
  echo "1) Use existing .env (fill missing only)"
  echo "2) Reset .env from .env.example and prompt"
  echo "3) Wipe database volumes and reset .env (DESTRUCTIVE)"
  echo "4) Stop containers and exit"
  echo "5) Exit without changes"
  echo ""
  local choice=""
  read -r -p "Choose an option [1-5]: " choice

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
      ENV_SETUP_MODE="stop"
      ;;
    5)
      ENV_SETUP_MODE="exit"
      ;;
    *)
      echo "[WARN] Unknown choice, defaulting to option 1."
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
        read -r -p "This will DELETE the database volume. Continue? [y/N]: " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
          echo "[INFO] Cancelled wipe."
        else
          compose_down "-v" || true
          if [ -f "$EXAMPLE_FILE" ]; then
            cp "$EXAMPLE_FILE" "$ENV_FILE"
          else
            : > "$ENV_FILE"
          fi
        fi
      else
        compose_down "-v" || true
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

# Database credentials
if is_placeholder "${POSTGRES_USER:-}"; then
  prompt_value "POSTGRES_USER" "Postgres user" "budget_user"
fi
if is_placeholder "${POSTGRES_PASSWORD:-}"; then
  prompt_value "POSTGRES_PASSWORD" "Postgres password" "" "secret"
fi
if is_placeholder "${POSTGRES_DB:-}"; then
  prompt_value "POSTGRES_DB" "Postgres database name" "budget_app"
fi

# JWT
if is_placeholder "${JWT_SECRET:-}"; then
  if is_tty; then
    local_choice=""
    read -r -p "Generate JWT_SECRET automatically? [Y/n]: " local_choice
    local_choice="${local_choice:-Y}"
    if [[ "$local_choice" =~ ^[Yy]$ ]]; then
      jwt_secret="$(generate_secret)"
      write_env_kv "JWT_SECRET" "$jwt_secret"
      export JWT_SECRET="$jwt_secret"
    else
      prompt_value "JWT_SECRET" "JWT secret (long random string)" "" "secret"
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

# CORS
if is_placeholder "${CORS_ALLOW_ALL:-}"; then
  write_env_kv "CORS_ALLOW_ALL" "false"
  export CORS_ALLOW_ALL="false"
fi

if is_placeholder "${CORS_ORIGINS:-}"; then
  prompt_value "CORS_ORIGINS" "Allowed CORS origins (comma-separated)" "http://localhost:3000,http://localhost:5173"
fi

# Proxy
if is_placeholder "${TRUST_PROXY:-}"; then
  prompt_value "TRUST_PROXY" "Behind reverse proxy? (true/false)" "false"
fi

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

# Audit log
if is_placeholder "${AUDIT_LOG_ENABLED:-}"; then
  write_env_kv "AUDIT_LOG_ENABLED" "true"
  export AUDIT_LOG_ENABLED="true"
fi

# Seed admin (optional)
if is_placeholder "${SEED_ADMIN:-}"; then
  write_env_kv "SEED_ADMIN" "false"
  export SEED_ADMIN="false"
fi
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
    echo "[ERROR] Missing or placeholder values in .env: ${missing[*]}" >&2
    echo "[HINT] Re-run with ENV_SETUP_MODE=reset-env or edit .env manually." >&2
    exit 1
  fi
}

validate_required

echo "[OK] Environment file is ready: $ENV_FILE"
echo "[INFO] If you changed DB credentials for an existing DB volume, you may need:"
echo "       docker compose down -v && docker compose up -d --build"
