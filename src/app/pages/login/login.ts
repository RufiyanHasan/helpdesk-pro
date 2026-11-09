import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';
import { GOOGLE_CLIENT_ID, loadGoogleSignIn } from '../../core/google-sign-in';

// Google's button can't be wider than this.
const MAX_GOOGLE_BUTTON_WIDTH = 400;

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

  protected readonly googleError = signal('');

  private readonly googleButton = viewChild.required<ElementRef<HTMLElement>>('googleButton');

  constructor() {
    // Runs once the page is on screen, because Google needs the empty div to draw its button into.
    afterNextRender(() => {
      loadGoogleSignIn()
        .then((google) => {
          google.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: ({ credential }) => this.signInWithGoogle(credential),
          });
          const element = this.googleButton().nativeElement;
          google.renderButton(element, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: Math.min(element.offsetWidth, MAX_GOOGLE_BUTTON_WIDTH),
          });
        })
        .catch(() => this.googleError.set('Google sign-in is unavailable right now.'));
    });
  }

  private signInWithGoogle(credential: string): void {
    this.googleError.set('');
    this.auth.loginWithGoogle(credential).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error: HttpErrorResponse) =>
        this.googleError.set(
          error.status === 401
            ? 'No HelpDesk Pro account uses this Google account.'
            : 'Could not sign in with Google. Please try again.',
        ),
    });
  }

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
