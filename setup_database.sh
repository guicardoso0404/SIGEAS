#!/bin/bash

# Verifica se o MySQL está instalado
if ! command -v mysql &> /dev/null
then
    echo "MySQL não está instalado. Instale-o antes de continuar."
    exit 1
fi

# Configura o banco de dados
read -p "Digite o usuário do MySQL (padrão: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Digite a senha do MySQL: " DB_PASSWORD
echo

# Cria o banco de dados e as tabelas
echo "Criando banco de dados..."
mysql -u$DB_USER -p$DB_PASSWORD < ./backend/backend/src/database/db-updated.sql

# Cria o arquivo .env
echo "Configurando variáveis de ambiente..."
cat > ./backend/backend/.env << EOF
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=sigeas
JWT_SECRET=sigeas_jwt_secret_key_super_secure
EOF

echo "Configuração do banco de dados concluída!"