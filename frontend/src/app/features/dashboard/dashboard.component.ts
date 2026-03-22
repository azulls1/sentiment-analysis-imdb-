import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { InfoModalComponent, ModalData } from '../../shared/components/info-modal/info-modal.component';
import { DatasetService } from '../../core/services/dataset.service';
import { ModelService } from '../../core/services/model.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { isPositiveSentiment, LANGUAGE, PREDICT_DEBOUNCE_MS } from '../../core/constants';

interface PredictionResult {
  positive: boolean;
  confidenceLabel: string;
  scores: { positivo: number; negativo: number } | null;
  idioma: string;
  modelo: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MetricCardComponent, LoadingSpinnerComponent, InfoModalComponent, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-wide">
      <div class="page-header animate-fadeIn">
        <h1 class="page-header__title font-display">Dashboard</h1>
        <p class="page-header__desc">Resumen del análisis de sentimientos en reseñas de películas IMDb</p>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <!-- Hero card -->
        <div class="card-hero animate-fadeInUp" style="margin-bottom:24px;">
          <h2 class="card-hero__title">Análisis de Sentimientos — IMDb</h2>
          <p class="card-hero__desc">
            Replicación del artículo de Keerthi Kumar & Harish (2019) con TF-IDF y tres clasificadores.
            Mejor resultado: SVM con <strong style="color:white;">89.68%</strong> de exactitud.
          </p>
        </div>

        <!-- Dataset stats -->
        <p class="section-label">Dataset</p>
        <div class="grid-stats stagger-children" style="margin-bottom:32px;">
          <app-metric-card class="animate-fadeInUp" label="Total Reseñas" [value]="stats()?.total?.toLocaleString() ?? '—'" subtitle="IMDb Movie Reviews" [clickable]="true" (cardClick)="openModal('total')" />
          <app-metric-card class="animate-fadeInUp" label="Entrenamiento" [value]="stats()?.train?.toLocaleString() ?? '—'" subtitle="50% del dataset" [clickable]="true" (cardClick)="openModal('train')" />
          <app-metric-card class="animate-fadeInUp" label="Prueba" [value]="stats()?.test?.toLocaleString() ?? '—'" subtitle="50% del dataset" [clickable]="true" (cardClick)="openModal('test')" />
          <app-metric-card class="animate-fadeInUp" label="Balance" [value]="'50 / 50'" subtitle="Perfectamente balanceado" [clickable]="true" (cardClick)="openModal('balance')" />
        </div>

