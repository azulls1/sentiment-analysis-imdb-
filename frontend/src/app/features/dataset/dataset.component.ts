import { Component, OnInit, signal } from '@angular/core';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { InfoModalComponent, ModalData } from '../../shared/components/info-modal/info-modal.component';
import { DatasetService } from '../../core/services/dataset.service';

@Component({
  selector: 'app-dataset',
  standalone: true,
  imports: [MetricCardComponent, LoadingSpinnerComponent, InfoModalComponent],
  template: `
    <div class="page page-wide">
      <div class="page-header animate-fadeIn">
        <h1 class="page-header__title font-display">Dataset IMDb</h1>
        <p class="page-header__desc">Exploración del dataset de reseñas de películas</p>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div class="grid-stats stagger-children" style="margin-bottom:32px;">
          <app-metric-card class="animate-fadeInUp" label="Total Reseñas" [value]="stats()?.total?.toLocaleString() ?? '—'" [clickable]="true" (cardClick)="openModal('total')" />
          <app-metric-card class="animate-fadeInUp" label="Entrenamiento" [value]="stats()?.train?.toLocaleString() ?? '—'" [clickable]="true" (cardClick)="openModal('train')" />
          <app-metric-card class="animate-fadeInUp" label="Prueba" [value]="stats()?.test?.toLocaleString() ?? '—'" [clickable]="true" (cardClick)="openModal('test')" />
          <app-metric-card class="animate-fadeInUp" label="Vocabulario TF-IDF" [value]="stats()?.vocabulario_tfidf?.toLocaleString() ?? '—'" [clickable]="true" (cardClick)="openModal('vocab')" />
          <app-metric-card class="animate-fadeInUp" label="Long. Promedio" [value]="(stats()?.longitud_promedio_palabras ?? '—') + ' palabras'" [clickable]="true" (cardClick)="openModal('length')" />
          <app-metric-card class="animate-fadeInUp" label="Balance" [value]="stats()?.balance ?? '—'" [clickable]="true" (cardClick)="openModal('balance')" />
        </div>

        <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);margin-bottom:12px;">
          Muestras de Reseñas
        </p>
        <div class="grid-cards stagger-children">
          @for (sample of samples(); track $index) {
            <div
              class="card card-compact animate-fadeInUp"
              style="cursor:pointer;"
              role="button"
              [attr.tabindex]="0"
              (click)="openSampleModal(sample)"
              (keydown.enter)="openSampleModal(sample)"
            >
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span class="badge" [class.badge-active]="sample.sentimiento === 'positivo'" [class.badge-error]="sample.sentimiento === 'negativo'">
                  {{ sample.sentimiento }}
                </span>
                <span style="font-size:0.7rem;color:var(--color-text-muted);">
                  {{ (sample.confianza * 100).toFixed(0) }}%
                </span>
              </div>
              <p style="font-size:0.8rem;line-height:1.5;color:var(--color-text-secondary);margin:0 0 10px;">
                {{ sample.texto }}
              </p>
              <div style="display:flex;gap:10px;font-size:0.65rem;color:var(--color-text-muted);">
                <span class="tag">NB: {{ sample.prediccion_nb }}</span>
                <span class="tag">LR: {{ sample.prediccion_lr }}</span>
                <span class="tag">SVM: {{ sample.prediccion_svm }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <app-info-modal
      [visible]="modalVisible()"
      [data]="modalData()"
      (closed)="closeModal()"
    />
  `,
  styles: [],
})
export class DatasetComponent implements OnInit {
  loading = signal(true);
  stats = signal<any>(null);
  samples = signal<any[]>([]);
  modalVisible = signal(false);
  modalData = signal<ModalData | null>(null);

