import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as authService from "../services/auth";

const AuthContext = createContext();

/**
 * Authentication state.
 *
 * The JWT lives in an httpOnly `accessToken` cookie, so JavaScript cannot (and
 * must not) read it. The only way to know whether the session is valid is to ask
 * the backend: `GET /auth/me` succeeds only when the cookie is present and
 * unexpired, and fails with 401 otherwise.
 *
 * localStorage is deliberately NOT used as the source of truth - a stale entry
 * would let the UI claim a session the server has already rejected. Authentication
 * is always re-derived from the cookie via the API.
 *
 * Exposed: user, isAuthenticated, loading, role, login, register, logout, refreshUser.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // React 18/19 StrictMode runs effects twice in development. Without this
  // guard, the mount-time /auth/me fires twice and the second response can win
  // the race against a login that happened in between.
  const loadInFlight = useRef(null);

  /**
   * Ask the backend who we are. Resolves to the user or null.
   * Never throws - "not signed in" is a normal state, not an error.
   */
  const loadUser = useCallback(() => {
    if (loadInFlight.current) return loadInFlight.current;

    const request = authService
      .getCurrentUser()
      .then((response) => response.data?.user ?? null)
      .catch(() => null)
      .then((resolvedUser) => {
        setUser(resolvedUser);
        return resolvedUser;
      })
      .finally(() => {
        loadInFlight.current = null;
      });

    loadInFlight.current = request;

    return request;
  }, []);

  // Bootstrap the session once, on mount.
  useEffect(() => {
    let cancelled = false;

    loadUser().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [loadUser]);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const loggedInUser = response.data?.user ?? null;

    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  const register = useCallback(async (details) => {
    const response = await authService.register(details);
    const registeredUser = response.data?.user ?? null;

    // The API sets the auth cookie on this same 201 response, but we do not
    // trust the local value alone: re-read the session from the backend so the
    // context can never disagree with what the cookie actually grants.
    setUser(registeredUser);

    try {
      await loadUser();
    } catch {
      // Keep the user from the response; a failed refresh is not fatal here.
    }

    return registeredUser;
  }, [loadUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Clear local state even if the request fails, so the UI can never get
      // stuck showing a session the user asked to end.
      setUser(null);
    }
  }, []);

  /** Re-read the session from the backend on demand. */
  const refreshUser = useCallback(() => loadUser(), [loadUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      role: user?.role ?? null,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }

  return context;
};
