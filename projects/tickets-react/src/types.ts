export interface Ticket {
  id: string;
  subject: string;
  topic: string;
  status: string;
  priority: string;
  assignee: string;
  updated: string;
}

export interface TicketDetail extends Ticket {
  requester_email: string;
  description: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
}

export interface NewTicketRequest {
  requesterEmail: string;
  topic: string;
  subject: string;
  description: string;
  priority: string;
}
