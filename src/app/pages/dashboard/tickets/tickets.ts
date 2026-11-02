import { Component } from '@angular/core';

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

  protected readonly tickets = [
    {
      id: 'HD-10482',
      subject: 'Cannot reset password from the login page',
      topic: 'Account access',
      status: 'Open',
      priority: 'High',
      assignee: 'Priya S.',
      updated: '4 min ago',
    },
    {
      id: 'HD-10481',
      subject: 'Invoice for October shows the wrong plan',
      topic: 'Billing',
      status: 'In progress',
      priority: 'Medium',
      assignee: 'Daniel K.',
      updated: '18 min ago',
    },
    {
      id: 'HD-10479',
      subject: 'SSO with Microsoft fails for new users',
      topic: 'Account access',
      status: 'Overdue',
      priority: 'Urgent',
      assignee: 'Priya S.',
      updated: '1 h ago',
    },
    {
      id: 'HD-10476',
      subject: 'Export to CSV is missing the date column',
      topic: 'Reports',
      status: 'Open',
      priority: 'Low',
      assignee: 'Unassigned',
      updated: '2 h ago',
    },
    {
      id: 'HD-10470',
      subject: 'Add Spanish translation to the help centre',
      topic: 'Content',
      status: 'In progress',
      priority: 'Medium',
      assignee: 'Maria L.',
      updated: '3 h ago',
    },
    {
      id: 'HD-10466',
      subject: 'Webhook not firing on ticket close',
      topic: 'Integrations',
      status: 'Open',
      priority: 'High',
      assignee: 'Daniel K.',
      updated: '5 h ago',
    },
    {
      id: 'HD-10461',
      subject: 'Dashboard slow with many topics',
      topic: 'Performance',
      status: 'Resolved',
      priority: 'Medium',
      assignee: 'Alex M.',
      updated: 'Yesterday',
    },
    {
      id: 'HD-10455',
      subject: 'Logo looks blurry on the portal header',
      topic: 'Branding',
      status: 'Resolved',
      priority: 'Low',
      assignee: 'Maria L.',
      updated: 'Yesterday',
    },
  ];
}
