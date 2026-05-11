import { env } from "$env/dynamic/private";
import { eq, sql } from "drizzle-orm";

import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { session, user } from "$lib/server/db/schema";
import { inviteEmail } from "$lib/server/email-templates";
import { createInvite } from "$lib/server/invites";
import { sendEmail } from "$lib/server/mail";
import { asManagedRole, type ManagedRole } from "$lib/user-management";

type EditableUserRecord = {
  id: string;
  name: string;
  role: string | null;
  email: string;
};

export type ManagedUserListItem = {
  id: string;
  name: string;
  email: string;
  managedRole: ManagedRole;
  lastActive: Date | null;
};

export class ManagedUserError extends Error {
  constructor(public readonly code: "account_exists" | "last_admin" | "not_found" | "self_delete") {
    super(code);
  }
}

export async function listManagedUsers(headers: Headers): Promise<ManagedUserListItem[]> {
  const { users } = await auth.api.listUsers({
    headers,
    query: { limit: 100, sortBy: "name", sortDirection: "asc" },
  });

  const lastActiveSessions = await db
    .select({
      userId: session.userId,
      lastActive: sql<Date | null>`MAX(${session.updatedAt})`.as("last_active"),
    })
    .from(session)
    .groupBy(session.userId);

  const lastActiveMap = new Map(lastActiveSessions.map((entry) => [entry.userId, entry.lastActive]));

  return users.map((entry) => ({
    ...entry,
    managedRole: asManagedRole(entry.role),
    lastActive: lastActiveMap.get(entry.id) ?? null,
  }));
}

export async function inviteManagedUser(email: string, role: ManagedRole) {
  try {
    const expiresInDays = 7;
    const invite = await createInvite(email, role, expiresInDays);
    const inviteUrl = `${env.ORIGIN}/signup?token=${invite.token}`;

    let emailSent = false;

    try {
      await sendEmail({
        to: email,
        subject: "You're invited to outa.one",
        html: inviteEmail(inviteUrl, expiresInDays),
      });
      emailSent = true;
    } catch {
      // Email delivery is best-effort. Admins can still share the invite link manually.
    }

    return { inviteUrl, emailSent };
  } catch (error) {
    if (error instanceof Error && error.message === `${email} already has an account`) {
      throw new ManagedUserError("account_exists");
    }

    throw error;
  }
}

export async function updateManagedUserRole(headers: Headers, userId: string, role: ManagedRole) {
  const targetUser = await findManagedUser(userId);

  if (!targetUser) {
    throw new ManagedUserError("not_found");
  }

  if (asManagedRole(targetUser.role) === "admin" && role !== "admin") {
    const adminCount = await countAdmins();

    if (adminCount <= 1) {
      throw new ManagedUserError("last_admin");
    }
  }

  await auth.api.setRole({
    headers,
    body: {
      userId,
      role,
    },
  });

  return targetUser;
}

export async function removeManagedUser(headers: Headers, userId: string, currentUserId?: string) {
  if (userId === currentUserId) {
    throw new ManagedUserError("self_delete");
  }

  const targetUser = await findManagedUser(userId);

  if (!targetUser) {
    throw new ManagedUserError("not_found");
  }

  if (asManagedRole(targetUser.role) === "admin") {
    const adminCount = await countAdmins();

    if (adminCount <= 1) {
      throw new ManagedUserError("last_admin");
    }
  }

  await auth.api.removeUser({
    headers,
    body: { userId },
  });

  return targetUser;
}

async function findManagedUser(userId: string): Promise<EditableUserRecord | null> {
  const [record] = await db
    .select({ id: user.id, name: user.name, role: user.role, email: user.email })
    .from(user)
    .where(eq(user.id, userId));

  return record ?? null;
}

async function countAdmins() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)`.as("count") })
    .from(user)
    .where(eq(user.role, "admin"));

  return Number(count);
}
