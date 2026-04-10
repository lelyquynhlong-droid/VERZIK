"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { googleLoginRequest, type AuthUser, type UserRole } from "@/services/auth.service";

export type ContextRole = "viewer" | UserRole;

export interface AuthState {
  isAuthenticated: boolean; 
  role: ContextRole;
  routePrefix: string; 
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  loginWithGoogle: (credential: string) => Promise<string | null>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user_data";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục phiên làm việc khi F5 trang
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      const res = await googleLoginRequest(credential);

      if (!res.success || !res.token || !res.user) {
        return res.message || "Xác thực Google thất bại.";
      }

      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));

      setToken(res.token);
      setUser(res.user);
      setIsAuthenticated(true);
      return null;
    } catch (error) {
      return "Đã xảy ra lỗi hệ thống.";
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const getToken = useCallback(() => token, [token]);

  // Logic điều hướng: Owner -> admin, Admin/OP -> email prefix
  const routePrefix = user 
    ? (user.role === 'owner' ? 'admin' : user.email.split("@")[0].toLowerCase())
    : "";

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role: user?.role || "viewer",
        routePrefix,
        user,
        token,
        isLoading,
        loginWithGoogle,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};