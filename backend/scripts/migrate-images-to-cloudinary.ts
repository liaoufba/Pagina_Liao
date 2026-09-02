import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { v2 as cloudinary } from 'cloudinary';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { argValue, hostFromUrl, isLocalHost, prismaFriendlyUrl, resolveDatabaseUrl } from './db-url';

const execFileAsync = promisify(execFile);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

type ImageRef = {
  table: string;
  id: number | string;
  field: string;
  index?: number;
  originalUrl: string;
};

export type MigrationEntry = ImageRef & {
  cloudinaryUrl: string;
  publicId: string;
  skipped?: boolean;
  skipReason?: string;
};

export type MigrationBackup = {
  createdAt: string;
  mode: 'dry-run' | 'apply';
  databaseHost: string;
  entries: MigrationEntry[];
};

const BACKUP_DIR = path.join(__dirname, 'cloudinary-backups');

function parseArgs() {
  const args = process.argv.slice(2);
  const only = argValue(args, '--only');
  return {
    apply: args.includes('--apply'),
    confirmProd: args.includes('--confirm-prod'),
    allowLocal: args.includes('--allow-local'),
    only,
    databaseUrl: resolveDatabaseUrl(argValue(args, '--database-url')),
  };
}

function matchesOnlyFilter(ref: ImageRef, only: string | undefined): boolean {
  if (!only) return true;
  const [table, id, field] = only.split(':');
  if (table && ref.table !== table) return false;
  if (id && String(ref.id) !== id) return false;
  if (field && ref.field !== field) return false;
  return true;
}

function isHtmlEmbed(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  if (trimmed.includes('instagram.com/p/') || trimmed.includes('instagram.com/reel/') || trimmed.includes('instgrm.it/')) {
    return true;
  }
  return (
    trimmed.startsWith('<') ||
    trimmed.includes('<iframe') ||
    trimmed.includes('<blockquote') ||
    trimmed.includes('<div') ||
    trimmed.includes('<script') ||
    trimmed.includes('<embed')
  );
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    const extra = (error as Error & { error?: { message?: string } }).error?.message;
    return extra ? `${error.message}: ${extra}` : error.message;
  }
  if (typeof error === 'object' && error) {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

function shouldSkipUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return 'empty';
  if (trimmed.startsWith('data:image/')) return null;
  if (trimmed.startsWith('/') || !/^https?:\/\//i.test(trimmed)) return 'local-or-relative-path';
  if (trimmed.includes('res.cloudinary.com')) return 'already-cloudinary';
  if (isHtmlEmbed(trimmed)) return 'html-or-social-embed';
  if (trimmed.includes('ui-avatars.com')) return 'generated-avatar';
  if (trimmed.includes('photos.google.com') || trimmed.includes('photos.app.goo.gl')) return 'album-link-not-image';
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) return 'video-link';
  return null;
}

function withAutoFormat(secureUrl: string): string {
  return secureUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
}

function collectString(refs: ImageRef[], table: string, id: number | string, field: string, value: string | null | undefined) {
  if (!value) return;
  refs.push({ table, id, field, originalUrl: value.trim() });
}

function collectStringArray(refs: ImageRef[], table: string, id: number | string, field: string, values: string[] | null | undefined) {
  if (!values) return;
  values.forEach((value, index) => {
    if (!value) return;
    refs.push({ table, id, field, index, originalUrl: value.trim() });
  });
}

