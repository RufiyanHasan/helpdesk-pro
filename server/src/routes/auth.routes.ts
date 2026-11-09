import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { verifyPassword } from '../auth/password.ts';
import { createToken } from '../auth/token.ts';
import { db } from '../db/database.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { text } from '../utils/text.ts';

export const authRouter = Router();

const googleClient = new OAuth2Client();

// Returns the token in the response. The browser keeps it and sends it back on every API call.
authRouter.post('/login', (req,res)=>{
    const username = text(req.body?.username);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username) as
        { id: number; username: string; password_hash: string } | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
    }

    res.json({ token: createToken(user.id, user.username), username: user.username });
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
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
        const payload = ticket.getPayload();
        // Only trust an email address Google has confirmed belongs to the account.
        email = payload?.email_verified ? payload.email?.toLowerCase() : undefined;
    } catch {
        email = undefined;
    }

    // Only existing users can sign in. A Google account with an unknown email can't create one.
    const user = email
        ? (db.prepare('SELECT id, username FROM users WHERE email = ?').get(email) as
            { id: number; username: string } | undefined)
        : undefined;

    if (!user) {
        res.status(401).json({ error: 'No HelpDesk Pro account uses this Google account' });
        return;
    }

    res.json({ token: createToken(user.id, user.username), username: user.username });
})

authRouter.get('/me', requireAuth, (req,res)=>{
    res.json({ username: res.locals.username });
})
