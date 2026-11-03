import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { API_URLS } from '../../core/api-urls';
import { PRIORITIES, TOPICS } from '../ticket-options';
import { RichTextEditor } from './rich-text-editor/rich-text-editor';

@Component({
  imports: [ReactiveFormsModule, RichTextEditor, RouterLink],
  selector: 'app-new-ticket',
  styleUrl: './new-ticket.scss',
  templateUrl: './new-ticket.html',
})
export class NewTicket {
  private readonly api = inject(Api);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly topics = TOPICS;

  protected readonly priorities = PRIORITIES;

  protected readonly articles = [
    'How to reset your password',
    'Setting up single sign-on',
    'Why am I asked for a verification code?',
  ];

  protected readonly form = this.formBuilder.group({
    requesterEmail: ['', [Validators.required, Validators.email]],
    topic: [TOPICS[0]],
    subject: ['', Validators.required],
    description: [''],
    priority: ['Medium'],
  });

  protected readonly isSubmitting = signal(false);

  protected readonly submitFailed = signal(false);

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitFailed.set(false);

    this.api.post<unknown>(API_URLS.tickets, this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['..'], { relativeTo: this.route }),
      error: () => {
        this.isSubmitting.set(false);
        this.submitFailed.set(true);
      },
    });
  }
}
