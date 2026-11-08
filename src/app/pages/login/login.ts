import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly loginError = signal('');

  protected readonly isSubmitting = signal(false);

  protected onSubmit(): void {
    // Shows the "is required" messages instead of sending empty fields to the server.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.loginError.set('');

    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.loginError.set(
          error.status === 401 ? 'Invalid username or password.' : 'Could not sign in. Please try again.',
        );
      },
    });
  }
}
