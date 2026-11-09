import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { verifyPassword } from '../auth/password.ts';
import { createToken } from '../auth/token.ts';
import { db } from '../db/database.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { text } from '../utils/text.ts';

interface User {
    id: number;
    username: string;
    name: string | null;
}

export const authRouter = Router();

const googleClient = new OAuth2Client();

// The same answer for password and Google login. The browser keeps the token and sends it back on every API call.
function loginResponse(user: User) {
    return { token: createToken(user.id, user.username), username: user.username, name: user.name };
}

authRouter.post('/login', (req,res)=>{
    const username = text(req.body?.username);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const user = db.prepare('SELECT id, username, name, password_hash FROM users WHERE username = ?').get(username) as
        (User & { password_hash: string }) | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
    }

    res.json(loginResponse(user));
})

// The login page needs the Client ID to show Google's button. It isn't secret, but keeping it only in
// server/.env means there is one copy to change, and none in the frontend code.
authRouter.get('/login/google/config', (req,res)=>{
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        res.status(404).json({ error: 'Google sign-in is not set up' });
        return;
    }

    res.json({ clientId });
})

// The browser sends the ID token Google gave it. Google's library checks it was signed by Google,
// hasn't expired, and was made for our Client ID, so it can't be faked or taken from another app.
authRouter.post('/login/google', async (req,res)=>{
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const credential = typeof req.body?.credential === 'string' ? req.body.credential : '';

    if (!clientId) {
        res.status(500).json({ error: 'Google sign-in is not set up' });
        return;
    }

    let email: string | undefined;
    let googleName: string | undefined;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
        const payload = ticket.getPayload();
        // Only trust an email address Google has confirmed belongs to the account.
        email = payload?.email_verified ? payload.email?.toLowerCase() : undefined;
        googleName = payload?.name?.trim() || undefined;
    } catch {
        email = undefined;
    }

    // Only existing users can sign in. A Google account with an unknown email can't create one.
    const user = email
        ? (db.prepare('SELECT id, username, name FROM users WHERE email = ?').get(email) as User | undefined)
        : undefined;

    if (!user) {
        res.status(401).json({ error: 'No HelpDesk Pro account uses this Google account' });
        return;
    }

    // Fills in a missing name from the Google account. A name that is already set is never replaced.
    if (!user.name && googleName) {
        db.prepare('UPDATE users SET name = ? WHERE id = ?').run(googleName, user.id);
        user.name = googleName;
    }

    res.json(loginResponse(user));
})

// The name isn't in the token, so it's read from the database, which also picks up any change to it.
authRouter.get('/me', requireAuth, (req,res)=>{
    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(res.locals.userId) as
        { name: string | null } | undefined;

    res.json({ username: res.locals.username, name: user?.name ?? null });
})
