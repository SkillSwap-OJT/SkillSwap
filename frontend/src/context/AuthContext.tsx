import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { AuthApi, ProfileApi } from '../api';
import { TOKEN_KEY } from '../api/client';
import { disconnectSocket } from '../lib/socket';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, college?: string, intent?: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const STORAGE_KEY = 'ss_user';
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }
    AuthApi.me()
      .then((u) => {
        setUserState(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await AuthApi.login({ email, password });
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setToken(t);
    setUserState(u);
    return u;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, college?: string, intent?: string) => {
    const { token: t, user: u } = await AuthApi.register({ name, email, password, college, intent });
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setToken(t);
    setUserState(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUserState(null);
    disconnectSocket();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await ProfileApi.getMe();
      setUserState(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      // ignore — token interceptor handles 401
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export default AuthContext;
