import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt, bearer } from "better-auth/plugins";

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is not set. Better Auth will fail if database is accessed.");
}

declare global {
  var _betterAuthMongoClient: MongoClient | undefined;
}

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/wedplan";

// Reuse a single client across hot reloads *and* serverless invocations.
// Creating a new MongoClient on every cold start leaks connection pools.
if (!global._betterAuthMongoClient) {
  global._betterAuthMongoClient = new MongoClient(mongoUri);
}
const client: MongoClient = global._betterAuthMongoClient;

const db = client.db();

function getBaseUrl() {
  const raw = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  const cleaned = raw.split("||")[0].split("#")[0].trim();
  if (cleaned && (cleaned.startsWith("http://") || cleaned.startsWith("https://"))) {
    return cleaned;
  }
  return "http://localhost:3000";
}

/** Roles a member of the public is allowed to choose at sign-up. */
const PUBLIC_SIGNUP_ROLES = ["customer", "vendor"];

export const auth = betterAuth({
  baseURL: getBaseUrl(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, {
    client,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // AGENTS.md section 5: min 6 chars, at least one uppercase, one lowercase.
      // Better Auth only enforces the length, so check the character rules here.
      if (ctx.path !== "/sign-up/email") return;

      const password = typeof ctx.body?.password === "string" ? ctx.body.password : "";
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must contain at least one uppercase and one lowercase letter",
        });
      }

      // `role` is server-controlled (input: false). Capture the requested role from
      // the raw body, whitelist it, stash for the DB create hook, then remove it so
      // Better Auth's input parser doesn't reject it as FIELD_NOT_ALLOWED.
      const requestedRole = (ctx.body as Record<string, unknown> | undefined)?.role;
      const role =
        typeof requestedRole === "string" && PUBLIC_SIGNUP_ROLES.includes(requestedRole)
          ? requestedRole
          : "customer";
      (ctx.context as { requestedSignUpRole?: string }).requestedSignUpRole = role;
      if (ctx.body && typeof ctx.body === "object") {
        delete (ctx.body as Record<string, unknown>).role;
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Role is determined server-side in the sign-up before hook and stashed on
          // the auth context; never trust client-writable input for privilege.
          const endpointCtx = ctx as
            | { context?: { requestedSignUpRole?: string }; body?: Record<string, unknown> }
            | undefined;
          const stashed = endpointCtx?.context?.requestedSignUpRole;
          const requested = stashed ?? endpointCtx?.body?.role;
          const role =
            typeof requested === "string" && PUBLIC_SIGNUP_ROLES.includes(requested)
              ? requested
              : "customer";

          return { data: { ...user, role } };
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        // Never accepted from the client. Set only by the create hook above or
        // by an operator (scripts/make-admin.js).
        input: false,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      businessName: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      subscriptionPlan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },
  plugins: [jwt(), bearer()],
});
