import React, { ReactNode, useEffect } from 'react';
import { useAuthProvider } from '../hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authProvider = useAuthProvider();

  useEffect(() => {
    authProvider.checkSavedUser();
  }, []);

  return (
    <authProvider.AuthContext.Provider value={authProvider}>
      {children}
    </authProvider.AuthContext.Provider>
  );
};