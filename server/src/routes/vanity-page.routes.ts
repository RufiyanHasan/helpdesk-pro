import express, { Router, type NextFunction, type Request, type Response } from 'express';
import { queryOne, run } from '../db/database.ts';
import { isLogoFile, LOGO_TYPES, MAX_LOGO_BYTES } from '../validation/logo.ts';
import { VANITY_SECTIONS } from '../validation/vanity-sections.ts';

export const vanityPageRouter = Router();

// The logo is a file, so it has its own routes. They come before the section routes, which would
// otherwise treat "logo" as an unknown section.
vanityPageRouter.get('/logo', async (req,res)=>{
    // The database returns the file's bytes as an ArrayBuffer.
    const row = await queryOne<{ content_type: string; data: ArrayBuffer }>(
        'SELECT content_type, data FROM vanity_page_logos WHERE user_id = ?', [res.locals.userId]
    );

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
    res.send(Buffer.from(new Uint8Array(row.data)));
})

vanityPageRouter.put('/logo', express.raw({ type: LOGO_TYPES, limit: MAX_LOGO_BYTES }), async (req,res)=>{
    const type = (req.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase();

    if (!Buffer.isBuffer(req.body) || !isLogoFile(type, req.body)) {
        res.status(400).json({ error: 'Invalid logo' });
        return;
    }

    await run(`
        INSERT INTO vanity_page_logos (user_id, content_type, data) VALUES (?, ?, ?)
        ON CONFLICT (user_id) DO UPDATE SET content_type = excluded.content_type, data = excluded.data
    `, [res.locals.userId, type, req.body]);

    res.status(204).end();
})

vanityPageRouter.delete('/logo', async (req,res)=>{
    await run('DELETE FROM vanity_page_logos WHERE user_id = ?', [res.locals.userId]);
    res.status(204).end();
})

// A logo over 1 MB is rejected by express.raw. This turns that into a JSON error like the others.
vanityPageRouter.use('/logo', (err: { type?: string }, req: Request, res: Response, next: NextFunction)=>{
    if (err.type === 'entity.too.large') {
        res.status(413).json({ error: 'Logo is larger than 1 MB' });
        return;
    }
    next(err);
})

// Runs before every route with :section, so only the sections in VANITY_SECTIONS can be read or saved.
vanityPageRouter.param('section', (req,res,next,section: string)=>{
    if (!Object.hasOwn(VANITY_SECTIONS, section)) {
        res.status(404).json({ error: 'Unknown section' });
        return;
    }
    next();
})

vanityPageRouter.get('/:section', async (req,res)=>{
    const row = await queryOne<{ settings: string }>(
        'SELECT settings FROM vanity_page_sections WHERE user_id = ? AND section = ?',
        [res.locals.userId, req.params.section]
    );

    // Nothing saved yet, so the page keeps its own defaults.
    res.json(row ? JSON.parse(row.settings) : null);
})

vanityPageRouter.put('/:section', async (req,res)=>{
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const settings = VANITY_SECTIONS[req.params.section](body);

    if (!settings) {
        res.status(400).json({ error: 'Invalid settings' });
        return;
    }

    try {
        await run(`
            INSERT INTO vanity_page_sections (user_id, section, settings) VALUES (?, ?, ?)
            ON CONFLICT (user_id, section) DO UPDATE SET settings = excluded.settings
        `, [res.locals.userId, req.params.section, JSON.stringify(settings)]);
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
