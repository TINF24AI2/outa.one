import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "$lib/server/db";
import { invite, user } from "$lib/server/db/schema";

export async function createInvite(email: string, role: "user" | "admin" = "user", expiresInDays = 7) {
  if (await emailAlreadyRegistered(email)) {
    throw new Error(`${email} already has an account`);
  } else if (await emailAlreadyInvited(email)) {
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    const [updated] = await db.update(invite).set({ expiresAt }).where(eq(invite.email, email)).returning();
    return updated;
  }
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  const [created] = await db.insert(invite).values({ id: randomUUID(), email, token, role, expiresAt }).returning();
  return created;
}

export async function getValidInvite(token: string) {
  const [found] = await db.select().from(invite).where(eq(invite.token, token));
  if (!found || found.usedAt || found.expiresAt < new Date()) return null;
  return found;
}

export async function consumeInvite(token: string) {
  await db.update(invite).set({ usedAt: new Date() }).where(eq(invite.token, token));
}

// Helper functions
async function emailAlreadyRegistered(email: string) {
  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  return !!existing;
}

async function emailAlreadyInvited(email: string) {
  const [existing] = await db.select({ id: invite.id }).from(invite).where(eq(invite.email, email));
  return existing;
}
