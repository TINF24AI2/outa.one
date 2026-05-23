import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

export function redirectAuthenticated(event: Pick<RequestEvent, "locals">, location = "/request") {
  if (event.locals.user) {
    redirect(302, location);
  }
}

export function requireAuthenticatedUser(event: Pick<RequestEvent, "locals">, location = "/login") {
  const currentUser = event.locals.user;

  if (!currentUser) {
    redirect(302, location);
  }

  return currentUser;
}

export function requireAdminUser(event: Pick<RequestEvent, "locals">) {
  const currentUser = requireAuthenticatedUser(event);

  if (currentUser.role !== "admin") {
    redirect(302, "/request");
  }

  return currentUser;
}
