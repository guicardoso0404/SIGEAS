import { User } from '../types';

// Tipos para o backend
export interface ApiUser {
  idUser: number;
  nameUser: string;
  email: string;
  role: 'pedagogue' | 'teacher' | 'student';
}

export interface ApiAuthResponse {
  message: string;
  success: boolean;
  data: {
    user: ApiUser;
    token: string;
  };
}

export interface ApiError {
  message: string;
  success: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Conversores de tipos entre frontend e backend
export const convertApiUserToFrontendUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.idUser.toString(),
    nome: apiUser.nameUser,
    email: apiUser.email,
    perfil: apiUser.role === 'pedagogue' ? 'admin' : 
            apiUser.role === 'teacher' ? 'professor' : 'aluno',
    senha: '' // A senha não vem do backend
  };
};

// Classe de serviço API
class ApiService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.token = localStorage.getItem('sigeas-token');
    console.log('🔧 Inicializando ApiService. Token encontrado:', this.token ? 'SIM' : 'NÃO');
  }

  // Método privado para garantir que o token esteja sempre atualizado
  private ensureToken(): void {
    if (!this.token) {
      this.token = localStorage.getItem('sigeas-token');
      console.log('🔄 Token recuperado do localStorage:', this.token ? 'SIM' : 'NÃO');
    }
  }

  // Método para definir o token após login
  setToken(token: string) {
    console.log('🔐 Definindo token:', token.substring(0, 20) + '...');
    this.token = token;
    localStorage.setItem('sigeas-token', token);
  }

  // Método para remover o token após logout
  clearToken() {
    this.token = null;
    localStorage.removeItem('sigeas-token');
  }

  // Headers padrão para requisições autenticadas
  private getAuthHeaders() {
    // Sempre garantir que temos o token mais recente
    this.ensureToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
    console.log('📋 Headers gerados:', {
      ...headers,
      Authorization: this.token ? `Bearer ${this.token.substring(0, 20)}...` : '(sem token)'
    });
    return headers;
  }

  // Métodos de requisição
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 Fazendo requisição GET para: ${this.baseUrl}${endpoint}`);
      console.log('🔑 Headers:', this.getAuthHeaders());
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      console.log(`📡 Status da resposta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.message || 'Erro desconhecido');
      }

      const result = await response.json();
      console.log('✅ Dados recebidos:', result);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao fazer requisição GET para ${endpoint}:`, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro desconhecido');
      }

      return await response.json() as ApiResponse<T>;
    } catch (error) {
      console.error(`Erro ao fazer requisição POST para ${endpoint}:`, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro desconhecido');
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro ao fazer requisição PUT para ${endpoint}:`, error);
      throw error;
    }
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro desconhecido');
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro ao fazer requisição PATCH para ${endpoint}:`, error);
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro desconhecido');
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro ao fazer requisição DELETE para ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos específicos para autenticação
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      console.log('🚀 Enviando requisição de login para:', `${this.baseUrl}/auth/login`);
      console.log('📊 Dados enviados:', { email, password: '***' });
      
      // Alterando o tipo para corresponder ao formato da resposta esperada
      interface LoginResponse {
        user: ApiUser;
        token: string;
      }
      
      const response = await this.post<LoginResponse>('/auth/login', { email, password });
      
      console.log('✅ Resposta de login recebida:', {
        success: response.success,
        message: response.message,
        hasUser: !!response.data?.user,
        hasToken: !!response.data?.token
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha na autenticação');
      }

      // Acessando os dados diretamente da resposta
      const apiUser = response.data.user;
      const token = response.data.token;
      
      console.log('🔐 Token recebido:', token.substring(0, 20) + '...');
      this.setToken(token);
      
      return {
        user: convertApiUserToFrontendUser(apiUser),
        token
      };
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      throw error;
    }
  }

  // Método para verificar se o token é válido
  async validateToken(): Promise<User | null> {
    console.log('🔍 validateToken - Verificando se token existe...');
    
    // Garantir que temos o token mais recente
    this.ensureToken();
    
    if (!this.token) {
      console.log('❌ validateToken - Nenhum token encontrado');
      return null;
    }

    try {
      console.log('🌐 validateToken - Fazendo requisição para /users/me');
      const response = await this.get<ApiUser>('/users/me');
      
      console.log('📊 validateToken - Resposta recebida:', response);
      
      if (!response.success || !response.data) {
        console.log('❌ validateToken - Resposta inválida, limpando token');
        this.clearToken();
        return null;
      }

      console.log('✅ validateToken - Token válido, usuário:', response.data);
      return convertApiUserToFrontendUser(response.data);
    } catch (error) {
      console.error('❌ validateToken - Erro ao validar token:', error);
      this.clearToken();
      return null;
    }
  }
}

// Exporta uma instância única do serviço de API
const apiInstance = new ApiService();

export const api = apiInstance;
export default apiInstance;