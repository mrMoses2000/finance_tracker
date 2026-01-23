#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Финансовый Трекер: Запуск Системы ===${NC}"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
NGINX_CONF_PATH="$ROOT_DIR/client/nginx.conf"
CERTS_DIR="${CERTS_DIR:-$ROOT_DIR/certs}"
CERTBOT_CONFIG_DIR="$CERTS_DIR/config"
CERTBOT_WORK_DIR="$CERTS_DIR/work"
CERTBOT_LOGS_DIR="$CERTS_DIR/logs"
HTTPS_MODE="${HTTPS_MODE:-}"
DOMAIN="${DOMAIN:-}"
IP_ADDRESS="${IP_ADDRESS:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
CERTBOT_PROFILE="${CERTBOT_PROFILE:-}"
CERT_CHECK_DAYS="${CERT_CHECK_DAYS:-}"
ENABLE_HTTPS=0
SERVER_NAMES="_"
SSL_CERT=""
SSL_KEY=""

# 1. Определение ОС
OS="$(uname -s)"
case "${OS}" in
    Linux*)     OS_TYPE=Linux;;
    Darwin*)    OS_TYPE=Mac;;
    *)          OS_TYPE="UNKNOWN:${OS}"
esac

echo -e "${YELLOW}[INFO] Обнаружена ОС: ${OS_TYPE}${NC}"

# 2. Функции и окружение
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
    SUDO="sudo"
fi

LINUX_DISTRO=""
if [ "$OS_TYPE" == "Linux" ] && [ -f /etc/os-release ]; then
    . /etc/os-release
    LINUX_DISTRO=$ID
fi

check_cmd() {
    if ! command -v "$1" &> /dev/null; then
        return 1
    else
        echo -e "${GREEN}[OK] $1 найден.${NC}"
        return 0
    fi
}

install_cmd() {
    local pkg="$1"
    local cask="$2"
    if [ "$OS_TYPE" == "Mac" ]; then
        if ! command -v brew &> /dev/null; then
            echo -e "${YELLOW}[INFO] Homebrew не найден. Устанавливаю...${NC}"
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
        fi
        echo -e "${YELLOW}[INFO] Устанавливаю $pkg через brew...${NC}"
        if [ "$cask" == "cask" ]; then
            brew install --cask $pkg
        else
            brew install $pkg
        fi
    elif [ "$OS_TYPE" == "Linux" ]; then
        if [ "$LINUX_DISTRO" == "ubuntu" ] || [ "$LINUX_DISTRO" == "debian" ]; then
            echo -e "${YELLOW}[INFO] Устанавливаю $pkg через apt...${NC}"
            $SUDO apt-get update -y
            $SUDO apt-get install -y $pkg
        else
            echo -e "${RED}[ERROR] Поддерживается только Ubuntu/Debian для авто-установки.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}[ERROR] Неизвестная ОС. Установка $pkg невозможна.${NC}"
        exit 1
    fi
}

install_docker_linux() {
    if [ "$LINUX_DISTRO" != "ubuntu" ] && [ "$LINUX_DISTRO" != "debian" ]; then
        echo -e "${RED}[ERROR] Авто-установка Docker поддерживается только для Ubuntu/Debian.${NC}"
        exit 1
    fi
    echo -e "${YELLOW}[INFO] Устанавливаю Docker Engine + Compose Plugin...${NC}"
    $SUDO apt-get update -y
    $SUDO apt-get install -y ca-certificates curl gnupg lsb-release
    $SUDO install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$LINUX_DISTRO/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    $SUDO chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$LINUX_DISTRO \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
    $SUDO apt-get update -y
    $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    if [ -n "$SUDO" ]; then
        $SUDO usermod -aG docker "$USER" || true
        echo -e "${YELLOW}[INFO] Добавил пользователя в группу docker. Перелогиньтесь, если нужно.${NC}"
    fi
}

