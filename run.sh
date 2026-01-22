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

# 2. Функция проверки зависимостей
check_cmd() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}[ERROR] $1 не установлен!${NC}"
        echo "Пожалуйста, установите $1 для работы приложения."
        if [ "$OS_TYPE" == "Mac" ]; then
             echo "На Mac: brew install --cask $1 (или docker)"
        elif [ "$OS_TYPE" == "Linux" ]; then
             echo "На Linux: sudo apt-get install $1"
        fi
        exit 1
    else
        echo -e "${GREEN}[OK] $1 найден.${NC}"
    fi
}

# 3. Проверка Docker
echo -e "\n${YELLOW}[Step 1] Проверка окружения...${NC}"
check_cmd docker
check_cmd git

# Проверка, запущен ли Docker Daemon
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}[ERROR] Docker установлен, но не запущен.${NC}"
    echo "Пожалуйста, запустите Docker Desktop или службу Docker."
    exit 1
fi

# 4. Оптимизация и Запуск
echo -e "\n${YELLOW}[Step 2] Сборка и запуск контейнеров...${NC}"
echo "Это обеспечит изолированную работу приложения (как демон)."

# Останавливаем старые контейнеры если есть
docker-compose down 2>/dev/null

# Запускаем в фоновом режиме (-d) с пересборкой (--build)
if docker-compose up -d --build; then
    echo -e "\n${GREEN}=== УСПЕХ! Приложение запущено ===${NC}"
    echo -e "Frontend:  ${YELLOW}http://localhost:3000${NC}"
    echo -e "Backend:   ${YELLOW}http://localhost:4000${NC}"
    echo -e "Database:  ${YELLOW}Port 5432${NC}"
    
    echo -e "\n${YELLOW}[INFO] Чтобы остановить приложение, выполните: docker-compose down${NC}"
else
    echo -e "\n${RED}[ERROR] Ошибка при запуске Docker Compose.${NC}"
    exit 1
fi
