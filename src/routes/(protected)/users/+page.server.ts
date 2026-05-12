import { fail } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

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
  return event.locals.user?.role === "admin";
}

export const load: PageServerLoad = async (event) => {
  requireAdminUser(event);

  const users = await listManagedUsers(event.request.headers);
  const editForms = await Promise.all(
    users.map(
      async (u) =>
        await superValidate({ userId: u.id, role: u.managedRole }, zod(updateUserRoleSchema), {
          id: `update-user-${u.id}`,
        }),
    ),
  );
  const deleteForms = await Promise.all(
    users.map(async (u) => await superValidate({ userId: u.id }, zod(removeUserSchema), { id: `remove-user-${u.id}` })),
  );

  return {
    inviteForm: await superValidate(zod(inviteUserSchema), { id: "invite-user" }),
    editForms,
    deleteForms,
    users,
  };
};

export const actions: Actions = {
  inviteUser: async (event) => {
    const form = await superValidate(event.request, zod(inviteUserSchema));
    if (!requireAdmin(event)) return message(form, m.dashboard_invite_error_forbidden(), { status: 403 });
    if (!form.valid) return fail(400, { form });

    const email = form.data.email.toLowerCase();

    try {
      const { inviteUrl, emailSent } = await inviteManagedUser(email, form.data.role);

      return {
        form,
        inviteUrl,
        emailSent,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ManagedUserError && error.code === "account_exists"
          ? m.users_invite_error_account_exists({ email })
          : m.auth_error_unexpected();

      if (error instanceof ManagedUserError && error.code === "account_exists") {
        return setError(form, "email", errorMessage);
      }

      return message(form, errorMessage, { status: 500 });
    }
  },

  updateUser: async (event) => {
    const form = await superValidate(event.request, zod(updateUserRoleSchema));
    if (!requireAdmin(event)) return message(form, m.dashboard_invite_error_forbidden(), { status: 403 });
    if (!form.valid) return fail(400, { form });

    try {
      await updateManagedUserRole(event.request.headers, form.data.userId, form.data.role);
      return { form };
    } catch (error) {
      if (error instanceof ManagedUserError) {
        if (error.code === "last_admin") {
          return message(form, m.users_error_last_admin(), { status: 400 });
        }

        if (error.code === "not_found") {
          return message(form, m.users_error_not_found(), { status: 404 });
        }
      }

      return message(form, m.auth_error_unexpected(), { status: 500 });
    }
  },

  removeUser: async (event) => {
    const form = await superValidate(event.request, zod(removeUserSchema));
    if (!requireAdmin(event)) return message(form, m.dashboard_invite_error_forbidden(), { status: 403 });
    if (!form.valid) return fail(400, { form });

    try {
      await removeManagedUser(event.request.headers, form.data.userId, event.locals.user?.id);
      return { form };
    } catch (error) {
      if (error instanceof ManagedUserError) {
        if (error.code === "self_delete") {
          return message(form, m.users_delete_error_self(), { status: 400 });
        }

        if (error.code === "last_admin") {
          return message(form, m.users_error_last_admin(), { status: 400 });
        }

        if (error.code === "not_found") {
          return message(form, m.users_error_not_found(), { status: 404 });
        }
      }
      return message(form, m.auth_error_unexpected(), { status: 500 });
    }
  },
};
