import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <app-header (menuToggle)="sidebarOpen.set(!sidebarOpen())" />

    <div class="layout-body">
      <app-sidebar [class.open]="sidebarOpen()" />

      @if (sidebarOpen()) {
        <div class="overlay" (click)="sidebarOpen.set(false)"></div>
      }

      <main class="app-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
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
