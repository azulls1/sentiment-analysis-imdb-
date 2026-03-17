import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { InfoModalComponent, ModalData } from '../../shared/components/info-modal/info-modal.component';
import { ModelService } from '../../core/services/model.service';

@Component({
  selector: 'app-modelo',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent, InfoModalComponent],
  template: `
    <div class="page page-wide">
      <div class="page-header animate-fadeIn">
        <h1 class="page-header__title font-display">Modelos de Clasificación</h1>
        <p class="page-header__desc">Resultados de Naïve Bayes, Regresión Logística y SVM con TF-IDF</p>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <!-- Model overview cards -->
        <p class="section-label">Resumen</p>
        <div class="grid-features stagger-children" style="margin-bottom:32px;">
          @for (model of modelList(); track model.key) {
            <div
              class="card animate-fadeInUp hover-lift"
              style="text-align:center;cursor:pointer;"
              (click)="openModelModal(model)"
            >
              <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;">
                <h3 class="font-display" style="font-size:0.9rem;font-weight:600;color:var(--color-text-primary);margin:0;">
                  {{ model.nombre }}
                </h3>
                @if (model.key === bestModelKey()) {
                  <span class="badge badge-active">Mejor</span>
                }
              </div>

              <div class="font-display" style="font-size:2.25rem;font-weight:700;color:var(--color-text-primary);">
                {{ (model.accuracy * 100).toFixed(2) }}%
              </div>
              <div class="card-stat__label" style="margin-bottom:16px;">Exactitud</div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;text-align:left;font-size:0.8rem;">
                <div><span style="color:var(--color-text-muted);">Precisión:</span> <span class="font-mono">{{ (model.precision_macro * 100).toFixed(1) }}%</span></div>
                <div><span style="color:var(--color-text-muted);">Sensibilidad:</span> <span class="font-mono">{{ (model.recall_macro * 100).toFixed(1) }}%</span></div>
                <div><span style="color:var(--color-text-muted);">Puntuación F1:</span> <span class="font-mono">{{ (model.f1_macro * 100).toFixed(1) }}%</span></div>
                <div><span style="color:var(--color-text-muted);">Tiempo:</span> <span class="font-mono">{{ model.tiempo_entrenamiento }}s</span></div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:12px;font-size:0.75rem;">
                <div style="padding:4px 6px;border-radius:4px;background:var(--color-bg-subtle);">
                  <div style="color:var(--color-text-muted);margin-bottom:2px;">Pos</div>
                  <div class="font-mono">P:{{ (model.precision_pos * 100).toFixed(0) }} R:{{ (model.recall_pos * 100).toFixed(0) }} F1:{{ (model.f1_pos * 100).toFixed(0) }}</div>
                </div>
                <div style="padding:4px 6px;border-radius:4px;background:var(--color-bg-subtle);">
                  <div style="color:var(--color-text-muted);margin-bottom:2px;">Neg</div>
                  <div class="font-mono">P:{{ (model.precision_neg * 100).toFixed(0) }} R:{{ (model.recall_neg * 100).toFixed(0) }} F1:{{ (model.f1_neg * 100).toFixed(0) }}</div>
                </div>
              </div>

              <div [class]="'progress progress--lg' + (model.key === bestModelKey() ? ' progress--success' : '')" style="margin-top:16px;">
                <div class="progress__bar" [style.width.%]="model.accuracy * 100"></div>
              </div>
            </div>
          }
        </div>

        <!-- Comparison table + analysis -->
        @if (comparison()) {
          <p class="section-label">Comparación Detallada</p>
          <div class="card animate-fadeInUp" style="margin-bottom:32px;">
            <div class="table-responsive">
              <table class="table table--compact">
                <thead>
                  <tr>
                    <th>Métrica</th>
                    @for (name of comparison().modelos; track name) {
                      <th style="text-align:center;">{{ name }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="td-clickable" (click)="openMetricModal('accuracy')">Exactitud</td>
                    @for (val of comparison().accuracy; track $index) {
                      <td
                        class="mono td-clickable"
                        style="text-align:center;"
                        [style.font-weight]="isBest(comparison().accuracy, $index) ? '700' : '400'"
                        (click)="openComparisonModal('accuracy', $index, val)"
                      >
                        {{ (val * 100).toFixed(2) }}%
                      </td>
                    }
                  </tr>
                  <tr>
                    <td class="td-clickable" (click)="openMetricModal('precision')">Precisión</td>
                    @for (val of comparison().precision; track $index) {
                      <td
                        class="mono td-clickable"
                        style="text-align:center;"
                        [style.font-weight]="isBest(comparison().precision, $index) ? '700' : '400'"
                        (click)="openComparisonModal('precision', $index, val)"
                      >
                        {{ (val * 100).toFixed(2) }}%
                      </td>
                    }
                  </tr>
                  <tr>
                    <td class="td-clickable" (click)="openMetricModal('recall')">Recall</td>
                    @for (val of comparison().recall; track $index) {
                      <td
                        class="mono td-clickable"
                        style="text-align:center;"
                        [style.font-weight]="isBest(comparison().recall, $index) ? '700' : '400'"
                        (click)="openComparisonModal('recall', $index, val)"
                      >
                        {{ (val * 100).toFixed(2) }}%
                      </td>
                    }
                  </tr>
                  <tr>
                    <td class="td-clickable" (click)="openMetricModal('f1_score')">F1-Score</td>
                    @for (val of comparison().f1_score; track $index) {
                      <td
                        class="mono td-clickable"
                        style="text-align:center;"
                        [style.font-weight]="isBest(comparison().f1_score, $index) ? '700' : '400'"
                        (click)="openComparisonModal('f1_score', $index, val)"
                      >
                        {{ (val * 100).toFixed(2) }}%
                      </td>
                    }
                  </tr>
                  <tr>
                    <td class="td-clickable" (click)="openMetricModal('tiempo')">Tiempo entrenamiento</td>
                    @for (val of comparison().tiempo_entrenamiento_seg; track $index) {
                      <td
                        class="mono td-clickable"
                        style="text-align:center;"
                        [style.font-weight]="isBest(comparison().tiempo_entrenamiento_seg, $index, true) ? '700' : '400'"
                        (click)="openComparisonModal('tiempo', $index, val)"
                      >
                        {{ val.toFixed(2) }}s
                      </td>
                    }
                  </tr>
                </tbody>
              </table>
            </div>

            <hr class="divider" style="margin:20px 0;">

            <p class="section-label" style="margin-top:0;">Análisis</p>
            <p style="margin:0;line-height:1.7;font-size:0.875rem;color:var(--color-text-secondary);">
              {{ comparison().analisis }}
            </p>
          </div>
        }

        <!-- Confusion matrices -->
        <p class="section-label">Matrices de Confusión</p>
        <div class="grid-features stagger-children" style="margin-bottom:32px;">
          @for (model of modelList(); track model.key) {
            @if (model.confusion_matrix) {
              <div
                class="card animate-fadeInUp hover-lift"
                style="cursor:pointer;"
                (click)="openConfusionModal(model)"
              >
                <h4 class="font-display" style="font-size:0.85rem;font-weight:600;text-align:center;margin:0 0 12px;color:var(--color-text-primary);">
                  {{ model.nombre_corto }}
                </h4>
                <div class="cm-grid">
                  <div class="cm-header"></div>
                  <div class="cm-header font-mono">Pred Neg</div>
                  <div class="cm-header font-mono">Pred Pos</div>

                  <div class="cm-row-label font-mono">Real Neg</div>
                  <div class="cm-cell cm-correct font-mono">{{ model.confusion_matrix[0][0].toLocaleString() }}</div>
                  <div class="cm-cell cm-error font-mono">{{ model.confusion_matrix[0][1].toLocaleString() }}</div>

                  <div class="cm-row-label font-mono">Real Pos</div>
                  <div class="cm-cell cm-error font-mono">{{ model.confusion_matrix[1][0].toLocaleString() }}</div>
                  <div class="cm-cell cm-correct font-mono">{{ model.confusion_matrix[1][1].toLocaleString() }}</div>
                </div>
              </div>
            }
          }
        </div>

        <!-- Live prediction -->
        <p class="section-label">Predicción en Vivo</p>
        <div class="card-section animate-fadeInUp">
          <label class="label" for="predict-input">Reseña de película (inglés o español)</label>
          <textarea
            id="predict-input"
            [ngModel]="predictText()"
            (ngModelChange)="predictText.set($event)"
            placeholder="Escribe una reseña en inglés o español... / Write a review in English or Spanish..."
            class="textarea"
            rows="3"
            (keydown.control.enter)="predict()"
          ></textarea>
          <div style="display:flex;align-items:center;gap:12px;margin-top:12px;">
            <button
              (click)="predict()"
              class="btn btn-primary"
              [disabled]="predicting()"
            >
              {{ predicting() ? 'Analizando...' : 'Analizar Sentimiento' }}
            </button>
            <span style="font-size:0.75rem;color:var(--color-text-muted);">Ctrl+Enter</span>
          </div>

          @if (predictionError()) {
            <div class="alert alert-error animate-scaleIn" style="margin-top:16px;">
              <div class="alert__content">
                <div class="alert__title">Error</div>
                <div style="font-size:0.85rem;margin-top:4px;">{{ predictionError() }}</div>
              </div>
            </div>
          }

          @if (prediction()) {
            <div
              class="alert animate-scaleIn"
              [class.alert-success]="isPositive(prediction().sentimiento)"
              [class.alert-error]="!isPositive(prediction().sentimiento)"
              style="margin-top:16px;text-align:center;"
            >
              <div class="alert__content">
                <div class="alert__title" style="font-size:1.1rem;">
                  {{ isPositive(prediction().sentimiento) ? 'POSITIVO' : 'NEGATIVO' }}
                </div>
                <div style="font-size:0.85rem;margin-top:4px;">
                  Confianza: {{ (prediction().confianza * 100).toFixed(1) }}%
                </div>
                @if (prediction().scores) {
                  <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
                    <span class="tag">Pos: {{ (prediction().scores.positivo * 100).toFixed(1) }}%</span>
                    <span class="tag">Neg: {{ (prediction().scores.negativo * 100).toFixed(1) }}%</span>
                  </div>
                }
                <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;font-size:0.75rem;color:var(--color-text-muted);">
                  <span class="tag">{{ prediction().idioma === 'es' ? 'Español' : 'Inglés' }}</span>
                  <span class="tag">{{ prediction().modelo }}</span>
                </div>
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
  styles: [`
    .section-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      margin-bottom: 12px;
    }
    .cm-grid {
      display: grid;
      grid-template-columns: auto 1fr 1fr;
      gap: 4px;
      max-width: 320px;
      margin: 0 auto;
    }
    .cm-header {
      font-size: 0.7rem;
      font-weight: 600;
      text-align: center;
      padding: 6px 4px;
      color: var(--color-text-muted);
    }
    .cm-row-label {
      font-size: 0.7rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      padding: 6px 4px;
      color: var(--color-text-muted);
    }
    .cm-cell {
      text-align: center;
      padding: 12px 8px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .cm-correct {
      background: #ECFDF5;
      color: #059669;
    }
    .cm-error {
      background: #FEF2F2;
      color: #991B1B;
    }
    .divider {
      border: none;
      border-top: 1px solid var(--color-border-subtle, #e5e7eb);
    }
    .td-clickable {
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s ease;
    }
    .td-clickable:hover {
      background: var(--color-bg-subtle, #f3f4f6);
    }
  `],
})
export class ModeloComponent implements OnInit {
  loading = signal(true);
  modelList = signal<any[]>([]);
  comparison = signal<any>(null);
  bestModelKey = signal<string>('');
  predictText = signal('');
  predicting = signal(false);
  prediction = signal<any>(null);
  predictionError = signal<string>('');
  modalVisible = signal(false);
  modalData = signal<ModalData | null>(null);

  private metricDescriptions: Record<string, { nombre: string; description: string; formula: string; interpretacion: string }> = {
    accuracy: {
      nombre: 'Exactitud (Accuracy)',
      description: 'Proporción de predicciones correctas sobre el total de predicciones realizadas. Es la métrica más intuitiva pero puede ser engañosa con datasets desbalanceados.',
      formula: '(TP + TN) / (TP + TN + FP + FN)',
      interpretacion: 'Un valor de 89% significa que de cada 100 reseñas, el modelo clasifica correctamente 89.',
    },
    precision: {
      nombre: 'Precisión (Precision)',
      description: 'De todas las predicciones positivas, qué proporción fue realmente positiva. Mide la fiabilidad cuando el modelo dice "positivo".',
      formula: 'TP / (TP + FP)',
      interpretacion: 'Alta precisión = pocas falsas alarmas. Importante cuando el costo de un falso positivo es alto.',
    },
    recall: {
      nombre: 'Sensibilidad (Recall)',
      description: 'De todos los casos realmente positivos, qué proporción fue detectada por el modelo. También conocido como tasa de verdaderos positivos o sensibilidad.',
      formula: 'TP / (TP + FN)',
      interpretacion: 'Alto recall = el modelo no se pierde muchos positivos. Importante cuando no queremos dejar pasar casos positivos.',
    },
    f1_score: {
      nombre: 'Puntuación F1 (F1-Score)',
      description: 'Media armónica de precisión y recall. Proporciona un balance único entre ambas métricas, penalizando valores extremos.',
      formula: '2 × (Precision × Recall) / (Precision + Recall)',
      interpretacion: 'F1 alto indica buen equilibrio entre precisión y recall. Es la métrica preferida cuando hay desbalance de clases.',
    },
    tiempo: {
      nombre: 'Tiempo de Entrenamiento',
      description: 'Tiempo que tarda el modelo en aprender los patrones del dataset de entrenamiento (25,000 reseñas con vectorización TF-IDF de 50,000 features).',
      formula: 'Medido en segundos (wall-clock time)',
      interpretacion: 'Menor tiempo = más eficiente. Importante para reentrenamiento frecuente o recursos limitados.',
    },
  };

  private modelDescriptions: Record<string, { description: string; algorithm: string; strengths: string; weaknesses: string }> = {
    naive_bayes: {
      description: 'Clasificador probabilístico basado en el teorema de Bayes con la suposición de independencia entre características. Rápido de entrenar y efectivo como baseline para clasificación de texto.',
      algorithm: 'MultinomialNB (scikit-learn)',
      strengths: 'Muy rápido de entrenar (1.23s), buen baseline, funciona bien con datos de alta dimensionalidad como TF-IDF.',
      weaknesses: 'Asume independencia entre palabras (raramente cierto en lenguaje natural), menor exactitud que modelos más complejos.',
    },
    logistic_regression: {
      description: 'Modelo lineal que usa la función sigmoide para estimar la probabilidad de pertenencia a una clase. Excelente balance entre rendimiento y velocidad.',
      algorithm: 'LogisticRegression (scikit-learn, max_iter=1000)',
      strengths: 'Buen equilibrio velocidad/rendimiento, produce probabilidades calibradas, fácil de interpretar.',
      weaknesses: 'Asume relación lineal entre características y la variable objetivo, puede no capturar patrones complejos.',
    },
    svm: {
      description: 'Máquina de Vectores de Soporte que encuentra el hiperplano óptimo para separar las clases. Mejor rendimiento en este dataset con 89.68% de exactitud.',
      algorithm: 'LinearSVC (scikit-learn, max_iter=2000)',
      strengths: 'Mayor exactitud (89.68%), robusto ante alta dimensionalidad, efectivo con TF-IDF sparse matrices.',
      weaknesses: 'Tiempo de entrenamiento significativamente mayor (142.35s), no produce probabilidades nativas.',
    },
  };

  constructor(private modelService: ModelService) {}

  ngOnInit() {
    this.modelService.getResults().subscribe({
      next: (data: any) => {
        const models = Object.entries(data).map(([key, val]: [string, any]) => ({ key, ...val }));
        this.modelList.set(models);

        let bestKey = '';
        let bestAcc = -1;
        for (const m of models) {
          if (m.accuracy > bestAcc) {
            bestAcc = m.accuracy;
            bestKey = m.key;
          }
        }
        this.bestModelKey.set(bestKey);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.modelService.getComparison().subscribe({
      next: (data) => this.comparison.set(data),
    });
  }

  isBest(values: number[], index: number, lowerIsBetter = false): boolean {
    if (!values || index < 0 || index >= values.length) return false;
    const target = lowerIsBetter ? Math.min(...values) : Math.max(...values);
    return values[index] === target;
  }

  isPositive(value: any): boolean {
    if (typeof value === 'string') {
      const v = value.toLowerCase().trim();
      return v === 'positivo' || v === 'positive' || v === 'pos';
    }
    if (typeof value === 'number') return value === 1;
    return !!value;
  }

  openModelModal(model: any) {
    const info = this.modelDescriptions[model.key];
    if (!info) return;
    this.modalData.set({
      title: model.nombre,
      value: (model.accuracy * 100).toFixed(2) + '%',
      description: info.description,
      details: [
        { label: 'Algoritmo', value: info.algorithm },
        { label: 'Exactitud', value: (model.accuracy * 100).toFixed(2) + '%' },
        { label: 'Precisión (macro)', value: (model.precision_macro * 100).toFixed(1) + '%' },
        { label: 'Recall (macro)', value: (model.recall_macro * 100).toFixed(1) + '%' },
        { label: 'F1-Score (macro)', value: (model.f1_macro * 100).toFixed(1) + '%' },
        { label: 'Tiempo entrenamiento', value: model.tiempo_entrenamiento + 's' },
        { label: 'Tiempo predicción', value: model.tiempo_prediccion + 's' },
        { label: 'Fortalezas', value: info.strengths },
        { label: 'Limitaciones', value: info.weaknesses },
      ],
    });
    this.modalVisible.set(true);
  }

  openConfusionModal(model: any) {
    const cm = model.confusion_matrix;
    const tn = cm[0][0], fp = cm[0][1], fn = cm[1][0], tp = cm[1][1];
    const total = tn + fp + fn + tp;
    const correctos = tn + tp;
    const errores = fp + fn;

    this.modalData.set({
      title: `Matriz de Confusión — ${model.nombre_corto}`,
      value: correctos.toLocaleString() + ' / ' + total.toLocaleString(),
      description: `El modelo ${model.nombre} clasificó correctamente ${correctos.toLocaleString()} de ${total.toLocaleString()} reseñas (${(correctos/total*100).toFixed(2)}%). Los errores se dividen en falsos positivos (${fp.toLocaleString()}) y falsos negativos (${fn.toLocaleString()}).`,
      details: [
        { label: 'Verdaderos Negativos (TN)', value: tn.toLocaleString() },
        { label: 'Falsos Positivos (FP)', value: fp.toLocaleString() },
        { label: 'Falsos Negativos (FN)', value: fn.toLocaleString() },
        { label: 'Verdaderos Positivos (TP)', value: tp.toLocaleString() },
        { label: 'Clasificaciones correctas', value: correctos.toLocaleString() + ' (' + (correctos/total*100).toFixed(1) + '%)' },
        { label: 'Clasificaciones erróneas', value: errores.toLocaleString() + ' (' + (errores/total*100).toFixed(1) + '%)' },
      ],
    });
    this.modalVisible.set(true);
  }

  openMetricModal(metricKey: string) {
    const comp = this.comparison();
    if (!comp) return;
    const metric = this.metricDescriptions[metricKey];
    if (!metric) return;

    const isTime = metricKey === 'tiempo';
    const fieldMap: Record<string, string> = {
      accuracy: 'accuracy',
      precision: 'precision',
      recall: 'recall',
      f1_score: 'f1_score',
      tiempo: 'tiempo_entrenamiento_seg',
    };
    const allValues: number[] = comp[fieldMap[metricKey]] ?? [];
    const best = isTime ? Math.min(...allValues) : Math.max(...allValues);
    const format = (v: number) => isTime ? v.toFixed(2) + 's' : (v * 100).toFixed(2) + '%';

    const ranking = allValues
      .map((v: number, i: number) => ({ v, name: comp.modelos[i] }))
      .sort((a: any, b: any) => isTime ? a.v - b.v : b.v - a.v);

    const details: { label: string; value: string }[] = ranking.map(
      (r: any, i: number) => ({
        label: `${i + 1}. ${r.name}`,
        value: format(r.v) + (r.v === best ? ' (Mejor)' : ''),
      })
    );

    details.push(
      { label: 'Fórmula', value: metric.formula },
      { label: 'Interpretación', value: metric.interpretacion },
    );

    this.modalData.set({
      title: metric.nombre,
      value: format(best),
      description: metric.description,
      details,
    });
    this.modalVisible.set(true);
  }

  openComparisonModal(metricKey: string, modelIndex: number, value: number) {
    const comp = this.comparison();
    if (!comp) return;
    const metric = this.metricDescriptions[metricKey];
    if (!metric) return;

    const modelName = comp.modelos[modelIndex];
    const isTime = metricKey === 'tiempo';
    const displayValue = isTime ? value.toFixed(2) + 's' : (value * 100).toFixed(2) + '%';

    const fieldMap: Record<string, string> = {
      accuracy: 'accuracy',
      precision: 'precision',
      recall: 'recall',
      f1_score: 'f1_score',
      tiempo: 'tiempo_entrenamiento_seg',
    };
    const allValues: number[] = comp[fieldMap[metricKey]] ?? [];

    const ranking = [...allValues]
      .map((v, i) => ({ v, name: comp.modelos[i] }))
      .sort((a, b) => isTime ? a.v - b.v : b.v - a.v);
    const position = ranking.findIndex(r => r.name === modelName) + 1;

    const best = isTime ? Math.min(...allValues) : Math.max(...allValues);
    const worst = isTime ? Math.max(...allValues) : Math.min(...allValues);
    const isBestModel = value === best;

    const details: { label: string; value: string }[] = [
      { label: 'Modelo', value: modelName },
      { label: 'Valor', value: displayValue },
      { label: 'Ranking', value: `${position}° de ${allValues.length}${isBestModel ? ' (Mejor)' : ''}` },
      { label: 'Mejor valor', value: isTime ? best.toFixed(2) + 's' : (best * 100).toFixed(2) + '%' },
      { label: 'Peor valor', value: isTime ? worst.toFixed(2) + 's' : (worst * 100).toFixed(2) + '%' },
      { label: 'Fórmula', value: metric.formula },
      { label: 'Interpretación', value: metric.interpretacion },
    ];

    this.modalData.set({
      title: `${metric.nombre} — ${modelName}`,
      value: displayValue,
      description: metric.description,
      details,
    });
    this.modalVisible.set(true);
  }

  closeModal() {
    this.modalVisible.set(false);
  }

  predict() {
    const text = this.predictText().trim();
    if (!text) return;
    if (this.predicting()) return;

    this.predicting.set(true);
    this.predictionError.set('');
    this.prediction.set(null);

    this.modelService.predict(text).subscribe({
      next: (data: any) => {
        this.prediction.set(data);
        this.predicting.set(false);
      },
      error: () => {
        this.predictionError.set('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
        this.predicting.set(false);
      },
    });
  }
}
