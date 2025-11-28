"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface User {
  _id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferences?: {
    defaultView: "grid" | "list";
    defaultSort: "dateAdded" | "clickCount" | "rating" | "title";
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
  updatePreferences: (data: {
    defaultView?: "grid" | "list";
    defaultSort?: "dateAdded" | "clickCount" | "rating" | "title";
  }) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "webnest_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loginMutation = useMutation(api.auth.login);
  const registerMutation = useMutation(api.auth.register);
  const logoutMutation = useMutation(api.auth.logout);
  const updateProfileMutation = useMutation(api.auth.updateProfile);
  const updatePreferencesMutation = useMutation(api.auth.updatePreferences);
  const changePasswordMutation = useMutation(api.auth.changePassword);

  const user = useQuery(api.auth.getCurrentUser, token ? { token } : "skip") as
    | User
    | null
    | undefined;

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation({ email, password });
      if (!result.success) {
        throw new Error(result.error);
      }
      setToken(result.token!);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await registerMutation({ email, password, name });
      if (!result.success) {
        throw new Error(result.error);
      }
      setToken(result.token!);
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    if (token) {
      await logoutMutation({ token });
    }
    setToken(null);
    router.push("/");
  }, [token, logoutMutation, router]);

  const updateProfile = useCallback(
    async (data: { name?: string; avatarUrl?: string }) => {
      if (!token) throw new Error("Not authenticated");
      await updateProfileMutation({ token, ...data });
    },
    [token, updateProfileMutation]
  );

  const updatePreferences = useCallback(
    async (data: {
      defaultView?: "grid" | "list";
      defaultSort?: "dateAdded" | "clickCount" | "rating" | "title";
      theme?: "light" | "dark" | "system";
    }) => {
      if (!token) throw new Error("Not authenticated");
      await updatePreferencesMutation({ token, ...data });
    },
    [token, updatePreferencesMutation]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!token) throw new Error("Not authenticated");
      await changePasswordMutation({ token, currentPassword, newPassword });
    },
    [token, changePasswordMutation]
  );

  const value: AuthContextType = {
    user: user ?? null,
    token,
    isLoading: isLoading || user === undefined,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
