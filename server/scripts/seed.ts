import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { db } from '../src/db/database.ts';

interface Ticket {
  id: string;
  subject: string;
  topic: string;
  status: string;
  priority: string;
  assignee: string;
  updated: string;
}

const TOTAL_TICKETS = 10000;
const LATEST_TICKET_NUMBER = 10482;

const SUBJECTS: Record<string, string[]> = {
  'Account access': [
    'Cannot log in after changing password',
    'Password reset email never arrives',
    'Account locked after failed login attempts',
    'Two-factor code is rejected',
    'New user cannot accept the invitation',
  ],
  Billing: [
    'Charged twice for the same month',
    'Invoice shows the wrong company name',
    'Cannot update the payment card',
    'Refund has not arrived yet',
    'Plan upgrade was not applied',
  ],
  Reports: [
    'Monthly report shows no data',
    'Export to PDF fails with an error',
    'Report totals do not match the dashboard',
    'Scheduled report email was not sent',
    'Date filter is ignored in the report',
  ],
  Content: [
    'Help article has a broken link',
    'Typo on the getting started page',
    'Article images are not loading',
    'Please add a guide for new admins',
    'Translated page shows English text',
  ],
  Integrations: [
    'Slack notifications stopped working',
    'API returns a 500 error',
    'Webhook is sent twice for one event',
    'Calendar sync is missing events',
    'API key stopped working after rotation',
  ],
  Performance: [
    'Ticket list takes too long to load',
    'Search is slow with long queries',
    'Page freezes when opening attachments',
    'Reports time out at the end of the month',
    'Mobile app is slow to start',
  ],
  Branding: [
    'Custom logo is not showing in emails',
    'Brand colour is wrong on the login page',
    'Favicon still shows the old logo',
    'Footer shows the old company address',
    'Email signature uses the wrong font',
  ],
};

const STATUSES = ['Open', 'In progress', 'Overdue', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const ASSIGNEES = ['Priya S.', 'Daniel K.', 'Maria L.', 'Alex M.', 'Unassigned'];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Uses the same text formats as the mock data, because the Tickets page sorts by them.
function randomUpdated(): string {
  const kind = randomNumber(1, 3);
  if (kind === 1) {
    return `${randomNumber(1, 59)} min ago`;
  }
  if (kind === 2) {
    return `${randomNumber(1, 23)} h ago`;
  }
  return 'Yesterday';
}

function createTicket(id: string): Ticket {
  const topic = pick(Object.keys(SUBJECTS));

  return {
    id,
    subject: pick(SUBJECTS[topic]),
    topic,
    status: pick(STATUSES),
    priority: pick(PRIORITIES),
    assignee: pick(ASSIGNEES),
    updated: randomUpdated(),
  };
}

const file = join(import.meta.dirname, '../../public/mock-data/tickets.json');
const mockTickets: Ticket[] = JSON.parse(readFileSync(file, 'utf8'));
const mockTicketsById = new Map(mockTickets.map((ticket) => [ticket.id, ticket]));

const insert = db.prepare(`
  INSERT OR REPLACE INTO tickets (id, subject, topic, status, priority, assignee, updated)
  VALUES (:id, :subject, :topic, :status, :priority, :assignee, :updated)
`);

db.exec('BEGIN');

for (let i = 0; i < TOTAL_TICKETS; i++) {
  const id = `HD-${String(LATEST_TICKET_NUMBER - i).padStart(5, '0')}`;
  insert.run({ ...(mockTicketsById.get(id) ?? createTicket(id)) });
}

db.prepare('UPDATE ticket_counter SET last_number = MAX(last_number, ?)').run(LATEST_TICKET_NUMBER);

db.exec('COMMIT');

console.log(`Seeded ${TOTAL_TICKETS} tickets`);
