import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');

export const DATABASE_URL = process.env.DATABASE_URL || '';
export const SQL_ENABLED = process.env.USE_SQL_AUTOMATION === 'true' && Boolean(DATABASE_URL);

export const pool = SQL_ENABLED
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }
    })
  : null;

export function getMigrationFiles() {
  const dir = path.join(backendRoot, 'db', 'migrations');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => ({ name, fullPath: path.join(dir, name) }));
}

export async function runMigrations() {
  if (!pool) return [];
  await pool.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const applied = await pool.query('select id from schema_migrations');
  const seen = new Set(applied.rows.map((row) => row.id));
  const migrations = getMigrationFiles();
  const executed = [];

  for (const migration of migrations) {
    if (seen.has(migration.name)) continue;
    const sql = fs.readFileSync(migration.fullPath, 'utf8');
    await pool.query('begin');
    try {
      await pool.query(sql);
      await pool.query('insert into schema_migrations (id) values ($1)', [migration.name]);
      await pool.query('commit');
      executed.push(migration.name);
    } catch (error) {
      await pool.query('rollback');
      throw error;
    }
  }

  return executed;
}

export async function dbHealth() {
  if (!pool) return { enabled: false, ok: true };
  const result = await pool.query('select now() as now');
  return { enabled: true, ok: true, now: result.rows[0]?.now || null };
}
