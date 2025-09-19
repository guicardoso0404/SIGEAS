import api, { ApiResponse } from './api';
import { Presenca } from '../types';

// Interfaces para o backend
export interface AttendanceRecord {
  idAttendanceRecord: number;
  studentId: number;
  classId: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  studentName?: string;
  className?: string;
  subject?: string;
}

// Interface para registro de presença em lote
export interface AttendanceData {
  classId: number;
  date: string;
  attendanceData: {
    studentId: number;
    status: 'present' | 'absent' | 'late' | 'excused';
  }[];
}

// Interface para resumo de presença
export interface AttendanceSummary {
  studentId: number;
  nameUser: string;
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
}

// Serviço para gerenciar presenças
class PresencaService {
  // Converter AttendanceRecord para Presenca (interface do frontend)
  private convertToFrontendPresenca(attendance: AttendanceRecord): Presenca {
    return {
      id: attendance.idAttendanceRecord.toString(),
      alunoId: attendance.studentId.toString(),
      turmaId: attendance.classId.toString(),
      data: attendance.date,
      presente: attendance.status === 'present',
      professorId: '1', // Isso não está vindo do backend, mas está na interface
    };
  }

  // Registrar presença para múltiplos alunos (registro de chamada)
  async recordAttendance(data: AttendanceData): Promise<ApiResponse<{ recordCount: number }>> {
    return await api.post<{ recordCount: number }>('/attendance', data);
  }

  // Obter registros de presença de uma turma em uma data
  async getAttendanceByClassAndDate(classId: string, date: string): Promise<Presenca[]> {
    try {
      const response = await api.get<AttendanceRecord[]>(`/classes/${classId}/attendance/${date}`);
      if (!response.data) return [];
      
      return response.data.map(this.convertToFrontendPresenca);
    } catch (error) {
      console.error('Erro ao buscar presenças da turma:', error);
      return [];
    }
  }

  // Obter registros de presença de um aluno
  async getStudentAttendance(studentId?: string): Promise<Presenca[]> {
    try {
      // Se studentId não for fornecido, busca as presenças do aluno logado
      const endpoint = studentId ? `/students/${studentId}/attendance` : '/student/attendance';
      
      const response = await api.get<AttendanceRecord[]>(endpoint);
      if (!response.data) return [];
      
      return response.data.map(this.convertToFrontendPresenca);
    } catch (error) {
      console.error('Erro ao buscar presenças do aluno:', error);
      return [];
    }
  }

  // Obter resumo de presença por turma (estatísticas)
  async getAttendanceSummaryByClass(classId: string): Promise<AttendanceSummary[]> {
    try {
      const response = await api.get<AttendanceSummary[]>(`/classes/${classId}/attendance-summary`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar resumo de presenças:', error);
      return [];
    }
  }

  // Atualizar o status de presença de um aluno
  async updateAttendance(attendanceId: string, status: 'present' | 'absent' | 'late' | 'excused'): Promise<ApiResponse<AttendanceRecord>> {
    return await api.put<AttendanceRecord>(`/attendance/${attendanceId}`, { status });
  }

  // Excluir um registro de presença
  async deleteAttendance(attendanceId: string): Promise<ApiResponse<void>> {
    return await api.delete<void>(`/attendance/${attendanceId}`);
  }
}

export const presencaService = new PresencaService();