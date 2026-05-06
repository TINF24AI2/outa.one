import { spawn } from 'node:child_process';
import type { Handle, ServerInit } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { auth } from '$lib/server/auth';

export const init: ServerInit = async () => {
  console.log('Migrating Database...');
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' });
  await migrationClient.end();

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      const child = spawn('pnpm', ['run', 'db:seedDemoUsers'], { stdio: 'inherit', shell: true });
      child.on('error', reject);
      child.on('exit', (code) =>
        code === 0 ? resolve() : reject(new Error(`db:seedDemoUsers exited with code ${code}`)),
      );
    }),
    new Promise<void>((resolve, reject) => {
      const child = spawn('pnpm', ['run', 'db:seedProducts'], { stdio: 'inherit', shell: true });
      child.on('error', reject);
      child.on('exit', (code) =>
        code === 0 ? resolve() : reject(new Error(`db:seedProducts exited with code ${code}`)),
      );
    }),
  ]);
};

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', getTextDirection(locale)),
    });
  });

const handleBetterAuth: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({ headers: event.request.headers });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth);
