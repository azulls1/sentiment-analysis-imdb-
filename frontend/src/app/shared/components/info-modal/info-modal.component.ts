import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

export interface ModalData {
  title: string;
  value: string;
  description: string;
  details: { label: string; value: string }[];
}

@Component({
  selector: 'app-info-modal',
  standalone: true,
  template: `
    @if (visible) {
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);"
        (click)="onOverlayClick($event)"
      >
        <!-- Panel -->
        <div
          class="bg-white rounded-2xl shadow-forest-lg w-full max-w-md animate-scaleIn"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'modal-title'"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 pt-6 pb-2">
            <h2
              id="modal-title"
              class="font-display"
              style="font-size:1rem;font-weight:600;color:var(--color-text-primary);margin:0;"
            >
              {{ data?.title }}
            </h2>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              style="color:var(--color-text-muted);"
              (click)="close()"
              aria-label="Cerrar"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Value highlight -->
          <div class="px-6 pb-2">
            <span
              class="font-display"
              style="font-size:2rem;font-weight:700;color:var(--color-forest, #04202C);"
            >
              {{ data?.value }}
            </span>
          </div>

          <!-- Description -->
          <div class="px-6 pb-4">
            <p style="margin:0;font-size:0.875rem;line-height:1.7;color:var(--color-text-secondary);">
              {{ data?.description }}
            </p>
          </div>

          <!-- Details table -->
          @if (data?.details?.length) {
            <div class="px-6 pb-6">
              <div style="border-top:1px solid var(--color-border, #e5e7eb);padding-top:16px;">
                @for (item of data!.details; track item.label) {
                  <div
                    class="flex items-center justify-between"
                    style="padding:8px 0;border-bottom:1px solid var(--color-border-subtle, #f3f4f6);"
                  >
                    <span style="font-size:0.8125rem;color:var(--color-text-muted);">{{ item.label }}</span>
                    <span style="font-size:0.8125rem;font-weight:600;color:var(--color-text-primary);">{{ item.value }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [],
})
export class InfoModalComponent {
  @Input() visible = false;
  @Input() data: ModalData | null = null;
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

  close() {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
