import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import type { UserRole } from "../store/dataStore";

type AuthUser = { id: string; email: string; name: string; staffId?: string; };

type AuthContextValue = {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USERS: { email: string; password: string; name: string; role: UserRole; staffId?: string }[] = [
  { email: "admin@demo.local", password: "admin123", name: "Admin User", role: "admin", staffId: "s6" },
  { email: "owner@salon.com", password: "owner123", name: "Meera Patel", role: "owner", staffId: "s5" },
  { email: "kriti@salon.com", password: "staff123", name: "Kriti Sharma", role: "staff", staffId: "s1" },
  { email: "pooja@salon.com", password: "staff123", name: "Pooja Mehta", role: "staff", staffId: "s2" },
  { email: "riya@salon.com", password: "staff123", name: "Riya Singh", role: "staff", staffId: "s3" },
  { email: "anjali@salon.com", password: "staff123", name: "Anjali Gupta", role: "staff", staffId: "s4" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("salonpro_auth");
      if (saved) {
        const { user: u, role: r } = JSON.parse(saved);
        setUser(u); setRole(r);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const match = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!match) throw new Error("Invalid email or password");
    const u: AuthUser = { id: `mock-${match.role}`, email: match.email, name: match.name, staffId: match.staffId };
    setUser(u);
    setRole(match.role);
    localStorage.setItem("salonpro_auth", JSON.stringify({ user: u, role: match.role }));
  };

  const logout = async () => {
    setUser(null); setRole(null);
    localStorage.removeItem("salonpro_auth");
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
