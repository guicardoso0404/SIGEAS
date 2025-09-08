import { useState, createContext, useContext, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { mockUsers } from '../data/mockData';

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

  const login = (email: string, senha: string): boolean => {
    const foundUser = mockUsers.find(
      u => u.email === email && u.senha === senha
    );
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('sigeas-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sigeas-user');
  };

  // Verificar se há usuário salvo no localStorage
  const checkSavedUser = () => {
    const savedUser = localStorage.getItem('sigeas-user');
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
  };

  return {
    user,
    login,
    logout,
    checkSavedUser,
    AuthContext
  };
};