prompt_https_mode() {
    if [ -z "$HTTPS_MODE" ] && [ -t 0 ]; then
        echo -e "\n${YELLOW}[Step 1.6] HTTPS режим${NC}"
        echo "Выберите режим HTTPS (ip/domain/off). По умолчанию: off"
        read -r HTTPS_MODE
    fi

    HTTPS_MODE="$(echo "${HTTPS_MODE:-off}" | tr '[:upper:]' '[:lower:]')"
    if [ "$HTTPS_MODE" != "ip" ] && [ "$HTTPS_MODE" != "domain" ] && [ "$HTTPS_MODE" != "off" ]; then
        echo -e "${YELLOW}[WARN] Некорректный HTTPS_MODE. Использую off.${NC}"
        HTTPS_MODE="off"
    fi

    if [ "$OS_TYPE" != "Linux" ] && [ "$HTTPS_MODE" != "off" ]; then
        echo -e "${YELLOW}[INFO] HTTPS режим доступен только на Linux. Использую off.${NC}"
        HTTPS_MODE="off"
    fi
}

ensure_certbot() {
    if ! command -v certbot >/dev/null 2>&1; then
        if [ "$OS_TYPE" == "Linux" ]; then
            echo -e "${YELLOW}[INFO] Устанавливаю certbot...${NC}"
            install_cmd certbot
        else
            echo -e "${RED}[ERROR] certbot не найден и авто-установка доступна только на Linux.${NC}"
            exit 1
        fi
    fi
}

certbot_supports_profile() {
    certbot --help 2>/dev/null | grep -q -- '--profile'
}

ensure_certificates() {
    if [ "$HTTPS_MODE" == "off" ]; then
        ENABLE_HTTPS=0
        return 0
    fi

    if [ "$HTTPS_MODE" == "ip" ] && ! command -v curl >/dev/null 2>&1; then
        install_cmd curl
    fi

    if ! command -v openssl >/dev/null 2>&1; then
        install_cmd openssl
    fi

    mkdir -p "$CERTBOT_CONFIG_DIR" "$CERTBOT_WORK_DIR" "$CERTBOT_LOGS_DIR"

    local target=""
    local cert_name=""
    local cert_args=()

    if [ "$HTTPS_MODE" == "domain" ]; then
        if [ -z "$DOMAIN" ] && [ -t 0 ]; then
            echo -e "${YELLOW}Введите домен для HTTPS:${NC}"
            read -r DOMAIN
        fi
        if [ -z "$DOMAIN" ]; then
            echo -e "${RED}[ERROR] DOMAIN не задан. Отключаю HTTPS.${NC}"
            HTTPS_MODE="off"
            ENABLE_HTTPS=0
            return 0
        fi
        local primary="${DOMAIN#www.}"
        DOMAIN="$primary"
        local www_domain="www.${primary}"
        SERVER_NAMES="${primary} ${www_domain}"
        cert_name="$primary"
        cert_args=(-d "$primary" -d "$www_domain")
    fi

    if [ "$HTTPS_MODE" == "ip" ]; then
        if [ -z "$IP_ADDRESS" ]; then
            local detected_ip
            detected_ip="$(get_public_ip)"
            if [ -t 0 ]; then
                echo -e "${YELLOW}Введите IP для HTTPS (по умолчанию: ${detected_ip}):${NC}"
                read -r IP_ADDRESS
            fi
            if [ -z "$IP_ADDRESS" ]; then
                IP_ADDRESS="$detected_ip"
            fi
        fi
        if [ -z "$IP_ADDRESS" ]; then
            echo -e "${RED}[ERROR] IP_ADDRESS не задан. Отключаю HTTPS.${NC}"
            HTTPS_MODE="off"
            ENABLE_HTTPS=0
            return 0
        fi
        SERVER_NAMES="$IP_ADDRESS"
        cert_name="$IP_ADDRESS"
        cert_args=(-d "$IP_ADDRESS")
        if [ -z "$CERTBOT_PROFILE" ]; then
            CERTBOT_PROFILE="shortlived"
        fi
    fi

    SSL_CERT="/etc/letsencrypt/live/${cert_name}/fullchain.pem"
    SSL_KEY="/etc/letsencrypt/live/${cert_name}/privkey.pem"

    local check_days
    if [ -n "$CERT_CHECK_DAYS" ]; then
        check_days="$CERT_CHECK_DAYS"
    elif [ "$HTTPS_MODE" == "ip" ]; then
        check_days="2"
    else
        check_days="30"
    fi

    if [ -f "$CERTBOT_CONFIG_DIR/live/${cert_name}/fullchain.pem" ] && \
        openssl x509 -checkend "$((check_days * 24 * 3600))" -noout -in "$CERTBOT_CONFIG_DIR/live/${cert_name}/fullchain.pem" >/dev/null 2>&1; then
        ENABLE_HTTPS=1
        return 0
    fi

    ensure_certbot

    local profile_args=()
    if [ -n "$CERTBOT_PROFILE" ]; then
        if certbot_supports_profile; then
            profile_args=(--profile "$CERTBOT_PROFILE")
        elif [ "$HTTPS_MODE" == "ip" ]; then
            echo -e "${RED}[ERROR] certbot не поддерживает --profile. Обновите certbot для IP-сертификатов.${NC}"
            exit 1
        fi
    fi

    local email_args=()
    if [ -n "$CERTBOT_EMAIL" ]; then
        email_args=(-m "$CERTBOT_EMAIL")
    elif [ -t 0 ]; then
        echo -e "${YELLOW}Введите email для certbot (опционально, рекомендуется):${NC}"
        read -r CERTBOT_EMAIL
        if [ -n "$CERTBOT_EMAIL" ]; then
            email_args=(-m "$CERTBOT_EMAIL")
        fi
    fi

    if [ "${#email_args[@]}" -eq 0 ]; then
        email_args=(--register-unsafely-without-email)
        echo -e "${YELLOW}[WARN] CERTBOT_EMAIL не задан. Использую регистрацию без email.${NC}"
    fi

    echo -e "${YELLOW}[INFO] Получаю сертификат Let's Encrypt (${HTTPS_MODE})...${NC}"
    $SUDO certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --preferred-challenges http \
        "${email_args[@]}" \
        "${profile_args[@]}" \
        --config-dir "$CERTBOT_CONFIG_DIR" \
        --work-dir "$CERTBOT_WORK_DIR" \
        --logs-dir "$CERTBOT_LOGS_DIR" \
        "${cert_args[@]}"

    if [ -f "$CERTBOT_CONFIG_DIR/live/${cert_name}/fullchain.pem" ] && [ -f "$CERTBOT_CONFIG_DIR/live/${cert_name}/privkey.pem" ]; then
        ENABLE_HTTPS=1
    else
        echo -e "${RED}[ERROR] Сертификаты не найдены после запроса.${NC}"
        exit 1
    fi
}

