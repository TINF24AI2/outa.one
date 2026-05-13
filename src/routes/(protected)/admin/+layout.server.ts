import { requireAdminUser } from "$lib/server/auth/guards";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = (event) => {
  const user = requireAdminUser(event);

  return { user };
};
