import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';

// Use this to perform interactions with better-auth on the client.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});
