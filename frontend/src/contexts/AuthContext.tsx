import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import {
  User,
  LoginCredentials,
  AuthResponse,
  AuthContextType,
} from '../types/auth';

import { apiConfig } from '../config/apiConfig';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const clearStoredSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('megacentral_token');
  localStorage.removeItem('megacentral_user');
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken =
        localStorage.getItem('token') ||
        localStorage.getItem('megacentral_token');

      if (!savedToken) {
        clearStoredSession();
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(apiConfig.endpoints.auth.verifyToken, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${savedToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
          throw new Error('Session invalide');
        }

        localStorage.setItem('token', savedToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        setToken(savedToken);
        setUser(data.user);
      } catch (error) {
        clearStoredSession();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    setIsLoading(true);

    try {
      const response = await fetch(apiConfig.endpoints.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setUser(data.user);
        setToken(data.token);

        return {
          success: true,
          user: data.user,
          token: data.token,
          message: data.message || 'Connexion réussie',
        };
      }

      return {
        success: false,
        message: data.message || 'Login ou mot de passe incorrect',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Impossible de contacter le serveur',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: Boolean(user && token),
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};