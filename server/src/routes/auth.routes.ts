import { Router } from 'express';
import { verifyPassword } from '../auth/password.ts';
import { createToken } from '../auth/token.ts';
import { db } from '../db/database.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { text } from '../utils/text.ts';

export const authRouter = Router();

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

authRouter.get('/me', requireAuth, (req,res)=>{
    res.json({ username: res.locals.username });
})
