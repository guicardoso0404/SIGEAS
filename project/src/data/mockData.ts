import { User, Turma, Professor, Aluno, Nota, Presenca } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    email: 'admin@escola.com',
    perfil: 'admin',
    senha: '123456'
  },
  {
    id: '2',
    nome: 'João Santos',
    email: 'prof.joao@escola.com',
    perfil: 'professor',
    senha: '123456'
  },
  {
    id: '3',
    nome: 'Ana Costa',
    email: 'ana.costa@escola.com',
    perfil: 'aluno',
    senha: '123456'
  },
  {
    id: '4',
    nome: 'Carlos Oliveira',
    email: 'prof.carlos@escola.com',
    perfil: 'professor',
    senha: '123456'
  }
];

export const mockProfessores: Professor[] = [
  {
    id: '2',
    nome: 'João Santos',
    email: 'prof.joao@escola.com',
    disciplina: 'Matemática',
    telefone: '(11) 98765-4321',
    turmas: ['1', '2']
  },
  {
    id: '4',
    nome: 'Carlos Oliveira',
    email: 'prof.carlos@escola.com',
    disciplina: 'Português',
    telefone: '(11) 87654-3210',
    turmas: ['3']
  }
];

export const mockTurmas: Turma[] = [
  {
    id: '1',
    nome: '9º Ano A',
    serie: '9º Ano',
    ano: 2024,
    professorId: '2'
  },
  {
    id: '2',
    nome: '8º Ano B',
    serie: '8º Ano',
    ano: 2024,
    professorId: '2'
  },
  {
    id: '3',
    nome: '7º Ano A',
    serie: '7º Ano',
    ano: 2024,
    professorId: '4'
  }
];

export const mockAlunos: Aluno[] = [
  {
    id: '3',
    nome: 'Ana Costa',
    email: 'ana.costa@escola.com',
    telefone: '(11) 99999-8888',
    responsavel: 'Maria Costa',
    turmaId: '1'
  },
  {
    id: '5',
    nome: 'Pedro Almeida',
    email: 'pedro.almeida@escola.com',
    telefone: '(11) 88888-7777',
    responsavel: 'José Almeida',
    turmaId: '1'
  },
  {
    id: '6',
    nome: 'Lucas Ferreira',
    email: 'lucas.ferreira@escola.com',
    telefone: '(11) 77777-6666',
    responsavel: 'Sandra Ferreira',
    turmaId: '2'
  }
];

export const mockNotas: Nota[] = [
  {
    id: '1',
    alunoId: '3',
    disciplina: 'Matemática',
    nota1: 8.5,
    nota2: 9.0,
    mediaFinal: 8.75,
    dataLancamento: '2024-11-15'
  },
  {
    id: '2',
    alunoId: '5',
    disciplina: 'Matemática',
    nota1: 7.0,
    nota2: 8.0,
    mediaFinal: 7.5,
    dataLancamento: '2024-11-15'
  }
];

export const mockPresencas: Presenca[] = [
  {
    id: '1',
    alunoId: '3',
    turmaId: '1',
    data: '2024-11-20',
    presente: true,
    professorId: '2'
  },
  {
    id: '2',
    alunoId: '3',
    turmaId: '1',
    data: '2024-11-19',
    presente: false,
    professorId: '2'
  },
  {
    id: '3',
    alunoId: '5',
    turmaId: '1',
    data: '2024-11-20',
    presente: true,
    professorId: '2'
  }
];

import type { Atividade, SubmissaoAtividade } from '../types';

/**
 * Atividades (tarefas) criadas pelos professores para suas turmas. Cada
 * atividade possui título, descrição e data de entrega. Os alunos podem
 * visualizar e submeter conteúdos para estas atividades.
 */
export const mockAtividades: Atividade[] = [
  {
    id: 'a1',
    turmaId: '1',
    professorId: '2',
    titulo: 'Trabalho de Matemática – Frações',
    descricao: 'Resolva os exercícios da página 42 e elabore um resumo sobre frações.',
    dataEntrega: '2024-12-05'
  },
  {
    id: 'a2',
    turmaId: '2',
    professorId: '2',
    titulo: 'Lista de exercícios de Geometria',
    descricao: 'Complete a lista de exercícios sobre polígonos regulares.',
    dataEntrega: '2024-12-10'
  }
];

/**
 * Submissões de atividades realizadas pelos alunos. Inicialmente vazio,
 * será populado em tempo de execução quando os alunos enviarem seus
 * trabalhos. Cada submissão contém referência à atividade e ao aluno,
 * bem como o conteúdo enviado e a data do envio.
 */
export const mockSubmissoes: SubmissaoAtividade[] = [];