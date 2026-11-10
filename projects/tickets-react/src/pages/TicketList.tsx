import { useEffect, useRef, useState } from 'react';
import { deleteTickets, getTickets } from '../api/tickets';
import Paginator from '../components/Paginator';
import StatusBadge from '../components/StatusBadge';
import { Link } from '../lib/navigation';
import { ASSIGNEES, PRIORITIES, STATUSES, TOPICS } from '../lib/ticket-options';
import type { TicketsResponse } from '../types';

type FilterKey = 'status' | 'priority' | 'assignee' | 'topic';
type SortDirection = 'asc' | 'desc' | '';

const FILTERS: { key: FilterKey; label: string; options: string[] }[] = [
  { key: 'status', label: 'Status', options: STATUSES },
  { key: 'priority', label: 'Priority', options: PRIORITIES },
  { key: 'assignee', label: 'Assignee', options: ASSIGNEES },
  { key: 'topic', label: 'Topic', options: TOPICS },
];

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'subject', label: 'Subject' },
  { key: 'topic', label: 'Topic' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'updated', label: 'Updated' },
];

const PAGE_SIZE = 25;
const SEARCH_DELAY_MS = 300;
const NO_RESULTS: TicketsResponse = { tickets: [], total: 0 };
const NO_FILTERS: Record<FilterKey, string> = { status: '', priority: '', assignee: '', topic: '' };

// Clicking a column sorts ascending, then descending, then not at all, like Angular Material's sort header.
function nextDirection(direction: SortDirection): SortDirection {
  return direction === '' ? 'asc' : direction === 'asc' ? 'desc' : '';
}

export default function TicketList() {
  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<{ active: string; direction: SortDirection }>({ active: '', direction: '' });
  const [filters, setFilters] = useState(NO_FILTERS);
  const [reloadCount, setReloadCount] = useState(0);

  // Keeps the current rows on screen while the next page loads.
  const [results, setResults] = useState(NO_RESULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);

  const tableScroll = useRef<HTMLDivElement>(null);
  const allBox = useRef<HTMLInputElement>(null);

  // Searches 300 ms after typing stops, on the server.
  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchInput.trim();
      setSearchTerm((current) => {
        if (current !== term) {
          setPageIndex(0);
        }
        return term;
      });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    // Cancels the request if the page, search, sort or filters change before it finishes.
    const controller = new AbortController();
    setIsLoading(true);

    getTickets(
      {
        page: pageIndex + 1,
        pageSize: PAGE_SIZE,
        search: searchTerm,
        sortBy: sort.active,
        sortDir: sort.direction,
        ...filters,
      },
      controller.signal,
    )
      .then((response) => {
        setResults(response);
        setLoadFailed(false);
        setIsLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults(NO_RESULTS);
          setLoadFailed(true);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [pageIndex, searchTerm, sort, filters, reloadCount]);

  // Each new set of rows starts at the top of the scrollable table, with nothing selected.
  useEffect(() => {
    tableScroll.current?.scrollTo({ top: 0 });
    setSelectedIds(new Set());
  }, [results]);

  const { tickets, total } = results;
  const allSelected = tickets.length > 0 && tickets.every((ticket) => selectedIds.has(ticket.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  // A checkbox can only be shown half-ticked from JavaScript.
  useEffect(() => {
    if (allBox.current) {
      allBox.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  function toggleTicket(id: string, checked: boolean): void {
    const selected = new Set(selectedIds);
    if (checked) {
      selected.add(id);
    } else {
      selected.delete(id);
    }
    setSelectedIds(selected);
  }

  function toggleAll(checked: boolean): void {
    setSelectedIds(new Set(checked ? tickets.map((ticket) => ticket.id) : []));
  }

  function changeSort(column: string): void {
    const direction = nextDirection(sort.active === column ? sort.direction : '');
    setPageIndex(0);
    setSort({ active: direction ? column : '', direction });
  }

  function applyFilter(key: FilterKey, value: string): void {
    setPageIndex(0);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function deleteSelected(): Promise<void> {
    const ids = [...selectedIds];
    const label = ids.length === 1 ? '1 ticket' : `${ids.length} tickets`;

    if (!confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setDeleteFailed(false);

    try {
      await deleteTickets(ids);
      const pageIsNowEmpty = ids.length === tickets.length;
      if (pageIsNowEmpty && pageIndex > 0) {
        setPageIndex(pageIndex - 1);
      } else {
        setReloadCount((count) => count + 1);
      }
    } catch {
      setDeleteFailed(true);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="ticket-list">
      <header className="header">
        <div>
          <h1 className="header__title">Tickets</h1>
          <p className="header__subtitle">Total tickets: {total.toLocaleString('en-US')}</p>
        </div>
        <div className="header__actions">
          {deleteFailed && <p className="header__error">Could not delete the tickets. Please try again.</p>}
          {selectedIds.size > 0 && (
            <button className="delete-tickets" type="button" disabled={isDeleting} onClick={deleteSelected}>
              Delete selected ({selectedIds.size})
            </button>
          )}
          <Link className="new-ticket" to="new">
            + New ticket
          </Link>
        </div>
      </header>

      <div className="toolbar">
        <div className="search">
          <svg className="search__icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            className="search__input"
            type="search"
            placeholder="Search by subject or ID"
            aria-label="Search tickets"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        {FILTERS.map((filter) => (
          <select
            className="filter"
            key={filter.key}
            aria-label={`Filter by ${filter.label}`}
            value={filters[filter.key]}
            onChange={(event) => applyFilter(filter.key, event.target.value)}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option value={option} key={option}>
                {filter.label}: {option}
              </option>
            ))}
          </select>
        ))}

        <button className="advanced-search" type="button">
          Advanced search
        </button>
      </div>

      <div className="table-card">
        <div className="table-scroll" ref={tableScroll}>
          <table className="table">
            <thead>
              <tr>
                <th className="table__select">
                  <input
                    ref={allBox}
                    type="checkbox"
                    aria-label="Select all tickets on this page"
                    checked={allSelected}
                    disabled={tickets.length === 0}
                    onChange={(event) => toggleAll(event.target.checked)}
                  />
                </th>
                {COLUMNS.map((column) => {
                  const direction = sort.active === column.key ? sort.direction : '';
                  return (
                    <th
                      key={column.key}
                      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
                    >
                      <button className="sort-header" type="button" onClick={() => changeSort(column.key)}>
                        {column.label}
                        <span className={`sort-header__arrow sort-header__arrow--${direction || 'none'}`} aria-hidden="true">
                          {direction === 'desc' ? '↓' : '↑'}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="table__select">
                    <input
                      type="checkbox"
                      aria-label={`Select ticket ${ticket.id}`}
                      checked={selectedIds.has(ticket.id)}
                      onChange={(event) => toggleTicket(ticket.id, event.target.checked)}
                    />
                  </td>
                  <td className="table__id">{ticket.id}</td>
                  <td className="table__subject">
                    <Link to={ticket.id}>{ticket.subject}</Link>
                  </td>
                  <td>{ticket.topic}</td>
                  <td>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td>{ticket.priority}</td>
                  <td>{ticket.assignee}</td>
                  <td>{ticket.updated}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td className="table__message" colSpan={COLUMNS.length + 1}>
                    {isLoading ? 'Loading tickets...' : loadFailed ? 'Could not load tickets.' : 'No tickets found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Paginator pageIndex={pageIndex} pageSize={PAGE_SIZE} total={total} onPageChange={setPageIndex} />
      </div>

      <footer className="footer">
        <span>Search runs on the server, 300 ms after typing stops</span>
      </footer>
    </div>
  );
}
