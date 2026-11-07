import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, throwError } from 'rxjs';
import { Api } from '../../core/api';
import { API_URLS } from '../../core/api-urls';
import { STATUS_CLASSES } from '../ticket-options';

interface TicketDetail {
  id: string;
  subject: string;
  topic: string;
  status: string;
  priority: string;
  assignee: string;
  updated: string;
  requester_email: string;
  description: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-ticket-details',
  styleUrl: './ticket-details.scss',
  templateUrl: './ticket-details.html',
})
export class TicketDetails {
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);

  protected readonly statusClasses = STATUS_CLASSES;

  protected readonly ticket = rxResource({
    params: () => this.route.snapshot.paramMap.get('id') ?? '',
    stream: ({ params: id }) =>
      this.api.get<TicketDetail>(`${API_URLS.tickets}/${encodeURIComponent(id)}`).pipe(
        // A missing ticket is a normal result, not a failed request.
        catchError((error: HttpErrorResponse) => (error.status === 404 ? of(null) : throwError(() => error))),
      ),
  });
}
