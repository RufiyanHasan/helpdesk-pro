import { httpResource } from '@angular/common/http';
import { Component, computed, effect, viewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

interface Ticket {
  id: string;
  subject: string;
  topic: string;
  status: string;
  priority: string;
  assignee: string;
  updated: string;
}

const PRIORITY_ORDER: Record<string, number> = { Low: 1, Medium: 2, High: 3, Urgent: 4 };

// Mock data stores "updated" as display text such as "4 min ago", "1 h ago" or "Yesterday".
function minutesAgo(updated: string): number {
  if (updated === 'Yesterday') {
    return 24 * 60;
  }

  const [value, unit] = updated.split(' ');
  return Number(value) * (unit === 'h' ? 60 : 1);
}

@Component({
  imports: [MatSortModule, MatTableModule],
  selector: 'app-tickets',
  styleUrl: './tickets.scss',
  templateUrl: './tickets.html',
})
export class Tickets {
  protected readonly filters = ['Status: Open', 'Priority', 'Assignee', 'Topic'];

  protected readonly columns = ['id', 'subject', 'topic', 'status', 'priority', 'assignee', 'updated'];

  protected readonly statusClasses: Record<string, string> = {
    Open: 'badge--open',
    'In progress': 'badge--in-progress',
    Overdue: 'badge--overdue',
    Resolved: 'badge--resolved',
  };

  protected readonly tickets = httpResource<Ticket[]>(() => '/mock-data/tickets.json');

  private readonly rows = computed(() => (this.tickets.hasValue() ? this.tickets.value() : []));

  private readonly sort = viewChild.required(MatSort);

  protected readonly dataSource = new MatTableDataSource<Ticket>();

  constructor() {
    this.dataSource.sortingDataAccessor = (ticket, column) => {
      if (column === 'priority') {
        return PRIORITY_ORDER[ticket.priority];
      }
      if (column === 'updated') {
        return minutesAgo(ticket.updated);
      }
      return ticket[column as keyof Ticket];
    };

    this.dataSource.filterPredicate = (ticket, term) =>
      ticket.subject.toLowerCase().includes(term) || ticket.id.toLowerCase().includes(term);

    effect(() => {
      this.dataSource.sort = this.sort();
      this.dataSource.data = this.rows();
    });
  }

  protected search(term: string): void {
    this.dataSource.filter = term.trim().toLowerCase();
  }
}
