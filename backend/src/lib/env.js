export function boolFromEnv(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).trim().toLowerCase() === 'true';
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function databaseConfigFromEnv() {
  const connectionString = process.env.DATABASE_URL || '';
  return {
    connectionString,
    enableSql: boolFromEnv(process.env.USE_SQL_AUTOMATION, false) && Boolean(connectionString),
    ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }
  };
}
