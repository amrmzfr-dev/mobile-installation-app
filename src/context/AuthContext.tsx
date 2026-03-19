import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe, saveToken, clearToken, getToken, AuthUser } from '../services/auth.service';
import { login as apiLogin } from '../services/auth.service';

interface AuthContextType {
  user: AuthUser | null;
  installerId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const { user } = await getMe();
          setUser(user);
        }
      } catch {
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await apiLogin(email, password);
    await saveToken(token);
    setUser(user);
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, installerId: user?.installerId ?? null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
