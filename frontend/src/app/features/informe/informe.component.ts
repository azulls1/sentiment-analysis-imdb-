import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ReportService } from '../../core/services/report.service';

@Component({
  selector: 'app-informe',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `
    <div class="page page-medium">
      <div class="page-header animate-fadeIn">
        <h1 class="page-header__title font-display">Informe Academico</h1>
        <p class="page-header__desc">Vista previa del informe PDF — Actividad 2: Analisis de Sentimientos</p>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (report()) {
        <div class="stack stagger-children">

          <!-- Hero card -->
          <div class="card-hero animate-fadeInUp" style="text-align:center;">
            <h2 class="card-hero__title" style="font-size:1.1rem;line-height:1.5;">{{ report().metadata.titulo }}</h2>
            <p style="font-size:0.82rem;color:var(--color-text-secondary);margin:8px 0 2px;">
              {{ report().metadata.subtitulo }}
            </p>
            <p style="font-size:0.78rem;color:var(--color-text-muted);margin:4px 0 0;">
              {{ report().metadata.autor }} · {{ report().metadata.fecha }}
            </p>
            <p style="font-size:0.72rem;color:var(--color-text-muted);margin:2px 0 14px;">
              {{ report().metadata.programa }} — {{ report().metadata.universidad }}
            </p>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
              <span class="badge" style="font-size:0.68rem;">{{ report().metadata.asignatura }}</span>
              <span class="badge" style="font-size:0.68rem;background:var(--color-text-primary);color:white;">{{ report().metadata.actividad }}</span>
            </div>
          </div>

          <!-- Section overview grid -->
          <div class="card-section animate-fadeInUp" style="margin-top:4px;">
            <h3 style="font-size:0.88rem;font-weight:600;color:var(--color-text-primary);margin:0 0 4px;">Contenido del Informe</h3>
            <p style="margin:0 0 16px;font-size:0.75rem;color:var(--color-text-muted);line-height:1.5;">
              Haz click en cada seccion para ver sus puntos clave, criterio de evaluacion y contenido completo.
            </p>
            <div class="informe-grid">
              @for (sec of seccionesInfo; track sec.key; let i = $index) {
                <div class="informe-card" (click)="abrirModal(i)">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <div class="informe-card-icon" [style.background]="sec.color + '22'" [style.color]="sec.color">
                      {{ sec.icono }}
                    </div>
                    <div style="min-width:0;">
                      <div style="font-size:0.78rem;font-weight:600;color:var(--color-text-primary);line-height:1.3;">{{ sec.titulo_corto }}</div>
                      @if (sec.criterio) {
                        <div style="font-size:0.6rem;color:var(--color-text-muted);margin-top:1px;">{{ sec.criterio }} · {{ sec.peso }}</div>
                      }
                    </div>
                  </div>
                  <p style="font-size:0.7rem;color:var(--color-text-secondary);margin:0;line-height:1.45;">{{ sec.resumen }}</p>
                  <span style="display:block;margin-top:8px;font-size:0.67rem;color:var(--color-text-muted);">Ver detalle &#8250;</span>
                </div>
              }
            </div>
          </div>

          <!-- Full sections -->
          @for (entry of blockEntries(); track entry.key; let i = $index) {
            <div class="card-section animate-fadeInUp">
              <div class="informe-section-header">
                <span style="font-size:1.2rem;">{{ seccionesInfo[i]?.icono }}</span>
                <h3 style="flex:1;font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0;">
                  {{ entry.value.titulo }}
                </h3>
                <button class="informe-detail-btn" (click)="abrirModal(i)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  Detalle
                </button>
              </div>
              <div class="report-content" [innerHTML]="sanitize(entry.value.contenido)"></div>
            </div>
          }

        </div>

        <!-- Modal -->
        @if (modalSection() !== null) {
          <div class="informe-modal-overlay" (click)="cerrarModal()">
            <div class="informe-modal-panel" (click)="$event.stopPropagation()">

              <!-- Sticky header -->
              <div class="informe-modal-header" [style.border-bottom-color]="seccionesInfo[modalSection()!].color">
                <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                  <span style="font-size:1.5rem;">{{ seccionesInfo[modalSection()!].icono }}</span>
                  <div style="min-width:0;">
                    <h2 style="font-size:1rem;font-weight:700;color:var(--color-text-primary);margin:0;overflow:hidden;text-overflow:ellipsis;">
                      {{ seccionesInfo[modalSection()!].titulo_corto }}
                    </h2>
                    @if (seccionesInfo[modalSection()!].criterio) {
                      <div style="font-size:0.7rem;color:var(--color-text-muted);margin-top:2px;">
                        {{ seccionesInfo[modalSection()!].criterio }} — Peso: {{ seccionesInfo[modalSection()!].peso }}
                      </div>
                    }
                  </div>
                </div>
                <button class="informe-modal-close" (click)="cerrarModal()" title="Cerrar">&#10005;</button>
              </div>

              <!-- Scrollable body -->
              <div class="informe-modal-body">

                <!-- Summary box -->
                <div style="background:var(--color-bg-muted,#F7F8F7);border-radius:8px;padding:14px 16px;margin-bottom:16px;border-left:3px solid;" [style.border-left-color]="seccionesInfo[modalSection()!].color">
                  <p style="font-size:0.82rem;color:var(--color-text-secondary);margin:0;line-height:1.6;">
                    {{ seccionesInfo[modalSection()!].resumen }}
                  </p>
                </div>

                <!-- Key points -->
                <div style="margin-bottom:20px;">
                  <h4 style="font-size:0.75rem;font-weight:600;color:var(--color-text-primary);margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em;">
                    Puntos clave de esta seccion
                  </h4>
                  <div style="display:grid;gap:8px;">
                    @for (punto of seccionesInfo[modalSection()!].puntos_clave; track $index) {
                      <div style="display:flex;align-items:flex-start;gap:8px;">
                        <span style="flex-shrink:0;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:white;" [style.background]="seccionesInfo[modalSection()!].color">
                          {{ $index + 1 }}
                        </span>
                        <span style="font-size:0.78rem;color:var(--color-text-secondary);line-height:1.5;">{{ punto }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Divider -->
                <div style="display:flex;align-items:center;gap:12px;margin:4px 0 20px;">
                  <div style="flex:1;height:1px;background:var(--color-border,#DFE4E0);"></div>
                  <span style="font-size:0.68rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;">Contenido completo</span>
                  <div style="flex:1;height:1px;background:var(--color-border,#DFE4E0);"></div>
                </div>

                <!-- Full HTML content -->
                <div class="report-content" [innerHTML]="sanitize(getBlockContent(modalSection()!))"></div>

              </div>

              <!-- Footer nav -->
              <div class="informe-modal-footer">
                <button class="btn-ghost" [disabled]="modalSection() === 0" (click)="modalSection.set(modalSection()! - 1)" style="font-size:0.76rem;">
                  &#8249; Anterior
                </button>
                <div style="display:flex;align-items:center;gap:5px;">
                  @for (sec of seccionesInfo; track sec.key; let j = $index) {
                    <div class="informe-modal-dot"
                      [class.informe-modal-dot-active]="modalSection() === j"
                      [style.background]="modalSection() === j ? sec.color : ''"
                      (click)="modalSection.set(j)">
                    </div>
                  }
                </div>
                <button class="btn-ghost" [disabled]="modalSection() === seccionesInfo.length - 1" (click)="modalSection.set(modalSection()! + 1)" style="font-size:0.76rem;">
                  Siguiente &#8250;
                </button>
              </div>

            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    /* ===== Report content styles (HTML from API) ===== */
    :host ::ng-deep .report-content p {
      margin: 0 0 10px;
      text-align: justify;
      line-height: 1.7;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
    :host ::ng-deep .report-content h3 {
      color: var(--color-text-primary);
      margin: 18px 0 8px;
      font-size: 0.9rem;
      font-weight: 600;
    }
    :host ::ng-deep .report-content ul,
    :host ::ng-deep .report-content ol {
      padding-left: 20px;
      margin: 8px 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
    :host ::ng-deep .report-content li {
      margin: 4px 0;
    }
    :host ::ng-deep .report-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 0.8rem;
    }
    :host ::ng-deep .report-content th {
      background: var(--color-text-primary, #04202C);
      color: white;
      padding: 8px 10px;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    :host ::ng-deep .report-content td {
      padding: 7px 10px;
      border-bottom: 1px solid var(--color-border, #DFE4E0);
      color: var(--color-text-primary);
    }
    :host ::ng-deep .report-content tr:nth-child(even) td {
      background: var(--color-bg-muted, #F7F8F7);
    }
    :host ::ng-deep .report-content code {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      background: var(--color-bg-muted, #F7F8F7);
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    :host ::ng-deep .report-content em {
      color: var(--color-text-muted);
      font-size: 0.8rem;
    }
    :host ::ng-deep .report-content a {
      color: var(--color-text-accent, #5B7065);
      text-decoration: none;
    }

    /* ===== Section overview grid ===== */
    .informe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 12px;
    }

    .informe-card {
      background: var(--color-bg-card, #FFFFFF);
      border: 1px solid var(--color-border, #DFE4E0);
      border-left: 3px solid var(--color-text-muted);
      border-radius: 10px;
      padding: 14px 16px;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .informe-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    }

    .informe-card-icon {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    /* ===== Section headers ===== */
    .informe-section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--color-text-primary);
    }

    .informe-detail-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--color-bg-muted, #F7F8F7);
      border: 1px solid var(--color-border, #DFE4E0);
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 0.72rem;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .informe-detail-btn:hover {
      background: var(--color-text-primary);
      color: white;
    }

    /* ===== Modal ===== */
    .informe-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    .informe-modal-panel {
      background: var(--color-bg-card, #FFFFFF);
      border-radius: 14px;
      width: 100%;
      max-width: 780px;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      animation: modalSlideIn 0.25s ease;
    }

    .informe-modal-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      border-bottom: 3px solid var(--color-text-primary);
      flex-shrink: 0;
    }

    .informe-modal-close {
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
    .informe-modal-close:hover {
      background: #e74c3c;
      color: white;
    }

    .informe-modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .informe-modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-top: 1px solid var(--color-border, #DFE4E0);
      flex-shrink: 0;
    }

    .informe-modal-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-border, #DFE4E0);
      cursor: pointer;
      transition: background 0.15s, transform 0.15s;
    }
    .informe-modal-dot:hover {
      transform: scale(1.3);
    }
    .informe-modal-dot-active {
      transform: scale(1.3);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalSlideIn {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .btn-ghost {
      background: none;
      border: 1px solid var(--color-border, #DFE4E0);
      border-radius: 6px;
      padding: 6px 14px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-ghost:hover:not(:disabled) {
      background: var(--color-bg-muted, #F7F8F7);
    }
    .btn-ghost:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  `],
})
export class InformeComponent implements OnInit {
  loading = signal(true);
  report = signal<any>(null);
  blockEntries = signal<{ key: string; value: any }[]>([]);
  modalSection = signal<number | null>(null);

