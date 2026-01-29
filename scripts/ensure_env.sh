#!/usr/bin/env bash
set -euo pipefail
set +H

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"
EXAMPLE_FILE="${EXAMPLE_FILE:-$ROOT_DIR/.env.example}"

is_tty() {
  [ -t 0 ]
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

ensure_env_file
load_env

# Database credentials
if [ -z "${POSTGRES_USER:-}" ]; then
  prompt_value "POSTGRES_USER" "Postgres user" "budget_user"
fi
if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  prompt_value "POSTGRES_PASSWORD" "Postgres password" "" "secret"
fi
if [ -z "${POSTGRES_DB:-}" ]; then
  prompt_value "POSTGRES_DB" "Postgres database name" "budget_app"
fi

# JWT
if [ -z "${JWT_SECRET:-}" ]; then
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

if [ -z "${JWT_EXPIRES_IN:-}" ]; then
  write_env_kv "JWT_EXPIRES_IN" "7d"
  export JWT_EXPIRES_IN="7d"
fi

# CORS
if [ -z "${CORS_ALLOW_ALL:-}" ]; then
  write_env_kv "CORS_ALLOW_ALL" "false"
  export CORS_ALLOW_ALL="false"
fi

if [ -z "${CORS_ORIGINS:-}" ]; then
  prompt_value "CORS_ORIGINS" "Allowed CORS origins (comma-separated)" "http://localhost:3000,http://localhost:5173"
fi

# Proxy
if [ -z "${TRUST_PROXY:-}" ]; then
  prompt_value "TRUST_PROXY" "Behind reverse proxy? (true/false)" "false"
fi

# Rate limiting
if [ -z "${RATE_LIMIT_ENABLED:-}" ]; then
  write_env_kv "RATE_LIMIT_ENABLED" "true"
  export RATE_LIMIT_ENABLED="true"
fi
if [ -z "${RATE_LIMIT_WINDOW_MS:-}" ]; then
  write_env_kv "RATE_LIMIT_WINDOW_MS" "900000"
  export RATE_LIMIT_WINDOW_MS="900000"
fi
if [ -z "${RATE_LIMIT_MAX:-}" ]; then
  write_env_kv "RATE_LIMIT_MAX" "300"
  export RATE_LIMIT_MAX="300"
fi
if [ -z "${RATE_LIMIT_AUTH_WINDOW_MS:-}" ]; then
  write_env_kv "RATE_LIMIT_AUTH_WINDOW_MS" "900000"
  export RATE_LIMIT_AUTH_WINDOW_MS="900000"
fi
if [ -z "${RATE_LIMIT_AUTH_MAX:-}" ]; then
  write_env_kv "RATE_LIMIT_AUTH_MAX" "20"
  export RATE_LIMIT_AUTH_MAX="20"
fi

# Audit log
if [ -z "${AUDIT_LOG_ENABLED:-}" ]; then
  write_env_kv "AUDIT_LOG_ENABLED" "true"
  export AUDIT_LOG_ENABLED="true"
fi

# Seed admin (optional)
if [ -z "${SEED_ADMIN:-}" ]; then
  write_env_kv "SEED_ADMIN" "false"
  export SEED_ADMIN="false"
fi
if [ -z "${SEED_ADMIN_EMAIL:-}" ]; then
  write_env_kv "SEED_ADMIN_EMAIL" "admin@example.com"
  export SEED_ADMIN_EMAIL="admin@example.com"
fi
if [ -z "${SEED_ADMIN_PASSWORD:-}" ]; then
  write_env_kv "SEED_ADMIN_PASSWORD" "change_me_secure"
  export SEED_ADMIN_PASSWORD="change_me_secure"
fi
if [ -z "${SEED_ADMIN_NAME:-}" ]; then
  write_env_kv "SEED_ADMIN_NAME" "Admin User"
  export SEED_ADMIN_NAME="Admin User"
fi

echo "[OK] Environment file is ready: $ENV_FILE"
echo "[INFO] If you changed DB credentials for an existing DB volume, you may need:"
echo "       docker compose down -v && docker compose up -d --build"
