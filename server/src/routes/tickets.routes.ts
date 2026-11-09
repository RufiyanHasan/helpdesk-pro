import { Router } from 'express';
import { queryAll, queryOne, run } from '../db/database.ts';
import { text } from '../utils/text.ts';

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

async function nextTicketId(): Promise<string> {
    const counter = await queryOne<{ last_number: number }>(
        'UPDATE ticket_counter SET last_number = last_number + 1 RETURNING last_number'
    );
    return `HD-${String(counter!.last_number).padStart(5, '0')}`;
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

export const ticketsRouter = Router();

ticketsRouter.post('/', async (req,res)=>{
    const requesterEmail = text(req.body?.requesterEmail);
    const topic = text(req.body?.topic);
    const subject = text(req.body?.subject);
    const description = text(req.body?.description);
    const priority = text(req.body?.priority);

    if (!EMAIL_PATTERN.test(requesterEmail) || !subject || !TOPICS.includes(topic) || !PRIORITIES.includes(priority)) {
        res.status(400).json({ error: 'Invalid ticket' });
        return;
    }

    const id = await nextTicketId();

    await run(`
        INSERT INTO tickets (id, subject, topic, status, priority, assignee, updated, requester_email, description)
        VALUES (:id, :subject, :topic, 'Open', :priority, 'Unassigned', 'Just now', :requesterEmail, :description)
    `, { id, subject, topic, priority, requesterEmail, description });

    res.status(201).json(await queryOne('SELECT * FROM tickets WHERE id = :id', { id }));
})

ticketsRouter.delete('/', async (req,res)=>{
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
    const { rowsAffected } = await run(`DELETE FROM tickets WHERE id IN (${placeholders})`, ids);

    res.json({ deleted: rowsAffected });
})

ticketsRouter.get('/', async (req,res)=>{
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

    const [count, tickets] = await Promise.all([
        queryOne<{ total: number }>(`SELECT COUNT(*) AS total FROM tickets ${where}`, params),
        queryAll(`
            SELECT * FROM tickets ${where}
            ORDER BY ${orderBy(req.query.sortBy, req.query.sortDir)}
            LIMIT :limit OFFSET :offset
        `, { ...params, limit: pageSize, offset: (page - 1) * pageSize }),
    ]);

    res.json({ tickets, total: count!.total });
})

ticketsRouter.get('/:id', async (req,res)=>{
    const ticket = await queryOne('SELECT * FROM tickets WHERE id = ?', [req.params.id]);

    if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
    }

    res.json(ticket);
})
