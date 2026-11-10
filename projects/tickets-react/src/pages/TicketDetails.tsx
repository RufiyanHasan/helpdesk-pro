import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { ApiError, getTicket } from '../api/tickets';
import StatusBadge from '../components/StatusBadge';
import { Link } from '../lib/navigation';
import type { TicketDetail } from '../types';

type TicketState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'missing' }
  | { status: 'loaded'; ticket: TicketDetail };

export default function TicketDetails({ id }: { id: string }) {
  const [state, setState] = useState<TicketState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    getTicket(id, controller.signal)
      .then((ticket) => setState({ status: 'loaded', ticket }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          // A missing ticket is a normal result, not a failed request.
          setState(error instanceof ApiError && error.status === 404 ? { status: 'missing' } : { status: 'failed' });
        }
      });

    return () => controller.abort();
  }, [id]);

  // The description is HTML from the editor. DOMPurify removes scripts and other unsafe HTML before React shows it,
  // which Angular's [innerHTML] did automatically in the Angular version.
  const descriptionHtml = useMemo(
    () => (state.status === 'loaded' && state.ticket.description ? DOMPurify.sanitize(state.ticket.description) : ''),
    [state],
  );

  return (
    <div className="ticket-details">
      <Link className="back-link" to="">
        ← Back to tickets
      </Link>

      {state.status === 'loading' && <p className="message">Loading ticket...</p>}
      {state.status === 'failed' && <p className="message">Could not load this ticket.</p>}
      {state.status === 'missing' && <p className="message">Ticket not found.</p>}

      {state.status === 'loaded' && (
        <>
          <h1 className="title">{state.ticket.subject}</h1>
          <p className="ticket-id">{state.ticket.id}</p>

          <div className="layout">
            <section className="card description">
              <h2 className="card__title">Description</h2>
              {descriptionHtml ? (
                <div className="description__body" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              ) : (
                <p className="description__empty">No description provided.</p>
              )}
            </section>

            <aside className="card info">
              <h2 className="card__title">Details</h2>
              <dl className="info__list">
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={state.ticket.status} />
                </dd>
                <dt>Priority</dt>
                <dd>{state.ticket.priority}</dd>
                <dt>Topic</dt>
                <dd>{state.ticket.topic}</dd>
                <dt>Assignee</dt>
                <dd>{state.ticket.assignee}</dd>
                <dt>Requester</dt>
                <dd>{state.ticket.requester_email || 'Not provided'}</dd>
                <dt>Updated</dt>
                <dd>{state.ticket.updated}</dd>
              </dl>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
