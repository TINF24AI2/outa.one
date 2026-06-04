import { requireAuthenticatedUser } from "$lib/server/auth/guards";
import { getUserLicenseHistory } from "$lib/server/history";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const user = requireAuthenticatedUser(event);

  const history = await getUserLicenseHistory(user.id);

  return {
    history,
  };
};
