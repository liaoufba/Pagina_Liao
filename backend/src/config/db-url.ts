import { pathToFileURL } from 'url';

export type DbEnv = 'dev' | 'prod';

export const DEV_DOCKER_URL =
  'postgresql://username:password@localhost:5432/liao_db?schema=public';

export function isPlaceholderDatabaseUrl(databaseUrl: string): boolean {
  return (
    !databaseUrl ||
    databaseUrl.includes('prod-host') ||
    databaseUrl.includes('YOUR-PASSWORD')
  );
}

export function isLocalHost(databaseUrl: string): boolean {
  try {
    const host = new URL(databaseUrl).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return true;
  }
}

export function hostFromUrl(databaseUrl: string): string {
  try {
    return new URL(databaseUrl).host;
  } catch {
    return 'unknown';
  }
}

function usableUrl(value: string | undefined): string | undefined {
  if (!value || isPlaceholderDatabaseUrl(value)) return undefined;
  return value;
}

export function getDbEnv(): DbEnv {
  const raw = (process.env.DB_ENV || '').trim().toLowerCase();
  if (raw === 'prod' || raw === 'production') return 'prod';
  if (raw === 'dev' || raw === 'development') return 'dev';
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') return 'prod';
  return 'dev';
}

/**
 * Pick the active database URL in process. Never writes .env.
 *
 * Local: DB_ENV=dev|prod selects DEV_DATABASE_URL or PROD_DATABASE_URL.
 * Hosted: a platform-injected DATABASE_URL is used only when the named URL
 * for that env is missing (Vercel, NODE_ENV=production).
 */
export function resolveActiveDatabaseUrl(): string {
  const dbEnv = getDbEnv();
  const named = usableUrl(
    dbEnv === 'prod' ? process.env.PROD_DATABASE_URL : process.env.DEV_DATABASE_URL
  );
  if (named) return named;

  const fallback = usableUrl(process.env.DATABASE_URL);
  if (fallback && dbEnv === 'prod') return fallback;

  const which = dbEnv === 'prod' ? 'PROD_DATABASE_URL' : 'DEV_DATABASE_URL';
  throw new Error(
    `${which} is missing or still a placeholder (DB_ENV=${dbEnv}). ` +
      'Set it in backend/.env. Hosted deploys can set DATABASE_URL instead.'
  );
}

export function applyActiveDatabaseUrl(): string {
  const url = resolveActiveDatabaseUrl();
  process.env.DATABASE_URL = url;
  return url;
}

export function usesSupabasePooler(databaseUrl: string): boolean {
  return databaseUrl.includes('pooler.supabase.com');
}

/** Prefer a real production URL; used by Cloudinary migration scripts. */
export function resolveDatabaseUrl(explicitUrl?: string): string {
  const candidates = [explicitUrl, process.env.PROD_DATABASE_URL, process.env.DATABASE_URL];
  for (const candidate of candidates) {
    if (candidate && !isPlaceholderDatabaseUrl(candidate)) {
      return candidate;
    }
  }
  return '';
}

/** Session-mode pooler works with Prisma; transaction-mode :6543 often breaks. */
export function prismaFriendlyUrl(databaseUrl: string): string {
  const parsed = new URL(databaseUrl);
  if (parsed.hostname.includes('pooler.supabase.com') && parsed.port === '6543') {
    parsed.port = '5432';
  }
  parsed.searchParams.delete('pgbouncer');
  return parsed.toString();
}

export function argValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

export function isDirectRun(metaUrl: string): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return metaUrl === pathToFileURL(entry).href;
}
