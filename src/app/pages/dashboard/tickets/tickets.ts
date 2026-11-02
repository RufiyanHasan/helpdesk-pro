import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';

interface Ticket {
  id: string;
  subject: string;
  topic: string;
  status: string;
  priority: string;
  assignee: string;
  updated: string;
}

@Component({
  imports: [],
  selector: 'app-tickets',
  styleUrl: './tickets.scss',
  templateUrl: './tickets.html',
})
export class Tickets {
  protected readonly filters = ['Status: Open', 'Priority', 'Assignee', 'Topic'];

  protected readonly statusClasses: Record<string, string> = {
    Open: 'badge--open',
    'In progress': 'badge--in-progress',
    Overdue: 'badge--overdue',
    Resolved: 'badge--resolved',
  };

  protected readonly tickets = httpResource<Ticket[]>(() => '/mock-data/tickets.json');
}
