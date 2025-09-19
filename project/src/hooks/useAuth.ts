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
      const { user } = await api.login(email, senha);
      setUser(user);
      localStorage.setItem('sigeas-user', JSON.stringify(user));
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
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
    setLoading(true);
    
    try {
      // Primeiro verificamos se há um token salvo e se ele é válido
      const validatedUser = await api.validateToken();
      if (validatedUser) {
        setUser(validatedUser);
        setLoading(false);
        return;
      }
      
      // Se não, tentamos ver se há um usuário salvo no localStorage
      const savedUser = localStorage.getItem('sigeas-user');
      if (savedUser && !user) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário salvo:', error);
      localStorage.removeItem('sigeas-user');
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