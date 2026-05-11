import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { m } from "$lib/paraglide/messages.js";
import { resetPasswordSchema } from "$lib/schemas/auth";
import { auth } from "$lib/server/auth";
import { redirectAuthenticated } from "$lib/server/auth/guards";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  redirectAuthenticated(event);

  const token = event.url.searchParams.get("token");
  if (!token) {
    redirect(302, "/forgot-password");
  }

  return {
    form: await superValidate({ token }, zod(resetPasswordSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event.request, zod(resetPasswordSchema));
    if (!form.valid) return fail(400, { form });

    try {
      await auth.api.resetPassword({ body: { token: form.data.token, newPassword: form.data.password } });
    } catch (error) {
      if (error instanceof APIError) {
        return message(form, m.auth_reset_error_token_invalid(), { status: 400 });
      }
      return message(form, m.auth_error_unexpected(), { status: 500 });
    }

    return message(form, { success: true as const });
  },
};
