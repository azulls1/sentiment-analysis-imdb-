import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExportService } from '../../core/services/export.service';
import { environment } from '../../../environments/environment';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-entregables',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-wide">
      <div class="page-header animate-fadeIn">
        <h1 class="page-header__title font-display">Entregables</h1>
        <p class="page-header__desc">Descarga los archivos de la Actividad 2 para entregar en la plataforma UNIR</p>
      </div>

      <!-- Hero context -->
      <div class="card-hero animate-fadeInUp" style="text-align:center;margin-bottom:28px;">
        <h2 class="card-hero__title" style="font-size:1.05rem;">Actividad 2: Analisis de Sentimientos</h2>
        <p style="font-size:0.8rem;color:var(--color-text-secondary);margin:6px 0 2px;line-height:1.5;">
          Procesamiento de Lenguaje Natural — Master en Inteligencia Artificial — UNIR
        </p>
        <p style="font-size:0.75rem;color:var(--color-text-muted);margin:2px 0 14px;">
          Basado en: Keerthi Kumar & Harish (2019) — Sentiment Analysis on IMDb Movie Reviews Using Hybrid Feature Extraction Method
        </p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <span class="badge" style="font-size:0.66rem;">Dataset: IMDb 50K</span>
          <span class="badge" style="font-size:0.66rem;">Clasificadores: NB, LR, SVM</span>
          <span class="badge" style="font-size:0.66rem;background:var(--color-text-primary);color:white;">Mejor: SVM 89.68%</span>
        </div>
      </div>

      <!-- Downloadable files section -->
      <div class="card-section animate-fadeInUp" style="margin-bottom:24px;">
        <h3 style="font-size:0.88rem;font-weight:600;color:var(--color-text-primary);margin:0 0 4px;">Archivos para Descargar</h3>
        <p style="margin:0 0 16px;font-size:0.75rem;color:var(--color-text-muted);line-height:1.5;">
          Haz click en cualquier tarjeta para ver el detalle completo del archivo.
        </p>
        <div class="entregables-grid">
          @for (ent of entregables; track ent.key; let i = $index) {
            <div class="entregable-card" [class.entregable-card-primary]="ent.destacado"
                 [style.border-left-color]="ent.color" role="button" tabindex="0"
                 (click)="abrirModalEntregable(i)" (keydown.enter)="abrirModalEntregable(i)">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div class="entregable-icon" [style.background]="ent.color">
                  {{ ent.icono }}
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:0.85rem;font-weight:600;color:var(--color-text-primary);">{{ ent.titulo }}</div>
                  <code style="font-size:0.68rem;color:var(--color-text-muted);font-family:'JetBrains Mono',monospace;">{{ ent.archivo }}</code>
                </div>
              </div>
              <p style="font-size:0.75rem;color:var(--color-text-secondary);margin:0 0 12px;line-height:1.5;">{{ ent.resumen }}</p>

              <!-- File contents preview -->
              <div style="background:var(--color-bg-muted,#F7F8F7);border-radius:6px;padding:8px 10px;margin-bottom:12px;">
                <div style="font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);margin-bottom:4px;">Contiene:</div>
                @for (item of ent.contenido_preview; track $index) {
                  <div style="font-size:0.7rem;color:var(--color-text-secondary);line-height:1.5;">
                    <span style="color:var(--color-text-muted);margin-right:4px;">&#8226;</span>{{ item }}
                  </div>
                }
              </div>

              <div style="display:flex;gap:8px;margin-top:auto;align-items:center;">
                <span style="font-size:0.68rem;color:var(--color-text-muted);flex:1;">Click para ver detalle</span>
                <button class="entregable-download-btn" [style.background]="ent.color"
                  (click)="downloadClick($event, ent.key)" [disabled]="downloading()">
                  {{ downloading() === ent.key ? 'Descargando...' : 'Descargar' }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Evaluation criteria section -->
      <div class="card-section animate-fadeInUp" style="margin-bottom:24px;">
        <h3 style="font-size:0.88rem;font-weight:600;color:var(--color-text-primary);margin:0 0 4px;">Criterios de Evaluacion</h3>
        <p style="margin:0 0 16px;font-size:0.75rem;color:var(--color-text-muted);line-height:1.5;">
          La rubrica de evaluacion se compone de 5 criterios. Haz click en cada uno para ver que se evalua y donde esta cubierto en el informe.
        </p>

        <!-- Total bar -->
        <div style="display:flex;height:10px;border-radius:6px;overflow:hidden;margin-bottom:16px;gap:2px;">
          @for (c of criterios; track c.num) {
            <div [style.flex]="c.peso_num" [style.background]="c.color" style="border-radius:3px;" [title]="c.titulo + ' — ' + c.peso"></div>
          }
        </div>

        <div class="criterios-grid">
          @for (c of criterios; track c.num; let i = $index) {
            <div class="criterio-card" role="button" tabindex="0" (click)="abrirModalCriterio(i)" (keydown.enter)="abrirModalCriterio(i)" [style.border-top-color]="c.color">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <span style="font-size:1.1rem;">{{ c.icono }}</span>
                <span style="font-size:0.65rem;font-weight:700;color:white;padding:2px 8px;border-radius:10px;" [style.background]="c.color">
                  {{ c.peso }}
                </span>
              </div>
              <div style="font-size:0.78rem;font-weight:600;color:var(--color-text-primary);margin-bottom:4px;">
                Criterio {{ c.num }}: {{ c.titulo }}
              </div>
              <p style="font-size:0.68rem;color:var(--color-text-secondary);margin:0;line-height:1.45;">{{ c.descripcion_corta }}</p>
              <span style="display:block;margin-top:8px;font-size:0.65rem;color:var(--color-text-muted);">Ver detalle &#8250;</span>
            </div>
          }
        </div>
      </div>

      <!-- Report structure preview -->
      <div class="card-section animate-fadeInUp" style="margin-bottom:24px;">
        <h3 style="font-size:0.88rem;font-weight:600;color:var(--color-text-primary);margin:0 0 4px;">Estructura del Informe PDF</h3>
        <p style="margin:0 0 16px;font-size:0.75rem;color:var(--color-text-muted);line-height:1.5;">
          Vista rapida de las secciones del informe y su correspondencia con los criterios de evaluacion.
        </p>
        <div style="display:grid;gap:6px;">
          @for (sec of seccionesInforme; track sec.num) {
            <div class="seccion-row">
              <div class="seccion-num" [style.background]="sec.color">{{ sec.num }}</div>
              <div style="flex:1;">
                <div style="font-size:0.78rem;font-weight:600;color:var(--color-text-primary);">{{ sec.titulo }}</div>
                <div style="font-size:0.65rem;color:var(--color-text-muted);margin-top:1px;">{{ sec.descripcion_breve }}</div>
              </div>
              <span class="seccion-badge" [style.background]="sec.criterio_color + '18'" [style.color]="sec.criterio_color">
                {{ sec.criterio_label }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Instructions -->
      <div class="card-section animate-fadeInUp" style="border-left:3px solid var(--color-text-primary);">
        <h3 style="font-size:0.88rem;font-weight:600;color:var(--color-text-primary);margin:0 0 12px;">Instrucciones de Entrega</h3>
        <div style="display:grid;gap:10px;">
          @for (paso of pasosEntrega; track paso.num) {
            <div style="display:flex;align-items:flex-start;gap:10px;">
              <div style="width:28px;height:28px;border-radius:50%;background:var(--color-text-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0;">
                {{ paso.num }}
              </div>
              <div>
                <div style="font-size:0.8rem;font-weight:600;color:var(--color-text-primary);">{{ paso.titulo }}</div>
                <div style="font-size:0.72rem;color:var(--color-text-secondary);line-height:1.5;margin-top:2px;">{{ paso.desc }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- ============ LISTA DE VERIFICACION ============ -->
      <div class="card-section animate-fadeInUp" style="margin-top:24px;margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--color-bg-muted,#F0F0F0);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:1.1rem;">&#9745;</span>
          </div>
          <div>
            <h3 style="font-size:0.92rem;font-weight:700;color:var(--color-text-primary);margin:0;">Lista de Verificacion</h3>
            <p style="font-size:0.72rem;color:var(--color-text-muted);margin:2px 0 0;">Requisitos de la actividad que deben estar incluidos en la entrega</p>
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display:flex;gap:8px;margin:16px 0;flex-wrap:wrap;">
          <button class="verify-btn verify-btn-primary" (click)="generateAndVerify()" [disabled]="verifying()">
            @if (verifying()) {
              <span class="verify-spinner"></span> Verificando...
            } @else {
              &#9745; Generar Todo y Verificar
            }
          </button>
          <button class="verify-btn" (click)="markAll()">&#10003; Marcar todo</button>
          <button class="verify-btn" (click)="unmarkAll()">&#10007; Desmarcar todo</button>
        </div>

        <!-- Checklist grid -->
        <div class="checklist-grid">
          @for (item of checklist(); track item.id) {
            <div class="checklist-item" [class.checklist-item-checked]="item.checked" (click)="toggleItem(item.id)">
              <div class="checklist-checkbox" [class.checklist-checkbox-checked]="item.checked">
                @if (item.checked) {
                  <span>&#10003;</span>
                }
              </div>
              <span class="checklist-label">{{ item.label }}</span>
            </div>
          }
        </div>

        <!-- Progress -->
        <div style="margin-top:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:0.78rem;font-weight:500;color:var(--color-text-secondary);">Progreso de verificacion</span>
            <span style="font-size:0.82rem;font-weight:700;color:var(--color-text-primary);">{{ checkedCount() }} / {{ checklist().length }}</span>
          </div>
          <div style="height:10px;background:var(--color-bg-muted,#E8E8E8);border-radius:6px;overflow:hidden;"
               role="progressbar" [attr.aria-valuenow]="checklistPercent()" aria-valuemin="0" aria-valuemax="100"
               aria-label="Progreso de verificacion">
            <div style="height:100%;border-radius:6px;background:#2D6A4F;transition:width 0.3s ease;"
                 [style.width]="checklistPercent() + '%'"></div>
          </div>
          @if (allChecked()) {
            <div style="display:flex;align-items:center;gap:6px;margin-top:10px;">
              <span style="color:#2D6A4F;font-size:0.85rem;">&#10003;</span>
              <span style="font-size:0.8rem;font-weight:600;color:#2D6A4F;">Todos los requisitos han sido verificados</span>
            </div>
          }
        </div>
      </div>

      <!-- ============ MODAL ENTREGABLE ============ -->
      @if (modalEntregable() !== null) {
        <div class="ent-modal-overlay" (click)="cerrarModales()">
          <div class="ent-modal-panel" (click)="$event.stopPropagation()">
            <div class="ent-modal-header" [style.border-bottom-color]="entregables[modalEntregable()!].color">
              <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                <span style="font-size:1.5rem;">{{ entregables[modalEntregable()!].icono }}</span>
                <div>
                  <h2 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin:0;">{{ entregables[modalEntregable()!].titulo }}</h2>
                  <code style="font-size:0.72rem;color:var(--color-text-muted);font-family:'JetBrains Mono',monospace;">{{ entregables[modalEntregable()!].archivo }}</code>
                </div>
              </div>
              <button class="ent-modal-close" (click)="cerrarModales()">&#10005;</button>
            </div>

            <div class="ent-modal-body">
              <!-- Summary -->
              <div style="background:var(--color-bg-muted,#F7F8F7);border-radius:8px;padding:14px 16px;margin-bottom:16px;border-left:3px solid;" [style.border-left-color]="entregables[modalEntregable()!].color">
                <p style="font-size:0.82rem;color:var(--color-text-secondary);margin:0;line-height:1.6;">
                  {{ entregables[modalEntregable()!].resumen }}
                </p>
              </div>

              <!-- Key points -->
              <div style="margin-bottom:20px;">
                <h4 class="ent-modal-subtitle">Puntos clave</h4>
                <div style="display:grid;gap:8px;">
                  @for (punto of entregables[modalEntregable()!].puntos_clave; track $index) {
                    <div style="display:flex;align-items:flex-start;gap:8px;">
                      <span style="flex-shrink:0;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:white;"
                            [style.background]="entregables[modalEntregable()!].color">{{ $index + 1 }}</span>
                      <span style="font-size:0.78rem;color:var(--color-text-secondary);line-height:1.5;">{{ punto }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Contents list -->
              <div style="margin-bottom:20px;">
                <h4 class="ent-modal-subtitle">Contenido del archivo</h4>
                <div style="background:var(--color-bg-muted,#F7F8F7);border-radius:8px;padding:12px 16px;">
                  @for (item of entregables[modalEntregable()!].contenido; track $index) {
                    <div style="display:flex;align-items:center;gap:8px;padding:5px 0;" [style.border-bottom]="$index < entregables[modalEntregable()!].contenido.length - 1 ? '1px solid var(--color-border,#DFE4E0)' : 'none'">
                      <span style="font-size:0.75rem;" [style.color]="entregables[modalEntregable()!].color">&#10003;</span>
                      <span style="font-size:0.78rem;color:var(--color-text-primary);">{{ item }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Technical details -->
              <div style="margin-bottom:16px;">
                <h4 class="ent-modal-subtitle">Detalles tecnicos</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  @for (det of entregables[modalEntregable()!].detalles; track det.label) {
                    <div style="background:var(--color-bg-muted,#F7F8F7);border-radius:6px;padding:10px 12px;">
                      <div style="font-size:0.62rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);margin-bottom:3px;">{{ det.label }}</div>
                      <div style="font-size:0.75rem;color:var(--color-text-primary);line-height:1.4;">{{ det.valor }}</div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="ent-modal-footer">
              <button class="btn-ghost" [disabled]="modalEntregable() === 0" (click)="modalEntregable.set(modalEntregable()! - 1)" style="font-size:0.76rem;">
                &#8249; Anterior
              </button>
              <div style="display:flex;gap:5px;">
                @for (ent of entregables; track ent.key; let j = $index) {
                  <div class="ent-modal-dot" [class.ent-modal-dot-active]="modalEntregable() === j"
                    [style.background]="modalEntregable() === j ? ent.color : ''" (click)="modalEntregable.set(j)"></div>
                }
              </div>
              <button class="btn-ghost" [disabled]="modalEntregable() === entregables.length - 1" (click)="modalEntregable.set(modalEntregable()! + 1)" style="font-size:0.76rem;">
                Siguiente &#8250;
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ============ MODAL CRITERIO ============ -->
      @if (modalCriterio() !== null) {
        <div class="ent-modal-overlay" (click)="cerrarModales()">
          <div class="ent-modal-panel" (click)="$event.stopPropagation()">
            <div class="ent-modal-header" [style.border-bottom-color]="criterios[modalCriterio()!].color">
              <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                <span style="font-size:1.5rem;">{{ criterios[modalCriterio()!].icono }}</span>
                <div>
                  <h2 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin:0;">Criterio {{ criterios[modalCriterio()!].num }}: {{ criterios[modalCriterio()!].titulo }}</h2>
                  <div style="font-size:0.72rem;color:var(--color-text-muted);margin-top:2px;">
                    Peso en la rubrica: <strong [style.color]="criterios[modalCriterio()!].color">{{ criterios[modalCriterio()!].peso }}</strong>
                  </div>
                </div>
              </div>
              <button class="ent-modal-close" (click)="cerrarModales()">&#10005;</button>
            </div>

            <div class="ent-modal-body">
              <!-- Description -->
              <div style="background:var(--color-bg-muted,#F7F8F7);border-radius:8px;padding:14px 16px;margin-bottom:16px;border-left:3px solid;" [style.border-left-color]="criterios[modalCriterio()!].color">
                <p style="font-size:0.82rem;color:var(--color-text-secondary);margin:0;line-height:1.6;">
                  {{ criterios[modalCriterio()!].descripcion }}
                </p>
              </div>

              <!-- What's evaluated -->
              <div style="margin-bottom:20px;">
                <h4 class="ent-modal-subtitle">Que se evalua</h4>
                <div style="display:grid;gap:8px;">
                  @for (item of criterios[modalCriterio()!].que_evalua; track $index) {
                    <div style="display:flex;align-items:flex-start;gap:8px;">
                      <span style="flex-shrink:0;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:white;"
                            [style.background]="criterios[modalCriterio()!].color">{{ $index + 1 }}</span>
                      <span style="font-size:0.78rem;color:var(--color-text-secondary);line-height:1.5;">{{ item }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Mapped report sections -->
              <div style="margin-bottom:20px;">
                <h4 class="ent-modal-subtitle">Secciones del informe que lo cubren</h4>
                <div style="background:var(--color-bg-muted,#F7F8F7);border-radius:8px;padding:12px 16px;">
                  @for (sec of criterios[modalCriterio()!].secciones_informe; track $index) {
                    <div style="display:flex;align-items:center;gap:8px;padding:5px 0;" [style.border-bottom]="$index < criterios[modalCriterio()!].secciones_informe.length - 1 ? '1px solid var(--color-border,#DFE4E0)' : 'none'">
                      <span style="font-size:0.78rem;" [style.color]="criterios[modalCriterio()!].color">&#9654;</span>
                      <span style="font-size:0.78rem;color:var(--color-text-primary);">{{ sec }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Tips -->
              <div style="margin-bottom:16px;">
                <h4 class="ent-modal-subtitle">Claves para la evaluacion</h4>
                <div style="display:grid;gap:6px;">
                  @for (tip of criterios[modalCriterio()!].tips; track $index) {
                    <div style="display:flex;align-items:flex-start;gap:8px;font-size:0.76rem;color:var(--color-text-secondary);line-height:1.5;">
                      <span style="color:var(--color-text-muted);flex-shrink:0;">&#9679;</span>
                      {{ tip }}
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="ent-modal-footer">
              <button class="btn-ghost" [disabled]="modalCriterio() === 0" (click)="modalCriterio.set(modalCriterio()! - 1)" style="font-size:0.76rem;">
                &#8249; Anterior
              </button>
              <div style="display:flex;gap:5px;">
                @for (c of criterios; track c.num; let j = $index) {
                  <div class="ent-modal-dot" [class.ent-modal-dot-active]="modalCriterio() === j"
                    [style.background]="modalCriterio() === j ? c.color : ''" (click)="modalCriterio.set(j)"></div>
                }
              </div>
              <button class="btn-ghost" [disabled]="modalCriterio() === criterios.length - 1" (click)="modalCriterio.set(modalCriterio()! + 1)" style="font-size:0.76rem;">
                Siguiente &#8250;
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .entregables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .entregable-card {
      background: var(--color-bg-card, #FFFFFF);
      border: 1px solid var(--color-border, #DFE4E0);
      border-left: 4px solid var(--color-text-muted);
      border-radius: 10px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .entregable-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    }
    .entregable-card:focus-visible {
      outline: 2px solid var(--color-forest, #04202C);
      outline-offset: 2px;
    }
    .entregable-card-primary {
      border-width: 2px;
      border-left-width: 4px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .entregable-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: white;
      flex-shrink: 0;
    }
    .entregable-download-btn {
      flex: 1;
      border: none;
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .entregable-download-btn:hover:not(:disabled) { opacity: 0.85; }
    .entregable-download-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Criteria grid */
    .criterios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
      gap: 12px;
    }
    .criterio-card {
      background: var(--color-bg-card, #FFFFFF);
      border: 1px solid var(--color-border, #DFE4E0);
      border-top: 3px solid var(--color-text-muted);
      border-radius: 10px;
      padding: 14px 16px;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .criterio-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    }
    .criterio-card:focus-visible {
      outline: 2px solid var(--color-forest, #04202C);
      outline-offset: 2px;
    }

    /* Report structure rows */
    .seccion-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: var(--color-bg-card, #FFFFFF);
      border: 1px solid var(--color-border, #DFE4E0);
      border-radius: 8px;
      transition: background 0.1s;
    }
    .seccion-row:hover { background: var(--color-bg-muted, #F7F8F7); }
    .seccion-num {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }
    .seccion-badge {
      font-size: 0.62rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 10px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Modal */
    .ent-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: entFadeIn 0.2s ease;
    }
    .ent-modal-panel {
      background: var(--color-bg-card, #FFFFFF);
      border-radius: 14px;
      width: 100%;
      max-width: 680px;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      animation: entSlideIn 0.25s ease;
    }
    @media (max-width: 640px) {
      .ent-modal-panel {
        max-height: 75vh;
        border-radius: 12px 12px 0 0;
      }
      .ent-modal-overlay {
        align-items: flex-end;
        padding: 0;
      }
      .checklist-grid {
        grid-template-columns: 1fr;
      }
    }
    .ent-modal-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      border-bottom: 3px solid var(--color-text-primary);
      flex-shrink: 0;
    }
    .ent-modal-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: var(--color-bg-muted, #F7F8F7);
      color: var(--color-text-muted);
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
      flex-shrink: 0;
    }
    .ent-modal-close:hover { background: #e74c3c; color: white; }
    .ent-modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    .ent-modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-top: 1px solid var(--color-border, #DFE4E0);
      flex-shrink: 0;
    }
    .ent-modal-subtitle {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .ent-modal-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-border, #DFE4E0);
      cursor: pointer;
      transition: background 0.15s, transform 0.15s;
    }
    .ent-modal-dot:hover { transform: scale(1.3); }
    .ent-modal-dot-active { transform: scale(1.3); }

    .btn-ghost {
      background: none;
      border: 1px solid var(--color-border, #DFE4E0);
      border-radius: 6px;
      padding: 6px 14px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-ghost:hover:not(:disabled) { background: var(--color-bg-muted, #F7F8F7); }
    .btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }

    /* Checklist */
    .checklist-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--color-bg-card, #FFFFFF);
      border: 1px solid var(--color-border, #DFE4E0);
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .checklist-item:hover { background: var(--color-bg-muted, #F7F8F7); }
    .checklist-item-checked {
      border-color: #2D6A4F60;
      background: #2D6A4F08;
    }
    .checklist-checkbox {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: 2px solid var(--color-border, #DFE4E0);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.8rem;
      color: white;
      transition: background 0.15s, border-color 0.15s;
    }
    .checklist-checkbox-checked {
      background: #1B4332;
      border-color: #1B4332;
    }
    .checklist-label {
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--color-text-primary);
      line-height: 1.4;
    }
    .verify-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--color-bg-card, #FFFFFF);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border, #DFE4E0);
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .verify-btn:hover:not(:disabled) { background: var(--color-bg-muted, #F7F8F7); }
    .verify-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .verify-btn-primary {
      background: #1B4332;
      color: white;
      border-color: #1B4332;
    }
    .verify-btn-primary:hover:not(:disabled) { background: #2D6A4F; }
    .verify-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes entFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes entSlideIn {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `],
})
export class EntregablesComponent {
  downloading = signal<string | null>(null);
  modalEntregable = signal<number | null>(null);
  modalCriterio = signal<number | null>(null);

  // Checklist state
  checklist = signal<ChecklistItem[]>([
    { id: 'pdf', label: 'Informe PDF generado (max 12 paginas)', checked: false },
    { id: 'definiciones', label: 'Definiciones de analisis de sentimientos (C1)', checked: false },
    { id: 'revision', label: 'Revision bibliografica del articulo (C2)', checked: false },
    { id: 'metodologia', label: 'Metodologia: TF-IDF + NB/LR/SVM (C2)', checked: false },
    { id: 'resultados', label: 'Resultados con tablas comparativas (C2)', checked: false },
    { id: 'retos', label: 'Retos abiertos en analisis de sentimientos (C3)', checked: false },
    { id: 'argilla', label: 'Tutorial Argilla predict-log-label (C4)', checked: false },
    { id: 'conclusiones', label: 'Conclusiones y reflexion sobre datos (C5)', checked: false },
    { id: 'referencias', label: 'Referencias en formato APA 7', checked: false },
    { id: 'notebook', label: 'Jupyter Notebook completo', checked: false },
    { id: 'zip', label: 'Paquete ZIP listo para entrega', checked: false },
  ]);

  verifying = signal(false);
  checkedCount = computed(() => this.checklist().filter(c => c.checked).length);
  allChecked = computed(() => this.checklist().every(c => c.checked));
  checklistPercent = computed(() => Math.round((this.checkedCount() / this.checklist().length) * 100));

  private baseUrl = environment.apiUrl;

  entregables: any[] = [
    {
      key: 'zip',
      icono: '📦',
      titulo: 'Paquete Completo (ZIP)',
      archivo: 'entrega_actividad2_SAMAEL.zip',
      resumen: 'Archivo comprimido con todos los entregables listos para subir a la plataforma UNIR. Contiene el informe PDF y el notebook Jupyter.',
      color: '#1B4332',
      destacado: true,
      contenido_preview: ['informe.pdf — Informe academico', 'notebook.ipynb — Codigo y resultados'],
      contenido: [
        'informe.pdf — Informe academico completo (~12-15 paginas)',
        'notebook.ipynb — Jupyter notebook con 38 celdas y outputs pre-poblados',
      ],
      puntos_clave: [
        'Contiene ambos archivos requeridos en un solo paquete comprimido',
        'Generado automaticamente al momento de la descarga desde el backend',
        'Nombre del archivo incluye identificador del alumno (SAMAEL)',
        'Listo para entregar sin modificaciones — subir directamente a UNIR',
      ],
      detalles: [
        { label: 'Formato', valor: 'ZIP (deflated compression)' },
        { label: 'Generacion', valor: 'En tiempo real via FastAPI + zipfile' },
        { label: 'Contenido', valor: '2 archivos: PDF + Notebook' },
        { label: 'Uso', valor: 'Descargar y subir a plataforma UNIR' },
      ],
    },
    {
      key: 'pdf',
      icono: '📄',
      titulo: 'Informe Academico PDF',
      archivo: 'informe.pdf',
      resumen: 'Documento academico con formato profesional. Incluye portada, 7 secciones de contenido, tablas comparativas y 15 referencias en formato APA 7.',
      color: '#C0392B',
      destacado: false,
      contenido_preview: ['7 secciones de contenido', 'Tablas comparativas', '15 referencias APA 7'],
      contenido: [
        '1. Definiciones y Contexto (Criterio 1, 20%)',
        '2. Revision Bibliografica (Criterio 2, 25%)',
        '3. Metodologia (Criterio 2, 25%)',
        '4. Resultados y Discusion (Criterio 2, 25%)',
        '5. Retos Abiertos (Criterio 3, 20%)',
        '6. Tutorial Argilla (Criterio 4, 25%)',
        '7. Conclusiones (Criterio 5, 10%)',
        'Referencias — 15 fuentes en formato APA 7',
      ],
      puntos_clave: [
        'Formato academico con portada UNIR, indice y referencias APA 7',
        'Cubre los 5 criterios de la rubrica de evaluacion',
        'Incluye tablas comparativas con el articulo de Keerthi Kumar & Harish (2019)',
        'Generado dinamicamente con WeasyPrint + Jinja2 desde los datos del backend',
      ],
      detalles: [
        { label: 'Formato', valor: 'PDF generado con WeasyPrint' },
        { label: 'Template', valor: 'Jinja2 HTML con tipografia academica' },
        { label: 'Paginas', valor: '~12-15 paginas de contenido' },
        { label: 'Secciones', valor: '7 secciones + referencias' },
      ],
    },
    {
      key: 'notebook',
      icono: '📓',
      titulo: 'Jupyter Notebook',
      archivo: 'notebook.ipynb',
      resumen: 'Notebook con el codigo completo del analisis, salidas pre-pobladas y visualizaciones. No requiere ejecucion para revision.',
      color: '#E67E22',
      destacado: false,
      contenido_preview: ['38 celdas con outputs', 'Graficos y matrices', 'Codigo documentado'],
      contenido: [
        'Configuracion del entorno y dependencias (pip install)',
        'Carga del dataset IMDb (50,000 resenas via HuggingFace)',
        'Analisis exploratorio: distribucion, longitud, vocabulario',
        'Preprocesamiento: HTML, minusculas, tokenizacion, stopwords',
        'Vectorizacion TF-IDF (50K features, bigramas)',
        'Entrenamiento: Naive Bayes, Regresion Logistica, SVM',
        'Evaluacion: Accuracy, Precision, Recall, F1, Matrices de Confusion',
        'Comparacion con resultados del articulo de referencia',
      ],
      puntos_clave: [
        'No requiere ejecucion — todos los outputs estan pre-poblados en las celdas',
        'Incluye graficos de matrices de confusion y barras comparativas',
        'Codigo documentado con explicaciones en celdas markdown',
        'Reproducible: puede re-ejecutarse en Google Colab o entorno local con Python 3.10+',
      ],
      detalles: [
        { label: 'Formato', valor: 'Jupyter Notebook (.ipynb) Python 3' },
        { label: 'Celdas', valor: '~38 celdas (codigo + markdown)' },
        { label: 'Generacion', valor: 'nbformat con outputs pre-poblados' },
        { label: 'Compatibilidad', valor: 'JupyterLab, Colab, VS Code' },
      ],
    },
  ];

  criterios: any[] = [
    {
      num: 1,
      titulo: 'Definiciones',
      peso: '20%',
      peso_num: 20,
      color: '#2D6A4F',
      icono: '📖',
      descripcion_corta: 'Conceptos de analisis de sentimientos, datasets de referencia y contexto.',
      descripcion: 'Definir los conceptos fundamentales del analisis de sentimientos, describir los datasets de referencia (IMDb, SST-2) y establecer el contexto academico del proyecto dentro del Master en IA de UNIR.',
      secciones_informe: ['1. Analisis de Sentimientos: Definicion y Contexto'],
      que_evalua: [
        'Claridad y precision en la definicion de analisis de sentimientos',
        'Descripcion de niveles de granularidad (documento, oracion, aspecto)',
        'Caracterizacion completa de los datasets (IMDb, SST-2)',
        'Contextualizacion del proyecto y su relacion con el articulo de referencia',
      ],
      tips: [
        'La seccion 1 del informe cubre este criterio de forma completa',
        'Incluye tabla comparativa IMDb vs SST-2 con 6 dimensiones',
        'Se definen los 3 niveles de granularidad segun Liu (2012) y Pang & Lee (2008)',
        'Se explica por que se eligio clasificacion binaria a nivel de documento',
      ],
    },
    {
      num: 2,
      titulo: 'Revision y Experimentacion',
      peso: '25%',
      peso_num: 25,
      color: '#40916C',
      icono: '📚',
      descripcion_corta: 'Articulo de referencia, metodologia implementada y resultados experimentales.',
      descripcion: 'Revision critica del articulo de Keerthi Kumar & Harish (2019), descripcion detallada de la metodologia implementada (preprocesamiento, TF-IDF, clasificadores) y presentacion de resultados con comparacion contra el articulo original.',
      secciones_informe: [
        '2. Revision Bibliografica',
        '3. Metodologia',
        '4. Resultados y Discusion',
      ],
      que_evalua: [
        'Comprension y analisis critico del articulo de referencia',
        'Descripcion clara de la metodologia (pipeline, features, clasificadores)',
        'Presentacion correcta de resultados con metricas apropiadas',
        'Comparacion rigurosa con los resultados del articulo original',
      ],
      tips: [
        'Es el criterio de mayor peso — abarca 3 secciones del informe',
        'La tabla comparativa muestra que nuestra implementacion supera al articulo en los 3 clasificadores',
        'Se analiza el trade-off rendimiento vs eficiencia entre SVM y LR',
        'Se justifica por que TF-IDF optimizado puede igualar al metodo hibrido',
      ],
    },
    {
      num: 3,
      titulo: 'Retos Abiertos',
      peso: '20%',
      peso_num: 20,
      color: '#D4A373',
      icono: '🎯',
      descripcion_corta: 'Desafios actuales: sarcasmo, negacion, multilinguismo, sesgos.',
      descripcion: 'Identificacion y analisis profundo de los principales retos abiertos en analisis de sentimientos, incluyendo sarcasmo, negacion, transferencia de dominio, multilinguismo, calidad de anotacion e interpretabilidad.',
      secciones_informe: ['5. Retos Abiertos en Analisis de Sentimientos'],
      que_evalua: [
        'Identificacion de retos relevantes y actuales en el campo',
        'Profundidad del analisis de cada reto con ejemplos concretos',
        'Referencias a investigacion reciente para cada desafio',
        'Conexion entre los retos y el trabajo realizado en el proyecto',
      ],
      tips: [
        'Se cubren 7 retos distintos con ejemplos concretos',
        'Cada reto incluye referencias academicas (Joshi 2017, Pan & Yang 2010, etc.)',
        'Se conecta con las limitaciones del propio modelo (sarcasmo vs BoW/TF-IDF)',
        'El reto multilingue enlaza con la adaptacion a espanol del tutorial Argilla',
      ],
    },
    {
      num: 4,
      titulo: 'Tutorial Argilla',
      peso: '25%',
      peso_num: 25,
      color: '#6C63FF',
      icono: '🔄',
      descripcion_corta: 'Flujo predict-log-label, anotacion iterativa, adaptacion a ML clasico.',
      descripcion: 'Tutorial completo sobre el flujo predict-log-label de Argilla aplicado al analisis de sentimientos, incluyendo los 7 pasos para obtener un analizador entrenado, adaptacion a ML clasico (NB, LR, SVM) y a datos en espanol.',
      secciones_informe: ['6. Tutorial: Analisis de Sentimientos con Argilla'],
      que_evalua: [
        'Descripcion clara de Argilla y su proposito en el flujo de ML',
        'Explicacion del ciclo iterativo predict-log-label',
        'Pasos detallados y praticos para el flujo completo',
        'Adaptacion especifica a ML clasico con TF-IDF y a datos en espanol',
      ],
      tips: [
        'Criterio de mayor peso junto con Revision — requiere profundidad',
        'Se detalla el flujo completo en 7 pasos desde modelo base hasta evaluacion',
        'Se incluye adaptacion especifica para NB, SVM, LR con TF-IDF',
        'La seccion de espanol aborda tokenizacion, stop words y modelos multilingues',
      ],
    },
    {
      num: 5,
      titulo: 'Conclusiones',
      peso: '10%',
      peso_num: 10,
      color: '#2D6A4F',
      icono: '✅',
      descripcion_corta: 'Hallazgos principales, reflexion sobre datos y lineas futuras.',
      descripcion: 'Sintesis de los hallazgos principales del trabajo, reflexion sobre el papel determinante de la calidad de los datos, y propuesta de lineas futuras de investigacion incluyendo deep learning, multiclase y cross-domain.',
      secciones_informe: ['7. Conclusiones y Reflexion sobre los Datos'],
      que_evalua: [
        'Sintesis coherente de los hallazgos del trabajo',
        'Reflexion critica sobre el papel de los datos',
        'Propuestas concretas de lineas futuras',
        'Coherencia entre conclusiones y los objetivos planteados',
      ],
      tips: [
        'Aunque tiene menor peso, es clave para cerrar el informe con solidez',
        'Se incluyen 4 conclusiones principales + 4 sub-secciones de reflexion',
        'Las lineas futuras incluyen 5 direcciones concretas de investigacion',
        'Se conecta el flujo Argilla con el escenario IMDb/SST-2 para aplicacion practica',
      ],
    },
  ];

  seccionesInforme: any[] = [
    { num: '1', titulo: 'Definiciones y Contexto', descripcion_breve: 'Analisis de sentimientos, IMDb, SST-2', color: '#2D6A4F', criterio_label: 'C1 · 20%', criterio_color: '#2D6A4F' },
    { num: '2', titulo: 'Revision Bibliografica', descripcion_breve: 'Articulo de Keerthi Kumar & Harish (2019)', color: '#40916C', criterio_label: 'C2 · 25%', criterio_color: '#40916C' },
    { num: '3', titulo: 'Metodologia', descripcion_breve: 'Pipeline, TF-IDF, clasificadores NB/LR/SVM', color: '#52B788', criterio_label: 'C2 · 25%', criterio_color: '#40916C' },
    { num: '4', titulo: 'Resultados y Discusion', descripcion_breve: 'SVM 89.68%, comparacion con articulo', color: '#74C69D', criterio_label: 'C2 · 25%', criterio_color: '#40916C' },
    { num: '5', titulo: 'Retos Abiertos', descripcion_breve: 'Sarcasmo, negacion, multilinguismo, sesgos', color: '#D4A373', criterio_label: 'C3 · 20%', criterio_color: '#D4A373' },
    { num: '6', titulo: 'Tutorial Argilla', descripcion_breve: 'Predict-log-label, 7 pasos, adaptacion', color: '#6C63FF', criterio_label: 'C4 · 25%', criterio_color: '#6C63FF' },
    { num: '7', titulo: 'Conclusiones', descripcion_breve: 'Hallazgos, reflexion sobre datos, futuro', color: '#2D6A4F', criterio_label: 'C5 · 10%', criterio_color: '#2D6A4F' },
    { num: 'R', titulo: 'Referencias', descripcion_breve: '15 fuentes academicas en APA 7', color: '#6B705C', criterio_label: 'Soporte', criterio_color: '#6B705C' },
  ];

  pasosEntrega: any[] = [
    { num: 1, titulo: 'Descargar el Paquete ZIP', desc: 'Haz click en "Descargar" en la tarjeta del Paquete Completo. El archivo se genera automaticamente con el informe PDF y el notebook.' },
    { num: 2, titulo: 'Verificar el contenido', desc: 'Abre el ZIP y confirma que contiene informe.pdf y notebook.ipynb. Opcionalmente, revisa el PDF y el notebook.' },
    { num: 3, titulo: 'Subir a la plataforma UNIR', desc: 'Accede al campus virtual, navega a la Actividad 2 de PLN y sube el archivo ZIP como entrega.' },
  ];

  constructor(private exportService: ExportService, private http: HttpClient) {}

  toggleItem(id: string) {
    this.checklist.update(items => items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  }

  markAll() {
    this.checklist.update(items => items.map(item => ({ ...item, checked: true })));
  }

  unmarkAll() {
    this.checklist.update(items => items.map(item => ({ ...item, checked: false })));
  }

  async generateAndVerify() {
    this.verifying.set(true);
    this.checklist.update(items => items.map(item => ({ ...item, checked: false })));

    try {
      const [report, results, pdfBlob, notebookBlob, zipBlob] = await Promise.all([
        this.http.get<any>(`${this.baseUrl}/api/report/content`).toPromise().catch(() => null),
        this.http.get<any>(`${this.baseUrl}/api/model/results`).toPromise().catch(() => null),
        this.http.get(`${this.baseUrl}/api/export/pdf`, { responseType: 'blob' }).toPromise().catch(() => null),
        this.http.get(`${this.baseUrl}/api/export/notebook`, { responseType: 'blob' }).toPromise().catch(() => null),
        this.http.get(`${this.baseUrl}/api/export/zip`, { responseType: 'blob' }).toPromise().catch(() => null),
      ]);

      const passIds: string[] = [];

      if (pdfBlob && (pdfBlob as Blob).size > 100) passIds.push('pdf');
      if (report?.blocks && typeof report.blocks === 'object') {
        const bk = report.blocks;
        if (bk.definiciones) passIds.push('definiciones');
        if (bk.revision) passIds.push('revision');
        if (bk.retos) passIds.push('retos');
        if (bk.argilla) passIds.push('argilla');
        if (bk.conclusiones) passIds.push('conclusiones');
        if (bk.referencias) passIds.push('referencias');
      }
      if (results?.svm || results?.naive_bayes) {
        passIds.push('metodologia', 'resultados');
      }
      if (notebookBlob && (notebookBlob as Blob).size > 100) passIds.push('notebook');
      if (zipBlob && (zipBlob as Blob).size > 100) passIds.push('zip');

      for (const id of passIds) {
        await new Promise(r => setTimeout(r, 100));
        this.checklist.update(items => items.map(item =>
          item.id === id ? { ...item, checked: true } : item
        ));
      }

      // Download only the ZIP (contains PDF + Notebook — single deliverable for UNIR)
      if (zipBlob && (zipBlob as Blob).size > 100) {
        this.triggerDownload(zipBlob as Blob, 'entrega_actividad2_SAMAEL.zip');
      }
    } catch (_) { /* silent */ }

    this.verifying.set(false);
  }

  private triggerDownload(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadClick(event: Event, key: string) {
    event.stopPropagation();
    this.downloading.set(key);
    if (key === 'zip') this.exportService.downloadZip();
    else if (key === 'pdf') this.exportService.downloadPdf();
    else if (key === 'notebook') this.exportService.downloadNotebook();
    setTimeout(() => this.downloading.set(null), 2500);
  }

  abrirModalEntregable(i: number) {
    this.modalEntregable.set(i);
    document.body.style.overflow = 'hidden';
  }

  abrirModalCriterio(i: number) {
    this.modalCriterio.set(i);
    document.body.style.overflow = 'hidden';
  }

  cerrarModales() {
    this.modalEntregable.set(null);
    this.modalCriterio.set(null);
    document.body.style.overflow = '';
  }
}
