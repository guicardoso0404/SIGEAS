#!/bin/bash

cd backend/backend

# Instalar as dependências do backend
echo "Instalando dependências do backend..."
npm install express cors dotenv mysql2 bcrypt jsonwebtoken

# Instalar os tipos necessários e ferramentas de desenvolvimento
echo "Instalando tipos necessários e ferramentas de desenvolvimento..."
npm install --save-dev @types/express @types/cors @types/node @types/bcrypt @types/jsonwebtoken typescript ts-node nodemon

# Criar script para executar o servidor
echo '{
  "name": "sigeas-backend",
  "version": "1.0.0",
  "description": "Backend para o Sistema de Gestão Escolar Avançado",
  "main": "src/server.ts",
  "scripts": {
    "start": "ts-node src/server.ts",
    "dev": "nodemon --exec ts-node src/server.ts"
  },
  "author": "",
  "license": "ISC"
}' > package.json

echo "Instalação concluída!"