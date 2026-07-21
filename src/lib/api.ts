/**
 * Central API client for resurva backend.
 * Base URL: https://api.resurva.my.id/api/v1
 *
 * Usage:
 *   import { apiClient } from "@/lib/api";
 *   const products = await apiClient.get("/products?store_id=...");
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.resurva.my.id/api/v1";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_store_id");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  business_id: string | null;
  store_id: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}

// ─── Core fetcher ─────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function tryRefreshToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(!!token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.access_token, data.refresh_token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      isRefreshing = false;
      onRefreshed(data.access_token);
      return true;
    } else {
      clearTokens();
      isRefreshing = false;
      onRefreshed("");
      window.location.href = "/login-merchant";
      return false;
    }
  } catch (err) {
    isRefreshing = false;
    onRefreshed("");
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    console.warn(`[apiClient] Network error on ${path}:`, err);
    throw new Error(`Gagal terhubung ke server backend (${err.message || 'Failed to fetch'})`);
  }


  if (response.status === 401) {
    let isExpired = false;
    try {
      const clone = response.clone();
      const body = await clone.json();
      if (body.detail === "Token has expired" || body.detail === "Signature has expired") {
        isExpired = true;
      }
    } catch {
      // ignore
    }

    if (isExpired) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const newToken = getAccessToken();
        const retryHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        };
        if (newToken) {
          retryHeaders["Authorization"] = `Bearer ${newToken}`;
        }
        response = await fetch(`${BASE_URL}${path}`, {
          ...options,
          headers: retryHeaders,
        });
      }
    }
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      errorDetail = body.detail ?? errorDetail;
    } catch {
      // ignore JSON parse errors for error responses
    }
    throw new Error(errorDetail);
  }

  // 204 No Content – return null cast to T
  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json() as Promise<T>;
}

// ─── Public API client ────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  uploadFile: async (path: string, file: File): Promise<{ access_url: string }> => {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    return response.json();
  },
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function loginWithCredentials(
  usernameOrEmail: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiClient.post<LoginResponse>("/auth/login", {
    username_or_email: usernameOrEmail,
    password,
  });
  setTokens(data.access_token, data.refresh_token);
  localStorage.setItem("auth_user", JSON.stringify(data.user));
  if (data.user.store_id) {
    localStorage.setItem("auth_store_id", data.user.store_id);
  }
  return data;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  clearTokens();
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_store_id");
}

