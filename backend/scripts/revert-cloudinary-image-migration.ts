import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { argValue, isLocalHost, prismaFriendlyUrl, resolveDatabaseUrl } from './db-url';

type MigrationEntry = {
  table: string;
  id: number | string;
  field: string;
  index?: number;
  originalUrl: string;
  cloudinaryUrl: string;
  skipped?: boolean;
};

type MigrationBackup = {
  mode: 'dry-run' | 'apply';
  entries: MigrationEntry[];
};

const BACKUP_DIR = path.join(__dirname, 'cloudinary-backups');

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    confirmProd: args.includes('--confirm-prod'),
    allowLocal: args.includes('--allow-local'),
    mapPath: argValue(args, '--map'),
    databaseUrl: resolveDatabaseUrl(argValue(args, '--database-url')),
  };
}

function latestApplyBackup(): string {
  if (!fs.existsSync(BACKUP_DIR)) {
    throw new Error(`No backups found in ${BACKUP_DIR}`);
  }
  const files = fs.readdirSync(BACKUP_DIR)
    .filter((name) => name.endsWith('-apply.json'))
    .sort();
  if (files.length === 0) {
    throw new Error('No apply backup JSON found. Pass --map <file>.');
  }
  return path.join(BACKUP_DIR, files[files.length - 1]);
}

async function revertEntry(prisma: PrismaClient, entry: MigrationEntry) {
  if (entry.skipped || !entry.cloudinaryUrl || !entry.originalUrl) return;

  const numericId = Number(entry.id);

  if (entry.field === 'gallery' && entry.table === 'Event' && entry.index !== undefined) {
    const row = await prisma.event.findUnique({ where: { id: numericId } });
    if (!row) return;
    const next = [...row.gallery];
    if (next[entry.index] === entry.cloudinaryUrl) {
      next[entry.index] = entry.originalUrl;
      await prisma.event.update({ where: { id: numericId }, data: { gallery: next } });
    }
    return;
  }

  if (entry.field === 'images' && entry.index !== undefined) {
    if (entry.table === 'Article') {
      const row = await prisma.article.findUnique({ where: { id: numericId } });
      if (!row) return;
      const next = [...row.images];
      if (next[entry.index] === entry.cloudinaryUrl) {
        next[entry.index] = entry.originalUrl;
        await prisma.article.update({ where: { id: numericId }, data: { images: next } });
      }
    } else if (entry.table === 'Project') {
      const row = await prisma.project.findUnique({ where: { id: numericId } });
      if (!row) return;
      const next = [...row.images];
      if (next[entry.index] === entry.cloudinaryUrl) {
        next[entry.index] = entry.originalUrl;
        await prisma.project.update({ where: { id: numericId }, data: { images: next } });
      }
    }
    return;
  }

  if (entry.table === 'SystemConfig' && entry.index !== undefined) {
    const row = await prisma.systemConfig.findUnique({ where: { key: String(entry.id) } });
    if (!row) return;
    const parsed = JSON.parse(row.value) as string[];
    if (parsed[entry.index] === entry.cloudinaryUrl) {
      parsed[entry.index] = entry.originalUrl;
      await prisma.systemConfig.update({
        where: { key: String(entry.id) },
        data: { value: JSON.stringify(parsed) },
      });
    }
    return;
  }

  const data = { [entry.field]: entry.originalUrl };
  if (entry.table === 'Event') {
    const row = await prisma.event.findUnique({ where: { id: numericId } });
    if (row && (row as any)[entry.field] === entry.cloudinaryUrl) {
      await prisma.event.update({ where: { id: numericId }, data });
    }
  } else if (entry.table === 'EventSpeaker') {
    const row = await prisma.eventSpeaker.findUnique({ where: { id: numericId } });
    if (row && row.photo === entry.cloudinaryUrl) {
      await prisma.eventSpeaker.update({ where: { id: numericId }, data });
    }
  } else if (entry.table === 'Member') {
    const row = await prisma.member.findUnique({ where: { id: numericId } });
    if (row && row.photo === entry.cloudinaryUrl) {
      await prisma.member.update({ where: { id: numericId }, data });
    }
  } else if (entry.table === 'Tutor') {
    const row = await prisma.tutor.findUnique({ where: { id: numericId } });
    if (row && row.photo === entry.cloudinaryUrl) {
      await prisma.tutor.update({ where: { id: numericId }, data });
    }
  } else if (entry.table === 'Partner') {
    const row = await prisma.partner.findUnique({ where: { id: numericId } });
    if (row && row.imageUrl === entry.cloudinaryUrl) {
      await prisma.partner.update({ where: { id: numericId }, data });
    }
  }
}

async function main() {
  const options = parseArgs();
  if (!options.databaseUrl) {
    console.error('Missing database URL. Set PROD_DATABASE_URL or pass --database-url.');
    process.exit(1);
  }
  if (isLocalHost(options.databaseUrl) && !options.allowLocal) {
    console.error('Refusing to revert a local database without --allow-local.');
    process.exit(1);
  }
  if (!isLocalHost(options.databaseUrl) && !options.confirmProd) {
    console.error('Re-run with --confirm-prod to restore original URLs on the remote database.');
    process.exit(1);
  }

  const mapPath = options.mapPath || latestApplyBackup();
  const backup = JSON.parse(fs.readFileSync(mapPath, 'utf8')) as MigrationBackup;
  if (backup.mode !== 'apply') {
    console.error('That backup is a dry-run map. Use an *-apply.json file.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: prismaFriendlyUrl(options.databaseUrl),
    ssl: isLocalHost(options.databaseUrl) ? undefined : { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    let restored = 0;
    for (const entry of backup.entries) {
      if (entry.skipped) continue;
      await revertEntry(prisma, entry);
      restored += 1;
    }
    console.log(`Restored ${restored} URLs from ${mapPath}`);
    console.log('Cloudinary copies were not deleted; only database strings were reverted.');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
