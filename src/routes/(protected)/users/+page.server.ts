import { fail, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { eq, sql } from "drizzle-orm";

import { m } from "$lib/paraglide/messages.js";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { session, user } from "$lib/server/db/schema";
import { inviteEmail } from "$lib/server/email-templates";
import { createInvite, deleteInviteByEmail } from "$lib/server/invites";
import { sendEmail } from "$lib/server/mail";

import type { Actions, PageServerLoad } from "./$types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MANAGED_ROLES = new Set(["admin", "user"]);

function isAdminRole(role: string | null | undefined) {
  return role?.split(",").includes("admin") ?? false;
}

function requireAdmin(event: Parameters<NonNullable<Actions[keyof Actions]>>[0]) {
  if (event.locals.user?.role !== "admin") {
    return fail(403, { message: m.dashboard_invite_error_forbidden() });
  }

  return null;
}

async function findManagedUser(userId: string) {
  const [found] = await db
    .select({ id: user.id, name: user.name, role: user.role, email: user.email })
    .from(user)
    .where(eq(user.id, userId));
  return found ?? null;
}

async function countAdmins() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)`.as("count") })
    .from(user)
    .where(eq(user.role, "admin"));

  return Number(count);
}

export const load: PageServerLoad = async (event) => {
  if (event.locals.user?.role !== "admin") {
    redirect(302, "/dashboard");
  }

  const { users } = await auth.api.listUsers({
    headers: event.request.headers,
    query: { limit: 100, sortBy: "name", sortDirection: "asc" },
  });

  const lastActiveSessions = await db
    .select({
      userId: session.userId,
      lastActive: sql<Date | null>`MAX(${session.updatedAt})`.as("last_active"),
    })
    .from(session)
    .groupBy(session.userId);

  const lastActiveMap = new Map(lastActiveSessions.map((s) => [s.userId, s.lastActive]));

  return {
    users: users.map((u) => ({
      ...u,
      managedRole: isAdminRole(u.role) ? ("admin" as const) : ("user" as const),
      lastActive: lastActiveMap.get(u.id) ?? null,
    })),
  };
};

export const actions: Actions = {
  inviteUser: async (event) => {
    const forbidden = requireAdmin(event);
    if (forbidden) {
      return forbidden;
    }

    const formData = await event.request.formData();
    const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
    const role = formData.get("role")?.toString() ?? "user";

    if (!EMAIL_REGEX.test(email)) {
      return fail(400, {
        fieldErrors: { email: m.dashboard_invite_error_email_invalid() },
        message: m.dashboard_invite_error_email_invalid(),
      });
    }

    if (!MANAGED_ROLES.has(role)) {
      return fail(400, {
        fieldErrors: { role: m.users_role_error_invalid() },
        message: m.users_role_error_invalid(),
      });
    }

    const managedRole = role as "admin" | "user";

    try {
      const EXPIRES_IN_DAYS = 7;
      const invite = await createInvite(email, managedRole, EXPIRES_IN_DAYS);
      const inviteUrl = `${env.ORIGIN}/signup?token=${invite.token}`;

      let emailSent = false;
      try {
        await sendEmail({
          to: email,
          subject: "You're invited to outa.one",
          html: inviteEmail(inviteUrl, EXPIRES_IN_DAYS),
        });
        emailSent = true;
      } catch {
        // email failure is non-fatal — admin can share the link manually
      }

      return {
        inviteUrl,
        emailSent,
        message: m.users_invite_success({ email }),
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message === `${email} already has an account`
          ? m.users_invite_error_account_exists({ email })
          : m.auth_error_unexpected();

      return fail(400, {
        fieldErrors: { email: message },
        message,
      });
    }
  },

  updateUser: async (event) => {
    const forbidden = requireAdmin(event);
    if (forbidden) {
      return forbidden;
    }

    const formData = await event.request.formData();
    const userId = formData.get("userId")?.toString() ?? "";
    const role = formData.get("role")?.toString() ?? "";

    if (!userId) {
      return fail(400, { message: m.users_error_not_found() });
    }

    if (!MANAGED_ROLES.has(role)) {
      return fail(400, {
        fieldErrors: { role: m.users_role_error_invalid() },
        message: m.users_role_error_invalid(),
      });
    }

    const managedRole = role as "admin" | "user";

    const targetUser = await findManagedUser(userId);
    if (!targetUser) {
      return fail(404, { message: m.users_error_not_found() });
    }

    if (isAdminRole(targetUser.role) && managedRole !== "admin") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return fail(400, { message: m.users_error_last_admin() });
      }
    }

    await auth.api.setRole({
      headers: event.request.headers,
      body: {
        userId,
        role: managedRole,
      },
    });

    return { message: m.users_edit_success({ name: targetUser.name }) };
  },

  removeUser: async (event) => {
    const forbidden = requireAdmin(event);
    if (forbidden) {
      return forbidden;
    }

    const formData = await event.request.formData();
    const userId = formData.get("userId")?.toString() ?? "";

    if (!userId) {
      return fail(400, { message: m.users_error_not_found() });
    }

    if (userId === event.locals.user?.id) {
      return fail(400, { message: m.users_delete_error_self() });
    }

    const targetUser = await findManagedUser(userId);
    if (!targetUser) {
      return fail(404, { message: m.users_error_not_found() });
    }

    if (isAdminRole(targetUser.role)) {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return fail(400, { message: m.users_error_last_admin() });
      }
    }

    await auth.api.removeUser({
      headers: event.request.headers,
      body: { userId },
    });

    await deleteInviteByEmail(targetUser.email);

    return { message: m.users_delete_success({ name: targetUser.name }) };
  },
};
