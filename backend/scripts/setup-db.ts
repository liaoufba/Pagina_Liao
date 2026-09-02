import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Client } from 'pg';
import * as net from 'net';
import {
  applyActiveDatabaseUrl,
  DEV_DOCKER_URL,
  getDbEnv,
  isPlaceholderDatabaseUrl,
} from './db-url';

function checkPort(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(1000);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

async function tryConnect(dbUrl: string): Promise<{ success: boolean; error?: any }> {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    await client.end();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

function writeEnvValue(envPath: string, key: string, value: string) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  const pattern = new RegExp(`^${key}=.+$`, 'm');
  if (pattern.test(envContent)) {
    envContent = envContent.replace(pattern, `${key}="${value}"`);
  } else {
    envContent += `\n${key}="${value}"\n`;
  }
  fs.writeFileSync(envPath, envContent, 'utf8');
}

async function main() {
  const envPath = path.join(__dirname, '../.env');
  const envExamplePath = path.join(__dirname, '../.env.example');

  let envCreated = false;
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    envCreated = true;
  }

  require('dotenv').config({ path: envPath });

  const dbEnv = getDbEnv();
  let devDbUrl = process.env.DEV_DATABASE_URL || '';

  if (dbEnv === 'dev') {
    const needsLocalDetect =
      envCreated ||
      !devDbUrl ||
      isPlaceholderDatabaseUrl(devDbUrl) ||
      devDbUrl === DEV_DOCKER_URL;

    if (needsLocalDetect) {
      const isPortOpen = await checkPort(5432, 'localhost');
      if (isPortOpen) {
        const currentUser = process.env.USER || process.env.USERNAME || 'postgres';
        const localUrl = `postgresql://${currentUser}@localhost:5432/postgres`;
        console.log(`🔍 Port 5432 is open. Checking if we can connect as user "${currentUser}"...`);

        const connTest = await tryConnect(localUrl);
        if (connTest.success) {
          const newDbUrl = `postgresql://${currentUser}@localhost:5432/liao_db?schema=public`;
          console.log(`⚙️ Detected running local PostgreSQL. Updating DEV_DATABASE_URL in .env to:`);
          console.log(`   ${newDbUrl}`);
          writeEnvValue(envPath, 'DEV_DATABASE_URL', newDbUrl);
          process.env.DEV_DATABASE_URL = newDbUrl;
        }
      }
    }
  } else if (!process.argv.includes('--confirm-prod')) {
    console.error('❌ Refusing db:setup against production.');
    console.error('   Set DB_ENV=dev, or re-run with --confirm-prod if you really mean to migrate prod.');
    process.exit(1);
  }

  let dbUrl: string;
  try {
    dbUrl = applyActiveDatabaseUrl();
  } catch (error) {
    console.error('❌', (error as Error).message);
    process.exit(1);
  }

  const match = dbUrl.match(/postgres(?:ql)?:\/\/([^:]+)(?::([^@]+))?@([^:/]+)(?::(\d+))?\/([^?]+)/);
  if (!match) {
    console.error('❌ Invalid database URL for the current DB_ENV');
    process.exit(1);
  }
  const [, , , host, portStr, dbName] = match;
  const port = portStr ? parseInt(portStr) : 5432;

  console.log(`📡 Connecting to PostgreSQL at ${host}:${port} (DB_ENV=${dbEnv})...`);
  let isReady = false;

  const connCheck = await tryConnect(dbUrl);
  if (connCheck.success) {
    console.log('✅ Connected to database successfully.');
    isReady = true;
  } else {
    const pgErr = connCheck.error as any;
    if (pgErr && pgErr.code === '3D000') {
      console.log(`🚧 Database "${dbName}" does not exist. Attempting to create it...`);
      const adminUrl = dbUrl.replace(`/${dbName}`, '/postgres');
      const adminClient = new Client({ connectionString: adminUrl });
      try {
        await adminClient.connect();
        await adminClient.query(`CREATE DATABASE "${dbName}"`);
        await adminClient.end();
        console.log(`✅ Created database "${dbName}" successfully.`);
        isReady = true;
      } catch (createErr) {
        console.error(`❌ Failed to create database "${dbName}":`, (createErr as Error).message);
        adminClient.end().catch(() => {});
      }
    } else if (host === 'localhost' || host === '127.0.0.1') {
      const isPortOccupied = await checkPort(port, host);
      if (isPortOccupied) {
        console.error(`\n⚠️  [Port Conflict] Port ${port} is already in use, but connection failed with: "${pgErr.message}".`);
        console.error(`👉 If you have a local PostgreSQL running on port ${port}:`);
        console.error(`   1. Please edit DEV_DATABASE_URL in "backend/.env" to include your correct credentials.`);
        console.error(`   2. Or, stop your local PostgreSQL service and run this setup script again so Docker Compose can use the port.\n`);
        process.exit(1);
      }

      console.log('🐳 Database connection failed. Attempting to start PostgreSQL via Docker Compose...');
      try {
        execSync('docker compose up -d', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

        console.log('⏳ Waiting for PostgreSQL container to start up...');
        let retries = 30;
        while (!isReady && retries > 0) {
          const retryCheck = await tryConnect(dbUrl);
          if (retryCheck.success) {
            console.log('✅ PostgreSQL container is ready!');
            isReady = true;
          } else {
            const retryErr = retryCheck.error as any;
            if (retryErr && retryErr.code === '3D000') {
              const adminUrl = dbUrl.replace(`/${dbName}`, '/postgres');
              const adminClient = new Client({ connectionString: adminUrl });
              try {
                await adminClient.connect();
                await adminClient.query(`CREATE DATABASE "${dbName}"`);
                await adminClient.end();
                console.log(`✅ Created database "${dbName}" successfully.`);
                isReady = true;
              } catch {
                adminClient.end().catch(() => {});
              }
            } else {
              retries--;
              if (retries === 0) {
                console.error('❌ Timed out waiting for PostgreSQL container.');
                process.exit(1);
              }
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }
      } catch (dockerErr) {
        console.error('❌ Failed to launch Docker Compose or connect to database:', (dockerErr as Error).message);
        process.exit(1);
      }
    } else {
      console.error('❌ Failed to connect to database:', pgErr.message);
      process.exit(1);
    }
  }

  if (!isReady) {
    console.error('❌ Database is not ready. Setup aborted.');
    process.exit(1);
  }

  console.log('🔄 Running Prisma migrations...');
  try {
    execSync('npx prisma migrate dev', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('🚀 Database setup completed successfully!');
  } catch {
    console.error('❌ Failed to run Prisma migrations.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
