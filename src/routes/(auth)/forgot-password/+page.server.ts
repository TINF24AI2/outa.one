import { fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { m } from "$lib/paraglide/messages.js";
import { forgotPasswordSchema } from "$lib/schemas/auth";
import { auth } from "$lib/server/auth";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    redirect(302, "/dashboard");
  }

  return { form: await superValidate(zod(forgotPasswordSchema)) };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event.request, zod(forgotPasswordSchema));
    if (!form.valid) return fail(400, { form });

    try {
      await auth.api.requestPasswordReset({
        body: { email: form.data.email, redirectTo: `${event.url.origin}/reset-password` },
      });
    } catch {
      // Always show success to prevent email enumeration
    }

    return message(form, m.auth_forgot_email_sent());
  },
};
