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
      disciplina: grade.disciplina || grade.subject || '', // Usar subject se disciplina não existir
      nota1: grade.nota,
      mediaFinal: grade.finalAverage,
      dataLancamento: grade.assessmentDate,
    };
  }
  
  // Agrupar notas por aluno e disciplina para exibição
  private groupGradesByStudentAndDiscipline(grades: Grade[]): Nota[] {
    const gradeMap: Record<string, Nota> = {};
    
    console.log('Processando notas para agrupamento:', grades);
    
    // Primeiro, ordenar as notas por data (mais antigas primeiro) para garantir ordem correta
    const sortedGrades = [...grades].sort((a, b) => {
      return new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime();
    });
    
    sortedGrades.forEach(grade => {
      // Usar subject se disciplina não estiver definida
      const disciplinaEffective = grade.disciplina || grade.subject || 'Disciplina não especificada';
      const key = `${grade.studentId}_${disciplinaEffective}`;
      
      console.log(`Processando nota: ${grade.idGrade} | Disciplina: ${disciplinaEffective} | Valor: ${grade.nota}`);
      
      if (gradeMap[key]) {
        // Já existe uma nota para este aluno/disciplina
        const existingNota = gradeMap[key];
        
        // Se a nota atual contém uma média final, usar ela
        if (grade.finalAverage !== undefined && grade.finalAverage !== null) {
          existingNota.mediaFinal = grade.finalAverage;
        }
        
        // Se a nota atual contém "média" ou "final" no nome, tratar como média final
        const isAverageGrade = 
          (grade.disciplina && grade.disciplina.toLowerCase().includes('média')) || 
          (grade.disciplina && grade.disciplina.toLowerCase().includes('final')) || 
          (grade.subject && grade.subject.toLowerCase().includes('média')) ||
          (grade.subject && grade.subject.toLowerCase().includes('final'));
          
        if (isAverageGrade) {
          existingNota.mediaFinal = grade.nota;
        } 
        // Caso contrário, é uma nota regular
        else {
          // Se a nota1 já existe, colocar na nota2 (a menos que já exista)
          if (existingNota.nota1 !== undefined && existingNota.nota2 === undefined) {
            existingNota.nota2 = grade.nota;
          } 
          // Se nem nota1 nem nota2 existem, colocar na nota1
          else if (existingNota.nota1 === undefined) {
            existingNota.nota1 = grade.nota;
          }
          // Caso contrário, assumimos que é uma atualização da nota mais recente
          else if (existingNota.nota2 !== undefined) {
            // Se temos ambas as notas, assumimos que esta é uma nota adicional
            // então manteremos a mais recente
            existingNota.nota2 = grade.nota;
          }
        }
        
        // Atualizar o ID para o mais recente
        existingNota.id = grade.idGrade.toString();
        
        // Usar a data mais recente para exibição
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
          disciplina: disciplinaEffective,
          nota1: grade.nota,
          mediaFinal: grade.finalAverage,
          dataLancamento: grade.assessmentDate,
        };
      }
    });
    
    const result = Object.values(gradeMap);
    console.log('Notas agrupadas:', result);
    return result;
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
      
      console.log(`🔍 Buscando notas do aluno ${studentId || 'logado'} no endpoint: ${endpoint}`);
      
      const response = await api.get<Grade[]>(endpoint);
      if (!response.data) {
        console.log('⚠️ Nenhuma nota encontrada no backend');
        return [];
      }

      // Verificar se há notas
      console.log(`✅ ${response.data.length} notas recebidas do backend:`, response.data);
      
      // Verificar estrutura dos dados
      if (response.data.length > 0) {
        const firstGrade = response.data[0];
        console.log('📊 Exemplo de nota recebida:', {
          idGrade: firstGrade.idGrade,
          studentId: firstGrade.studentId, 
          classId: firstGrade.classId,
          disciplina: firstGrade.disciplina,
          subject: firstGrade.subject,
          nota: firstGrade.nota,
          finalAverage: firstGrade.finalAverage
        });
      }
      
      // Tentar obter notas de teste do endpoint sem autenticação
      if (response.data.length === 0) {
        try {
          console.log('⚠️ Tentando buscar notas do endpoint de debug como fallback...');
          const debugResponse = await fetch(`http://localhost:3001/debug-student-grades/${studentId || '4'}`);
          const debugData = await debugResponse.json();
          
          if (debugData.success && debugData.data && debugData.data.length > 0) {
            console.log('✅ Notas encontradas no endpoint de debug:', debugData.data);
            
            // Usar essas notas
            const notasDebug = this.groupGradesByStudentAndDiscipline(debugData.data);
            return notasDebug;
          }
        } catch (debugError) {
          console.error('❌ Erro ao tentar buscar notas do endpoint de debug:', debugError);
        }
      }
      
      const notasAgrupadas = this.groupGradesByStudentAndDiscipline(response.data);
      console.log('📋 Notas agrupadas para exibição:', notasAgrupadas);
      
      return notasAgrupadas;
    } catch (error) {
      console.error('❌ Erro ao buscar notas do aluno:', error);
      
      // Tentar obter notas de teste se ocorrer um erro
      try {
        console.log('🔄 Tentando buscar notas do endpoint de debug após erro...');
        const debugResponse = await fetch(`http://localhost:3001/debug-student-grades/${studentId || '4'}`);
        const debugData = await debugResponse.json();
        
        if (debugData.success && debugData.data && debugData.data.length > 0) {
          console.log('✅ Notas encontradas no endpoint de debug após erro:', debugData.data);
          
          // Usar essas notas
          const notasDebug = this.groupGradesByStudentAndDiscipline(debugData.data);
          return notasDebug;
        }
      } catch (debugError) {
        console.error('❌ Erro ao tentar buscar notas do endpoint de debug:', debugError);
      }
      
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