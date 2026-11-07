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
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const MAX_PAGE_TEXT_LENGTH = 100;
const BUTTON_CORNERS = ['rounded', 'square'];
const BRAND_MARKS = ['monogram', 'logo'];
const MAX_MONOGRAM_LETTERS = 2;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const MAX_LOGO_BYTES = 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// 3 to 40 lowercase letters, numbers or hyphens, not starting or ending with a hyphen.
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

// Checks the file's contents really match its type, instead of trusting the header the browser sent.
function isLogoFile(type: string, data: Buffer): boolean {
    if (type === 'image/png') {
        return data.subarray(0, 8).equals(PNG_SIGNATURE);
    }
    if (type === 'image/jpeg') {
        return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
    }
    if (type === 'image/svg+xml') {
        return /<svg[\s>]/i.test(data.toString('utf8'));
    }
    return false;
}

function text(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

// Checks one Page Text group from the browser, and keeps only the fields the page uses.
function textSetting(value: unknown) {
    if (typeof value !== 'object' || value === null) {
        return null;
    }
    const { show, useCustom, customText, customColor } = value as Record<string, unknown>;
    if (
        typeof show !== 'boolean' ||
        typeof useCustom !== 'boolean' ||
        typeof customText !== 'string' ||
        customText.length > MAX_PAGE_TEXT_LENGTH ||
        typeof customColor !== 'string' ||
        !HEX_COLOR.test(customColor)
    ) {
        return null;
    }
    return { show, useCustom, customText, customColor };
}

function colorSetting(value: unknown) {
    if (typeof value !== 'object' || value === null) {
        return null;
    }
    const { useCustom, customColor } = value as Record<string, unknown>;
    if (typeof useCustom !== 'boolean' || typeof customColor !== 'string' || !HEX_COLOR.test(customColor)) {
        return null;
    }
    return { useCustom, customColor };
}

// Each vanity page section, with a function that checks what the browser sends and returns only the
// fields to save, or null if anything is invalid.
const VANITY_SECTIONS: Record<string, (body: Record<string, unknown>) => object | null> = {
    'page-text': (body) => {
        const districtName = textSetting(body.districtName);
        const subtext = textSetting(body.subtext);
        return districtName && subtext ? { districtName, subtext } : null;
    },
    'page-appearance': (body) => {
        const pageBackground = colorSetting(body.pageBackground);
        const cardBackground = colorSetting(body.cardBackground);
        const { buttonCorners } = body;
        if (!pageBackground || !cardBackground || typeof buttonCorners !== 'string' || !BUTTON_CORNERS.includes(buttonCorners)) {
            return null;
        }
        return { pageBackground, cardBackground, buttonCorners };
    },
    'monogram-logo': (body) => {
        const background = colorSetting(body.background);
        const letterColor = colorSetting(body.letterColor);
        const { show, useCustomLetters, customLetters } = body;
        if (
            !background ||
            !letterColor ||
            typeof show !== 'string' ||
            !BRAND_MARKS.includes(show) ||
            typeof useCustomLetters !== 'boolean' ||
            typeof customLetters !== 'string' ||
            customLetters.length > MAX_MONOGRAM_LETTERS
        ) {
            return null;
        }
        return { show, useCustomLetters, customLetters, background, letterColor };
    },
    'sign-in-block': (body) => {
        const heading = textSetting(body.heading);
        const cardBackground = colorSetting(body.cardBackground);
        const { showBorder, corners } = body;
        if (
            !heading ||
            !cardBackground ||
            typeof showBorder !== 'boolean' ||
            typeof corners !== 'string' ||
            !BUTTON_CORNERS.includes(corners)
        ) {
            return null;
        }
        return { heading, cardBackground, showBorder, corners };
    },
    'sso-sign-in': (body) => {
        const google = textSetting(body.google);
        return google ? { google } : null;
    },
    'alternate-sign-in': (body) => {
        const email = textSetting(body.email);
        const guest = textSetting(body.guest);
        return email && guest ? { email, guest } : null;
    },
    'footer': (body) => {
        const copyright = textSetting(body.copyright);
        const background = colorSetting(body.background);
        const { showPoweredBy } = body;
        if (!copyright || !background || typeof showPoweredBy !== 'boolean') {
            return null;
        }
        return { copyright, showPoweredBy, background };
    },
    'url-configuration': (body) => {
        const { slug } = body;
        if (typeof slug !== 'string' || (slug !== '' && !SLUG_PATTERN.test(slug))) {
            return null;
        }
        return { slug };
    },
};

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

app.use('/api/vanity-page', requireAuth);

// The logo is a file, so it has its own routes. They come before the section routes, which would
// otherwise answer "Unknown section".
app.get('/api/vanity-page/logo', (req,res)=>{
    const row = db.prepare('SELECT content_type, data FROM vanity_page_logos WHERE user_id = ?').get(res.locals.userId) as
        { content_type: string; data: Uint8Array } | undefined;

    if (!row) {
        res.status(404).json({ error: 'No logo' });
        return;
    }

    // An SVG can contain scripts. These headers stop them running if the file is opened directly.
    res.set({
        'Content-Type': row.content_type,
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
    });
    res.send(Buffer.from(row.data));
})

app.put('/api/vanity-page/logo', express.raw({ type: LOGO_TYPES, limit: MAX_LOGO_BYTES }), (req,res)=>{
    const type = (req.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase();

    if (!Buffer.isBuffer(req.body) || !isLogoFile(type, req.body)) {
        res.status(400).json({ error: 'Invalid logo' });
        return;
    }

    db.prepare(`
        INSERT INTO vanity_page_logos (user_id, content_type, data) VALUES (?, ?, ?)
        ON CONFLICT (user_id) DO UPDATE SET content_type = excluded.content_type, data = excluded.data
    `).run(res.locals.userId, type, req.body);

    res.status(204).end();
})

app.delete('/api/vanity-page/logo', (req,res)=>{
    db.prepare('DELETE FROM vanity_page_logos WHERE user_id = ?').run(res.locals.userId);
    res.status(204).end();
})

// A logo over 1 MB is rejected by express.raw. This turns that into a JSON error like the others.
app.use('/api/vanity-page/logo', (err: { type?: string }, req: express.Request, res: express.Response, next: express.NextFunction)=>{
    if (err.type === 'entity.too.large') {
        res.status(413).json({ error: 'Logo is larger than 1 MB' });
        return;
    }
    next(err);
})

app.use('/api/vanity-page/:section', (req,res,next)=>{
    if (!Object.hasOwn(VANITY_SECTIONS, req.params.section)) {
        res.status(404).json({ error: 'Unknown section' });
        return;
    }
    next();
})

app.get('/api/vanity-page/:section', (req,res)=>{
    const row = db.prepare(`
        SELECT settings FROM vanity_page_sections WHERE user_id = ? AND section = ?
    `).get(res.locals.userId, req.params.section) as { settings: string } | undefined;

    // Nothing saved yet, so the page keeps its own defaults.
    res.json(row ? JSON.parse(row.settings) : null);
})

app.put('/api/vanity-page/:section', (req,res)=>{
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const settings = VANITY_SECTIONS[req.params.section](body);

    if (!settings) {
        res.status(400).json({ error: 'Invalid settings' });
        return;
    }

    try {
        db.prepare(`
            INSERT INTO vanity_page_sections (user_id, section, settings) VALUES (?, ?, ?)
            ON CONFLICT (user_id, section) DO UPDATE SET settings = excluded.settings
        `).run(res.locals.userId, req.params.section, JSON.stringify(settings));
    } catch (error) {
        // The unique index on page URLs rejects a URL another user already has.
        if (error instanceof Error && error.message.includes('vanity_page_url_slug')) {
            res.status(409).json({ error: 'That page URL is already taken' });
            return;
        }
        throw error;
    }

    res.json(settings);
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