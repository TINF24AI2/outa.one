import { redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { session } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (event.locals.user?.role !== 'admin') {
    redirect(302, '/dashboard');
  }

  const { users } = await auth.api.listUsers({
    headers: event.request.headers,
    query: { limit: 100, sortBy: 'name', sortDirection: 'asc' },
  });

  const lastActiveSessions = await db
    .select({
      userId: session.userId,
      lastActive: sql<Date | null>`MAX(${session.updatedAt})`.as('last_active'),
    })
    .from(session)
    .groupBy(session.userId);

  const lastActiveMap = new Map(lastActiveSessions.map((s) => [s.userId, s.lastActive]));

  return {
    users: users.map((u) => ({ ...u, lastActive: lastActiveMap.get(u.id) ?? null })),
  };
};
