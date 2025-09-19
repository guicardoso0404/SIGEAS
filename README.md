# SIGEAS - Sistema de Gestão Escolar Avançado

SIGEAS é um sistema de gestão escolar desenvolvido com React, TypeScript e Tailwind CSS no frontend, e Node.js, Express e MySQL no backend. O sistema oferece interfaces específicas para administradores (pedagogos), professores e alunos.
Em desenvolvimento por: Guilherme Cardoso, Nicolas Menegussi Ramos, Rafaela Ferrasso e Maria Eduarda Locks.

## Funcionalidades

### Administradores (Pedagogos)
- Dashboard com visão geral da instituição
- Gerenciamento de turmas
- Gerenciamento de professores
- Gerenciamento de alunos
- Analytics e relatórios de desempenho
- Gerenciamento de matrículas

### Professores
- Dashboard com visão geral das turmas
- Lançamento de chamada
- Lançamento de notas
- Gerenciamento de turmas
- Atividades e tarefas
- Calendário

### Alunos
- Dashboard personalizado
- Visualização de turma
- Visualização de notas
- Controle de presenças
- Tarefas
- Calendário

## Estrutura do Projeto

O projeto é dividido em duas partes principais:

1. **Backend**: API RESTful construída com Node.js, Express e TypeScript
2. **Frontend**: Aplicação web construída com React, TypeScript e Tailwind CSS

### Estrutura do Frontend
O projeto frontend segue uma estrutura organizada por componentes específicos para cada tipo de usuário:
- `components/admin/` - Componentes para administradores
- `components/professor/` - Componentes para professores
- `components/aluno/` - Componentes para alunos
- `components/common/` - Componentes compartilhados
- `context/` - Contextos React
- `hooks/` - Custom hooks
- `services/` - Serviços para comunicação com o backend
- `types/` - Definições de tipos TypeScript

### Estrutura do Backend
O backend segue uma arquitetura MVC:
- `controllers/` - Controladores para lógica de negócios
- `models/` - Definição de tipos e interfaces
- `middleware/` - Middlewares para autenticação e autorização
- `config/` - Configurações do banco de dados
- `database/` - Scripts SQL e migrações

## Requisitos

- Node.js (v14.x ou superior)
- npm (v7.x ou superior)
- MySQL (v8.x ou superior)

## Instalação e Configuração

### 1. Configuração do Banco de Dados

Primeiro, é necessário criar o banco de dados e as tabelas necessárias:

1. Crie um banco de dados chamado `sigeas` (ou o nome de sua preferência)
2. Execute o script SQL localizado em `backend/src/database/db.sql`

### 2. Instalação das Dependências do Backend

Execute o script de instalação para configurar todas as dependências do backend:

```bash
# Dê permissão de execução ao script (no Linux/Mac)
chmod +x install_backend_deps.sh

# Execute o script
./install_backend_deps.sh
```

Ou instale manualmente:

```bash
cd backend/backend
npm install express cors dotenv mysql2 bcrypt jsonwebtoken
npm install --save-dev @types/express @types/cors @types/node @types/bcrypt @types/jsonwebtoken
```

### 3. Configuração das Variáveis de Ambiente do Backend

Crie um arquivo `.env` na pasta `backend/backend` com as seguintes variáveis:

```
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=sigeas
JWT_SECRET=sua_chave_secreta_para_jwt
```

### 4. Instalação das Dependências do Frontend

```bash
cd project
npm install
```

## Executando o Projeto

### 1. Iniciar o Backend

```bash
cd backend/backend
npm start
```

Isso iniciará o servidor backend na porta 3001.

### 2. Iniciar o Frontend

```bash
cd project
npm start
```

Isso iniciará o servidor de desenvolvimento do React na porta 3000.

## Acesso à Aplicação

