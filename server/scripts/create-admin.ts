import { hashPassword } from '../src/auth/password.ts';
import { db } from '../src/db/database.ts';

const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!USERNAME || !PASSWORD) {
  console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in .env first');
  process.exit(1);
}

db.prepare(`
  INSERT INTO users (username, password_hash) VALUES (?, ?)
  ON CONFLICT (username) DO UPDATE SET password_hash = excluded.password_hash
`).run(USERNAME, hashPassword(PASSWORD));

console.log(`User "${USERNAME}" is ready`);