import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import { TOKEN_KEY, USER_KEY } from '../services/api';
import type { User, UserRole } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On app load, if a token exists, validate/rehydrate the user via GET /auth/me.
  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_KEY);
    if (!existingToken) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then((fetchedUser) => {
        setUser(fetchedUser);
        setToken(existingToken);
        localStorage.setItem(USER_KEY, JSON.stringify(fetchedUser));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistSession = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token: newToken, user: newUser } = await authService.login(email, password);
      persistSession(newToken, newUser);
      return newUser;
    },
    [persistSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role: UserRole) => {
      const { token: newToken, user: newUser } = await authService.register(name, email, password, role);
      persistSession(newToken, newUser);
      return newUser;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