  private cardDetails: Record<string, ModalData> = {
    total: {
      title: 'Total Reseñas',
      value: '50,000',
      description:
        'El dataset IMDb Large Movie Review contiene 50,000 reseñas altamente polarizadas. Fue creado por Andrew Maas et al. (2011) y es el estándar de facto para benchmarks de análisis de sentimientos binario.',
      details: [
        { label: 'Fuente', value: 'Stanford AI Lab (Maas et al.)' },
        { label: 'Año de publicación', value: '2011' },
        { label: 'Reseñas positivas', value: '25,000' },
        { label: 'Reseñas negativas', value: '25,000' },
        { label: 'Idioma dataset', value: 'Inglés (predicción soporta inglés y español)' },
        { label: 'Formato', value: 'Texto plano (HTML limpio)' },
      ],
    },
    train: {
      title: 'Conjunto de Entrenamiento',
      value: '25,000',
      description:
        'Se usa el 50% del dataset para entrenar los tres clasificadores. Las reseñas se preprocesan y vectorizan con TF-IDF antes del entrenamiento.',
      details: [
        { label: 'Tamaño', value: '25,000 reseñas' },
        { label: 'Positivas', value: '12,500' },
        { label: 'Negativas', value: '12,500' },
        { label: 'Proporción', value: '50% del total' },
        { label: 'Preprocesamiento', value: 'Limpieza HTML, lowercase' },
        { label: 'Vectorización', value: 'TF-IDF con bigramas' },
      ],
    },
    test: {
      title: 'Conjunto de Prueba',
      value: '25,000',
      description:
        'El otro 50% se reserva exclusivamente para evaluación. Nunca se usa durante el entrenamiento, garantizando una medición imparcial del rendimiento.',
      details: [
        { label: 'Tamaño', value: '25,000 reseñas' },
        { label: 'Positivas', value: '12,500' },
        { label: 'Negativas', value: '12,500' },
        { label: 'Proporción', value: '50% del total' },
        { label: 'Métricas evaluadas', value: 'Accuracy, Precision, Recall, F1' },
        { label: 'Uso', value: 'Solo evaluación (sin fuga de datos)' },
      ],
    },
    vocab: {
      title: 'Vocabulario TF-IDF',
      value: '50,000',
      description:
        'TF-IDF (Term Frequency - Inverse Document Frequency) transforma el texto en vectores numéricos. Se limita a las 50,000 características más relevantes usando unigramas y bigramas.',
      details: [
        { label: 'Max features', value: '50,000' },
        { label: 'N-gramas', value: '(1, 2) — uni y bigramas' },
        { label: 'Sublinear TF', value: 'Activado (log)' },
        { label: 'Stop words', value: 'Inglés (scikit-learn) + Español (heurístico)' },
        { label: 'Min DF', value: '5 documentos' },
        { label: 'Librería', value: 'scikit-learn TfidfVectorizer' },
      ],
    },
    length: {
      title: 'Longitud Promedio',
      value: '~231 palabras',
      description:
        'Las reseñas de IMDb son relativamente largas en comparación con otros datasets de sentimientos (como tweets). Esto permite capturar matices más complejos del lenguaje.',
      details: [
        { label: 'Promedio', value: '~231 palabras' },
        { label: 'Mediana', value: '~174 palabras' },
        { label: 'Mínimo', value: '~10 palabras' },
        { label: 'Máximo', value: '~2,470 palabras' },
        { label: 'Desv. estándar', value: '~173 palabras' },
        { label: 'Impacto', value: 'Mayor contexto para TF-IDF' },
      ],
    },
    balance: {
      title: 'Balance de Clases',
      value: '50 / 50',
      description:
        'El dataset está perfectamente balanceado. Cada clase (positiva y negativa) tiene exactamente la misma cantidad de muestras, tanto en train como en test.',
      details: [
        { label: 'Clase positiva', value: '50% (25,000)' },
        { label: 'Clase negativa', value: '50% (25,000)' },
        { label: 'Ratio', value: '1:1 (perfecto)' },
        { label: 'Sobremuestreo', value: 'No requerido' },
        { label: 'Submuestreo', value: 'No requerido' },
        { label: 'Métrica principal', value: 'Accuracy (apropiada)' },
      ],
    },
  };

  constructor(private datasetService: DatasetService) {}

  ngOnInit() {
    this.datasetService.getStats().subscribe({
      next: (data) => this.stats.set(data),
    });
    this.datasetService.getSamples().subscribe({
      next: (data) => {
        this.samples.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openModal(key: string) {
    const data = this.cardDetails[key];
    if (data) {
      this.modalData.set(data);
      this.modalVisible.set(true);
    }
  }

  openSampleModal(sample: any) {
    const sentiment = sample.sentimiento === 'positivo' ? 'Positiva' : 'Negativa';
    const confidence = (sample.confianza * 100).toFixed(1);
    this.modalData.set({
      title: `Reseña ${sentiment}`,
      value: `${confidence}% confianza`,
      description: sample.texto,
      details: [
        { label: 'Sentimiento', value: sample.sentimiento },
        { label: 'Confianza', value: `${confidence}%` },
        { label: 'Naïve Bayes', value: sample.prediccion_nb },
        { label: 'Regresión Logística', value: sample.prediccion_lr },
        { label: 'SVM', value: sample.prediccion_svm },
      ],
    });
    this.modalVisible.set(true);
  }

  closeModal() {
    this.modalVisible.set(false);
  }
}
