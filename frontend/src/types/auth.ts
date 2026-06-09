export interface User {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'standard';
  voirPrixAchat?: number | null;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  success: boolean;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
