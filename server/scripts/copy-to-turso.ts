// Copies everything from the local helpdesk.db into the Turso database set in .env.
// Run it once after creating the Turso database: npm run copy-to-turso
import { join } from 'node:path';
import { createClient, type InStatement } from '@libsql/client';
import { databaseReady, db } from '../src/db/database.ts';

// Parents before children, so users exist before the rows that point to them.
const TABLES = ['users', 'tickets', 'ticket_counter', 'vanity_page_sections', 'vanity_page_logos'];
const ROWS_PER_BATCH = 500;

if (!process.env.TURSO_DATABASE_URL) {
  console.error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env first');
  process.exit(1);
}

const local = createClient({ url: `file:${join(import.meta.dirname, '..', 'helpdesk.db')}` });

// Creates the tables in Turso if they don't exist yet.
await databaseReady;

for (const table of TABLES) {
  const { columns, rows } = await local.execute(`SELECT * FROM ${table}`);
  const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;

  for (let start = 0; start < rows.length; start += ROWS_PER_BATCH) {
    const statements: InStatement[] = rows
      .slice(start, start + ROWS_PER_BATCH)
      .map((row) => ({ sql, args: columns.map((_, i) => row[i]) }));
    await db.batch(statements, 'write');
  }

  console.log(`${table}: ${rows.length} rows copied`);
}

local.close();
db.close();
