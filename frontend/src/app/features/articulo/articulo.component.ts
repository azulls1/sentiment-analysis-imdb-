import { Component, OnInit, signal } from '@angular/core';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-articulo',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `
    <div class="page page-medium">
      <div class="page-header animate-fadeIn">
        <h1 class="page-header__title font-display">Artículo de Referencia</h1>
        <p class="page-header__desc">Resumen del artículo base para esta actividad</p>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (article()) {
        <div class="stack stagger-children">
          <!-- Article header card -->
          <div class="card-hero animate-fadeInUp">
            <h2 class="card-hero__title" style="font-size:1.15rem;">{{ article().titulo }}</h2>
            <p style="margin:4px 0 12px;font-size:0.8rem;font-style:italic;color:var(--color-text-muted);">
              Título original: {{ article().titulo_original }}
            </p>
            <p class="card-hero__desc">
              {{ article().autores }}<br>
              {{ article().revista }} ({{ article().anio }}) &mdash; DOI: {{ article().doi }}
            </p>
          </div>

          <!-- Abstract -->
          <div class="card animate-fadeInUp">
            <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 10px;">
              Resumen
            </h3>
            <p style="margin:0 0 14px;line-height:1.7;font-size:0.875rem;color:var(--color-text-secondary);text-align:justify;">
              {{ article().abstract }}
            </p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              @for (kw of article().keywords; track kw) {
                <span class="tag">{{ kw }}</span>
              }
            </div>
          </div>

          <!-- Objetivo -->
          <div class="card animate-fadeInUp">
            <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 12px;">
              Objetivo
            </h3>
            <p style="margin:0 0 16px;line-height:1.7;font-size:0.875rem;color:var(--color-text-secondary);text-align:justify;">
              {{ article().objetivo.principal }}
            </p>

            <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.03em;">
              Objetivos Específicos
            </h4>
            <ul style="padding-left:18px;margin:0 0 16px;font-size:0.85rem;color:var(--color-text-secondary);line-height:1.7;">
              @for (obj of article().objetivo.especificos; track $index) {
                <li style="margin-bottom:4px;">{{ obj }}</li>
              }
            </ul>

            <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;border-left:3px solid var(--color-text-accent, #5B7065);">
              <p style="margin:0 0 4px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);">
                Hipótesis
              </p>
              <p style="margin:0;font-size:0.85rem;color:var(--color-text-secondary);line-height:1.7;font-style:italic;">
                {{ article().objetivo.hipotesis }}
              </p>
            </div>
          </div>

          <!-- Dataset -->
          <div class="card animate-fadeInUp">
            <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 12px;">
              Dataset
            </h3>
            <p style="margin:0 0 16px;line-height:1.7;font-size:0.875rem;color:var(--color-text-secondary);text-align:justify;">
              {{ article().dataset.descripcion }}
            </p>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:16px;">
              <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;text-align:center;">
                <p style="margin:0;font-size:1.25rem;font-weight:700;color:var(--color-text-primary);">{{ article().dataset.total_reviews?.toLocaleString() }}</p>
                <p style="margin:4px 0 0;font-size:0.75rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.03em;">Total Reseñas</p>
              </div>
              <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;text-align:center;">
                <p style="margin:0;font-size:1.25rem;font-weight:700;color:var(--color-text-primary);">{{ article().dataset.train_reviews?.toLocaleString() }}</p>
                <p style="margin:4px 0 0;font-size:0.75rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.03em;">Entrenamiento</p>
              </div>
              <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;text-align:center;">
                <p style="margin:0;font-size:1.25rem;font-weight:700;color:var(--color-text-primary);">{{ article().dataset.test_reviews?.toLocaleString() }}</p>
                <p style="margin:4px 0 0;font-size:0.75rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.03em;">Prueba</p>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.85rem;">
              <div><span style="color:var(--color-text-muted);">Nombre:</span> {{ article().dataset.nombre }}</div>
              <div><span style="color:var(--color-text-muted);">Tarea:</span> {{ article().dataset.tipo_tarea }}</div>
              <div><span style="color:var(--color-text-muted);">Idioma:</span> {{ article().dataset.idioma }}</div>
              <div><span style="color:var(--color-text-muted);">Dominio:</span> {{ article().dataset.dominio }}</div>
              <div><span style="color:var(--color-text-muted);">Positivas:</span> {{ article().dataset.positivas?.toLocaleString() }}</div>
              <div><span style="color:var(--color-text-muted);">Negativas:</span> {{ article().dataset.negativas?.toLocaleString() }}</div>
              <div style="grid-column:1/-1;"><span style="color:var(--color-text-muted);">Balance:</span> {{ article().dataset.balance }}</div>
            </div>

            <p style="margin:12px 0 0;font-size:0.78rem;font-style:italic;color:var(--color-text-muted);line-height:1.5;">
              Ref: {{ article().dataset.referencia_dataset }}
            </p>
          </div>

          <!-- Metodología -->
          <div class="card animate-fadeInUp">
            <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 14px;">
              Metodología
            </h3>

            <!-- Preprocesamiento -->
            <div style="margin-bottom:20px;">
              <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.03em;">
                1. Preprocesamiento
              </h4>
              <div style="display:flex;flex-direction:column;gap:8px;">
                @for (step of article().metodologia.preprocesamiento; track $index) {
                  <div style="display:flex;gap:12px;align-items:flex-start;">
                    <span style="min-width:24px;height:24px;border-radius:50%;background:var(--color-text-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;flex-shrink:0;">
                      {{ $index + 1 }}
                    </span>
                    <div>
                      <p style="margin:0;font-size:0.85rem;font-weight:600;color:var(--color-text-primary);">{{ step.paso }}</p>
                      <p style="margin:2px 0 0;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.5;">{{ step.descripcion }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Extracción de Características -->
            <div style="margin-bottom:20px;">
              <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.03em;">
                2. Extracción de Características
              </h4>
              <div style="display:flex;flex-direction:column;gap:10px;">
                @for (feat of article().metodologia.extraccion_features; track $index) {
                  <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                    <p style="margin:0 0 4px;font-size:0.85rem;font-weight:600;color:var(--color-text-primary);">{{ feat.nombre }}</p>
                    <p style="margin:0 0 8px;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.6;">{{ feat.descripcion }}</p>
                    @if (feat.formula) {
                      <p style="margin:0 0 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:0.78rem;color:var(--color-text-accent, #5B7065);background:white;padding:6px 10px;border-radius:4px;">
                        {{ feat.formula }}
                      </p>
                    }
                    <div style="display:flex;gap:16px;font-size:0.78rem;">
                      <span style="color:var(--color-text-muted);">Ventaja: <span style="color:#16a34a;">{{ feat.ventaja }}</span></span>
                      <span style="color:var(--color-text-muted);">Limitación: <span style="color:#dc2626;">{{ feat.limitacion }}</span></span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Clasificadores -->
            <div style="margin-bottom:20px;">
              <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.03em;">
                3. Clasificadores
              </h4>
              <div style="display:flex;flex-direction:column;gap:10px;">
                @for (clf of article().metodologia.clasificadores; track $index) {
                  <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                    <p style="margin:0 0 4px;font-size:0.85rem;font-weight:600;color:var(--color-text-primary);">{{ clf.nombre }}</p>
                    <p style="margin:0 0 8px;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.6;">{{ clf.descripcion }}</p>
                    <div style="display:flex;gap:16px;font-size:0.78rem;">
                      <span style="color:var(--color-text-muted);">Ventaja: <span style="color:#16a34a;">{{ clf.ventaja }}</span></span>
                      <span style="color:var(--color-text-muted);">Limitación: <span style="color:#dc2626;">{{ clf.limitacion }}</span></span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Evaluación -->
            <div>
              <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.03em;">
                4. Evaluación
              </h4>
              <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                <p style="margin:0 0 6px;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.6;">
                  {{ article().metodologia.evaluacion.descripcion }}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                  <span class="badge" style="background:#EFF6FF;color:#2563EB;">{{ article().metodologia.evaluacion.metrica_principal }}</span>
                  @for (m of article().metodologia.evaluacion.otras_metricas; track m) {
                    <span class="tag">{{ m }}</span>
                  }
                </div>
                <p style="margin:8px 0 0;font-size:0.78rem;color:var(--color-text-muted);">
                  Validación: {{ article().metodologia.evaluacion.validacion }}
                </p>
              </div>
            </div>
          </div>

          <!-- Results table -->
          <div class="card animate-fadeInUp">
            <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 12px;">
              Resultados Clave
            </h3>
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Método</th><th>NB</th><th>LR</th><th>SVM</th>
                  </tr>
                </thead>
                <tbody>
                  @for (method of ['BoW', 'TF-IDF', 'Hibrido']; track method) {
                    <tr [style.background]="method === 'Hibrido' ? 'rgba(91,112,101,0.08)' : 'transparent'">
                      <td style="font-weight:500;">{{ method }}</td>
                      <td class="mono">{{ article().resultados_clave[method]['NB'] }}%</td>
                      <td class="mono">{{ article().resultados_clave[method]['LR'] }}%</td>
                      <td class="mono" [style.font-weight]="method === 'Hibrido' ? '700' : '400'" [style.color]="method === 'Hibrido' ? 'var(--color-text-primary)' : 'inherit'">
                        {{ article().resultados_clave[method]['SVM'] }}%
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="alert alert-success" style="margin-top:12px;">
              <div class="alert__content">
                Mejor resultado: <strong>{{ article().mejor_resultado.clasificador }}</strong>
                con {{ article().mejor_resultado.metodo }} &mdash;
                <strong>{{ article().mejor_resultado.accuracy }}%</strong>
              </div>
            </div>
          </div>

          <!-- Análisis de Resultados -->
          @if (article().analisis_resultados) {
            <div class="card animate-fadeInUp">
              <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 14px;">
                Análisis de Resultados
              </h3>

              <!-- Mejoras del método híbrido -->
              <div style="margin-bottom:20px;">
                <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.03em;">
                  Mejora del Método Híbrido
                </h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                    <p style="margin:0 0 8px;font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;color:var(--color-text-muted);">
                      vs BoW
                    </p>
                    <div style="display:flex;flex-direction:column;gap:4px;font-size:0.82rem;">
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:var(--color-text-secondary);">NB</span>
                        <span style="color:#16a34a;font-weight:600;">{{ article().analisis_resultados.mejora_hibrido_vs_bow['NB'] }}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:var(--color-text-secondary);">LR</span>
                        <span style="color:#16a34a;font-weight:600;">{{ article().analisis_resultados.mejora_hibrido_vs_bow['LR'] }}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:var(--color-text-secondary);">SVM</span>
                        <span style="color:#16a34a;font-weight:600;">{{ article().analisis_resultados.mejora_hibrido_vs_bow['SVM'] }}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-top:1px solid var(--color-border, #e5e7eb);padding-top:4px;margin-top:2px;">
                        <span style="color:var(--color-text-primary);font-weight:600;">Promedio</span>
                        <span style="color:#16a34a;font-weight:700;">{{ article().analisis_resultados.mejora_hibrido_vs_bow['promedio'] }}</span>
                      </div>
                    </div>
                  </div>
                  <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                    <p style="margin:0 0 8px;font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;color:var(--color-text-muted);">
                      vs TF-IDF
                    </p>
                    <div style="display:flex;flex-direction:column;gap:4px;font-size:0.82rem;">
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:var(--color-text-secondary);">NB</span>
                        <span style="color:#16a34a;font-weight:600;">{{ article().analisis_resultados.mejora_hibrido_vs_tfidf['NB'] }}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:var(--color-text-secondary);">LR</span>
                        <span style="color:#16a34a;font-weight:600;">{{ article().analisis_resultados.mejora_hibrido_vs_tfidf['LR'] }}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:var(--color-text-secondary);">SVM</span>
                        <span style="color:#16a34a;font-weight:600;">{{ article().analisis_resultados.mejora_hibrido_vs_tfidf['SVM'] }}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;border-top:1px solid var(--color-border, #e5e7eb);padding-top:4px;margin-top:2px;">
                        <span style="color:var(--color-text-primary);font-weight:600;">Promedio</span>
                        <span style="color:#16a34a;font-weight:700;">{{ article().analisis_resultados.mejora_hibrido_vs_tfidf['promedio'] }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ranking de clasificadores -->
              <div style="margin-bottom:20px;">
                <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.03em;">
                  Ranking de Clasificadores
                </h4>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  @for (rank of article().analisis_resultados.ranking_clasificadores; track rank.posicion) {
                    <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;display:flex;gap:12px;align-items:flex-start;"
                         [style.border-left]="rank.posicion === 1 ? '3px solid #16a34a' : '3px solid transparent'">
                      <span style="min-width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0;"
                            [style.background]="rank.posicion === 1 ? '#16a34a' : rank.posicion === 2 ? 'var(--color-text-muted)' : '#9ca3af'"
                            style="color:white;">
                        {{ rank.posicion }}
                      </span>
                      <div style="flex:1;">
                        <div style="display:flex;justify-content:space-between;align-items:baseline;">
                          <p style="margin:0;font-size:0.85rem;font-weight:600;color:var(--color-text-primary);">{{ rank.clasificador }}</p>
                          <span class="mono" style="font-size:0.85rem;font-weight:700;color:var(--color-text-primary);">{{ rank.mejor_accuracy }}%</span>
                        </div>
                        <p style="margin:4px 0 0;font-size:0.78rem;color:var(--color-text-secondary);line-height:1.5;">{{ rank.razon }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Hallazgos clave -->
              <div style="margin-bottom:20px;">
                <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.03em;">
                  Hallazgos Clave
                </h4>
                <ul style="padding-left:18px;margin:0;font-size:0.83rem;color:var(--color-text-secondary);line-height:1.7;">
                  @for (h of article().analisis_resultados.hallazgos_clave; track $index) {
                    <li style="margin-bottom:6px;">{{ h }}</li>
                  }
                </ul>
              </div>

              <!-- Comparación con trabajos previos -->
              <div>
                <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.03em;">
                  Comparación con Trabajos Previos
                </h4>
                <div class="table-wrapper">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Autores</th><th>Método</th><th>Accuracy</th><th>Comparación</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (prev of article().analisis_resultados.comparacion_trabajos_previos; track $index) {
                        <tr>
                          <td style="font-size:0.8rem;">{{ prev.autores }}</td>
                          <td style="font-size:0.8rem;">{{ prev.metodo }}</td>
                          <td class="mono" style="font-size:0.8rem;">{{ prev.accuracy }}%</td>
                          <td style="font-size:0.78rem;color:var(--color-text-secondary);">{{ prev.nota }}</td>
                        </tr>
                      }
                      <tr style="background:rgba(91,112,101,0.08);">
                        <td style="font-weight:600;font-size:0.8rem;">Keerthi Kumar (2019)</td>
                        <td style="font-weight:600;font-size:0.8rem;">Híbrido + SVM</td>
                        <td class="mono" style="font-weight:700;font-size:0.8rem;">88.75%</td>
                        <td style="font-size:0.78rem;color:#16a34a;font-weight:600;">Mejor resultado</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }

          <!-- Conclusiones -->
          <div class="card animate-fadeInUp">
            <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 10px;">
              Conclusiones
            </h3>
            <ul style="padding-left:18px;margin:0 0 20px;font-size:0.85rem;color:var(--color-text-secondary);line-height:1.7;">
              @for (c of article().conclusiones; track $index) {
                <li style="margin-bottom:6px;">{{ c }}</li>
              }
            </ul>

            <!-- Limitaciones -->
            @if (article().limitaciones) {
              <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.03em;">
                Limitaciones del Estudio
              </h4>
              <ul style="padding-left:18px;margin:0 0 20px;font-size:0.83rem;color:var(--color-text-secondary);line-height:1.7;">
                @for (l of article().limitaciones; track $index) {
                  <li style="margin-bottom:4px;">{{ l }}</li>
                }
              </ul>
            }

            <!-- Trabajo Futuro -->
            @if (article().trabajo_futuro) {
              <h4 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.03em;">
                Trabajo Futuro
              </h4>
              <ul style="padding-left:18px;margin:0;font-size:0.83rem;color:var(--color-text-secondary);line-height:1.7;">
                @for (tf of article().trabajo_futuro; track $index) {
                  <li style="margin-bottom:4px;">{{ tf }}</li>
                }
              </ul>
            }
          </div>

        </div>
      }
    </div>
  `,
  styles: [],
})
export class ArticuloComponent implements OnInit {
  loading = signal(true);
  article = signal<any>(null);

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.articleService.getSummary().subscribe({
      next: (data) => {
        this.article.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