async function collectRefs(prisma: PrismaClient): Promise<ImageRef[]> {
  const refs: ImageRef[] = [];

  const [events, speakers, members, tutors, articles, projects, partners, carousel] = await Promise.all([
    prisma.event.findMany({ select: { id: true, coverImage: true, gallery: true } }),
    prisma.eventSpeaker.findMany({ select: { id: true, photo: true } }),
    prisma.member.findMany({ select: { id: true, photo: true } }),
    prisma.tutor.findMany({ select: { id: true, photo: true } }),
    prisma.article.findMany({ select: { id: true, images: true } }),
    prisma.project.findMany({ select: { id: true, images: true } }),
    prisma.partner.findMany({ select: { id: true, imageUrl: true } }),
    prisma.systemConfig.findUnique({ where: { key: 'about_carousel_images' } }),
  ]);

  for (const event of events) {
    collectString(refs, 'Event', event.id, 'coverImage', event.coverImage);
    collectStringArray(refs, 'Event', event.id, 'gallery', event.gallery);
  }
  for (const speaker of speakers) {
    collectString(refs, 'EventSpeaker', speaker.id, 'photo', speaker.photo);
  }
  for (const member of members) {
    collectString(refs, 'Member', member.id, 'photo', member.photo);
  }
  for (const tutor of tutors) {
    collectString(refs, 'Tutor', tutor.id, 'photo', tutor.photo);
  }
  for (const article of articles) {
    collectStringArray(refs, 'Article', article.id, 'images', article.images);
  }
  for (const project of projects) {
    collectStringArray(refs, 'Project', project.id, 'images', project.images);
  }
  for (const partner of partners) {
    collectString(refs, 'Partner', partner.id, 'imageUrl', partner.imageUrl);
  }

  if (carousel?.value) {
    try {
      const parsed = JSON.parse(carousel.value);
      if (Array.isArray(parsed)) {
        collectStringArray(refs, 'SystemConfig', 'about_carousel_images', 'value', parsed);
      }
    } catch {
      console.warn('Could not parse about_carousel_images JSON; skipping that config row.');
    }
  }

  return refs;
}

function folderFor(table: string): string {
  const folders: Record<string, string> = {
    Event: 'liao/events',
    EventSpeaker: 'liao/speakers',
    Member: 'liao/members',
    Tutor: 'liao/tutors',
    Article: 'liao/articles',
    Project: 'liao/projects',
    Partner: 'liao/partners',
    SystemConfig: 'liao/carousel',
  };
  return folders[table] || 'liao/other';
}

async function uploadUrl(originalUrl: string, folder: string): Promise<{ cloudinaryUrl: string; publicId: string }> {
  const source = originalUrl.trim();
  if (source.startsWith('data:')) {
    return uploadToCloudinary(source, folder);
  }

  try {
    return await uploadToCloudinary(source, folder);
  } catch (firstError) {
    const localPath = await fetchAndMaybeCompress(source);
    try {
      return await uploadToCloudinary(localPath, folder);
    } finally {
      fs.rmSync(path.dirname(localPath), { recursive: true, force: true });
    }
  }
}

