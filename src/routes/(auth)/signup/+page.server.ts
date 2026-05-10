import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { m } from "$lib/paraglide/messages.js";
import { signupSchema } from "$lib/schemas/auth";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { consumeInvite, getValidInvite } from "$lib/server/invites";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    redirect(302, "/dashboard");
  }

  const token = event.url.searchParams.get("token");

  if (!token) {
    return { error: "no_invite" as const, form: await superValidate(zod(signupSchema)) };
  }

  const invite = await getValidInvite(token);
  if (!invite) {
    return { error: "invalid_invite" as const, form: await superValidate(zod(signupSchema)) };
  }

  return {
    form: await superValidate({ token: invite.token }, zod(signupSchema)),
    email: invite.email,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event.request, zod(signupSchema));
    if (!form.valid) return fail(400, { form });

    const invite = await getValidInvite(form.data.token);
    if (!invite) {
      return message(form, m.auth_signup_error_invite_invalid(), { status: 400 });
    }

    try {
      await auth.api.signUpEmail({ body: { email: invite.email, password: form.data.password, name: form.data.name } });

      if (invite.role === "admin") {
        await db.update(user).set({ role: "admin" }).where(eq(user.email, invite.email));
      }

      await consumeInvite(form.data.token);
    } catch (error) {
      if (error instanceof APIError) {
        return message(form, m.auth_signup_error_failed(), { status: 400 });
      }
      return message(form, m.auth_error_unexpected(), { status: 500 });
    }

    redirect(302, "/signup/success");
  },
};
