import * as fs from 'fs';
import * as path from 'path';

function main() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    // If .env doesn't exist yet, we let setup-db copy it first
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  // Parse DB_ENV
  const dbEnvMatch = envContent.match(/^DB_ENV=["']?(dev|prod)["']?/m);
  const dbEnv = dbEnvMatch ? dbEnvMatch[1] : 'dev';

  // Parse DEV_DATABASE_URL
  const devDbMatch = envContent.match(/^DEV_DATABASE_URL=["']?([^"\n\r]+)["']?/m);
  const devDb = devDbMatch ? devDbMatch[1] : '';

  // Parse PROD_DATABASE_URL
  const prodDbMatch = envContent.match(/^PROD_DATABASE_URL=["']?([^"\n\r]+)["']?/m);
  const prodDb = prodDbMatch ? prodDbMatch[1] : '';

  // Parse current DATABASE_URL
  const currentDbMatch = envContent.match(/^DATABASE_URL=["']?([^"\n\r]+)["']?/m);
  const currentDb = currentDbMatch ? currentDbMatch[1] : '';

  const targetDb = dbEnv === 'prod' ? prodDb : devDb;

  if (targetDb && targetDb !== currentDb) {
    console.log(`🔄 DB_ENV is set to "${dbEnv.toUpperCase()}". Synchronizing active DATABASE_URL...`);
    let updatedContent = envContent;
    if (currentDbMatch) {
      updatedContent = envContent.replace(
        /^DATABASE_URL=["']?([^"\n\r]+)["']?$/m,
        `DATABASE_URL="${targetDb}"`
      );
    } else {
      updatedContent += `\nDATABASE_URL="${targetDb}"\n`;
    }
    fs.writeFileSync(envPath, updatedContent, 'utf8');
    console.log(`✅ DATABASE_URL synchronized successfully to the ${dbEnv === 'prod' ? 'PRODUCTION' : 'DEVELOPMENT'} database.`);
  }
}

main();
