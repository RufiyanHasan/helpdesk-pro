import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly logoutFailed = signal(false);

  protected logout(): void {
    this.logoutFailed.set(false);
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.logoutFailed.set(true),
    });
  }
}
