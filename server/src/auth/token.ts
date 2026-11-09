import jwt, { type JwtPayload } from 'jsonwebtoken';

const TOKEN_LIFETIME = '1h';

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export function createToken(userId: number, username: string): string {
  return jwt.sign({ sub: String(userId), username }, jwtSecret(), { expiresIn: TOKEN_LIFETIME });
}

// Throws if the token is missing, expired, or not signed with our secret.
export function verifyToken(token: string): { userId: number; username: string } {
  const payload = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] }) as JwtPayload;
  return { userId: Number(payload.sub), username: payload.username };
}