write_nginx_conf() {
    if [ "$ENABLE_HTTPS" -eq 1 ]; then
        cat <<EOF > "$NGINX_CONF_PATH"
server {
    listen 80;
    server_name ${SERVER_NAMES};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${SERVER_NAMES};

    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://server:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }

    location /auth/ {
        proxy_pass http://server:4000;
    }
}
EOF
        return 0
    fi

    cat <<EOF > "$NGINX_CONF_PATH"
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://server:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }

    location /auth/ {
        proxy_pass http://server:4000;
    }
}
EOF
}

setup_cert_renewal() {
    if [ "$ENABLE_HTTPS" -ne 1 ]; then
        return 0
    fi

    local renew_script="$CERTS_DIR/renew_my_finance_ssl.sh"
    local check_days
    if [ -n "$CERT_CHECK_DAYS" ]; then
        check_days="$CERT_CHECK_DAYS"
    elif [ "$HTTPS_MODE" == "ip" ]; then
        check_days="2"
    else
        check_days="30"
    fi

    $SUDO tee "$renew_script" >/dev/null <<EOF
#!/bin/bash
set -e
HTTPS_MODE="${HTTPS_MODE}"
DOMAIN="${DOMAIN}"
IP_ADDRESS="${IP_ADDRESS}"
CERTBOT_PROFILE="${CERTBOT_PROFILE}"
CERTBOT_EMAIL="${CERTBOT_EMAIL}"
CERTBOT_CONFIG_DIR="${CERTBOT_CONFIG_DIR}"
CERTBOT_WORK_DIR="${CERTBOT_WORK_DIR}"
CERTBOT_LOGS_DIR="${CERTBOT_LOGS_DIR}"
CHECK_DAYS="${check_days}"

target=""
if [ "\$HTTPS_MODE" = "domain" ]; then
  target="\${DOMAIN#www.}"
fi
if [ "\$HTTPS_MODE" = "ip" ]; then
  target="\$IP_ADDRESS"
fi
if [ -z "\$target" ]; then
  exit 0
fi

cert_path="\$CERTBOT_CONFIG_DIR/live/\$target/fullchain.pem"
if [ -f "\$cert_path" ] && openssl x509 -checkend "\$((CHECK_DAYS * 24 * 3600))" -noout -in "\$cert_path" >/dev/null 2>&1; then
  exit 0
fi

docker stop budget_client >/dev/null 2>&1 || true

profile_args=()
if [ -n "\$CERTBOT_PROFILE" ]; then
  if certbot --help 2>/dev/null | grep -q -- '--profile'; then
    profile_args=(--profile "\$CERTBOT_PROFILE")
  fi
fi

email_args=()
if [ -n "\$CERTBOT_EMAIL" ]; then
  email_args=(-m "\$CERTBOT_EMAIL")
else
  email_args=(--register-unsafely-without-email)
fi

cert_args=()
if [ "\$HTTPS_MODE" = "domain" ]; then
  primary="\${DOMAIN#www.}"
  cert_args=(-d "\$primary" -d "www.\$primary")
else
  cert_args=(-d "\$IP_ADDRESS")
fi

certbot certonly --standalone --non-interactive --agree-tos --preferred-challenges http \
  "\${email_args[@]}" "\${profile_args[@]}" \
  --config-dir "\$CERTBOT_CONFIG_DIR" \
  --work-dir "\$CERTBOT_WORK_DIR" \
  --logs-dir "\$CERTBOT_LOGS_DIR" \
  "\${cert_args[@]}"

docker start budget_client >/dev/null 2>&1 || true
EOF

    $SUDO chmod +x "$renew_script"
    $SUDO tee /etc/cron.d/my_finance_ssl_renew >/dev/null <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 4 * * * root $renew_script
EOF

    if systemctl list-unit-files 2>/dev/null | grep -q '^certbot.timer'; then
        echo -e "${YELLOW}[INFO] Отключаю certbot.timer, чтобы избежать дублирования продления.${NC}"
        $SUDO systemctl disable --now certbot.timer 2>/dev/null || true
    fi
}

