import api, { ApiResponse } from './api';
import { Nota } from '../types';

// Interfaces para o backend
export interface Grade {
  idGrade: number;
  studentId: number;
  classId: number;
  assessmentDate: string;
  disciplina: string;
  nota: number;
  finalAverage: number;
  studentName?: string;
  className?: string;
  subject?: string;
}

// Serviço para gerenciar notas
class NotasService {
  // Converter Grade para Nota (interface do frontend)
  private convertToFrontendNota(grade: Grade): Nota {
    return {
      id: grade.idGrade.toString(),
      alunoId: grade.studentId.toString(),
      disciplina: grade.disciplina,
      nota1: grade.nota,
      mediaFinal: grade.finalAverage,
      dataLancamento: grade.assessmentDate,
    };
  }
  
  // Agrupar notas por aluno e disciplina para exibição
  private groupGradesByStudentAndDiscipline(grades: Grade[]): Nota[] {
    const gradeMap: Record<string, Nota> = {};
    
    grades.forEach(grade => {
      const key = `${grade.studentId}_${grade.disciplina}`;
      
      if (gradeMap[key]) {
        // Já existe uma nota para este aluno/disciplina
        const existingNota = gradeMap[key];
        
        // Verificar qual nota colocar (nota1 ou nota2)
        if (existingNota.nota1 !== undefined) {
          existingNota.nota2 = grade.nota;
        } else {
          existingNota.nota1 = grade.nota;
        }
        
        // Usar a média final mais recente
        existingNota.mediaFinal = grade.finalAverage;
        
        // Usar a data mais recente
        const existingDate = new Date(existingNota.dataLancamento);
        const newDate = new Date(grade.assessmentDate);
        if (newDate > existingDate) {
          existingNota.dataLancamento = grade.assessmentDate;
        }
      } else {
        // Criar uma nova entrada
        gradeMap[key] = {
          id: grade.idGrade.toString(),
          alunoId: grade.studentId.toString(),
          disciplina: grade.disciplina,
          nota1: grade.nota,
          mediaFinal: grade.finalAverage,
          dataLancamento: grade.assessmentDate,
        };
      }
    });
    
    return Object.values(gradeMap);
  }

  // Obter todas as notas (admin/pedagogo)
  async getAllGrades(): Promise<Nota[]> {
    try {
      const response = await api.get<Grade[]>('/grades');
      if (!response.data) return [];
      
      return this.groupGradesByStudentAndDiscipline(response.data);
    } catch (error) {
      console.error('Erro ao buscar todas as notas:', error);
      return [];
    }
  }

  // Obter notas de uma turma
  async getGradesByClass(classId: string): Promise<Nota[]> {
    try {
      const response = await api.get<Grade[]>(`/classes/${classId}/grades`);
      if (!response.data) return [];
      
      return this.groupGradesByStudentAndDiscipline(response.data);
    } catch (error) {
      console.error(`Erro ao buscar notas da turma ${classId}:`, error);
      return [];
    }
  }

  // Obter notas de um aluno
  async getStudentGrades(studentId?: string): Promise<Nota[]> {
    try {
      // Se studentId não for fornecido, busca as notas do aluno logado
      const endpoint = studentId ? `/students/${studentId}/grades` : '/student/grades';
      
      const response = await api.get<Grade[]>(endpoint);
      if (!response.data) return [];

      console.log('Notas recebidas do backend:', response.data);
      const notasAgrupadas = this.groupGradesByStudentAndDiscipline(response.data);
      console.log('Notas agrupadas para exibição:', notasAgrupadas);
      
      return notasAgrupadas;
    } catch (error) {
      console.error('Erro ao buscar notas do aluno:', error);
      return [];
    }
  }

  // Adicionar uma nova nota
  async addGrade(data: {
    studentId: number;
    classId: number;
    disciplina: string;
    nota: number;
    assessmentDate: string;
  }): Promise<ApiResponse<Grade>> {
    return await api.post<Grade>('/grades', data);
  }

  // Atualizar uma nota existente
  async updateGrade(gradeId: string, data: {
    nota?: number;
    assessmentDate?: string;
  }): Promise<ApiResponse<Grade>> {
    return await api.put<Grade>(`/grades/${gradeId}`, data);
  }

  // Excluir uma nota
  async deleteGrade(gradeId: string): Promise<ApiResponse<void>> {
    return await api.delete<void>(`/grades/${gradeId}`);
  }
}

export const notasService = new NotasService();