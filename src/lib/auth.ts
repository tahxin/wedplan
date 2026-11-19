import { betterAuth } from "better-auth";
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

let client: MongoClient;
if (process.env.NODE_ENV === "development") {
  if (!global._betterAuthMongoClient) {
    global._betterAuthMongoClient = new MongoClient(mongoUri);
  }
  client = global._betterAuthMongoClient;
} else {
  client = new MongoClient(mongoUri);
}

const db = client.db();

function getBaseUrl() {
  const raw = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  const cleaned = raw.split("||")[0].split("#")[0].trim();
  if (cleaned && (cleaned.startsWith("http://") || cleaned.startsWith("https://"))) {
    return cleaned;
  }
  return "http://localhost:3000";
}

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
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
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
  plugins: [
    jwt(),
    bearer(),
  ],
});
