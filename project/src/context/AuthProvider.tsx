import React, { ReactNode, useEffect } from 'react';
import { useAuthProvider } from '../hooks/useAuth';
import { AuthContextType } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthProvider();

  useEffect(() => {
    auth.checkSavedUser();
  }, [auth.checkSavedUser]);

  // Selecionamos apenas os campos que queremos expor no contexto
  const authContextValue: AuthContextType = {
    user: auth.user,
    login: auth.login,
    logout: auth.logout,
    loading: auth.loading,
    error: auth.error,
    checkSavedUser: auth.checkSavedUser
  };

  return (
    <auth.AuthContext.Provider value={authContextValue}>
      {children}
    </auth.AuthContext.Provider>
  );
};