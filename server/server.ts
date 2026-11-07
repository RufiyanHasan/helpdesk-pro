import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { db } from './db.ts';
import { clearAuthCookie, requireAuth, setAuthCookie, verifyPassword } from './auth.ts';


const app = express();
const PORT = 3000;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

// Only these columns can be sorted on. The client never sends SQL directly.
const SORT_COLUMNS: Record<string, string> = {
    id: 'id',
    subject: 'subject',
    topic: 'topic',
    status: 'status',
    assignee: 'assignee',
    priority: `CASE priority WHEN 'Low' THEN 1 WHEN 'Medium' THEN 2 WHEN 'High' THEN 3 ELSE 4 END`,
    updated: `CASE
        WHEN updated = 'Yesterday' THEN 1440
        WHEN updated LIKE '% h ago' THEN CAST(updated AS INTEGER) * 60
        ELSE CAST(updated AS INTEGER)
    END`,
};

const FILTER_COLUMNS = ['status', 'priority', 'assignee', 'topic'];
const TOPICS = ['Account access', 'Billing', 'Branding', 'Content', 'Integrations', 'Performance', 'Reports'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function nextTicketId(): string {
    const { last_number } = db.prepare(
        'UPDATE ticket_counter SET last_number = last_number + 1 RETURNING last_number'
    ).get() as { last_number: number };
    return `HD-${String(last_number).padStart(5, '0')}`;
}

function positiveNumber(value: unknown, fallback: number): number {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
}

function orderBy(sortBy: unknown, sortDir: unknown): string {
    const hasColumn = typeof sortBy === 'string' && Object.hasOwn(SORT_COLUMNS, sortBy);
    if (!hasColumn || (sortDir !== 'asc' && sortDir !== 'desc')) {
        return 'id DESC';
    }
    return `${SORT_COLUMNS[sortBy]} ${sortDir.toUpperCase()}, id DESC`;
}

app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:4201'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/tickets', requireAuth);

app.post('/api/tickets', (req,res)=>{
    const requesterEmail = text(req.body?.requesterEmail);
    const topic = text(req.body?.topic);
    const subject = text(req.body?.subject);
    const description = text(req.body?.description);
    const priority = text(req.body?.priority);

    if (!EMAIL_PATTERN.test(requesterEmail) || !subject || !TOPICS.includes(topic) || !PRIORITIES.includes(priority)) {
        res.status(400).json({ error: 'Invalid ticket' });
        return;
    }

    const id = nextTicketId();

    db.prepare(`
        INSERT INTO tickets (id, subject, topic, status, priority, assignee, updated, requester_email, description)
        VALUES (:id, :subject, :topic, 'Open', :priority, 'Unassigned', 'Just now', :requesterEmail, :description)
    `).run({ id, subject, topic, priority, requesterEmail, description });

    res.status(201).json(db.prepare('SELECT * FROM tickets WHERE id = :id').get({ id }));
})

app.delete('/api/tickets', (req,res)=>{
    const ids: unknown = req.body?.ids;

    if (
        !Array.isArray(ids) ||
        ids.length === 0 ||
        ids.length > MAX_PAGE_SIZE ||
        !ids.every((id) => typeof id === 'string')
    ) {
        res.status(400).json({ error: 'Invalid ticket ids' });
        return;
    }

    const placeholders = ids.map(() => '?').join(', ');
    const { changes } = db.prepare(`DELETE FROM tickets WHERE id IN (${placeholders})`).run(...ids);

    res.json({ deleted: Number(changes) });
})

app.get('/api/tickets', (req,res)=>{
    const page = positiveNumber(req.query.page, 1);
    const pageSize = Math.min(positiveNumber(req.query.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const term = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const search = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
    const conditions = [`(subject LIKE :search ESCAPE '\\' OR id LIKE :search ESCAPE '\\')`];
    const params: Record<string, string> = { search };

    for (const column of FILTER_COLUMNS) {
        const value = req.query[column];
        if (typeof value === 'string' && value) {
            conditions.push(`${column} = :${column}`);
            params[column] = value;
        }
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { total } = db.prepare(`SELECT COUNT(*) AS total FROM tickets ${where}`).get(params) as { total: number };
    const tickets = db.prepare(`
        SELECT * FROM tickets ${where}
        ORDER BY ${orderBy(req.query.sortBy, req.query.sortDir)}
        LIMIT :limit OFFSET :offset
    `).all({ ...params, limit: pageSize, offset: (page - 1) * pageSize });

    res.json({ tickets, total });
})

app.get('/api/tickets/:id', (req,res)=>{
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

    if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
    }

    res.json(ticket);
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})

app.post('/api/login', (req,res)=>{
    const username = text(req.body?.username);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username) as
        { id: number; username: string; password_hash: string } | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
    }

    setAuthCookie(res, user.id, user.username);
    res.json({ username: user.username });
})

app.post('/api/logout', (req,res)=>{
    clearAuthCookie(res);
    res.status(204).end();
})

app.get('/api/me', requireAuth, (req,res)=>{
    res.json({ username: res.locals.username });
})