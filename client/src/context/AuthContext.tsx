import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data } = await api.post<{ user: User; token: string }>('/auth/login', {
      email: normalizedEmail,
      password,
    });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ user: User; token: string }>('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
