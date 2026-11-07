import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';

@Component({
  imports: [],
  selector: 'app-settings',
  styleUrl: './settings.scss',
  templateUrl: './settings.html',
})
export class Settings implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  protected readonly loadFailed = signal(false);

  private unmount?: () => void;
  private destroyed = false;

  ngAfterViewInit(): void {
    loadRemoteModule('settings', './Mount')
      .then((m) => {
        // The user may have left the page while the remote was loading.
        if (!this.destroyed) {
          this.unmount = m.mount(this.host().nativeElement);
        }
      })
      .catch(() => this.loadFailed.set(true));
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.unmount?.();
  }
}