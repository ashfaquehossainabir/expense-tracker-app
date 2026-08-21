import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  loginUser,
  registerUser,
  fetchMe,
  updateProfile as updateProfileApi,
  changePassword as changePasswordApi,
  deleteAccount as deleteAccountApi,
} from "../api/authApi";
import { setOnUnauthorized } from "../api/client";

const AuthContext = createContext(null);
const TOKEN_KEY = "ledger_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => logout());
  }, [logout]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchMe();
        setUser(data.user);
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async ({ email, password }) => {
    setAuthError("");
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.message || "Couldn't log in. Try again.");
      return false;
    }
  };

  const register = async ({ name, email, password }) => {
    setAuthError("");
    try {
      const data = await registerUser({ name, email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.message || "Couldn't create your account. Try again.");
      return false;
    }
  };

  const updateProfile = async ({ name, email }) => {
    const data = await updateProfileApi({ name, email });
    setUser(data.user);
    return data.user;
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    await changePasswordApi({ currentPassword, newPassword });
  };

  const deleteAccount = async ({ password }) => {
    await deleteAccountApi({ password });
    logout();
  };

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    clearAuthError: () => setAuthError(""),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
