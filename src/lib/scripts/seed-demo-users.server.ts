/**
 * Seeds two demo users: one employee, one admin.
 * Run with: pnpm db:seed
 * Requires DATABASE_URL to be set (loaded from .env automatically).
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { DEMO_PASSWORD, DEMO_USERS } from "$lib/demo-users";
import { account, user } from "$lib/server/db/auth.schema";

import { loadEnv } from "./utils";

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

// Import password hasher from better-auth (avoids SvelteKit module resolution)
const { hashPassword } = await import("better-auth/crypto");

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function seed() {
  const hashedPassword = await hashPassword(DEMO_PASSWORD);

  for (const demo of DEMO_USERS) {
    const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, demo.email));
    if (existing) {
      console.log(`  skip  ${demo.email} (already exists)`);
      continue;
    }

    await db.insert(user).values({
      id: demo.id,
      name: demo.name,
      email: demo.email,
      emailVerified: true,
      role: demo.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(account).values({
      id: `${demo.id}-account`,
      accountId: demo.id,
      providerId: "credential",
      userId: demo.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`  added  ${demo.role === "admin" ? "admin  " : "employee"} → ${demo.email}`);
  }

  console.log(`\nDemo credentials:`);
  console.log(`  Employee : sarah.johnson@company.com`);
  console.log(`  Admin    : emily.rodriguez@company.com`);
  console.log(`  Password : ${DEMO_PASSWORD}`);

  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
