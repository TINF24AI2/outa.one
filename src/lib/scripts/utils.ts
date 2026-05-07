import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Manually loads environment variables from a .env file in the project root.
 * Useful for scripts that run outside of the Vite/SvelteKit environment (like tsx).
 */
export function loadEnv() {
  try {
    const envContent = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eq_idx = trimmed.indexOf('=');
        if (eq_idx > 0) {
          const key = trimmed.slice(0, eq_idx).trim();
          const val = trimmed
            .slice(eq_idx + 1)
            .trim()
            .replace(/^["']|["']$/g, '');
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  } catch (_err) {
    // If .env doesn't exist, we assume variables are already set in the environment
    console.warn('Note: .env file not found, using existing environment variables.');
  }
}
