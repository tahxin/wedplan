import { authClient } from "./auth-client";

function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_LINK || "";
  const cleaned = raw.split("||")[0].split("#")[0].trim();
  if (cleaned && (cleaned.startsWith("http://") || cleaned.startsWith("https://"))) {
    return cleaned.replace(/\/$/, "");
  }
  return "http://localhost:5000";
}

const API_BASE_URL = getApiBaseUrl();

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let token = options.token;
  if (!token) {
    try {
      const sessionData = await authClient.getSession();
      if (sessionData?.data?.session?.token) {
        token = sessionData.data.session.token;
      }
    } catch {
      // Session retrieval failed or user is guest
    }
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: Error & { status?: number; data?: Record<string, unknown> } = new Error(
      data?.message || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}
