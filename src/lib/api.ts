import { authClient } from "./auth-client";

export function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_LINK || "";
  const cleaned = raw.split("||")[0].split("#")[0].trim();
  if (cleaned && (cleaned.startsWith("http://") || cleaned.startsWith("https://"))) {
    return cleaned.replace(/\/$/, "");
  }
  // When running in the browser on a live website (not local dev), route to production backend
  if (typeof window !== "undefined") {
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return "https://wedplan-backend.vercel.app";
    }
  }
  // Server-side production fallback
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "https://wedplan-backend.vercel.app";
  }
  return "http://localhost:5000";
}

const API_BASE_URL = getApiBaseUrl();

interface FetchOptions extends RequestInit {
  token?: string;
}

/**
 * `authClient.getSession()` is a network round-trip. Dashboards fire several
 * requests at once, so cache the token briefly instead of asking every time.
 */
let cachedToken: { value: string; expiresAt: number } | null = null;
const TOKEN_CACHE_MS = 30_000;

function clearTokenCache() {
  cachedToken = null;
}

async function resolveToken(explicitToken?: string): Promise<string | undefined> {
  if (explicitToken) return explicitToken;

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  try {
    const sessionData = await authClient.getSession();
    const tokenFromSession = (sessionData?.data as { session?: { token?: string } } | null)?.session?.token;
    if (typeof tokenFromSession === "string" && tokenFromSession) {
      cachedToken = { value: tokenFromSession, expiresAt: Date.now() + TOKEN_CACHE_MS };
      return tokenFromSession;
    }

    if (sessionData?.data?.session) {
      const res = await fetch("/api/auth/token", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { token?: string } | null;
        if (data?.token) {
          cachedToken = { value: data.token, expiresAt: Date.now() + TOKEN_CACHE_MS };
          return data.token;
        }
      }
    }
  } catch {
    // Session/token retrieval failed or user is guest
  }

  return undefined;
}

function redirectToSignIn() {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/sign-in")) return;

  const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/sign-in?callbackUrl=${callbackUrl}`);
}

async function handleBlockedUser() {
  clearTokenCache();
  try {
    await authClient.signOut();
  } catch {
    // Ignore - the redirect below is what matters.
  }
  if (typeof window !== "undefined") {
    window.location.assign("/sign-in?blocked=1");
  }
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = await resolveToken(options.token);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message: string =
      (data as { message?: string })?.message || `Request failed with status ${response.status}`;

    // The session is gone or expired: send the user to sign in once, instead
    // of surfacing "Authorization token required" as a toast.
    if (response.status === 401) {
      clearTokenCache();
      redirectToSignIn();
    }

    // A blocked account is a 403 with a specific message.
    if (response.status === 403 && /blocked/i.test(message)) {
      await handleBlockedUser();
    }

    const error: Error & { status?: number; data?: Record<string, unknown> } = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}
