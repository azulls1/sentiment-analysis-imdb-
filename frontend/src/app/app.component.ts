import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { ErrorHandlingService } from './core/services/error-handling.service';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>

    @if (!errorService.isOnline()) {
      <div class="status-banner status-banner--offline" role="alert">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/><path d="M5 12.55a10.94 10.94 0 015.17-2.39"/><path d="M10.71 5.05A16 16 0 0122.56 9"/><path d="M1.42 9a15.91 15.91 0 014.7-2.88"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
        <span>Sin conexion a Internet</span>
      </div>
    }

    @if (errorService.isOnline() && !errorService.apiHealthy()) {
      <div class="status-banner status-banner--api-warning" role="status">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>El servidor API no esta disponible &mdash; algunos datos pueden no cargarse</span>
        <button class="retry-btn" (click)="errorService.recheckApi()" aria-label="Reintentar conexion con el servidor">Reintentar</button>
      </div>
    }

    <app-header [menuOpen]="sidebarOpen()" (menuToggle)="sidebarOpen.set(!sidebarOpen())" />

    <div class="layout-body">
      <app-sidebar [class.open]="sidebarOpen()" />

      @if (sidebarOpen()) {
        <div class="overlay" (click)="sidebarOpen.set(false)"
             role="presentation"></div>
      }

      <main class="app-main" id="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--color-forest);
      color: white;
      padding: 8px 16px;
      z-index: 100;
      transition: top 0.2s;
    }
    .skip-link:focus {
      top: 0;
      outline: 2px solid var(--color-forest);
      outline-offset: 2px;
    }
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    .layout-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .layout-body .app-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    @media (min-width: 1024px) {
      .layout-body .app-main {
        margin-left: 240px;
      }
    }

    /* Status banners */
    .status-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 6px 16px;
      font-size: 0.78rem;
      font-weight: 500;
      flex-shrink: 0;
      z-index: 60;
    }
    .status-banner--offline {
      background: #991B1B;
      color: white;
    }
    .status-banner--api-warning {
      background: #92400E;
      color: #FEF3C7;
    }
    .retry-btn {
      margin-left: 8px;
      padding: 2px 10px;
      font-size: 0.72rem;
      font-weight: 600;
      border: 1px solid #FEF3C7;
      border-radius: 4px;
      background: transparent;
      color: #FEF3C7;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .retry-btn:hover {
      background: #FEF3C7;
      color: #92400E;
    }
    .retry-btn:focus-visible {
      outline: 2px solid #FEF3C7;
      outline-offset: 2px;
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  sidebarOpen = signal(false);
  errorService = inject(ErrorHandlingService);

  private router = inject(Router);
  private analyticsService = inject(AnalyticsService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.analyticsService.trackPageView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
