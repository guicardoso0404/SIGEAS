export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'professor' | 'aluno';
  senha: string;
}

export interface Turma {
  id: string;
  nome: string;
  serie: string;
  ano: number;
  professorId?: string;
  professor?: Professor;
  alunos?: Aluno[];
}

export interface Professor {
  id: string;
  nome: string;
  email: string;
  disciplina: string;
  telefone?: string;
  turmas?: string[];
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  responsavel?: string;
  turmaId?: string;
  turma?: Turma;
  notas?: Nota[];
  presencas?: Presenca[];
}

export interface Nota {
  id: string;
  alunoId: string;
  disciplina: string;
  nota1?: number;
  nota2?: number;
  mediaFinal?: number;
  dataLancamento: string;
}

export interface Presenca {
  id: string;
  alunoId: string;
  turmaId: string;
  data: string;
  presente: boolean;
  professorId: string;
}

/**
 * Representa uma atividade (tarefa ou trabalho) lançada por um professor
 * para uma turma específica. Inclui título, descrição e data de entrega.
 */
export interface Atividade {
  id: string;
  turmaId: string;
  professorId: string;
  titulo: string;
  descricao: string;
  dataEntrega: string; // ISO date string
}

/**
 * Representa uma submissão de atividade feita por um aluno. Armazena
 * referência à atividade, conteúdo submetido e data de envio.
 */
export interface SubmissaoAtividade {
  id: string;
  atividadeId: string;
  alunoId: string;
  conteudo: string;
  dataEnvio: string; // ISO date string
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  checkSavedUser: () => Promise<void>;
}