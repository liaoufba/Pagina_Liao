import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { applyActiveDatabaseUrl, getDbEnv, hostFromUrl, usesSupabasePooler } from './db-url';

dotenv.config();

const databaseUrl = applyActiveDatabaseUrl();
console.log(`🗄️  Using ${getDbEnv()} database at ${hostFromUrl(databaseUrl)}`);

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: usesSupabasePooler(databaseUrl) ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
