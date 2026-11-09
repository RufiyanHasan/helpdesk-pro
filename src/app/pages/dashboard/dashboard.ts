import { Component, computed, inject } from '@angular/core';
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

  protected readonly displayName = this.auth.displayName;

  // "Rufiyan Hasan" becomes "RH", "priya.sharma" becomes "PS", and a single word like "admin" becomes "AD".
  protected readonly initials = computed(() => {
    const words = this.displayName().split(/[^a-zA-Z0-9]+/).filter(Boolean);
    const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '').slice(0, 2);
    return letters.toUpperCase();
  });

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
