import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { filter } from 'rxjs';

const BASE_PATH = '/dashboard/tickets';

// What the React tickets remote exposes as ./Mount.
interface TicketsHandle {
  setPath(path: string): void;
  unmount(): void;
}

interface TicketsRemote {
  mount(
    element: HTMLElement,
    navigation: { basePath: string; path: string; navigate(path: string): void },
  ): TicketsHandle;
}

// Shows the React tickets app. Angular's router owns the address bar: React asks it to change pages,
// and this component tells React when the address changes, so links, the back button and refreshes all agree.
@Component({
  imports: [],
  selector: 'app-tickets-host',
  styleUrl: './tickets-host.scss',
  templateUrl: './tickets-host.html',
})
export class TicketsHost implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  protected readonly loadFailed = signal(false);

  private handle?: TicketsHandle;
  private destroyed = false;

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.handle?.setPath(this.currentPath()));
  }

  ngAfterViewInit(): void {
    loadRemoteModule<TicketsRemote>('tickets-react', './Mount')
      .then((remote) => {
        // The user may have left the page while the remote was loading.
        if (this.destroyed) {
          return;
        }
        this.handle = remote.mount(this.host().nativeElement, {
          basePath: BASE_PATH,
          path: this.currentPath(),
          navigate: (path) => this.router.navigateByUrl(path ? `${BASE_PATH}/${path}` : BASE_PATH),
        });
      })
      .catch(() => this.loadFailed.set(true));
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.handle?.unmount();
  }

  // The part of the address after /dashboard/tickets: '' for the list, 'new', or a ticket ID.
  private currentPath(): string {
    const path = this.router.url.split(/[?#]/)[0];
    return path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length).replace(/^\//, '') : '';
  }
}
