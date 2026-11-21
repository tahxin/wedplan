import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const mongoUri = process.env.MONGODB_URI;

export async function getTestDb() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }
  const client = new MongoClient(mongoUri);
  await client.connect();
  return { client, db: client.db() };
}

export async function promoteToAdmin(email: string) {
  const { client, db } = await getTestDb();
  try {
    await db.collection("user").updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { role: "admin", updatedAt: new Date() } }
    );
  } finally {
    await client.close();
  }
}

export async function setVendorPlan(email: string, plan: "free" | "premium") {
  const { client, db } = await getTestDb();
  try {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await db.collection("user").updateOne(
      { email: email.toLowerCase().trim() },
      {
        $set: {
          subscriptionPlan: plan,
          subscriptionExpiresAt: plan === "premium" ? expiresAt : null,
          updatedAt: new Date(),
        },
      }
    );
  } finally {
    await client.close();
  }
}

export async function blockUser(email: string, isBlocked: boolean = true) {
  const { client, db } = await getTestDb();
  try {
    await db.collection("user").updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { isBlocked, updatedAt: new Date() } }
    );
  } finally {
    await client.close();
  }
}

export async function cleanupTestUser(email: string) {
  const { client, db } = await getTestDb();
  try {
    const user = await db.collection("user").findOne({ email: email.toLowerCase().trim() });
    if (user) {
      await Promise.all([
        db.collection("user").deleteOne({ _id: user._id }),
        db.collection("account").deleteMany({ userId: user._id }),
        db.collection("session").deleteMany({ userId: user._id }),
        db.collection("bookings").deleteMany({ $or: [{ customerId: user._id }, { vendorId: user._id }] }),
        db.collection("services").deleteMany({ vendorId: user._id }),
        db.collection("transactions").deleteMany({ vendorId: user._id }),
      ]);
    }
  } catch (err) {
    console.warn("Cleanup warning:", err);
  } finally {
    await client.close();
  }
}
