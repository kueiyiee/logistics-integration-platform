import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMe, ApiError } from '../services/auth';

interface AuthContextValue {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

const STORAGE_KEY = '3pdms_token';

const safeGetStoredToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const safeStoreToken = (token: string, remember: boolean) => {
  try {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, token);
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, token);
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage failures
  }
};

const safeRemoveToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  login: async () => undefined,
  logout: () => undefined,
  hasPermission: () => false,
  hasRole: () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => safeGetStoredToken());
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const loadingRef = useRef(false);

  // restore user when token exists
  useEffect(() => {
    let mounted = true;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // prevent overlapping fetches
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    fetchMe()
      .then((u) => {
        if (!mounted) return;
        setUser(u);
      })
      .catch((err) => {
        // if token invalid or expired, clear it
        if (err instanceof ApiError && err.status === 401) {
          safeRemoveToken();
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        loadingRef.current = false;
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const login = useCallback(async (nextToken: string, remember = true) => {
    // prevent races: optimistic update then fetch user
    safeStoreToken(nextToken, remember);
    setToken(nextToken);
    setLoading(true);

    try {
      const u = await fetchMe();
      setUser(u);
    } catch (err) {
      // on failure, remove token
      safeRemoveToken();
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    safeRemoveToken();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      safeRemoveToken();
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', onUnauthorized as EventListener);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized as EventListener);
  }, []);

  const permissions = useMemo(() => {
    if (!user || !Array.isArray(user.roles)) return new Set<string>();
    return new Set(user.roles.flatMap((role: any) => (Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.name) : [])));
  }, [user]);

  const hasPermission = useCallback((permission: string) => permissions.has(permission), [permissions]);

  const hasRole = useCallback(
    (roleName: string) => {
      if (!user || !Array.isArray(user.roles)) return false;
      return user.roles.some((role: any) => role.name === roleName);
    },
    [user],
  );

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), loading, login, logout, hasPermission, hasRole }),
    [token, user, loading, login, logout, hasPermission, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
