import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, setToken, clearToken } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  quickLoginAs: (role: UserRole) => Promise<void>;
  isKepalaSekolah: boolean;
  isPengurusBarang: boolean;
  isAdminTU: boolean;
  isSuperadmin: boolean;
  canMutate: boolean; // false for kepala_sekolah
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('simaset_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('simaset_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setTokenState(storedToken);
        } catch (err) {
          console.warn('Session verification failed:', err);
          clearToken();
          setTokenState(null);
          setUser(null);
        }
      } else {
        // Auto-login with default superadmin for instant seamless testing
        try {
          const res = await api.login('superadmin', 'password123');
          setToken(res.token);
          setTokenState(res.token);
          setUser(res.user);
        } catch (e) {
          // not fatal
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(username, pass);
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    } finally {
      clearToken();
      setTokenState(null);
      setUser(null);
    }
  };

  const quickLoginAs = async (role: UserRole) => {
    const roleUsernames: Record<UserRole, string> = {
      admin_tu: 'admin_tu',
      pengurus_barang: 'pengurus_barang',
      kepala_sekolah: 'kepala_sekolah',
      superadmin: 'superadmin',
    };
    await login(roleUsernames[role], 'password123');
  };

  const isKepalaSekolah = user?.role === 'kepala_sekolah';
  const isPengurusBarang = user?.role === 'pengurus_barang';
  const isAdminTU = user?.role === 'admin_tu';
  const isSuperadmin = user?.role === 'superadmin';
  const canMutate = !isKepalaSekolah;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        quickLoginAs,
        isKepalaSekolah,
        isPengurusBarang,
        isAdminTU,
        isSuperadmin,
        canMutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