configure_remote_access() {
    if [ "$OS_TYPE" != "Linux" ]; then
        return
    fi

    echo -e "\n${YELLOW}[Step 1.5] Подготовка для удаленного доступа...${NC}"
    if check_cmd ufw; then
        if $SUDO ufw status | grep -q "Status: active"; then
            echo -e "${YELLOW}[INFO] UFW активен. Открываю порты 3000 и 4000.${NC}"
            $SUDO ufw allow 3000/tcp || true
            $SUDO ufw allow 4000/tcp || true
            $SUDO ufw allow 22/tcp || true
            if [ "$HTTPS_MODE" != "off" ]; then
                echo -e "${YELLOW}[INFO] HTTPS включен. Открываю порт 443.${NC}"
                $SUDO ufw allow 443/tcp || true
            fi
        else
            echo -e "${YELLOW}[INFO] UFW установлен, но не активен. Порты не меняю.${NC}"
        fi
    else
        if [ "$LINUX_DISTRO" == "ubuntu" ] || [ "$LINUX_DISTRO" == "debian" ]; then
            install_cmd ufw
            echo -e "${YELLOW}[INFO] UFW установлен, но не активирован. Включите при необходимости: sudo ufw enable${NC}"
        fi
    fi

    if check_cmd hostname; then
        echo -e "${YELLOW}[INFO] IP адреса: $(hostname -I 2>/dev/null || true)${NC}"
    fi
}

get_public_ip() {
    if [ "$OS_TYPE" != "Linux" ]; then
        return
    fi

    if check_cmd curl; then
        local ip=""
        local token=""
        token="$(curl -fsS --max-time 2 -X PUT http://169.254.169.254/latest/api/token \
            -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)"
        if [ -n "$token" ]; then
            ip="$(curl -fsS --max-time 2 -H "X-aws-ec2-metadata-token: $token" \
                http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)"
        fi
        if [ -z "$ip" ]; then
            ip="$(curl -fsS --max-time 2 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)"
        fi
        if [ -z "$ip" ]; then
            ip="$(curl -fsS --max-time 2 https://checkip.amazonaws.com 2>/dev/null | tr -d '\n' || true)"
        fi
        if [ -z "$ip" ]; then
            ip="$(curl -fsS --max-time 2 https://ifconfig.me 2>/dev/null | tr -d '\n' || true)"
        fi
        if [ -n "$ip" ]; then
            echo "$ip"
        fi
    fi
}

