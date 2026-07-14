import { api } from './api';
import type { AxiosResponse } from 'axios';
import { z } from 'zod';

export class ApiError extends Error {
  status: number | null;
  code?: string | number;
  validationErrors?: Record<string, unknown> | null;
  responseData?: any;

  constructor(message: string, status: number | null = null, opts: Partial<ApiError> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = opts.code;
    this.validationErrors = opts.validationErrors ?? null;
    this.responseData = opts.responseData;
  }
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  company_name: string;
  name: string;
  email: string;
  password: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
};

export type CreateWebhookPayload = {
  name: string;
  description?: string;
  target_url: string;
  http_method?: string;
  retry_count?: number;
  timeout_seconds?: number;
  events: string[];
};

export type CreateDriverPayload = {
  name: string;
  email?: string;
  phone?: string;
  vehicle_type: string;
  vehicle_number?: string;
  license_number: string;
  notes?: string;
  status?: string;
};

export interface Permission {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  uuid?: string;
  company_id?: number;
  company?: {
    id: number;
    name: string;
    slug?: string;
  };
  name: string | null;
  email: string;
  status: string;
  roles?: Role[];
}

export interface ApiKey {
  id: number;
  company_id: number;
  name: string;
  description?: string | null;
  public_key: string;
  key_prefix?: string;
  secret_hash?: string;
  permissions?: string[];
  status: string;
  environment?: string;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: number;
  secret?: string;
}

export interface Webhook {
  id: number;
  company_id: number;
  name: string;
  description?: string | null;
  target_url: string;
  http_method?: string;
  retry_count?: number;
  timeout_seconds?: number;
  secret?: string;
  status: string;
  events: string[];
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: number;
  company_id: number;
  company?: {
    id: number;
    name: string;
  };
  name: string;
  email?: string | null;
  phone?: string | null;
  vehicle_type: string;
  vehicle_number?: string | null;
  license_number: string;
  notes?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  company_id: number;
  user_id: number;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: true;
  token: string;
  user?: User | null;
}

export interface MfaRequiredResponse {
  success: true;
  mfa_required: true;
  challenge_token: string;
}

export type LoginResponse = AuthResponse | MfaRequiredResponse;

export interface RegisterResponse {
  user: User;
  message: string;
}

interface DataResponse<T> {
  data: T;
}

type ExtractKind = 'auto' | 'data' | 'user' | 'raw';

async function handleRequest<T>(promise: Promise<AxiosResponse<unknown>>, extract: ExtractKind = 'auto', schema?: z.ZodType<T>): Promise<T> {
  try {
    const res = await promise;
    const payload = res.data as unknown;

    // Determine selected value in a clear, deterministic way
    let selected: unknown;

    const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

    if (extract === 'raw') {
      selected = payload;
    } else if (extract === 'data') {
      if (isObject(payload) && Object.prototype.hasOwnProperty.call(payload, 'data')) selected = (payload as any).data;
      else throw new ApiError("Expected response with 'data' property", res.status ?? null, { responseData: payload });
    } else if (extract === 'user') {
      if (isObject(payload) && Object.prototype.hasOwnProperty.call(payload, 'user')) selected = (payload as any).user;
      else throw new ApiError("Expected response with 'user' property", res.status ?? null, { responseData: payload });
    } else {
      // auto: prefer well-known wrapper fields, but fall back to raw payload
      if (isObject(payload)) {
        if (Object.prototype.hasOwnProperty.call(payload, 'data')) selected = (payload as any).data;
        else if (Object.prototype.hasOwnProperty.call(payload, 'user')) selected = (payload as any).user;
        else selected = payload;
      } else {
        selected = payload;
      }
    }

    if (schema) {
      const parsed = schema.safeParse(selected as any);
      if (!parsed.success) {
        const issues = parsed.error.format();
        throw new ApiError('Response validation failed', res.status ?? null, { validationErrors: issues, responseData: selected });
      }
      return parsed.data as T;
    }

    return selected as T;
  } catch (err: any) {
    // cancelled
    if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
      throw new ApiError('Request cancelled', null, { responseData: err });
    }

    // axios timeout (client-side) or network error (no response)
    if (err?.isAxiosError && !err?.response) {
      // timeout specifically
      const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@yourdomain.com';
      if (err?.code === 'ECONNABORTED' || (err?.message && typeof err.message === 'string' && err.message.toLowerCase().includes('timeout'))) {
        throw new ApiError(`Registration timed out — our servers are taking longer than expected. Please try again in a few moments. If this continues, contact support at ${SUPPORT_EMAIL}.`, null, { code: 'timeout', responseData: err });
      }

      const message = err?.message || 'Network error';
      throw new ApiError(message, null, { responseData: err });
    }

    const status = err?.response?.status ?? null;
    const remote = err?.response?.data;

    // server errors — give a professional, user-friendly message
    if (status && status >= 500) {
      const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@yourdomain.com';
      const friendly = remote?.message || `We're experiencing a temporary server issue. Please try again shortly. If the problem persists, contact support at ${SUPPORT_EMAIL}.`;
      throw new ApiError(friendly, status, { responseData: remote });
    }

    if (status === 422 && remote && remote.errors) {
      throw new ApiError(remote.message || 'Validation error', status, { validationErrors: remote.errors, responseData: remote });
    }

    const message = remote?.message || err?.message || 'Request failed';
    throw new ApiError(message, status, { responseData: remote });
  }
}

const ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
    REGISTER: '/v1/auth/register',
    ME: '/v1/auth/me',
    CHANGE_PASSWORD: '/v1/auth/change-password',
  },
  ADMIN: {
    DASHBOARD: '/v1/admin/dashboard',
    SECURITY: '/v1/admin/security',
    API_KEYS: '/v1/admin/api-keys',
    WEBHOOKS: '/v1/admin/webhooks',
    DRIVERS: '/v1/admin/drivers',
    AUDIT_LOGS: '/v1/admin/audit-logs',
    ROLES: '/v1/admin/roles',
    PERMISSIONS: '/v1/admin/permissions',
    USERS: '/v1/admin/users',
    USER_ROLES: (userId: number) => `/v1/admin/users/${userId}/roles`,
    USER_ROLE: (userId: number, roleId: number) => `/v1/admin/users/${userId}/roles/${roleId}`,
  },
  PLATFORM: {
    DASHBOARD: '/v1/platform/dashboard',
    COMPANIES: '/v1/platform/companies',
    PENDING_COMPANIES: '/v1/platform/companies/pending',
    COMPANY: (companyId: number) => `/v1/platform/companies/${companyId}`,
    COMPANY_APPROVE: (companyId: number) => `/v1/platform/companies/${companyId}/approve`,
    COMPANY_REJECT: (companyId: number) => `/v1/platform/companies/${companyId}/reject`,
    COMPANY_SUSPEND: (companyId: number) => `/v1/platform/companies/${companyId}/suspend`,
    COMPANY_ACTIVATE: (companyId: number) => `/v1/platform/companies/${companyId}/activate`,
    COMPANY_DELETE: (companyId: number) => `/v1/platform/companies/${companyId}`,
    USERS: '/v1/platform/users',
    USER_ROLES: (userId: number) => `/v1/platform/users/${userId}/roles`,
    USER_ROLE: (userId: number, roleId: number) => `/v1/platform/users/${userId}/roles/${roleId}`,
    ROLES: '/v1/platform/roles',
    PERMISSIONS: '/v1/platform/permissions',
    DELIVERIES: '/v1/platform/deliveries',
    DRIVERS: '/v1/platform/drivers',
  },
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const AuthResponseSchema = z.union([
    z.object({
      success: z.literal(true),
      mfa_required: z.literal(true),
      challenge_token: z.string(),
    }).passthrough(),
    z.object({
      success: z.literal(true),
      token: z.string(),
      user: z.object({
        id: z.number(),
        name: z.string().nullable(),
        email: z.string().email(),
        status: z.string(),
      }).nullable().optional(),
    }).passthrough(),
  ]);

  return handleRequest<LoginResponse>(api.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, payload), 'raw', AuthResponseSchema);
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return handleRequest<RegisterResponse>(api.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, payload), 'raw');
}

