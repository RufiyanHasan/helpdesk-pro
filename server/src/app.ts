import cors from 'cors';
import express from 'express';
import { ALLOWED_ORIGINS } from './config.ts';
import { requireAuth } from './middleware/require-auth.ts';
import { authRouter } from './routes/auth.routes.ts';
import { ticketsRouter } from './routes/tickets.routes.ts';
import { vanityPageRouter } from './routes/vanity-page.routes.ts';

export const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// /api/login is open. /api/me checks the token itself.
app.use('/api', authRouter);
app.use('/api/tickets', requireAuth, ticketsRouter);
app.use('/api/vanity-page', requireAuth, vanityPageRouter);
