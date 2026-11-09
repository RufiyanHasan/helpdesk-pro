import { hashPassword } from '../src/auth/password.ts';
import { db } from '../src/db/database.ts';

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

const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(USERNAME);

if (!existingUser && !PASSWORD) {
  console.error('A new user needs ADMIN_PASSWORD in .env');
  process.exit(1);
}

// All changes are saved together, so a taken email doesn't leave a half-created user behind.
db.exec('BEGIN');

try {
  // A blank password keeps the existing one, so you can set just the email or name.
  if (PASSWORD) {
    db.prepare(`
      INSERT INTO users (username, password_hash) VALUES (?, ?)
      ON CONFLICT (username) DO UPDATE SET password_hash = excluded.password_hash
    `).run(USERNAME, hashPassword(PASSWORD));
  }

  if (EMAIL) {
    db.prepare('UPDATE users SET email = ? WHERE username = ?').run(EMAIL, USERNAME);
  }

  if (NAME) {
    db.prepare('UPDATE users SET name = ? WHERE username = ?').run(NAME, USERNAME);
  }

  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  if (error instanceof Error && error.message.includes('users.email')) {
    console.error(`Another user already has the email ${EMAIL}`);
    process.exit(1);
  }
  throw error;
}

const details = [NAME && `name ${NAME}`, EMAIL && `email ${EMAIL}`].filter(Boolean).join(' and ');
console.log(`User "${USERNAME}" is ready${details ? ` with ${details}` : ''}`);