Após iniciar tanto o backend quanto o frontend, você pode acessar a aplicação em [http://localhost:3000](http://localhost:3000).

### Usuários de Teste

| Perfil    | E-mail               | Senha   |
|-----------|----------------------|---------|
| Admin     | admin@escola.com     | 123456  |
| Professor | prof.joao@escola.com | 123456  |
| Aluno     | ana.costa@escola.com | 123456  |

## Tecnologias utilizadas

### Backend
- Node.js
- Express
- TypeScript
- MySQL
- JWT para autenticação
- bcrypt para hash de senhas

### Frontend
- React
- TypeScript
- Tailwind CSS
- Framer Motion para animações
- Context API para gerenciamento de estado
- Lucide Icons

## Interface

O sistema possui uma interface moderna e responsiva com:
- Efeito de vidro (glass effect)
- Navegação lateral adaptativa
- Animações suaves
- Design responsivo para desktop e dispositivos móveis

## API Endpoints

### Autenticação
- `POST /auth/login` - Fazer login

### Usuários
- `GET /users` - Listar todos os usuários (requer perfil pedagogo)
- `GET /users/:idUser` - Buscar usuário por ID
- `POST /users` - Criar novo usuário (requer perfil pedagogo)
- `PATCH /users/email` - Atualizar e-mail do usuário
- `PATCH /users/name` - Atualizar nome do usuário

### Turmas
- `GET /classes` - Listar todas as turmas
- `GET /classes/:idClass` - Buscar turma por ID
- `GET /teacher/classes` - Listar turmas do professor logado (requer perfil professor)
- `POST /classes` - Criar nova turma (requer perfil pedagogo)
- `PUT /classes/:idClass` - Atualizar turma (requer perfil professor ou pedagogo)
- `DELETE /classes/:idClass` - Excluir turma (requer perfil pedagogo)

### Notas
- `GET /grades` - Listar todas as notas (requer perfil pedagogo)
- `GET /classes/:classId/grades` - Listar notas de uma turma (requer perfil professor ou pedagogo)
- `GET /students/:studentId/grades` - Listar notas de um aluno
- `GET /student/grades` - Listar notas do aluno logado (requer perfil aluno)
- `POST /grades` - Adicionar nota (requer perfil professor)
- `PUT /grades/:idGrade` - Atualizar nota (requer perfil professor)
- `DELETE /grades/:idGrade` - Excluir nota (requer perfil professor)

### Presenças
- `POST /attendance` - Registrar presenças (requer perfil professor)
- `GET /classes/:classId/attendance/:date` - Buscar presenças de uma turma em uma data (requer perfil professor ou pedagogo)
- `GET /students/:studentId/attendance` - Buscar presenças de um aluno
- `GET /student/attendance` - Buscar presenças do aluno logado (requer perfil aluno)
- `GET /classes/:classId/attendance-summary` - Resumo de presenças de uma turma (requer perfil professor ou pedagogo)
- `PUT /attendance/:idAttendanceRecord` - Atualizar registro de presença (requer perfil professor)
- `DELETE /attendance/:idAttendanceRecord` - Excluir registro de presença (requer perfil professor)

### Professor
- `GET /teacher/dashboard` - Estatísticas do dashboard do professor (requer perfil professor)
- `GET /classes/:classId/students` - Listar alunos de uma turma (requer perfil professor)
- `POST /assignments` - Adicionar atividade (requer perfil professor)
- `GET /classes/:classId/assignments` - Listar atividades de uma turma (requer perfil professor ou pedagogo)
- `PUT /assignments/:idAssignment` - Atualizar atividade (requer perfil professor)
- `DELETE /assignments/:idAssignment` - Excluir atividade (requer perfil professor)

### Pedagogo
- `GET /pedagogue/dashboard` - Estatísticas do dashboard do pedagogo (requer perfil pedagogo)
- `GET /pedagogue/class-performance` - Desempenho das turmas (requer perfil pedagogo)
- `POST /enrollments` - Matricular aluno em turma (requer perfil pedagogo)
- `GET /enrollments` - Listar matrículas (requer perfil pedagogo)
- `GET /students/:studentId/report` - Gerar relatório de aluno (requer perfil pedagogo)
- `GET /classes/:classId/report` - Gerar relatório de turma (requer perfil pedagogo)