async function fetchAndMaybeCompress(url: string): Promise<string> {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`fetch-failed ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 32) {
    throw new Error('fetched-empty-body');
  }

  const workDir = path.join(tmpdir(), `liao-cld-${randomUUID()}`);
  fs.mkdirSync(workDir, { recursive: true });
  const inputPath = path.join(workDir, 'source');
  const outputPath = path.join(workDir, 'upload.jpg');
  fs.writeFileSync(inputPath, buffer);

  if (buffer.length <= MAX_UPLOAD_BYTES) {
    return inputPath;
  }

  await execFileAsync('magick', [inputPath, '-resize', '2000x2000>', '-quality', '82', outputPath]);
  if (fs.statSync(outputPath).size > MAX_UPLOAD_BYTES) {
    await execFileAsync('magick', [inputPath, '-resize', '1600x1600>', '-quality', '70', outputPath]);
  }
  return outputPath;
}

async function uploadToCloudinary(file: string, folder: string): Promise<{ cloudinaryUrl: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    unique_filename: true,
    overwrite: false,
  });
  return {
    cloudinaryUrl: withAutoFormat(result.secure_url),
    publicId: result.public_id,
  };
}

async function applyUpdates(prisma: PrismaClient, entries: MigrationEntry[]) {
  const grouped = new Map<string, MigrationEntry[]>();
  for (const entry of entries) {
    if (!entry.cloudinaryUrl || entry.skipped) continue;
    const key = `${entry.table}:${entry.id}:${entry.field}`;
    const list = grouped.get(key) || [];
    list.push(entry);
    grouped.set(key, list);
  }

  for (const [key, group] of grouped) {
    const [table, id, field] = key.split(':');
    const numericId = Number(id);

    if (field === 'gallery' || field === 'images' || (table === 'SystemConfig' && field === 'value')) {
      if (table === 'Event') {
        const row = await prisma.event.findUnique({ where: { id: numericId } });
        if (!row) continue;
        const next = [...row.gallery];
        for (const entry of group) {
          if (entry.index === undefined) continue;
          next[entry.index] = entry.cloudinaryUrl;
        }
        await prisma.event.update({ where: { id: numericId }, data: { gallery: next } });
      } else if (table === 'Article') {
        const row = await prisma.article.findUnique({ where: { id: numericId } });
        if (!row) continue;
        const next = [...row.images];
        for (const entry of group) {
          if (entry.index === undefined) continue;
          next[entry.index] = entry.cloudinaryUrl;
        }
        await prisma.article.update({ where: { id: numericId }, data: { images: next } });
      } else if (table === 'Project') {
        const row = await prisma.project.findUnique({ where: { id: numericId } });
        if (!row) continue;
        const next = [...row.images];
        for (const entry of group) {
          if (entry.index === undefined) continue;
          next[entry.index] = entry.cloudinaryUrl;
        }
        await prisma.project.update({ where: { id: numericId }, data: { images: next } });
      } else if (table === 'SystemConfig') {
        const row = await prisma.systemConfig.findUnique({ where: { key: String(id) } });
        if (!row) continue;
        const parsed = JSON.parse(row.value) as string[];
        for (const entry of group) {
          if (entry.index === undefined) continue;
          parsed[entry.index] = entry.cloudinaryUrl;
        }
        await prisma.systemConfig.update({
          where: { key: String(id) },
          data: { value: JSON.stringify(parsed) },
        });
      }
      continue;
    }

    const data = { [field]: group[0].cloudinaryUrl };
    if (table === 'Event') {
      await prisma.event.update({ where: { id: numericId }, data });
    } else if (table === 'EventSpeaker') {
      await prisma.eventSpeaker.update({ where: { id: numericId }, data });
    } else if (table === 'Member') {
      await prisma.member.update({ where: { id: numericId }, data });
    } else if (table === 'Tutor') {
      await prisma.tutor.update({ where: { id: numericId }, data });
    } else if (table === 'Partner') {
      await prisma.partner.update({ where: { id: numericId }, data });
    }
  }
}

function writeJson(name: string, data: unknown): string {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const filePath = path.join(BACKUP_DIR, name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

function writeBackup(backup: MigrationBackup): string {
  const stamp = backup.createdAt.replace(/[:.]/g, '-');
  return writeJson(`${stamp}-${backup.mode}.json`, backup);
}

async function snapshotImageRows(prisma: PrismaClient) {
  const [events, speakers, members, tutors, articles, projects, partners, configs] = await Promise.all([
    prisma.event.findMany({ select: { id: true, slug: true, coverImage: true, gallery: true } }),
    prisma.eventSpeaker.findMany({ select: { id: true, eventId: true, photo: true } }),
    prisma.member.findMany({ select: { id: true, email: true, photo: true } }),
    prisma.tutor.findMany({ select: { id: true, email: true, photo: true } }),
    prisma.article.findMany({ select: { id: true, title: true, images: true } }),
    prisma.project.findMany({ select: { id: true, title: true, images: true } }),
    prisma.partner.findMany({ select: { id: true, name: true, imageUrl: true } }),
    prisma.systemConfig.findMany(),
  ]);
  return { events, speakers, members, tutors, articles, projects, partners, configs };
}

async function main() {
  const options = parseArgs();

  if (!process.env.CLOUDINARY_URL) {
    console.error('Missing CLOUDINARY_URL in backend/.env');
    process.exit(1);
  }
  if (!options.databaseUrl) {
    console.error('Missing database URL. Set PROD_DATABASE_URL in backend/.env or pass --database-url.');
    process.exit(1);
  }
  if (isLocalHost(options.databaseUrl) && !options.allowLocal) {
    console.error('Refusing to run against a local database (seed/test data).');
    console.error('Add PROD_DATABASE_URL and --confirm-prod, or pass --allow-local only if you really mean to rewrite local rows.');
    process.exit(1);
  }
  if (!isLocalHost(options.databaseUrl) && !options.confirmProd) {
    console.error('This will read/write a remote database. Re-run with --confirm-prod if you are sure.');
    process.exit(1);
  }

  const mode = options.apply ? 'apply' : 'dry-run';
  const host = hostFromUrl(options.databaseUrl);
  console.log(`Cloudinary image migration (${mode})`);
  console.log(`Database host: ${host}`);
  if (options.only) {
    console.log(`Scoped to --only ${options.only}`);
  }
  if (mode === 'dry-run') {
    console.log('Dry run: uploads and DB writes are skipped. Pass --apply to perform the migration.');
  }

  const connectionString = prismaFriendlyUrl(options.databaseUrl);
  const pool = new Pool({
    connectionString,
    ssl: isLocalHost(options.databaseUrl) ? undefined : { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const snapshot = await snapshotImageRows(prisma);
    const snapshotPath = writeJson(`${new Date().toISOString().replace(/[:.]/g, '-')}-pre-migration-snapshot.json`, {
      createdAt: new Date().toISOString(),
      databaseHost: host,
      mode,
      snapshot,
    });
    console.log(`Row snapshot written to: ${snapshotPath}`);

    const refs = await collectRefs(prisma);
    const uploadCache = new Map<string, { cloudinaryUrl: string; publicId: string }>();
    const entries: MigrationEntry[] = [];

    for (const ref of refs) {
      const skipReason = shouldSkipUrl(ref.originalUrl);
      if (skipReason) {
        entries.push({ ...ref, cloudinaryUrl: '', publicId: '', skipped: true, skipReason });
        continue;
      }
      if (!matchesOnlyFilter(ref, options.only)) {
        entries.push({ ...ref, cloudinaryUrl: '', publicId: '', skipped: true, skipReason: 'outside-only-filter' });
        continue;
      }

      if (mode === 'dry-run') {
        entries.push({ ...ref, cloudinaryUrl: '(dry-run)', publicId: '', skipped: false });
        continue;
      }

      const cached = uploadCache.get(ref.originalUrl);
      if (cached) {
        entries.push({ ...ref, ...cached });
        continue;
      }

      try {
        const uploaded = await uploadUrl(ref.originalUrl, folderFor(ref.table));
        uploadCache.set(ref.originalUrl, uploaded);
        entries.push({ ...ref, ...uploaded });
        console.log(`Uploaded ${ref.table}.${ref.field}#${ref.id} -> ${uploaded.publicId}`);
      } catch (error) {
        const message = formatError(error);
        console.warn(`Failed ${ref.table}.${ref.field}#${ref.id}: ${message}`);
        entries.push({
          ...ref,
          cloudinaryUrl: '',
          publicId: '',
          skipped: true,
          skipReason: `upload-failed: ${message}`,
        });
      }
    }

    if (mode === 'apply') {
      await applyUpdates(prisma, entries);
    }

    const backupPath = writeBackup({
      createdAt: new Date().toISOString(),
      mode,
      databaseHost: host,
      entries,
    });

    const migrated = entries.filter((entry) => !entry.skipped && entry.cloudinaryUrl && entry.cloudinaryUrl !== '(dry-run)');
    const wouldMigrate = entries.filter((entry) => !entry.skipped);
    const skipped = entries.filter((entry) => entry.skipped);

    console.log(`\nCandidates: ${wouldMigrate.length}`);
    console.log(`Skipped: ${skipped.length}`);
    if (mode === 'apply') {
      console.log(`Updated in database: ${migrated.length}`);
    }
    console.log(`Backup written to: ${backupPath}`);
    console.log('seed.ts, public/ assets, and event fallbacks were not touched.');
    if (mode === 'dry-run') {
      console.log('\nRe-run with --apply --confirm-prod to upload and rewrite production URLs.');
    } else {
      console.log('\nRevert with: npx tsx scripts/revert-cloudinary-image-migration.ts --confirm-prod --map ' + backupPath);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