export async function fetchDashboard(): Promise<Record<string, unknown>> {
  return handleRequest<Record<string, unknown>>(api.get<Record<string, unknown>>(ENDPOINTS.ADMIN.DASHBOARD), 'raw');
}

export async function fetchSecurityMetrics(): Promise<Record<string, unknown>> {
  return handleRequest<Record<string, unknown>>(api.get<Record<string, unknown>>(ENDPOINTS.ADMIN.SECURITY), 'raw');
}

export async function fetchApiKeys(): Promise<ApiKey[]> {
  return handleRequest<ApiKey[]>(api.get<DataResponse<ApiKey[]>>(ENDPOINTS.ADMIN.API_KEYS), 'data');
}

export async function createApiKey(payload: { name: string; description?: string; permissions?: string[] }): Promise<ApiKey> {
  const result = await handleRequest<{ data: ApiKey; secret: string }>(api.post<{ data: ApiKey; secret: string }>(ENDPOINTS.ADMIN.API_KEYS, payload), 'raw');
  return { ...result.data, secret: result.secret };
}

export async function deleteApiKey(id: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.delete<{ message: string }>(`${ENDPOINTS.ADMIN.API_KEYS}/${id}`), 'raw');
}

export async function regenerateApiKey(id: number): Promise<{ secret: string }> {
  return handleRequest<{ secret: string }>(api.post<{ secret: string }>(`${ENDPOINTS.ADMIN.API_KEYS}/${id}/regenerate`), 'data');
}

export async function fetchWebhooks(): Promise<Webhook[]> {
  return handleRequest<Webhook[]>(api.get<DataResponse<Webhook[]>>(ENDPOINTS.ADMIN.WEBHOOKS), 'data');
}

export async function createWebhook(data: CreateWebhookPayload): Promise<Webhook> {
  const result = await handleRequest<{ data: Webhook; secret: string }>(api.post<{ data: Webhook; secret: string }>(ENDPOINTS.ADMIN.WEBHOOKS, data), 'raw');
  return { ...result.data, secret: result.secret };
}

export async function updateWebhook(id: number, payload: Partial<CreateWebhookPayload> & { status?: string }): Promise<Webhook> {
  return handleRequest<Webhook>(api.patch<Webhook>(`${ENDPOINTS.ADMIN.WEBHOOKS}/${id}`, payload), 'data');
}

export async function deleteWebhook(id: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.delete<{ message: string }>(`${ENDPOINTS.ADMIN.WEBHOOKS}/${id}`), 'raw');
}

export async function testWebhook(id: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.post<{ message: string }>(`${ENDPOINTS.ADMIN.WEBHOOKS}/${id}/test`), 'data');
}

export async function fetchDrivers(): Promise<Driver[]> {
  return handleRequest<Driver[]>(api.get<DataResponse<Driver[]>>(ENDPOINTS.ADMIN.DRIVERS), 'data');
}

export async function createDriver(data: CreateDriverPayload): Promise<Driver> {
  return handleRequest<Driver>(api.post<Driver>(ENDPOINTS.ADMIN.DRIVERS, data), 'data');
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  return handleRequest<AuditLog[]>(api.get<DataResponse<AuditLog[]>>(ENDPOINTS.ADMIN.AUDIT_LOGS), 'data');
}

export async function changePassword(payload: { current_password: string; password: string; password_confirmation: string }): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.post<{ message: string }>(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload), 'raw');
}

export async function fetchMe(): Promise<User> {
  const UserSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string().email(),
    status: z.string(),
    roles: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable().optional(),
        permissions: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            description: z.string().nullable().optional(),
            created_at: z.string().optional(),
            updated_at: z.string().optional(),
          }).passthrough(),
        ).optional(),
        created_at: z.string().optional(),
        updated_at: z.string().optional(),
      }).passthrough(),
    ).optional(),
  }).partial().passthrough();

  return handleRequest<User>(api.get<{ user: User }>(ENDPOINTS.AUTH.ME), 'user', UserSchema);
}

export async function fetchRoles(): Promise<Role[]> {
  return handleRequest<Role[]>(api.get<DataResponse<Role[]>>(ENDPOINTS.ADMIN.ROLES), 'data');
}

