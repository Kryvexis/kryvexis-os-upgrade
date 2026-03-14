import { applyMigrations, dbConfig } from '../src/lib/db.js';

async function main() {
  if (!dbConfig.enableSql) {
    throw new Error('USE_SQL_AUTOMATION=true and DATABASE_URL are required to run migrations.');
  }
  const result = await applyMigrations(console);
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

main().catch((error) => {
  console.error('Migration run failed:', error.message);
  process.exit(1);
});
