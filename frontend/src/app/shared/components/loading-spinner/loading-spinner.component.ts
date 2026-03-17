import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="loading-dots" style="margin-bottom:12px;">
        <span></span><span></span><span></span>
      </div>
      <p class="empty-state__title">Cargando...</p>
    </div>
  `,
  styles: [],
})
export class LoadingSpinnerComponent {}
