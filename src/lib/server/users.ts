import { env } from "$env/dynamic/private";
import { and, eq, isNull, sql } from "drizzle-orm";

import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { invite, session, user } from "$lib/server/db/schema";
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
  name: string | null;
  email: string;
  managedRole: ManagedRole;
  status: "active" | "pending";
  lastActive: Date | null;
  invitedAt: Date | null;
};

export class ManagedUserError extends Error {
  constructor(
    public readonly code: "account_exists" | "last_admin" | "not_found" | "self_delete" | "invite_not_found",
  ) {
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

  const activeUsers = users.map((entry) => ({
    ...entry,
    managedRole: asManagedRole(entry.role),
    status: "active" as const,
    lastActive: lastActiveMap.get(entry.id) ?? null,
    invitedAt: null,
  }));

  const pendingInvites = await db
    .select({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      invitedAt: invite.createdAt,
    })
    .from(invite)
    .leftJoin(user, eq(invite.email, user.email))
    .where(and(isNull(invite.usedAt), isNull(user.id)));

  const pendingUsers = pendingInvites.map((entry) => ({
    id: entry.id,
    name: null,
    email: entry.email,
    managedRole: asManagedRole(entry.role),
    status: "pending" as const,
    lastActive: null,
    invitedAt: entry.invitedAt,
  }));

  return [...activeUsers, ...pendingUsers].sort((left, right) => {
    const leftLabel = left.name?.trim() || left.email;
    const rightLabel = right.name?.trim() || right.email;

    return (
      leftLabel.localeCompare(rightLabel, undefined, { sensitivity: "base" }) || left.email.localeCompare(right.email)
    );
  });
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

export async function resendManagedInvite(inviteId: string) {
  const pendingInvite = await findPendingInvite(inviteId);

  if (!pendingInvite) {
    throw new ManagedUserError("invite_not_found");
  }

  return inviteManagedUser(pendingInvite.email, pendingInvite.managedRole);
}

export async function cancelManagedInvite(inviteId: string) {
  const pendingInvite = await findPendingInvite(inviteId);

  if (!pendingInvite) {
    throw new ManagedUserError("invite_not_found");
  }

  await db.delete(invite).where(eq(invite.id, inviteId));

  return pendingInvite;
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

async function findPendingInvite(inviteId: string) {
  const [record] = await db
    .select({
      id: invite.id,
      email: invite.email,
      managedRole: invite.role,
    })
    .from(invite)
    .leftJoin(user, eq(invite.email, user.email))
    .where(and(eq(invite.id, inviteId), isNull(invite.usedAt), isNull(user.id)));

  return record
    ? {
        ...record,
        managedRole: asManagedRole(record.managedRole),
      }
    : null;
}