        <!-- Sample Reviews Carousel -->
        @if (samples().length) {
          <p class="section-label">Reseñas de Ejemplo</p>
          <div class="snap-x" style="display:flex;gap:16px;padding-bottom:12px;margin-bottom:32px;">
            @for (sample of samples(); track $index) {
              <div class="card hover-lift" style="min-width:280px;max-width:320px;flex-shrink:0;padding:16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                  <span [class]="'badge ' + (isPositive(sample.sentimiento) ? 'badge-active' : 'badge-error')">
                    {{ isPositive(sample.sentimiento) ? 'Positiva' : 'Negativa' }}
                  </span>
                  @if (sample.confianza != null) {
                    <span style="font-size:0.6875rem;color:var(--color-text-muted);">
                      {{ (sample.confianza * 100).toFixed(0) }}%
                    </span>
                  }
                </div>
                <p class="line-clamp-3" style="font-size:0.8125rem;color:var(--color-text-secondary);line-height:1.6;margin:0 0 12px;">
                  {{ sample.texto }}
                </p>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  @if (sample.prediccion_nb != null) {
                    <span class="tag">NB: {{ isPositive(sample.prediccion_nb) ? 'pos' : 'neg' }}</span>
                  }
                  @if (sample.prediccion_lr != null) {
                    <span class="tag">LR: {{ isPositive(sample.prediccion_lr) ? 'pos' : 'neg' }}</span>
                  }
                  @if (sample.prediccion_svm != null) {
                    <span class="tag">SVM: {{ isPositive(sample.prediccion_svm) ? 'pos' : 'neg' }}</span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Model Comparison — Progress Bars -->
        <p class="section-label">Rendimiento de Modelos</p>
        <div class="card animate-fadeInUp" style="margin-bottom:32px;">
          <div style="display:flex;flex-direction:column;gap:20px;">
            @for (m of modelBars; track m.name) {
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:0.875rem;font-weight:600;color:var(--color-text-primary);">{{ m.label }}</span>
                    @if (m.best) {
                      <span class="badge badge-active">Mejor</span>
                    }
                    @if (m.isRef) {
                      <span class="tag">Referencia</span>
                    }
                  </div>
                  <div style="display:flex;align-items:center;gap:12px;">
                    @if (m.time != null) {
                      <span style="font-size:0.6875rem;color:var(--color-text-muted);">{{ m.time }}s</span>
                    }
                    <span class="font-mono" style="font-size:0.875rem;font-weight:700;color:var(--color-text-primary);">{{ m.accuracy }}%</span>
                  </div>
                </div>
                <div class="progress progress--lg" [class.progress--success]="m.best"
                     role="progressbar" [attr.aria-valuenow]="m.accuracy" aria-valuemin="0" aria-valuemax="100"
                     [attr.aria-label]="m.label + ' accuracy'">
                  <div class="progress__bar" [style.width.%]="m.width"></div>
                </div>
              </div>
            }
          </div>
          <p style="margin:16px 0 0;font-size:0.75rem;color:var(--color-text-muted);">
            Referencia: Keerthi Kumar & Harish (2019) — 88.75% con método híbrido (Word2Vec + TF-IDF)
          </p>
        </div>

        <!-- Quick Prediction Widget -->
        <p class="section-label">Prueba Rápida</p>
        <div class="card animate-fadeInUp" style="margin-bottom:32px;">
          <div class="card-section">
            <p style="margin:0 0 12px;font-size:0.875rem;color:var(--color-text-secondary);">
              Escribe una reseña en inglés o español y analiza su sentimiento con el modelo SVM.
            </p>
            <div style="display:flex;gap:12px;">
              <label for="predict-input" class="sr-only">Reseña para analizar</label>
              <input
                id="predict-input"
                class="input"
                placeholder="e.g. This movie was fantastic... / Esta película fue increíble..."
                [ngModel]="predictText()"
                (ngModelChange)="predictText.set($event)"
                (keydown.enter)="quickPredict()"
                [disabled]="predicting()"
              />
              <button
                class="btn-primary"
                style="white-space:nowrap;cursor:pointer;"
                (click)="quickPredict()"
                [disabled]="predicting() || !predictText().trim()"
              >
                {{ predicting() ? 'Analizando...' : 'Analizar' }}
              </button>
            </div>
          </div>
          @if (prediction()) {
            <div style="margin-top:16px;" aria-live="polite">
              <div
                [class]="prediction()!.positive ? 'alert alert-success' : 'alert alert-error'"
                style="padding:12px 16px;border-radius:var(--radius-md);"
              >
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                  <strong>{{ prediction()!.positive ? 'Positiva' : 'Negativa' }}</strong>
                  <span class="font-mono" style="font-size:0.8125rem;">
                    Confianza: {{ prediction()!.confidenceLabel }}
                  </span>
                </div>
                @if (prediction()!.scores) {
                  <div style="display:flex;gap:8px;margin-top:8px;">
                    <span class="tag">Pos: {{ (prediction()!.scores!.positivo * 100).toFixed(1) }}%</span>
                    <span class="tag">Neg: {{ (prediction()!.scores!.negativo * 100).toFixed(1) }}%</span>
                  </div>
                }
                <div style="display:flex;gap:8px;margin-top:8px;font-size:0.75rem;color:var(--color-text-muted);">
                  <span class="tag">{{ prediction()!.idioma === 'es' ? 'Español' : 'Inglés' }}</span>
                  <span class="tag">{{ prediction()!.modelo }}</span>
                </div>
              </div>
            </div>
          }
          @if (predictionError()) {
            <div style="margin-top:16px;" aria-live="assertive">
              <div class="alert alert-error" style="padding:12px 16px;border-radius:var(--radius-md);">
                No se pudo analizar la reseña. Verifica que el backend esté activo.
              </div>
            </div>
          }
        </div>

        <!-- Navigation Cards -->
        <p class="section-label">Explorar</p>
        <div class="grid-features stagger-children">
          <a routerLink="/modelo" class="card-feature animate-fadeInUp" style="text-decoration:none;cursor:pointer;">
            <div class="card-feature__icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
            <h3 style="font-size:0.9375rem;font-weight:600;color:var(--color-text-primary);margin:0 0 4px;">Modelos</h3>
            <p style="font-size:0.8125rem;color:var(--color-text-secondary);margin:0;">Métricas detalladas, matrices de confusión y comparación de clasificadores.</p>
          </a>
          <a routerLink="/pipeline" class="card-feature animate-fadeInUp" style="text-decoration:none;cursor:pointer;">
            <div class="card-feature__icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3 style="font-size:0.9375rem;font-weight:600;color:var(--color-text-primary);margin:0 0 4px;">Pipeline NLP</h3>
            <p style="font-size:0.8125rem;color:var(--color-text-secondary);margin:0;">Visualiza el pipeline de procesamiento de texto paso a paso.</p>
          </a>
          <a routerLink="/articulo" class="card-feature animate-fadeInUp" style="text-decoration:none;cursor:pointer;">
            <div class="card-feature__icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 style="font-size:0.9375rem;font-weight:600;color:var(--color-text-primary);margin:0 0 4px;">Artículo</h3>
            <p style="font-size:0.8125rem;color:var(--color-text-secondary);margin:0;">Lee el artículo de referencia de Keerthi Kumar & Harish (2019).</p>
          </a>
        </div>
      }
    </div>

    <app-info-modal
      [visible]="modalVisible()"
      [data]="modalData()"
      (closed)="closeModal()"
    />
  `,
  styles: [`
    .section-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      margin-bottom: 12px;
    }
  `],
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = signal(true);
  stats = signal<any>(null);
  models = signal<any>(null);
  samples = signal<any[]>([]);
  predictText = signal('');
  predicting = signal(false);
  prediction = signal<PredictionResult | null>(null);
  predictionError = signal(false);
  modalVisible = signal(false);
  modalData = signal<ModalData | null>(null);

  private destroy$ = new Subject<void>();
  private lastPredictTime = 0;

  modelBars: ModelBar[] = [
    { name: 'nb', label: 'Naïve Bayes', accuracy: 85.12, width: 85.12, best: false, isRef: false, time: 1.23 },
    { name: 'lr', label: 'Regresión Logística', accuracy: 89.36, width: 89.36, best: false, isRef: false, time: 5.67 },
    { name: 'svm', label: 'SVM', accuracy: 89.68, width: 89.68, best: true, isRef: false, time: 142.35 },
    { name: 'ref', label: 'Artículo Ref.', accuracy: 88.75, width: 88.75, best: false, isRef: true, time: null },
  ];

  private cardDetails: Record<string, ModalData> = {
    total: {
      title: 'Total Reseñas',
      value: '50,000',
      description:
        'El dataset IMDb Movie Reviews contiene 50,000 reseñas de películas etiquetadas como positivas o negativas. Es uno de los benchmarks más utilizados en análisis de sentimientos.',
      details: [
        { label: 'Fuente', value: 'IMDb (Maas et al., 2011)' },
        { label: 'Reseñas positivas', value: '25,000' },
        { label: 'Reseñas negativas', value: '25,000' },
        { label: 'Idioma dataset', value: 'Inglés (predicción soporta inglés y español)' },
        { label: 'Puntuación positiva', value: '≥ 7 estrellas' },
        { label: 'Puntuación negativa', value: '≤ 4 estrellas' },
      ],
    },
    train: {
      title: 'Conjunto de Entrenamiento',
      value: '25,000',
      description:
        'La mitad del dataset se usa para entrenar los modelos. Las reseñas se transforman a vectores TF-IDF con bigramas antes de alimentar los clasificadores.',
      details: [
        { label: 'Tamaño', value: '25,000 reseñas' },
        { label: 'Proporción', value: '50% del total' },
        { label: 'Positivas', value: '12,500' },
        { label: 'Negativas', value: '12,500' },
        { label: 'Representación', value: 'TF-IDF (bigramas)' },
        { label: 'Max features', value: '50,000' },
      ],
    },
    test: {
      title: 'Conjunto de Prueba',
      value: '25,000',
      description:
        'La otra mitad se reserva exclusivamente para evaluar el rendimiento de los modelos. No se utiliza durante el entrenamiento para evitar sobreajuste.',
      details: [
        { label: 'Tamaño', value: '25,000 reseñas' },
        { label: 'Proporción', value: '50% del total' },
        { label: 'Positivas', value: '12,500' },
        { label: 'Negativas', value: '12,500' },
        { label: 'Uso', value: 'Solo evaluación' },
        { label: 'Métricas', value: 'Accuracy, F1, Precision, Recall' },
      ],
    },
    balance: {
      title: 'Balance de Clases',
      value: '50 / 50',
      description:
        'El dataset está perfectamente balanceado entre reseñas positivas y negativas, lo que elimina la necesidad de técnicas de sobremuestreo o submuestreo.',
      details: [
        { label: 'Clase positiva', value: '50%' },
        { label: 'Clase negativa', value: '50%' },
        { label: 'Ratio', value: '1:1' },
        { label: 'Sesgo', value: 'Ninguno' },
        { label: 'Técnica de balanceo', value: 'No requerida' },
      ],
    },
  };

  private analyticsService = inject(AnalyticsService);

  constructor(
    private datasetService: DatasetService,
    private modelService: ModelService,
  ) {}

  ngOnInit() {
    this.analyticsService.trackPageView();

    this.datasetService.getStats().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.modelService.getResults().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.models.set(data);
        this.updateModelBars(data);
      },
    });

    this.datasetService.getSamples(6).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => this.samples.set(data),
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isPositive(value: unknown): boolean {
    return isPositiveSentiment(value);
  }

  quickPredict() {
    const text = this.predictText().trim();
    if (!text || this.predicting()) return;

    // Debounce: prevent rapid-fire predictions within PREDICT_DEBOUNCE_MS
    const now = Date.now();
    if (now - this.lastPredictTime < PREDICT_DEBOUNCE_MS) return;
    this.lastPredictTime = now;

    this.predicting.set(true);
    this.prediction.set(null);
    this.predictionError.set(false);
    this.modelService.predict(text).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        const positive = this.isPositive(result.sentimiento);
        const confidence = result.confianza > 1 ? result.confianza / 100 : result.confianza;
        this.prediction.set({
          positive,
          confidenceLabel: (confidence * 100).toFixed(1) + '%',
          scores: result.scores ?? null,
          idioma: result.idioma ?? LANGUAGE.ENGLISH,
          modelo: result.modelo ?? 'svm-tfidf',
        });
        this.analyticsService.trackPrediction();
        this.predicting.set(false);
      },
      error: () => {
        this.predictionError.set(true);
        this.predicting.set(false);
      },
    });
  }

  openModal(key: string) {
    const data = this.cardDetails[key];
    if (data) {
      this.modalData.set(data);
      this.modalVisible.set(true);
    }
  }

  closeModal() {
    this.modalVisible.set(false);
  }

  private updateModelBars(data: any) {
    if (!data || typeof data !== 'object') return;
    const mapping: Record<string, string> = {
      naive_bayes: 'nb',
      logistic_regression: 'lr',
      svm: 'svm',
    };
    for (const [key, value] of Object.entries(data)) {
      const barName = mapping[key];
      if (!barName) continue;
      const item = value as any;
      const bar = this.modelBars.find(b => b.name === barName);
      if (bar && item.accuracy != null) {
        const acc = item.accuracy > 1 ? item.accuracy : +(item.accuracy * 100).toFixed(2);
        bar.accuracy = acc;
        bar.width = acc;
      }
      if (bar && item.tiempo_entrenamiento != null) {
        bar.time = +item.tiempo_entrenamiento.toFixed(2);
      }
    }
  }
}

interface ModelBar {
  name: string;
  label: string;
  accuracy: number;
  width: number;
  best: boolean;
  isRef: boolean;
  time: number | null;
}
