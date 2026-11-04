import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const db = new DatabaseSync(join(import.meta.dirname, 'helpdesk.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    assignee TEXT NOT NULL,
    updated TEXT NOT NULL
  )
`);

// Stores the last ticket number used, so a deleted ticket's ID is never given out again.
db.exec(`
  CREATE TABLE IF NOT EXISTS ticket_counter (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    last_number INTEGER NOT NULL
  );

  INSERT OR IGNORE INTO ticket_counter (id, last_number)
  SELECT 1, COALESCE(MAX(CAST(SUBSTR(id, 4) AS INTEGER)), 0) FROM tickets;
`);

// Adds the newer columns to a database created before they existed.
const existingColumns = db.prepare('PRAGMA table_info(tickets)').all().map((column) => column.name);

for (const column of ['requester_email', 'description']) {
  if (!existingColumns.includes(column)) {
    db.exec(`ALTER TABLE tickets ADD COLUMN ${column} TEXT NOT NULL DEFAULT ''`);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )
`);
