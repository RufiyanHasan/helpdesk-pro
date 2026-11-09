import { Component, inject } from '@angular/core';
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

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
