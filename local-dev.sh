#!/bin/bash

# Локальная разработка без Docker
# Запускает сервер и клиент параллельно

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${GREEN}=== Финансовый Трекер: Локальная Разработка ===${NC}"

# Проверка node
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js не установлен${NC}"
    exit 1
fi

# Проверка npm зависимостей
if [ ! -d "$ROOT_DIR/server/node_modules" ]; then
    echo -e "${YELLOW}[INFO] Устанавливаю зависимости сервера...${NC}"
    cd "$ROOT_DIR/server" && npm install
fi

if [ ! -d "$ROOT_DIR/client/node_modules" ]; then
    echo -e "${YELLOW}[INFO] Устанавливаю зависимости клиента...${NC}"
    cd "$ROOT_DIR/client" && npm install
fi

# Проверка .env
if [ ! -f "$ROOT_DIR/server/.env" ]; then
    echo -e "${RED}[ERROR] server/.env не найден${NC}"
    echo "Создайте файл с DATABASE_URL и JWT_SECRET"
    exit 1
fi

# Функция очистки при выходе
cleanup() {
    echo -e "\n${YELLOW}[INFO] Останавливаю процессы...${NC}"
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Запуск сервера
echo -e "${YELLOW}[INFO] Запускаю сервер на порту 4000...${NC}"
cd "$ROOT_DIR/server"
npm run dev &
SERVER_PID=$!

# Даём серверу время запуститься
sleep 3

# Запуск клиента
echo -e "${YELLOW}[INFO] Запускаю клиент на порту 3000...${NC}"
cd "$ROOT_DIR/client"
npm run dev &
CLIENT_PID=$!

echo -e "\n${GREEN}=== Локальная разработка запущена ===${NC}"
echo -e "Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "Backend:  ${YELLOW}http://localhost:4000${NC}"
echo -e "\nНажмите Ctrl+C для остановки"

# Ждём завершения
wait
