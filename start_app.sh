#!/bin/bash

# Este script inicia o backend e o frontend em terminais separados

# Cores para feedback visual
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração do banco de dados
MYSQL_BIN="C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe"
DB_USER=root
DB_PASSWORD=root
DB_NAME=meubanco

# Perguntar se deseja recriar o banco de dados
echo -e "${YELLOW}Deseja recriar o banco de dados? (s/n)${NC}"
read -r recreate_db
if [ "$recreate_db" = "s" ] || [ "$recreate_db" = "S" ]; then
    echo -e "${BLUE}Configurando o banco de dados...${NC}"
    "$MYSQL_BIN" -u$DB_USER -p$DB_PASSWORD -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME;" || {
        echo -e "${RED}Erro ao criar o banco de dados. Verifique as credenciais e o caminho do MySQL.${NC}"
        exit 1
    }
    "$MYSQL_BIN" -u$DB_USER -p$DB_PASSWORD $DB_NAME < ./backend/backend/src/database/db-updated.sql || {
        echo -e "${RED}Erro ao importar o esquema do banco de dados.${NC}"
        exit 1
    }
    
    # Verificar se o banco foi configurado corretamente
    echo -e "${BLUE}Verificando usuários no banco de dados...${NC}"
    "$MYSQL_BIN" -u$DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SELECT idUser, nameUser, email, role FROM User;"
    
    echo -e "${GREEN}Banco de dados configurado com sucesso!${NC}"
fi

# Perguntar se deseja limpar o cache do npm
echo -e "${YELLOW}Deseja limpar o cache do npm antes de iniciar? (s/n)${NC}"
read -r clean_cache
if [ "$clean_cache" = "s" ] || [ "$clean_cache" = "S" ]; then
    echo -e "${BLUE}Limpando cache do npm...${NC}"
    npm cache clean --force
    echo -e "${GREEN}Cache limpo com sucesso!${NC}"
fi

# Iniciar o backend em background
echo -e "${BLUE}Iniciando o servidor backend...${NC}"
cd backend/backend || {
    echo -e "${RED}Diretório do backend não encontrado!${NC}"
    exit 1
}

# Usar screen ou tmux se disponível, ou executar em background
if command -v screen &> /dev/null; then
    screen -dmS backend npm run dev:ts -- --transpile-only
    echo -e "${GREEN}Backend iniciado em uma sessão screen. Para acessar: 'screen -r backend'${NC}"
elif command -v tmux &> /dev/null; then
    tmux new-session -d -s backend "npm run dev:ts -- --transpile-only"
    echo -e "${GREEN}Backend iniciado em uma sessão tmux. Para acessar: 'tmux attach -t backend'${NC}"
else
    # Fallback para execução em background
    npx ts-node --transpile-only src/server.ts &
    BACKEND_PID=$!
    echo -e "${GREEN}Backend iniciado em background com PID: $BACKEND_PID${NC}"
    # Registrar trap apenas se estiver usando o método de PID
    trap "kill $BACKEND_PID" EXIT
fi

# Esperar o backend iniciar
echo -e "${BLUE}Aguardando o backend inicializar...${NC}"
sleep 3

# Iniciar o frontend
echo -e "${BLUE}Iniciando o cliente frontend...${NC}"
cd ../../project || {
    echo -e "${RED}Diretório do frontend não encontrado!${NC}"
    exit 1
}
npm run dev

echo -e "${GREEN}Aplicação SIGEAS finalizada!${NC}"