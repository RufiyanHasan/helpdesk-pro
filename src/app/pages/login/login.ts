import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';


@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  form = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  })

  loginError = signal('');
  isSubmitting = signal(false);

  onSubmit(){
    const { username, password } = this.form.value;

    this.isSubmitting.set(true);
    this.loginError.set('');

    this.auth.login(username ?? '', password ?? '').subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.loginError.set(
          error.status === 401
            ? 'Invalid username or password.'
            : 'Could not sign in. Please try again.',
        );
      },
    });
  }
}
