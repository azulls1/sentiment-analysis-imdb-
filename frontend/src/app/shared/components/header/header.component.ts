import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="navbar" style="flex-shrink:0;z-index:50;width:100%;">
      <div class="navbar-inner">
        <!-- Izquierda: hamburguesa (móvil) + branding -->
        <div style="display:flex;align-items:center;gap:12px;">
          <button class="menu-toggle" (click)="menuToggle.emit()" aria-label="Abrir menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <a routerLink="/dashboard" style="text-decoration:none;display:flex;align-items:baseline;gap:8px;">
            <span class="font-display" style="font-size:15px;font-weight:700;color:var(--color-text-primary);">
              PLN — UNIR
            </span>
            <span class="hide-mobile" style="font-size:12px;color:var(--color-text-muted);">
              Análisis de Sentimientos
            </span>
          </a>
        </div>

        <!-- Derecha -->
        <div style="display:flex;align-items:center;gap:10px;">
          <a routerLink="/entregables" class="btn btn-ghost hide-mobile" style="font-size:12px;gap:4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar ZIP
          </a>

          <div class="divider-subtle hide-mobile" style="width:1px;height:24px;margin:0;"></div>

          <div style="width:30px;height:30px;border-radius:9999px;background:var(--color-text-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;font-family:'Sora',sans-serif;cursor:default;" title="Samael Hernández">
            SH
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [],
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();
}
