import { useState, createContext, useContext, useCallback } from 'react';
import { User, AuthContextType } from '../types';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 useAuth.login - Iniciando login...');
      const { user, token } = await api.login(email, senha);
      console.log('✅ useAuth.login - Login bem-sucedido:', user);
      console.log('🔐 useAuth.login - Token recebido e salvo');
      
      setUser(user);
      localStorage.setItem('sigeas-user', JSON.stringify(user));
      
      // Importante: Garantir que o token foi salvo corretamente
      const savedToken = localStorage.getItem('sigeas-token');
      console.log('🔍 useAuth.login - Token verificado no localStorage:', savedToken ? 'PRESENTE' : 'AUSENTE');
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('❌ useAuth.login - Erro no login:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sigeas-user');
    api.clearToken();
  }, []);

  const checkSavedUser = useCallback(async () => {
    console.log('🔍 checkSavedUser - Iniciando verificação...');
    setLoading(true);
    
    try {
      // Verificar se há um usuário salvo no localStorage primeiro
      console.log('🔍 checkSavedUser - Verificando localStorage...');
      const savedUser = localStorage.getItem('sigeas-user');
      const savedToken = localStorage.getItem('sigeas-token');
      
      console.log('📦 checkSavedUser - Usuário no localStorage:', savedUser ? 'PRESENTE' : 'AUSENTE');
      console.log('� checkSavedUser - Token no localStorage:', savedToken ? 'PRESENTE' : 'AUSENTE');
      
      if (savedUser && savedToken && !user) {
        console.log('✅ checkSavedUser - Restaurando sessão do localStorage');
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setLoading(false);
        return;
      }
      
      // Se não há dados salvos, apenas continue
      console.log('❌ checkSavedUser - Nenhuma sessão salva encontrada');
    } catch (error) {
      console.error('❌ checkSavedUser - Erro ao verificar usuário salvo:', error);
      localStorage.removeItem('sigeas-user');
      localStorage.removeItem('sigeas-token');
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    user,
    login,
    logout,
    loading,
    error,
    checkSavedUser,
    AuthContext
  };
};