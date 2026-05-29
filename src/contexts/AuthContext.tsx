import { createContext, useContext, useState, ReactNode } from 'react';

const API = '';

interface User {
  username: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  saveScore: (score: number, result: 'win' | 'loss' | 'tie') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const u = { username: data.username, token: data.token };
    setUser(u);
    localStorage.setItem('auth', JSON.stringify(u));
  };

  const register = async (username: string, password: string) => {
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const u = { username: data.username, token: data.token };
    setUser(u);
    localStorage.setItem('auth', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
  };

  const saveScore = async (score: number, result: 'win' | 'loss' | 'tie') => {
    if (!user) return;
    await fetch(`${API}/api/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ score, result }),
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, saveScore }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
