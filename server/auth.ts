import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const KEY_LENGTH = 64;
const TOKEN_LIFETIME = '1h';
const TOKEN_LIFETIME_MS = 60 * 60 * 1000;
const COOKIE_NAME = 'token';

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api',
};

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
    return `${salt}:${hash}`;
  }
  
  export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const expected = Buffer.from(hash, 'hex');
    return timingSafeEqual(scryptSync(password, salt, KEY_LENGTH), expected);
  }

  function jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }
    return secret;
  }
  
  export function setAuthCookie(res: Response, userId: number, username: string): void {
    const token = jwt.sign({ sub: String(userId), username }, jwtSecret(), { expiresIn: TOKEN_LIFETIME });
    res.cookie(COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: TOKEN_LIFETIME_MS });
  }

  export function clearAuthCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  }

  export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    try {
      const payload = jwt.verify(req.cookies[COOKIE_NAME], jwtSecret(), { algorithms: ['HS256'] }) as JwtPayload;
      res.locals.username = payload.username;
      next();
    } catch {
      res.status(401).json({ error: 'Not logged in' });
    }
  }