  seccionesInfo: any[] = [
    {
      key: 'definiciones',
      icono: '📖',
      titulo_corto: 'Definiciones y Contexto',
      resumen: 'Que es el analisis de sentimientos, niveles de granularidad, datasets IMDb y SST-2, y contexto del proyecto academico.',
      criterio: 'Criterio 1',
      peso: '20%',
      color: '#2D6A4F',
      puntos_clave: [
        'El analisis de sentimientos identifica opiniones y polaridad en textos (Liu, 2012)',
        'Tres niveles de granularidad: documento, oracion y aspecto',
        'Dataset IMDb: 50,000 resenas balanceadas, polarizacion fuerte (≤4 neg, ≥7 pos)',
        'Comparacion IMDb (textos largos ~233 palabras) vs SST-2 (frases cortas ~19 palabras)',
      ],
    },
    {
      key: 'revision',
      icono: '📚',
      titulo_corto: 'Revision Bibliografica',
      resumen: 'Articulo de Keerthi Kumar & Harish (2019): metodo hibrido BoW + TF-IDF para clasificacion de sentimientos.',
      criterio: 'Criterio 2',
      peso: '25%',
      color: '#40916C',
      puntos_clave: [
        'Metodo hibrido combina BoW (presencia) + TF-IDF (importancia relativa)',
        'SVM con metodo hibrido alcanza 88.75% de exactitud',
        'Linea de investigacion desde Pang & Lee (2002)',
        'BERT y transformers como nuevo estado del arte con mayor costo computacional',
      ],
    },
    {
      key: 'metodologia',
      icono: '⚙️',
      titulo_corto: 'Metodologia',
      resumen: 'Pipeline de preprocesamiento, vectorizacion TF-IDF con bigramas, y tres clasificadores evaluados.',
      criterio: 'Criterio 2',
      peso: '25%',
      color: '#52B788',
      puntos_clave: [
        'Preprocesamiento: HTML → minusculas → tokenizacion → stopwords',
        'TF-IDF: 50,000 features, bigramas (1,2), sublinear_tf=True',
        'Clasificadores: Naive Bayes, Regresion Logistica, SVM (LinearSVC)',
        'Metricas: Accuracy, Precision, Recall, F1-Score',
      ],
    },
    {
      key: 'resultados',
      icono: '📊',
      titulo_corto: 'Resultados y Discusion',
      resumen: 'SVM alcanza 89.68%, superando al articulo original. Analisis del trade-off rendimiento vs eficiencia.',
      criterio: 'Criterio 2',
      peso: '25%',
      color: '#1B4332',
      puntos_clave: [
        'SVM: 89.68% — mejor resultado general',
        'LR: 89.36% — mejor balance rendimiento/eficiencia (25x mas rapido que SVM)',
        'Supera al articulo en los 3 clasificadores (+0.62 a +0.93 pp)',
        'TF-IDF con bigramas optimizado ≥ metodo hibrido BoW+TF-IDF',
      ],
    },
    {
      key: 'retos',
      icono: '🎯',
      titulo_corto: 'Retos Abiertos',
      resumen: 'Sarcasmo, negacion, dependencia de dominio, multilinguismo, sesgos y explicabilidad.',
      criterio: 'Criterio 3',
      peso: '20%',
      color: '#D4A373',
      puntos_clave: [
        'Sarcasmo e ironia invierten la polaridad literal del texto',
        'Negacion y composicionalidad: "not bad" = positivo',
        'Transferencia entre dominios: "unpredictable" cambia de significado',
        'Desafios multilingues: escasez de recursos anotados en espanol',
      ],
    },
    {
      key: 'argilla',
      icono: '🔄',
      titulo_corto: 'Tutorial Argilla',
      resumen: 'Plataforma de anotacion con flujo predict-log-label, adaptacion a ML clasico y datos en espanol.',
      criterio: 'Criterio 4',
      peso: '25%',
      color: '#6C63FF',
      puntos_clave: [
        'Argilla: plataforma open-source para anotacion y curacion de datos',
        'Ciclo iterativo: predict → log → label para mejora continua',
        '7 pasos para obtener un analizador entrenado',
        'Adaptable a ML clasico (NB, LR, SVM con TF-IDF) y datos en espanol',
      ],
    },
    {
      key: 'conclusiones',
      icono: '✅',
      titulo_corto: 'Conclusiones',
      resumen: 'Validacion del articulo, reflexion sobre el papel de los datos, y lineas futuras de investigacion.',
      criterio: 'Criterio 5',
      peso: '10%',
      color: '#2D6A4F',
      puntos_clave: [
        'Resultados del articulo validados y superados con TF-IDF optimizado',
        'Regresion Logistica como opcion mas equilibrada en la practica',
        'Calidad de datos es el factor mas determinante del rendimiento',
        'Lineas futuras: deep learning, multiclase, cross-domain, espanol',
      ],
    },
    {
      key: 'referencias',
      icono: '📑',
      titulo_corto: 'Referencias',
      resumen: '15 fuentes academicas en formato APA 7ma edicion, desde 2002 hasta 2024.',
      criterio: '',
      peso: '',
      color: '#6B705C',
      puntos_clave: [
        '15 referencias academicas citadas en formato APA 7',
        'Articulo principal: Keerthi Kumar & Harish (2019) — IJIMAI',
        'Dataset: Maas et al. (2011) — IMDb Movie Reviews',
        'Incluye referencias fundamentales: Liu (2012), Pang & Lee (2008), Devlin et al. (2019)',
      ],
    },
  ];

  constructor(
    private reportService: ReportService,
    private sanitizer: DomSanitizer,
  ) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  abrirModal(i: number) {
    this.modalSection.set(i);
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.modalSection.set(null);
    document.body.style.overflow = '';
  }

  getBlockContent(i: number): string {
    const entries = this.blockEntries();
    return entries[i]?.value?.contenido || '';
  }

  ngOnInit() {
    this.reportService.getContent().subscribe({
      next: (data) => {
        this.report.set(data);
        this.blockEntries.set(
          Object.entries(data.blocks).map(([key, value]) => ({ key, value }))
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
