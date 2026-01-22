#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Финансовый Трекер: Запуск Системы ===${NC}"

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

if ! docker compose version &> /dev/null; then
    if check_cmd docker-compose; then
        COMPOSE_CMD="docker-compose"
    else
        if [ "$OS_TYPE" == "Linux" ]; then
            install_docker_linux
        else
            install_cmd docker-compose
        fi
        COMPOSE_CMD="docker compose"
    fi
else
    COMPOSE_CMD="docker compose"
fi

# Проверка, запущен ли Docker Daemon
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}[ERROR] Docker установлен, но не запущен.${NC}"
    echo "Пожалуйста, запустите Docker Desktop или службу Docker."
    exit 1
fi

# Ubuntu remote setup
configure_remote_access

# 4. Оптимизация и Запуск
echo -e "\n${YELLOW}[Step 2] Сборка и запуск контейнеров...${NC}"
echo "Это обеспечит изолированную работу приложения (как демон)."

# Останавливаем старые контейнеры если есть
$COMPOSE_CMD down 2>/dev/null

# Запускаем в фоновом режиме (-d) с пересборкой (--build)
if $COMPOSE_CMD up -d --build; then
    echo -e "\n${GREEN}=== УСПЕХ! Приложение запущено ===${NC}"
    echo -e "Frontend:  ${YELLOW}http://localhost:3000${NC}"
    echo -e "Backend:   ${YELLOW}http://localhost:4000${NC}"
    echo -e "Database:  ${YELLOW}Port 5432${NC}"
    
    echo -e "\n${YELLOW}[INFO] Чтобы остановить приложение, выполните: $COMPOSE_CMD down${NC}"
else
    echo -e "\n${RED}[ERROR] Ошибка при запуске Docker Compose.${NC}"
    exit 1
fi