export async function fetchPermissions(): Promise<Permission[]> {
  return handleRequest<Permission[]>(api.get<DataResponse<Permission[]>>(ENDPOINTS.ADMIN.PERMISSIONS), 'data');
}

export async function fetchUsers(): Promise<User[]> {
  return handleRequest<User[]>(api.get<DataResponse<User[]>>(ENDPOINTS.ADMIN.USERS), 'data');
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  return handleRequest<User>(api.post<DataResponse<User>>(ENDPOINTS.ADMIN.USERS, payload), 'data');
}

export async function assignRoleToUser(userId: number, role: string): Promise<User> {
  return handleRequest<User>(api.post<DataResponse<User>>(ENDPOINTS.ADMIN.USER_ROLES(userId), { role }), 'data');
}

export async function removeRoleFromUser(userId: number, roleId: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.delete<{ message: string }>(ENDPOINTS.ADMIN.USER_ROLE(userId, roleId)), 'raw');
}

export async function fetchPlatformDashboard(): Promise<Record<string, unknown>> {
  return handleRequest<Record<string, unknown>>(api.get<Record<string, unknown>>(ENDPOINTS.PLATFORM.DASHBOARD), 'raw');
}

export async function fetchPlatformUsers(): Promise<User[]> {
  return handleRequest<User[]>(api.get<DataResponse<User[]>>(ENDPOINTS.PLATFORM.USERS), 'data');
}

export async function assignPlatformRoleToUser(userId: number, role: string): Promise<User> {
  return handleRequest<User>(api.post<DataResponse<User>>(ENDPOINTS.PLATFORM.USER_ROLES(userId), { role }), 'data');
}

export async function removePlatformRoleFromUser(userId: number, roleId: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.delete<{ message: string }>(ENDPOINTS.PLATFORM.USER_ROLE(userId, roleId)), 'raw');
}

export async function fetchPlatformRoles(): Promise<Role[]> {
  return handleRequest<Role[]>(api.get<DataResponse<Role[]>>(ENDPOINTS.PLATFORM.ROLES), 'data');
}

export async function fetchPlatformPermissions(): Promise<Permission[]> {
  return handleRequest<Permission[]>(api.get<DataResponse<Permission[]>>(ENDPOINTS.PLATFORM.PERMISSIONS), 'data');
}

export async function fetchPlatformDeliveries(): Promise<any[]> {
  return handleRequest<any[]>(api.get<DataResponse<any[]>>(ENDPOINTS.PLATFORM.DELIVERIES), 'data');
}

export async function fetchPlatformDrivers(): Promise<Driver[]> {
  return handleRequest<Driver[]>(api.get<DataResponse<Driver[]>>(ENDPOINTS.PLATFORM.DRIVERS), 'data');
}

export async function fetchCompanies(): Promise<any[]> {
  return handleRequest<any[]>(api.get<DataResponse<any[]>>(ENDPOINTS.PLATFORM.COMPANIES), 'data');
}

export async function fetchPendingCompanies(): Promise<any[]> {
  return handleRequest<any[]>(api.get<DataResponse<any[]>>(ENDPOINTS.PLATFORM.PENDING_COMPANIES), 'data');
}

export async function approveCompany(companyId: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.post<{ message: string }>(ENDPOINTS.PLATFORM.COMPANY_APPROVE(companyId), {}), 'raw');
}

export async function rejectCompany(companyId: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.post<{ message: string }>(ENDPOINTS.PLATFORM.COMPANY_REJECT(companyId), {}), 'raw');
}

export async function suspendCompany(companyId: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.post<{ message: string }>(ENDPOINTS.PLATFORM.COMPANY_SUSPEND(companyId), {}), 'raw');
}

export async function activateCompany(companyId: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.post<{ message: string }>(ENDPOINTS.PLATFORM.COMPANY_ACTIVATE(companyId), {}), 'raw');
}

export async function deleteCompany(companyId: number): Promise<{ message: string }> {
  return handleRequest<{ message: string }>(api.delete<{ message: string }>(ENDPOINTS.PLATFORM.COMPANY_DELETE(companyId)), 'raw');
}
