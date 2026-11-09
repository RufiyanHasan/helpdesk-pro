import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// The database file stays in the server folder, two levels up from here.
export const db = new DatabaseSync(join(import.meta.dirname, '..', '..', 'helpdesk.db'));

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

// Google sign-in finds users by email. Adds the column to a users table created before it existed.
const userColumns = db.prepare('PRAGMA table_info(users)').all().map((column) => column.name);

if (!userColumns.includes('email')) {
  db.exec('ALTER TABLE users ADD COLUMN email TEXT');
}

// Two users can't share an email. Users without one (NULL) are fine.
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS users_email ON users (email)');

// Each user has their own vanity page: one row per user and section, with the settings stored as JSON.
db.exec(`
  CREATE TABLE IF NOT EXISTS vanity_page_sections (
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    settings TEXT NOT NULL,
    PRIMARY KEY (user_id, section)
  )
`);

// No two users can save the same page URL. An empty slug means no URL has been chosen, so it isn't checked.
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS vanity_page_url_slug
  ON vanity_page_sections (json_extract(settings, '$.slug'))
  WHERE section = 'url-configuration' AND json_extract(settings, '$.slug') <> ''
`);

// Each user's uploaded vanity page logo, stored as the file's bytes.
db.exec(`
  CREATE TABLE IF NOT EXISTS vanity_page_logos (
    user_id INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    data BLOB NOT NULL
  )
`);
