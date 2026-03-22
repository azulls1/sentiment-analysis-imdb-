import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:flex;' },
  template: `
    <div
      class="card-stat hover-lift"
      style="display:flex;flex-direction:column;width:100%;cursor:pointer;"
      [attr.role]="clickable ? 'button' : null"
      [attr.tabindex]="clickable ? 0 : null"
      [attr.aria-label]="clickable ? label + ': ' + value : null"
      (click)="onClick()"
      (keydown.enter)="onClick()"
    >
      <div class="card-stat__label">{{ label }}</div>
      <div class="card-stat__value font-display" style="flex:1;display:flex;align-items:center;">{{ value }}</div>
      <div class="card-stat__desc" style="min-height:1.2em;">{{ subtitle }}</div>
    </div>
  `,
  styles: [`
    .card-stat:focus-visible {
      outline: 2px solid var(--color-forest, #04202C);
      outline-offset: 2px;
    }
  `],
})
export class MetricCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() subtitle = '';
  @Input() clickable = false;
  @Output() cardClick = new EventEmitter<void>();

  onClick() {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }
}
