import api, { ApiResponse } from './api';
import { User } from '../types';

// Interfaces
export interface UserCreate {
  nameUser: string;
  email: string;
  password: string;
  age: number;
  role: 'student' | 'teacher' | 'pedagogue';
}

export interface UserUpdate {
  nameUser?: string;
  email?: string;
}

// Serviço para gerenciar usuários
class UserService {
  // Obter todos os usuários (somente para admin/pedagogo)
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data || [];
  }

  // Obter usuário por ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await api.get<User>(`/users/${userId}`);
      return response.data || null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  // Criar um novo usuário
  async createUser(userData: UserCreate): Promise<ApiResponse<User>> {
    return await api.post<User>('/users', userData);
  }

  // Atualizar e-mail do usuário
  async updateUserEmail(email: string): Promise<ApiResponse<User>> {
    return await api.patch<User>('/users/email', { email });
  }

  // Atualizar nome do usuário
  async updateUserName(nameUser: string): Promise<ApiResponse<User>> {
    return await api.patch<User>('/users/name', { nameUser });
  }
}

export const userService = new UserService();