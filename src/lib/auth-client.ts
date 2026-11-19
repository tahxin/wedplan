import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
  const cleaned = raw.split("||")[0].split("#")[0].trim();
  if (cleaned && (cleaned.startsWith("http://") || cleaned.startsWith("https://"))) {
    return cleaned;
  }
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    inferAdditionalFields<typeof auth>(),
    jwtClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
