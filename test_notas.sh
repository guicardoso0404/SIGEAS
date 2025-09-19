#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testando fluxo completo de notas...${NC}"

# Configuração
API_URL="http://localhost:3001"
EMAIL_PROFESSOR="professor@test.com"
SENHA="123456"
EMAIL_ALUNO="aluno@test.com"

# Função para login
login() {
  echo -e "${BLUE}Fazendo login como $1...${NC}"
  response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$2\", \"password\":\"$3\"}")
  
  token=$(echo $response | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  
  if [ -z "$token" ]; then
    echo -e "${RED}Falha no login!${NC}"
    echo $response
    exit 1
  fi
  
  echo -e "${GREEN}Login bem sucedido!${NC}"
  echo $token
}

# Função para listar turmas do professor
listar_turmas() {
  echo -e "${BLUE}Listando turmas do professor...${NC}"
  curl -s -X GET "$API_URL/teacher/classes" \
    -H "Authorization: Bearer $1" | jq
}

# Função para listar alunos de uma turma
listar_alunos() {
  echo -e "${BLUE}Listando alunos da turma $2...${NC}"
  curl -s -X GET "$API_URL/classes/$2/students" \
    -H "Authorization: Bearer $1" | jq
}

# Função para registrar uma nota
registrar_nota() {
  echo -e "${BLUE}Registrando nota para o aluno $2 na turma $3...${NC}"
  curl -s -X POST "$API_URL/grades" \
    -H "Authorization: Bearer $1" \
    -H "Content-Type: application/json" \
    -d "{\"studentId\":$2,\"classId\":$3,\"disciplina\":\"Matemática\",\"nota\":$4,\"assessmentDate\":\"$(date +%Y-%m-%d)\"}" | jq
}

# Função para visualizar notas do aluno
visualizar_notas() {
  echo -e "${BLUE}Visualizando notas do aluno...${NC}"
  curl -s -X GET "$API_URL/student/grades" \
    -H "Authorization: Bearer $1" | jq
}

# Executar o fluxo
echo -e "${YELLOW}========== TESTE DE NOTAS ===========${NC}"

# Login como professor
echo -e "${YELLOW}1. Login como professor${NC}"
TOKEN_PROFESSOR=$(login "professor" "$EMAIL_PROFESSOR" "$SENHA")

# Listar turmas do professor
echo -e "\n${YELLOW}2. Listando turmas do professor${NC}"
listar_turmas "$TOKEN_PROFESSOR"

# Solicitar ID da turma e aluno para teste
read -p "Digite o ID da turma para teste: " TURMA_ID
read -p "Digite o ID do aluno para teste: " ALUNO_ID
read -p "Digite a nota que deseja registrar (0-10): " NOTA

# Registrar nota para o aluno
echo -e "\n${YELLOW}3. Registrando nota para o aluno${NC}"
registrar_nota "$TOKEN_PROFESSOR" "$ALUNO_ID" "$TURMA_ID" "$NOTA"

# Login como aluno
echo -e "\n${YELLOW}4. Login como aluno${NC}"
TOKEN_ALUNO=$(login "aluno" "$EMAIL_ALUNO" "$SENHA")

# Visualizar notas do aluno
echo -e "\n${YELLOW}5. Visualizando notas do aluno${NC}"
visualizar_notas "$TOKEN_ALUNO"

echo -e "\n${GREEN}Teste completo!${NC}"