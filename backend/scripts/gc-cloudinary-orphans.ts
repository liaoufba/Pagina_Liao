import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { applyActiveDatabaseUrl, getDbEnv, hostFromUrl } from './db-url';
import {
  destroyUnreferencedPublicIds,
  loadReferencedPublicIds,
  ownedPublicIdPrefixes,
} from '../src/services/cloudinaryMedia';

async function listPublicIds(prefix: string): Promise<string[]> {
  const ids: string[] = [];
  let nextCursor: string | undefined;
  do {
    const page = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      prefix,
      max_results: 500,
      next_cursor: nextCursor,
    });
    for (const resource of page.resources || []) {
      if (resource.public_id) ids.push(resource.public_id);
    }
    nextCursor = page.next_cursor;
  } while (nextCursor);
  return ids;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const confirmProd = process.argv.includes('--confirm-prod');

  applyActiveDatabaseUrl();
  const dbEnv = getDbEnv();
  if (dbEnv === 'prod' && !confirmProd) {
    console.error('Refusing to scan production. Pass --confirm-prod if you mean it.');
    process.exit(1);
  }

  if (!process.env.CLOUDINARY_URL) {
    console.error('CLOUDINARY_URL is not set.');
    process.exit(1);
  }

  const prefixes = ownedPublicIdPrefixes();
  console.log(`Cloudinary GC (${apply ? 'apply' : 'dry-run'})`);
  console.log(`Database: ${hostFromUrl(process.env.DATABASE_URL || '')} (DB_ENV=${dbEnv})`);
  console.log(`Prefixes: ${prefixes.join(', ')}`);

  const remoteIds = new Set<string>();
  for (const prefix of prefixes) {
    const listed = await listPublicIds(prefix.replace(/\/$/, ''));
    listed.forEach((id) => remoteIds.add(id));
  }

  const referenced = await loadReferencedPublicIds();
  const orphans = [...remoteIds].filter((id) => !referenced.has(id));

  console.log(`Remote owned assets: ${remoteIds.size}`);
  console.log(`Referenced in DB: ${referenced.size}`);
  console.log(`Orphans: ${orphans.length}`);
  orphans.slice(0, 40).forEach((id) => console.log(`  - ${id}`));
  if (orphans.length > 40) console.log(`  … ${orphans.length - 40} more`);

  if (!apply) {
    console.log('\nRe-run with --apply to destroy orphans.');
    return;
  }

  await destroyUnreferencedPublicIds(orphans);
  console.log('Destroy finished.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