start_docker_service() {
    if [ "$OS_TYPE" != "Linux" ]; then
        return 1
    fi

    if check_cmd systemctl; then
        $SUDO systemctl start docker || true
        $SUDO systemctl enable docker || true
        return 0
    fi

    if check_cmd service; then
        $SUDO service docker start || true
        return 0
    fi

    return 1
}

# 3. Проверка Docker/Git
echo -e "\n${YELLOW}[Step 1] Проверка окружения...${NC}"
if ! check_cmd git; then
    install_cmd git
fi

if ! check_cmd docker; then
    if [ "$OS_TYPE" == "Linux" ]; then
        install_docker_linux
    else
        install_cmd docker cask
    fi
fi

# Проверка, запущен ли Docker Daemon
if ! docker info > /dev/null 2>&1; then
    if [ "$OS_TYPE" == "Linux" ]; then
        start_docker_service
    fi
fi

DOCKER_CMD="docker"
if ! docker info > /dev/null 2>&1; then
    if $SUDO docker info > /dev/null 2>&1; then
        DOCKER_CMD="$SUDO docker"
        echo -e "${YELLOW}[INFO] Использую Docker через sudo (права группы еще не применились).${NC}"
    else
        echo -e "${RED}[ERROR] Docker установлен, но не запущен.${NC}"
        echo "Пожалуйста, запустите Docker Desktop или службу Docker."
        exit 1
    fi
fi

if $DOCKER_CMD compose version &> /dev/null; then
    COMPOSE_CMD="$DOCKER_CMD compose"
elif check_cmd docker-compose; then
    if [ "$DOCKER_CMD" == "docker" ]; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="$SUDO docker-compose"
    fi
else
    if [ "$OS_TYPE" == "Linux" ]; then
        install_docker_linux
    else
        install_cmd docker-compose
    fi
    COMPOSE_CMD="$DOCKER_CMD compose"
fi

# HTTPS setup (interactive)
prompt_https_mode

# Ubuntu remote setup
configure_remote_access

# 4. Оптимизация и Запуск
echo -e "\n${YELLOW}[Step 2] Сборка и запуск контейнеров...${NC}"
echo "Это обеспечит изолированную работу приложения (как демон)."

# Останавливаем старые контейнеры если есть
$COMPOSE_CMD down 2>/dev/null

# HTTPS certificates + nginx config
ensure_certificates
write_nginx_conf
setup_cert_renewal

# Запускаем в фоновом режиме (-d) с пересборкой (--build)
if $COMPOSE_CMD up -d --build; then
    echo -e "\n${GREEN}=== УСПЕХ! Приложение запущено ===${NC}"
    if [ "$ENABLE_HTTPS" -eq 1 ]; then
        echo -e "Frontend:  ${YELLOW}https://localhost${NC}"
        echo -e "HTTP:      ${YELLOW}http://localhost:3000${NC}"
    else
        echo -e "Frontend:  ${YELLOW}http://localhost:3000${NC}"
    fi
    echo -e "Backend:   ${YELLOW}http://localhost:4000${NC}"
    echo -e "Database:  ${YELLOW}Port 5432${NC}"

    if [ "$OS_TYPE" == "Linux" ]; then
        PUBLIC_IP=$(get_public_ip)
        if [ -n "$PUBLIC_IP" ]; then
            if [ "$ENABLE_HTTPS" -eq 1 ]; then
                echo -e "Remote:    ${YELLOW}https://${PUBLIC_IP}${NC}"
                echo -e "HTTP:      ${YELLOW}http://${PUBLIC_IP}:3000${NC}"
                echo -e "${YELLOW}[INFO] Для облачных серверов откройте порты 443/3000/4000 (TCP) в Security Group/Firewall.${NC}"
            else
                echo -e "Remote:    ${YELLOW}http://${PUBLIC_IP}:3000${NC}"
                echo -e "${YELLOW}[INFO] Для облачных серверов откройте порты 3000/4000 (TCP) в Security Group/Firewall.${NC}"
            fi
            echo -e "${YELLOW}[INFO] ICMP ping может быть закрыт — это нормально.${NC}"
        else
            echo -e "${YELLOW}[INFO] Не удалось определить публичный IP. Используйте IP/домен сервера + :3000${NC}"
        fi
    fi
    
    echo -e "\n${YELLOW}[INFO] Чтобы остановить приложение, выполните: $COMPOSE_CMD down${NC}"
else
    echo -e "\n${RED}[ERROR] Ошибка при запуске Docker Compose.${NC}"
    exit 1
fi
