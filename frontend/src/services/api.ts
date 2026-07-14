import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '/api';
const configuredTimeout = Number(import.meta.env.VITE_API_TIMEOUT ?? 20000) || 20000;

const STORAGE_KEY = '3pdms_token';
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const makeRequestId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
};

export const api = axios.create({
  baseURL,
  timeout: configuredTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach token, request id and standard headers
api.interceptors.request.use((config) => {
  const token = getStoredToken();

  config.headers = config.headers ?? {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!config.headers.Accept) config.headers.Accept = 'application/json';
  if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) config.headers['Content-Type'] = 'application/json';

  // add a lightweight request id for tracing
  if (!config.headers['X-Request-Id']) config.headers['X-Request-Id'] = makeRequestId();

  return config;
});

// Response interceptor: surface 401 -> clear token and notify app
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore storage errors
      }

      // emit an event so AuthContext or other parts of the app can react
      try {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { status } }));
      } catch {}

      // redirect to login preserving the current path
      try {
        const redirectTo = '/login';
        if (window.location.pathname !== redirectTo) window.location.href = redirectTo;
      } catch {}
    }

    return Promise.reject(err);
  },
);
