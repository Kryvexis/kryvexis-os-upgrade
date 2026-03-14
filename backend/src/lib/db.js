import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { databaseConfigFromEnv } from './env.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '..', '..', 'db', 'migrations');

const config = databaseConfigFromEnv();

export const dbConfig = config;
export const pool = config.enableSql ? new Pool({ connectionString: config.connectionString, ssl: config.ssl }) : null;

export function listMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
}

export function readMigrationFile(name) {
  return fs.readFileSync(path.join(migrationsDir, name), 'utf8');
}

export async function ensureMigrationsTable(client) {
  await client.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

export async function applyMigrations(log = console) {
  if (!pool) return { enabled: false, applied: [] };
  const client = await pool.connect();
  try {
    await client.query('begin');
    await ensureMigrationsTable(client);
    const existing = await client.query('select id from schema_migrations');
    const appliedIds = new Set(existing.rows.map((row) => row.id));
    const applied = [];
    for (const file of listMigrationFiles()) {
      if (appliedIds.has(file)) continue;
      const sql = readMigrationFile(file);
      await client.query(sql);
      await client.query('insert into schema_migrations (id) values ($1)', [file]);
      applied.push(file);
    }
    await client.query('commit');
    if (applied.length) log.log?.(`Applied migrations: ${applied.join(', ')}`);
    return { enabled: true, applied };
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function query(text, params = []) {
  if (!pool) throw new Error('SQL automation is not enabled.');
  return pool.query(text, params);
}
