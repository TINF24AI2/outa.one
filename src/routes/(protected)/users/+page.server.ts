import { fail } from "@sveltejs/kit";
import { z } from "zod";

import { m } from "$lib/paraglide/messages.js";
import { inviteUserSchema, removeUserSchema, updateUserRoleSchema } from "$lib/schemas/users";
import { requireAdminUser } from "$lib/server/auth/guards";
import {
  inviteManagedUser,
  listManagedUsers,
  ManagedUserError,
  removeManagedUser,
  updateManagedUserRole,
} from "$lib/server/users";

import type { Actions, PageServerLoad } from "./$types";

function requireAdmin(event: Parameters<NonNullable<Actions[keyof Actions]>>[0]) {
  if (event.locals.user?.role !== "admin") {
    return fail(403, { message: m.dashboard_invite_error_forbidden() });
  }

  return null;
}

export const load: PageServerLoad = async (event) => {
  requireAdminUser(event);

  return {
    users: await listManagedUsers(event.request.headers),
  };
};

export const actions: Actions = {
  inviteUser: async (event) => {
    const forbidden = requireAdmin(event);
    if (forbidden) {
      return forbidden;
    }

    const payload = Object.fromEntries(await event.request.formData());
    const result = inviteUserSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors;

      return fail(400, {
        fieldErrors: {
          email: fieldErrors.email?.[0],
          role: fieldErrors.role?.[0],
        },
        message: fieldErrors.email?.[0] ?? fieldErrors.role?.[0] ?? m.auth_error_unexpected(),
      });
    }

    const email = result.data.email.toLowerCase();

    try {
      const { inviteUrl, emailSent } = await inviteManagedUser(email, result.data.role);

      return {
        inviteUrl,
        emailSent,
        message: m.users_invite_success({ email }),
      };
    } catch (error) {
      const message =
        error instanceof ManagedUserError && error.code === "account_exists"
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

    const payload = Object.fromEntries(await event.request.formData());
    const result = updateUserRoleSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors;
      return fail(400, {
        fieldErrors: { role: fieldErrors.role?.[0] },
        message: fieldErrors.role?.[0] ?? m.users_error_not_found(),
      });
    }

    try {
      const targetUser = await updateManagedUserRole(event.request.headers, result.data.userId, result.data.role);

      return { message: m.users_edit_success({ name: targetUser.name }) };
    } catch (error) {
      if (error instanceof ManagedUserError) {
        if (error.code === "last_admin") {
          return fail(400, { message: m.users_error_last_admin() });
        }

        if (error.code === "not_found") {
          return fail(404, { message: m.users_error_not_found() });
        }
      }

      return fail(500, { message: m.auth_error_unexpected() });
    }
  },

  removeUser: async (event) => {
    const forbidden = requireAdmin(event);
    if (forbidden) {
      return forbidden;
    }

    const payload = Object.fromEntries(await event.request.formData());
    const result = removeUserSchema.safeParse(payload);

    if (!result.success) {
      return fail(400, { message: m.users_error_not_found() });
    }

    try {
      const targetUser = await removeManagedUser(event.request.headers, result.data.userId, event.locals.user?.id);

      return { message: m.users_delete_success({ name: targetUser.name }) };
    } catch (error) {
      if (error instanceof ManagedUserError) {
        if (error.code === "self_delete") {
          return fail(400, { message: m.users_delete_error_self() });
        }

        if (error.code === "last_admin") {
          return fail(400, { message: m.users_error_last_admin() });
        }

        if (error.code === "not_found") {
          return fail(404, { message: m.users_error_not_found() });
        }
      }

      return fail(500, { message: m.auth_error_unexpected() });
    }
  },
};
