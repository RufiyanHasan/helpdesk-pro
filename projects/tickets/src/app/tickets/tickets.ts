import { DecimalPipe } from '@angular/common';
import { Component, effect, ElementRef, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { API_URLS } from '../core/api-urls';
import { ASSIGNEES, PRIORITIES, STATUSES, TOPICS } from './ticket-options';

interface Ticket {
  id: string;
  subject: string;
  topic: string;
  status: string;
  priority: string;
  assignee: string;
  updated: string;
}

interface TicketsResponse {
  tickets: Ticket[];
  total: number;
}

type FilterKey = 'status' | 'priority' | 'assignee' | 'topic';

const NO_RESULTS: TicketsResponse = { tickets: [], total: 0 };
const SEARCH_DELAY_MS = 300;

@Component({
  imports: [DecimalPipe, MatPaginatorModule, MatSortModule, MatTableModule, RouterLink],
  selector: 'app-tickets',
  styleUrl: './tickets.scss',
  templateUrl: './tickets.html',
})
export class Tickets {
  private readonly api = inject(Api);

  protected readonly filters: { key: FilterKey; label: string; options: string[] }[] = [
    { key: 'status', label: 'Status', options: STATUSES },
    { key: 'priority', label: 'Priority', options: PRIORITIES },
    { key: 'assignee', label: 'Assignee', options: ASSIGNEES },
    { key: 'topic', label: 'Topic', options: TOPICS },
  ];

  protected readonly columns = ['id', 'subject', 'topic', 'status', 'priority', 'assignee', 'updated'];

  protected readonly statusClasses: Record<string, string> = {
    Open: 'badge--open',
    'In progress': 'badge--in-progress',
    Overdue: 'badge--overdue',
    Resolved: 'badge--resolved',
  };

  protected readonly pageSize = 25;

  protected readonly pageIndex = signal(0);

  private readonly searchTerm = signal('');

  private readonly sortState = signal<Sort>({ active: '', direction: '' });

  private readonly filterValues = signal<Record<FilterKey, string>>({
    status: '',
    priority: '',
    assignee: '',
    topic: '',
  });

  private searchTimer?: ReturnType<typeof setTimeout>;

  protected readonly tickets = rxResource({
    params: () => ({
      page: this.pageIndex() + 1,
      pageSize: this.pageSize,
      search: this.searchTerm(),
      sortBy: this.sortState().active,
      sortDir: this.sortState().direction,
      ...this.filterValues(),
    }),
    stream: ({ params }) => this.api.get<TicketsResponse>(API_URLS.tickets, params),
  });

  // Keeps the current rows on screen while the next page loads.
  protected readonly results = linkedSignal<TicketsResponse | undefined, TicketsResponse>({
    source: () => (this.tickets.hasValue() ? this.tickets.value() : undefined),
    computation: (current, previous) =>
      this.tickets.error() ? NO_RESULTS : (current ?? previous?.value ?? NO_RESULTS),
  });

  private readonly tableScroll = viewChild.required<ElementRef<HTMLElement>>('tableScroll');

  constructor() {
    // Each new set of rows starts at the top of the scrollable table.
    effect(() => {
      this.results();
      this.tableScroll().nativeElement.scrollTop = 0;
    });
  }

  protected search(term: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.pageIndex.set(0);
      this.searchTerm.set(term.trim());
    }, SEARCH_DELAY_MS);
  }

  protected applyFilter(key: FilterKey, value: string): void {
    this.pageIndex.set(0);
    this.filterValues.update((values) => ({ ...values, [key]: value }));
  }

  protected sort(sort: Sort): void {
    this.pageIndex.set(0);
    this.sortState.set(sort);
  }

  protected changePage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
  }
}
