import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>
    <app-header [menuOpen]="sidebarOpen()" (menuToggle)="sidebarOpen.set(!sidebarOpen())" />

    <div class="layout-body">
      <app-sidebar [class.open]="sidebarOpen()" />

      @if (sidebarOpen()) {
        <div class="overlay" (click)="sidebarOpen.set(false)"></div>
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
  `],
})
export class AppComponent {
  sidebarOpen = signal(false);
}
