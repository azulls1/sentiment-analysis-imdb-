import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" style="position:fixed;display:flex;flex-direction:column;top:56px;height:calc(100vh - 56px);overflow-y:auto;">
      <nav style="flex:1;padding:16px 8px;" class="stagger-children">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
            class="sidebar-link animate-fadeIn"
          >
            <svg class="sidebar-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              @switch (item.icon) {
                @case ('dashboard') {
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                }
                @case ('dataset') {
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                }
                @case ('modelo') {
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                }
                @case ('articulo') {
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                }
                @case ('informe') {
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                }
                @case ('retos') {
                  <path d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.96l-6.93-12a2 2 0 00-3.5 0l-6.93 12A2 2 0 005.07 19z"/>
                }
                @case ('argilla') {
                  <path d="M4 4h16v16H4z" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/>
                }
                @case ('pipeline') {
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                }
                @case ('entregables') {
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                }
              }
            </svg>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div style="padding:14px 16px;border-top:1px solid var(--color-border-subtle);font-size:0.75rem;color:var(--color-text-muted);">
        <p style="margin:0;font-weight:500;color:var(--color-text-secondary);">Samael Hernández</p>
        <p style="margin:2px 0 0;font-size:0.65rem;">Marzo 2026</p>
      </div>
    </aside>
  `,
  styles: [`
    @media (min-width: 1024px) {
      .sidebar {
        transform: none !important;
      }
    }
  `],
})
export class SidebarComponent {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/dataset', label: 'Dataset', icon: 'dataset' },
    { path: '/modelo', label: 'Modelo', icon: 'modelo' },
    { path: '/articulo', label: 'Artículo', icon: 'articulo' },
    { path: '/retos', label: 'Retos TSA', icon: 'retos' },
    { path: '/argilla', label: 'Argilla', icon: 'argilla' },
    { path: '/pipeline', label: 'Pipeline NLP', icon: 'pipeline' },
    { path: '/informe', label: 'Informe', icon: 'informe' },
    { path: '/entregables', label: 'Entregables', icon: 'entregables' },
  ];
}
