import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, type AuthUser } from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const me = await api.me();
        if (mounted) {
          setUser(me);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void init();
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser } = await api.login(email, password);
      setUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const me = await api.me();
    setUser(me);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
