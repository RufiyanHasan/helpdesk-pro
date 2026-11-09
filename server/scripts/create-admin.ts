import type { InStatement } from '@libsql/client';
import { hashPassword } from '../src/auth/password.ts';
import { databaseReady, db, queryOne } from '../src/db/database.ts';

const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;
// Stored in lowercase, because Google sends emails in lowercase.
const EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
// The person's name shown in the app, e.g. "Rufiyan Hasan".
const NAME = process.env.ADMIN_NAME?.trim() || null;

if (!USERNAME) {
  console.error('Set ADMIN_USERNAME in .env first');
  process.exit(1);
}

await databaseReady;

const existingUser = await queryOne('SELECT id FROM users WHERE username = ?', [USERNAME]);

if (!existingUser && !PASSWORD) {
  console.error('A new user needs ADMIN_PASSWORD in .env');
  process.exit(1);
}

const statements: InStatement[] = [];

// A blank password keeps the existing one, so you can set just the email or name.
if (PASSWORD) {
  statements.push({
    sql: `
      INSERT INTO users (username, password_hash) VALUES (?, ?)
      ON CONFLICT (username) DO UPDATE SET password_hash = excluded.password_hash
    `,
    args: [USERNAME, hashPassword(PASSWORD)],
  });
}

if (EMAIL) {
  statements.push({ sql: 'UPDATE users SET email = ? WHERE username = ?', args: [EMAIL, USERNAME] });
}

if (NAME) {
  statements.push({ sql: 'UPDATE users SET name = ? WHERE username = ?', args: [NAME, USERNAME] });
}

// A batch is saved all together or not at all, so a taken email doesn't leave a half-created user behind.
try {
  await db.batch(statements, 'write');
} catch (error) {
  if (error instanceof Error && error.message.includes('users.email')) {
    console.error(`Another user already has the email ${EMAIL}`);
    process.exit(1);
  }
  throw error;
}

const details = [NAME && `name ${NAME}`, EMAIL && `email ${EMAIL}`].filter(Boolean).join(' and ');
console.log(`User "${USERNAME}" is ready${details ? ` with ${details}` : ''}`);
