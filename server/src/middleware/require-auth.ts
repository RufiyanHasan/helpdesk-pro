import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../auth/token.ts';

// The browser sends the token as "Authorization: Bearer <token>".
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

  try {
    const { userId, username } = verifyToken(token);
    res.locals.userId = userId;
    res.locals.username = username;
    next();
  } catch {
    res.status(401).json({ error: 'Not logged in' });
  }
}
