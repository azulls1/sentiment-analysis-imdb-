import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state" role="status" aria-live="polite">
      <div class="loading-dots" aria-hidden="true" style="margin-bottom:12px;">
        <span></span><span></span><span></span>
      </div>
      <p class="empty-state__title">Cargando...</p>
    </div>
  `,
  styles: [],
})
export class LoadingSpinnerComponent {}
