import { join } from 'node:path';
import { createClient, type InArgs, type ResultSet } from '@libsql/client';

// On Vercel this is Turso, set by TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.
// Without them, it's the helpdesk.db file in the server folder, so local development works as before.
function databaseUrl(): string {
  return process.env.TURSO_DATABASE_URL || `file:${join(import.meta.dirname, '..', '..', 'helpdesk.db')}`;
}

export const db = createClient({
  url: databaseUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function queryAll<T>(sql: string, args: InArgs = []): Promise<T[]> {
  const result = await db.execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function queryOne<T>(sql: string, args: InArgs = []): Promise<T | undefined> {
  const rows = await queryAll<T>(sql, args);
  return rows[0];
}

export async function run(sql: string, args: InArgs = []): Promise<ResultSet> {
  return db.execute({ sql, args });
}

// Adds a column to a table created before the column existed.
async function addMissingColumns(table: string, columns: string[], type: string): Promise<void> {
  const existing = (await queryAll<{ name: string }>(`PRAGMA table_info(${table})`)).map((column) => column.name);
  for (const column of columns) {
    if (!existing.includes(column)) {
      await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    }
  }
}

async function createTables(): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      assignee TEXT NOT NULL,
      updated TEXT NOT NULL
    );

    -- Stores the last ticket number used, so a deleted ticket's ID is never given out again.
    CREATE TABLE IF NOT EXISTS ticket_counter (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_number INTEGER NOT NULL
    );

    INSERT OR IGNORE INTO ticket_counter (id, last_number)
    SELECT 1, COALESCE(MAX(CAST(SUBSTR(id, 4) AS INTEGER)), 0) FROM tickets;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    -- Each user has their own vanity page: one row per user and section, with the settings stored as JSON.
    CREATE TABLE IF NOT EXISTS vanity_page_sections (
      user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      section TEXT NOT NULL,
      settings TEXT NOT NULL,
      PRIMARY KEY (user_id, section)
    );

    -- No two users can save the same page URL. An empty slug means no URL has been chosen, so it isn't checked.
    CREATE UNIQUE INDEX IF NOT EXISTS vanity_page_url_slug
    ON vanity_page_sections (json_extract(settings, '$.slug'))
    WHERE section = 'url-configuration' AND json_extract(settings, '$.slug') <> '';

    -- Each user's uploaded vanity page logo, stored as the file's bytes.
    CREATE TABLE IF NOT EXISTS vanity_page_logos (
      user_id INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
      content_type TEXT NOT NULL,
      data BLOB NOT NULL
    );
  `);

  await addMissingColumns('tickets', ['requester_email', 'description'], "TEXT NOT NULL DEFAULT ''");

  // email: Google sign-in finds users by it. name: the person's name shown in the app, e.g. "Rufiyan Hasan".
  await addMissingColumns('users', ['email', 'name'], 'TEXT');

  // Two users can't share an email. Users without one (NULL) are fine.
  await run('CREATE UNIQUE INDEX IF NOT EXISTS users_email ON users (email)');
}

// Starts once per server start. app.ts makes every request wait for it, and the scripts await it.
export const databaseReady = createTables();
