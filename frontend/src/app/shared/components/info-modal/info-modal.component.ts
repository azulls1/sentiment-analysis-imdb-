import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

export interface ModalData {
  title: string;
  value: string;
  description: string;
  details: { label: string; value: string }[];
}

@Component({
  selector: 'app-info-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible) {
      <!-- Overlay -->
      <div
        class="info-modal-overlay"
        (click)="onOverlayClick($event)"
      >
        <!-- Panel -->
        <div
          class="info-modal-panel animate-scaleIn"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'modal-title'"
          aria-describedby="modal-description"
        >
          <!-- Header -->
          <div class="info-modal-header">
            <h2
              id="modal-title"
              class="font-display"
              style="font-size:1rem;font-weight:600;color:var(--color-text-primary);margin:0;"
            >
              {{ data?.title }}
            </h2>
            <button
              #closeBtn
              class="info-modal-close-btn"
              (click)="close()"
              aria-label="Cerrar"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Value highlight -->
          <div style="padding:0 24px 8px;">
            <span
              class="font-display"
              style="font-size:2rem;font-weight:700;color:var(--color-forest, #04202C);"
            >
              {{ data?.value }}
            </span>
          </div>

          <!-- Description -->
          <div style="padding:0 24px 16px;">
            <p id="modal-description" style="margin:0;font-size:0.875rem;line-height:1.7;color:var(--color-text-secondary);">
              {{ data?.description }}
            </p>
          </div>

          <!-- Details table -->
          @if (data?.details?.length) {
            <div style="padding:0 24px 24px;">
              <div style="border-top:1px solid var(--color-border, #e5e7eb);padding-top:16px;">
                @for (item of data!.details; track item.label) {
                  <div
                    style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--color-border-subtle, #f3f4f6);"
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
  styles: [`
    .info-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
    }
    .info-modal-panel {
      background: var(--color-bg-card, #fff);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      width: 100%;
      max-width: 28rem;
      max-height: 85vh;
      overflow-y: auto;
    }
    .info-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 8px;
    }
    .info-modal-close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: background 0.15s;
    }
    .info-modal-close-btn:hover {
      background: var(--color-bg-muted, #f3f4f6);
    }
    .info-modal-close-btn:focus-visible {
      outline: 2px solid var(--color-forest, #04202C);
      outline-offset: 2px;
    }
    @media (max-width: 480px) {
      .info-modal-panel {
        max-height: 75vh;
        border-radius: 12px;
      }
      .info-modal-overlay {
        padding: 12px;
        align-items: flex-end;
      }
    }
  `],
})
export class InfoModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() data: ModalData | null = null;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;

  private previouslyFocused: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']) {
      if (this.visible) {
        this.previouslyFocused = document.activeElement as HTMLElement;
        // Focus the close button after the view renders
        setTimeout(() => this.closeBtn?.nativeElement?.focus(), 0);
      } else if (this.previouslyFocused) {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    }
  }

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
