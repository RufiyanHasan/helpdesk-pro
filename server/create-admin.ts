import { hashPassword } from './auth.ts';
import { db } from './db.ts';

const USERNAME = 'admin';
const PASSWORD = 'welcome123';

db.prepare(`
  INSERT INTO users (username, password_hash) VALUES (?, ?)
  ON CONFLICT (username) DO UPDATE SET password_hash = excluded.password_hash
`).run(USERNAME, hashPassword(PASSWORD));

console.log(`User "${USERNAME}" is ready`);