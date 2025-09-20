import api, { ApiResponse } from './api';
import { Turma } from '../types';

// Interfaces para o backend
export interface ClassRoom {
  idClass: number;
  className: string;
  teacherId: number;
  subject: string;
  teacherName?: string;
}

// Serviço para gerenciar turmas
class TurmaService {
  // Converter ClassRoom para Turma (interface do frontend)
  private convertToFrontendTurma(classroom: ClassRoom): Turma {
    return {
      id: classroom.idClass.toString(),
      nome: classroom.className,
      serie: classroom.subject,
      ano: new Date().getFullYear(),
      professorId: classroom.teacherId.toString(),
    };
  }

  // Obter todas as turmas
  async getAllClasses(): Promise<Turma[]> {
    const response = await api.get<ClassRoom[]>('/classes');
    if (!response.data) return [];
    
    return response.data.map(this.convertToFrontendTurma);
  }

  // Obter turma por ID
  async getClassById(classId: string): Promise<Turma | null> {
    try {
      const response = await api.get<ClassRoom>(`/classes/${classId}`);
      if (!response.data) return null;
      
      return this.convertToFrontendTurma(response.data);
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
      return null;
    }
  }

  // Obter turmas de um professor
  async getClassesByTeacher(): Promise<Turma[]> {
    try {
      console.log('🔍 TurmaService.getClassesByTeacher - Fazendo requisição para /teacher/classes');
      
      // Verificar se a instância da API tem token
      console.log('🔍 TurmaService - Verificando token na API...', (api as any).token ? 'TOKEN PRESENTE' : 'TOKEN AUSENTE');
      
      // Verificar localStorage diretamente
      const tokenFromStorage = localStorage.getItem('sigeas-token');
      console.log('🔍 TurmaService - Token no localStorage:', tokenFromStorage ? 'PRESENTE' : 'AUSENTE');
      
      if (tokenFromStorage && !(api as any).token) {
        console.log('🔧 TurmaService - Forçando token na instância da API');
        (api as any).setToken(tokenFromStorage);
      }
      
      const response = await api.get<ClassRoom[]>('/teacher/classes');
      console.log('📊 TurmaService - Resposta recebida:', response);
      
      if (!response.data) {
        console.log('⚠️ TurmaService - Nenhum dado retornado da API');
        return [];
      }
      
      console.log('📋 TurmaService - Dados das turmas recebidos:', response.data);
      const turmasConvertidas = response.data.map(this.convertToFrontendTurma);
      console.log('✅ TurmaService - Turmas convertidas:', turmasConvertidas);
      
      return turmasConvertidas;
    } catch (error) {
      console.error('❌ TurmaService - Erro ao buscar turmas do professor:', error);
      return [];
    }
  }
  
  // Alias para manter compatibilidade com o componente ChamadaLauncher
  async getTeacherClasses(): Promise<Turma[]> {
    return this.getClassesByTeacher();
  }
  
  // Obter alunos de uma turma específica
  async getClassStudents(classId: string): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`/classes/${classId}/students`);
      if (!response.data) return [];
      
      // Mapear os dados do backend para o formato esperado pelo frontend
      return response.data.map(student => ({
        id: student.idUser?.toString() || student.id?.toString(),
        nome: student.nameUser || student.nome,
        email: student.email,
        turmaId: classId
      }));
    } catch (error) {
      console.error(`Erro ao buscar alunos da turma ${classId}:`, error);
      return [];
    }
  }

  // Criar uma nova turma
  async createClass(data: { className: string; teacherId: number; subject: string }): Promise<ApiResponse<ClassRoom>> {
    return await api.post<ClassRoom>('/classes', data);
  }

  // Atualizar uma turma
  async updateClass(classId: string, data: Partial<{ className: string; teacherId: number; subject: string }>): Promise<ApiResponse<ClassRoom>> {
    return await api.put<ClassRoom>(`/classes/${classId}`, data);
  }

  // Excluir uma turma
  async deleteClass(classId: string): Promise<ApiResponse<void>> {
    return await api.delete<void>(`/classes/${classId}`);
  }
}

export const turmaService = new TurmaService();