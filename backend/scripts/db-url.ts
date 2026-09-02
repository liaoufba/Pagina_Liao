import { pathToFileURL } from 'url';

export function isPlaceholderDatabaseUrl(databaseUrl: string): boolean {
  return (
    !databaseUrl ||
    databaseUrl.includes('prod-host') ||
    databaseUrl.includes('username:password') ||
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
