import cors from 'cors';
import express from 'express';
import { ALLOWED_ORIGINS } from './config.ts';
import { databaseReady } from './db/database.ts';
import { requireAuth } from './middleware/require-auth.ts';
import { authRouter } from './routes/auth.routes.ts';
import { ticketsRouter } from './routes/tickets.routes.ts';
import { vanityPageRouter } from './routes/vanity-page.routes.ts';

export const app = express();

// Only needed when the frontends run on other ports. On Vercel everything is on one domain.
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// The tables are created once when the server starts. A request that arrives first waits for that.
app.use(async (req, res, next) => {
    await databaseReady;
    next();
});

// /api/login is open. /api/me checks the token itself.
app.use('/api', authRouter);
app.use('/api/tickets', requireAuth, ticketsRouter);
app.use('/api/vanity-page', requireAuth, vanityPageRouter);

// Vercel runs the app from this default export. Locally, server.ts starts it with app.listen().
export default app;
