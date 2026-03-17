import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page page-wide">
      <div class="page-header animate-fadeIn">
        <h1 class="page-header__title font-display">Pipeline NLP</h1>
        <p class="page-header__desc">Visualizacion paso a paso del procesamiento de texto para analisis de sentimientos</p>
      </div>

      <!-- Hero -->
      <div class="card-hero animate-fadeInUp" style="margin-bottom:32px;">
        <h2 class="card-hero__title">Del Texto a la Prediccion</h2>
        <p class="card-hero__desc">
          Cada resena pasa por un pipeline de 7 etapas antes de ser clasificada.
          Ingresa un texto para ver la transformacion en tiempo real, o haz click en cualquier paso para conocer la teoria detras.
        </p>
      </div>

      <!-- Seccion informativa: Etapas del Pipeline -->
      <div class="card-section animate-fadeInUp" style="margin-bottom:32px;">
        <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 6px;">
          Etapas del Pipeline de Analisis de Sentimientos
        </h3>
        <p style="margin:0 0 18px;font-size:0.78rem;color:var(--color-text-muted);line-height:1.5;">
          Haz click en cada etapa para ver explicacion detallada, ejemplos y su relacion con el articulo de referencia.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
          @for (step of steps; track step.nombre; let i = $index) {
            <div class="pipeline-info-card" (click)="abrirModal(i)">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;"
                     [style.background]="step.color">
                  {{ step.icono }}
                </div>
                <div>
                  <div style="font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);">Paso {{ i + 1 }}</div>
                  <div style="font-size:0.82rem;font-weight:600;color:var(--color-text-primary);">{{ step.nombre }}</div>
                </div>
              </div>
              <p style="margin:0;font-size:0.75rem;color:var(--color-text-secondary);line-height:1.5;">{{ step.descripcion }}</p>
              <span style="display:block;margin-top:8px;font-size:0.7rem;color:var(--color-text-muted);">Ver detalle &#8250;</span>
            </div>
          }
        </div>
      </div>

      <!-- Demo interactiva: Input + Pipeline -->
      <div class="card-section animate-fadeInUp" style="margin-bottom:12px;">
        <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 4px;">
          Demo Interactiva: Transformacion Paso a Paso
        </h3>
        <p style="margin:0 0 14px;font-size:0.78rem;color:var(--color-text-muted);line-height:1.5;">
          Soporta textos en ingles y espanol. Escribe, pega, sube un archivo o usa los ejemplos para ver la transformacion.
        </p>
        <textarea
          id="pipeline-input"
          [(ngModel)]="inputText"
          (ngModelChange)="processPipeline()"
          placeholder="Escribe o pega una resena de pelicula..."
          class="textarea"
          rows="2"
        ></textarea>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center;">
          <button class="btn btn-ghost" (click)="useExample('en')">Negativo (EN)</button>
          <button class="btn btn-ghost" (click)="useExample('es')">Positivo (ES)</button>
          <button class="btn btn-ghost" (click)="useExample('sarcasm')">Sarcasmo</button>
          <button class="btn btn-ghost" (click)="useExample('mixed')">Mixto</button>
          <span style="width:1px;height:20px;background:var(--color-border, #e5e7eb);"></span>
          <label class="btn btn-ghost" style="cursor:pointer;display:flex;align-items:center;gap:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Subir archivo
            <input type="file" accept=".txt,.csv,.text" (change)="onFileUpload($event)" style="display:none;" />
          </label>
        </div>
        @if (fileName()) {
          <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
            <span style="font-size:0.75rem;color:var(--color-text-muted);">Archivo cargado:</span>
            <span class="badge" style="font-size:0.72rem;">{{ fileName() }}</span>
            <button style="background:none;border:none;cursor:pointer;font-size:0.75rem;color:#DC2626;padding:2px 6px;" (click)="clearFile()">&#10005; Quitar</button>
          </div>
        }
      </div>

      <!-- Idioma detectado -->
      @if (inputText.trim()) {
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:10px 16px;background:var(--color-bg-muted);border-radius:8px;">
          <span style="font-size:1rem;">{{ detectedLang() === 'es' ? '\uD83C\uDDEA\uD83C\uDDF8' : '\uD83C\uDDFA\uD83C\uDDF8' }}</span>
          <span style="font-size:0.78rem;color:var(--color-text-secondary);">
            Idioma detectado: <strong>{{ detectedLang() === 'es' ? 'Espanol' : 'Ingles' }}</strong>
          </span>
          <span style="font-size:0.72rem;color:var(--color-text-muted);">|</span>
          <span style="font-size:0.78rem;color:var(--color-text-secondary);">
            {{ tokens().length }} palabras &#8594; {{ filteredTokens().length }} tokens utiles
          </span>
        </div>
      }

      <!-- Pipeline steps visualization (siempre visible) -->
      @if (inputText.trim()) {
        <div class="stagger-children" style="display:grid;gap:0;margin-bottom:32px;">
          @for (step of steps; track step.nombre; let i = $index) {
            <!-- Connector arrow -->
            @if (i > 0) {
              <div style="display:flex;justify-content:center;padding:4px 0;">
                <svg width="24" height="24" viewBox="0 0 24 24" style="color:var(--color-text-muted);">
                  <path d="M12 4v16M6 14l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            }

            <!-- Step card -->
            <div class="card animate-fadeInUp pipeline-step-card" style="overflow:hidden;padding:0;">
              <div class="pipeline-step-header" (click)="abrirModal(i)">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;"
                       [style.background]="step.color">
                    {{ step.icono }}
                  </div>
                  <div>
                    <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);">
                      Paso {{ i + 1 }}
                    </div>
                    <div style="font-size:0.88rem;font-weight:600;color:var(--color-text-primary);">
                      {{ step.nombre }}
                    </div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:0.72rem;color:var(--color-text-muted);display:none;" class="step-desc-desktop">{{ step.descripcion }}</span>
                  <span style="font-size:0.7rem;color:var(--color-text-muted);">&#9432;</span>
                </div>
              </div>
              <div style="padding:16px 20px;">
                @switch (i) {
                  @case (0) {
                    <div style="font-size:0.85rem;color:var(--color-text-secondary);line-height:1.7;word-break:break-word;">
                      {{ inputText }}
                    </div>
                  }
                  @case (1) {
                    <div style="font-size:0.85rem;color:var(--color-text-secondary);line-height:1.7;word-break:break-word;">
                      {{ cleanedText() }}
                    </div>
                    @if (cleanedText() !== inputText) {
                      <div style="margin-top:8px;font-size:0.75rem;color:#D97706;">Se eliminaron etiquetas HTML y caracteres especiales</div>
                    }
                  }
                  @case (2) {
                    <div style="font-size:0.85rem;color:var(--color-text-secondary);line-height:1.7;word-break:break-word;">
                      {{ lowercasedText() }}
                    </div>
                  }
                  @case (3) {
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                      @for (token of tokens(); track $index) {
                        <span class="tag" style="font-size:0.8rem;">{{ token }}</span>
                      }
                    </div>
                    <div style="margin-top:8px;font-size:0.75rem;color:var(--color-text-muted);">
                      {{ tokens().length }} tokens generados
                    </div>
                  }
                  @case (4) {
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                      @for (token of filteredTokens(); track $index) {
                        <span class="tag" style="font-size:0.8rem;">{{ token }}</span>
                      }
                    </div>
                    <div style="margin-top:8px;font-size:0.75rem;color:var(--color-text-muted);">
                      {{ filteredTokens().length }} tokens (se eliminaron {{ tokens().length - filteredTokens().length }} stopwords)
                    </div>
                    @if (removedStopwords().length > 0) {
                      <div style="margin-top:6px;font-size:0.75rem;color:#DC2626;">
                        Eliminados: {{ removedStopwords().slice(0, 20).join(', ') }}{{ removedStopwords().length > 20 ? '...' : '' }}
                      </div>
                    }
                  }
                  @case (5) {
                    <div style="overflow-x:auto;">
                      <div style="display:flex;align-items:flex-end;gap:3px;min-height:80px;padding:8px 0;">
                        @for (feat of tfidfFeatures(); track feat.term) {
                          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:48px;">
                            <div style="font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:var(--color-text-muted);">
                              {{ feat.score.toFixed(2) }}
                            </div>
                            <div style="width:32px;border-radius:4px 4px 0 0;transition:height 0.3s;"
                                 [style.height.px]="feat.score * 60"
                                 [style.background]="feat.sentiment === 'pos' ? '#059669' : feat.sentiment === 'neg' ? '#DC2626' : 'var(--color-text-primary)'">
                            </div>
                            <div style="font-size:0.65rem;color:var(--color-text-secondary);writing-mode:vertical-lr;transform:rotate(180deg);max-height:60px;overflow:hidden;">
                              {{ feat.term }}
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                    <div style="margin-top:8px;display:flex;gap:12px;font-size:0.72rem;color:var(--color-text-muted);">
                      <span>Top {{ tfidfFeatures().length }} features TF-IDF</span>
                      <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#059669;"></span> Positivo</span>
                      <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#DC2626;"></span> Negativo</span>
                      <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--color-text-primary);"></span> Neutral</span>
                    </div>
                  }
                  @case (6) {
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                      @for (pred of predictions(); track pred.modelo) {
                        <div style="text-align:center;padding:12px;border-radius:8px;"
                             [style.background]="pred.sentimiento === 'positivo' ? '#ECFDF5' : '#FEF2F2'">
                          <div style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);margin-bottom:4px;">{{ pred.modelo }}</div>
                          <div style="font-size:1.1rem;font-weight:700;"
                               [style.color]="pred.sentimiento === 'positivo' ? '#059669' : '#DC2626'">
                            {{ pred.sentimiento === 'positivo' ? 'POSITIVO' : 'NEGATIVO' }}
                          </div>
                          <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:2px;">
                            {{ (pred.confianza * 100).toFixed(0) }}% confianza
                          </div>
                          <div style="margin-top:6px;font-size:0.7rem;color:var(--color-text-muted);">
                            Ref: {{ pred.accuracy_real }}% en IMDb
                          </div>
                        </div>
                      }
                    </div>
                    <div style="margin-top:12px;font-size:0.75rem;color:var(--color-text-muted);text-align:center;font-style:italic;">
                      * Prediccion simulada con heuristicas de palabras clave. Los porcentajes de referencia son del articulo de Keerthi Kumar (2019).
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Seccion: Sobre este Pipeline -->
      <div class="card-section animate-fadeInUp" style="margin-bottom:24px;">
        <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 14px;">
          Contexto del Pipeline en el Articulo de Referencia
        </h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div style="background:var(--color-bg-muted);border-radius:10px;padding:14px 18px;">
            <p style="margin:0 0 4px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);">Articulo de referencia</p>
            <p style="margin:0;font-size:0.82rem;color:var(--color-text-secondary);line-height:1.6;">
              Keerthi Kumar & Harish (2019) aplican este pipeline con 5 pasos de preprocesamiento + 3 metodos de extraccion de caracteristicas (BoW, TF-IDF, Hibrido) + 3 clasificadores (NB, LR, SVM). Mejor resultado: <strong>SVM + Hibrido = 88.75%</strong>.
            </p>
          </div>
          <div style="background:var(--color-bg-muted);border-radius:10px;padding:14px 18px;">
            <p style="margin:0 0 4px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);">Nuestra implementacion</p>
            <p style="margin:0;font-size:0.82rem;color:var(--color-text-secondary);line-height:1.6;">
              Replicamos el pipeline y obtuvimos <strong>89.68%</strong> con SVM + TF-IDF (unigramas + bigramas, max_features=50,000), superando el resultado original en +0.93 pp. La diferencia esta en la optimizacion de hiperparametros del preprocesamiento.
            </p>
          </div>
        </div>
        <div style="background:rgba(91,112,101,0.06);border-radius:8px;padding:12px 16px;border-left:3px solid var(--color-text-accent, #5B7065);">
          <p style="margin:0;font-size:0.82rem;color:var(--color-text-secondary);line-height:1.6;">
            <strong>Importancia del preprocesamiento:</strong> La calidad del preprocesamiento impacta mas que la eleccion del clasificador. Eliminar ruido HTML, normalizar texto, remover stopwords irrelevantes y generar buenos features TF-IDF puede representar una diferencia de 3-5 puntos porcentuales en accuracy.
          </p>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    @if (modalStep() !== null) {
      <div style="position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;"
           (click)="cerrarModal()">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);"></div>

        <div style="position:relative;background:var(--color-bg-primary, #fff);border-radius:16px;max-width:720px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 24px 48px rgba(0,0,0,0.2);animation:modalIn 0.25s ease-out;"
             (click)="$event.stopPropagation()">

          <!-- Modal header -->
          <div style="position:sticky;top:0;z-index:1;background:var(--color-bg-primary, #fff);border-bottom:1px solid var(--color-border, #e5e7eb);padding:20px 24px;border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;"
                   [style.background]="steps[modalStep()!].color">
                {{ steps[modalStep()!].icono }}
              </div>
              <div>
                <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);">Paso {{ modalStep()! + 1 }} de 7</div>
                <h2 class="font-display" style="font-size:1.15rem;font-weight:700;color:var(--color-text-primary);margin:0;">
                  {{ steps[modalStep()!].nombre }}
                </h2>
              </div>
            </div>
            <button (click)="cerrarModal()" class="modal-close-btn">&#10005;</button>
          </div>

          <!-- Modal body -->
          <div style="padding:24px;">
            <!-- Descripcion extendida -->
            <div style="margin-bottom:24px;">
              <h3 class="modal-section-title">Descripcion</h3>
              <p style="margin:0;line-height:1.8;font-size:0.875rem;color:var(--color-text-secondary);text-align:justify;">
                {{ steps[modalStep()!].detalle.descripcion_extendida }}
              </p>
            </div>

            <!-- Por que es importante -->
            <div style="margin-bottom:24px;">
              <h3 class="modal-section-title">Por que es importante</h3>
              <div style="display:flex;flex-direction:column;gap:8px;">
                @for (punto of steps[modalStep()!].detalle.por_que_importa; track $index) {
                  <div style="display:flex;gap:10px;align-items:flex-start;">
                    <span style="min-width:22px;height:22px;border-radius:50%;background:var(--color-bg-muted);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:var(--color-text-muted);flex-shrink:0;">
                      {{ $index + 1 }}
                    </span>
                    <p style="margin:0;font-size:0.84rem;color:var(--color-text-secondary);line-height:1.6;">{{ punto }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Ejemplos -->
            <div style="margin-bottom:24px;">
              <h3 class="modal-section-title">Ejemplos</h3>
              <div style="display:flex;flex-direction:column;gap:10px;">
                @for (ej of steps[modalStep()!].detalle.ejemplos; track $index) {
                  <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                    <p style="margin:0 0 6px;font-size:0.84rem;font-weight:600;color:var(--color-text-primary);line-height:1.5;">
                      {{ ej.titulo }}
                    </p>
                    @if (ej.antes) {
                      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:6px;">
                        <div style="background:var(--color-bg-primary);border-radius:6px;padding:8px 10px;font-size:0.78rem;color:var(--color-text-secondary);font-family:'JetBrains Mono',monospace;">{{ ej.antes }}</div>
                        <span style="font-size:1rem;color:var(--color-text-muted);">&#8594;</span>
                        <div style="background:var(--color-bg-primary);border-radius:6px;padding:8px 10px;font-size:0.78rem;color:var(--color-text-primary);font-family:'JetBrains Mono',monospace;font-weight:600;">{{ ej.despues }}</div>
                      </div>
                    }
                    <p style="margin:0;font-size:0.78rem;color:var(--color-text-secondary);line-height:1.5;">
                      {{ ej.explicacion }}
                    </p>
                  </div>
                }
              </div>
            </div>

            <!-- Impacto en accuracy -->
            @if (steps[modalStep()!].detalle.impacto) {
              <div style="margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:#ECFDF5;border-radius:8px;padding:12px 16px;border-left:3px solid #059669;">
                  <p style="margin:0 0 4px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#059669;">Si se aplica bien</p>
                  <p style="margin:0;font-size:0.82rem;color:var(--color-text-secondary);line-height:1.5;">{{ steps[modalStep()!].detalle.impacto!.bien }}</p>
                </div>
                <div style="background:#FEF2F2;border-radius:8px;padding:12px 16px;border-left:3px solid #DC2626;">
                  <p style="margin:0 0 4px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#DC2626;">Si se omite o aplica mal</p>
                  <p style="margin:0;font-size:0.82rem;color:var(--color-text-secondary);line-height:1.5;">{{ steps[modalStep()!].detalle.impacto!.mal }}</p>
                </div>
              </div>
            }

            <!-- En el articulo de referencia -->
            <div style="margin-bottom:24px;background:rgba(91,112,101,0.06);border-radius:8px;padding:14px 18px;border-left:3px solid var(--color-text-accent, #5B7065);">
              <h3 style="font-size:0.8rem;color:var(--color-text-accent, #5B7065);font-weight:600;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.04em;">
                En el Articulo de Keerthi Kumar (2019)
              </h3>
              <p style="margin:0;line-height:1.7;font-size:0.84rem;color:var(--color-text-secondary);">
                {{ steps[modalStep()!].detalle.en_articulo }}
              </p>
            </div>

            <!-- Herramientas usadas -->
            @if (steps[modalStep()!].detalle.herramientas) {
              <div style="margin-bottom:24px;">
                <h3 class="modal-section-title">Herramientas y Bibliotecas</h3>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                  @for (h of steps[modalStep()!].detalle.herramientas!; track $index) {
                    <div style="background:var(--color-bg-muted);border-radius:6px;padding:6px 12px;font-size:0.78rem;color:var(--color-text-secondary);">
                      <strong>{{ h.nombre }}</strong> — {{ h.uso }}
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Navegacion -->
            <div style="display:flex;justify-content:space-between;padding-top:16px;border-top:1px solid var(--color-border, #e5e7eb);">
              <button class="btn btn-ghost" [disabled]="modalStep()! === 0" (click)="modalStep.set(modalStep()! - 1)" style="font-size:0.8rem;">
                &#8592; {{ modalStep()! > 0 ? steps[modalStep()! - 1].nombre : '' }}
              </button>
              <button class="btn btn-ghost" [disabled]="modalStep()! === steps.length - 1" (click)="modalStep.set(modalStep()! + 1)" style="font-size:0.8rem;">
                {{ modalStep()! < steps.length - 1 ? steps[modalStep()! + 1].nombre : '' }} &#8594;
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .pipeline-info-card {
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 12px;
      padding: 14px 16px;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .pipeline-info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
    .pipeline-step-card {
      transition: box-shadow 0.2s ease;
    }
    .pipeline-step-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-border-subtle);
      cursor: pointer;
      transition: background 0.15s;
    }
    .pipeline-step-header:hover {
      background: var(--color-bg-muted);
    }
    .modal-close-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: var(--color-bg-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: var(--color-text-muted);
      transition: background 0.15s;
    }
    .modal-close-btn:hover {
      background: var(--color-border, #d1d5db);
    }
    .modal-section-title {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: 600;
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    @media (min-width: 768px) {
      .step-desc-desktop { display: inline !important; }
    }
  `],
})
export class PipelineComponent {
  inputText = 'This movie was absolutely terrible! The acting was bad, but the cinematography wasn\'t entirely without merit. I wouldn\'t recommend it to anyone.';
  modalStep = signal<number | null>(null);
  fileName = signal<string>('');

  abrirModal(index: number) {
    this.modalStep.set(index);
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.modalStep.set(null);
    document.body.style.overflow = '';
  }

  steps: any[] = [
    {
      nombre: 'Texto Original',
      descripcion: 'Entrada sin procesar tal como viene del dataset',
      icono: '\uD83D\uDCDD',
      color: '#EFF6FF',
      detalle: {
        descripcion_extendida: 'El primer paso del pipeline es recibir el texto crudo tal como existe en el dataset de IMDb. Las resenas de usuarios contienen todo tipo de ruido: etiquetas HTML del scraping web (<br>, <p>, <b>), caracteres especiales, emojis, URLs, y formatos inconsistentes. Este texto "sucio" es la materia prima que el pipeline transformara paso a paso en una representacion numerica que los clasificadores puedan procesar. La calidad del texto de entrada determina el techo de rendimiento del sistema completo.',
        por_que_importa: [
          'El dataset de IMDb contiene resenas scraped de la web, por lo que incluyen HTML residual que no aporta informacion semantica.',
          'Cada resena tiene longitud variable: desde 1 oracion hasta 30+ parrafos. El pipeline debe manejar ambos extremos.',
          'Las resenas contienen opinion subjetiva expresada en lenguaje natural, con sarcasmo, ironia y matices que son dificiles para los modelos.',
          'Entender la naturaleza del texto de entrada ayuda a disenar el preprocesamiento adecuado para el dominio.',
        ],
        ejemplos: [
          {
            titulo: 'Resena con HTML (comun en IMDb)',
            antes: '<br/>This movie was <b>awful</b>!!',
            despues: 'This movie was awful!!',
            explicacion: 'El scraping de IMDb preserva etiquetas HTML que deben limpiarse antes de cualquier procesamiento.',
          },
          {
            titulo: 'Resena larga y detallada',
            antes: '',
            despues: '',
            explicacion: 'Las resenas de IMDb promedian ~230 palabras. Las mas largas (>500 palabras) tienden a ser mas matizadas y dificiles de clasificar porque mezclan elogios con criticas.',
          },
          {
            titulo: 'Resena con sentimiento ambiguo',
            antes: '',
            despues: '',
            explicacion: '"Not the worst movie, but certainly not good either" — Este tipo de negacion compuesta es uno de los mayores retos del analisis de sentimientos.',
          },
        ],
        en_articulo: 'Keerthi Kumar & Harish (2019) utilizan el dataset Large Movie Review de Maas et al. (2011) con 50,000 resenas: 25,000 para entrenamiento y 25,000 para prueba, perfectamente balanceado (50% positivo, 50% negativo). Las resenas con puntuacion <=4 son negativas y >=7 positivas, descartando las neutrales (5-6).',
        impacto: {
          bien: 'Comprender la estructura y ruido del texto permite disenar un preprocesamiento efectivo desde el inicio.',
          mal: 'Ignorar las caracteristicas del texto (HTML, longitud, ambiguedad) lleva a un preprocesamiento inadecuado que pierde informacion valiosa.',
        },
      },
    },
    {
      nombre: 'Limpieza de Texto',
      descripcion: 'Eliminar HTML, caracteres especiales y ruido',
      icono: '\uD83E\uDDF9',
      color: '#FEF2F2',
      detalle: {
        descripcion_extendida: 'La limpieza de texto elimina todo el contenido que no aporta informacion semantica para la clasificacion de sentimientos. Esto incluye etiquetas HTML (<br>, <p>, <b>, <i>), entidades HTML (&amp;, &lt;), caracteres especiales, URLs, direcciones de email, y secuencias de puntuacion excesiva. El objetivo es quedarse unicamente con el texto natural que expresa la opinion del autor. Esta etapa es especialmente critica para datos scraped de la web como las resenas de IMDb, donde el HTML residual es comun.',
        por_que_importa: [
          'Las etiquetas HTML no aportan informacion de sentimiento y generan tokens basura que contaminan el vocabulario del modelo.',
          'Los caracteres especiales y puntuacion excesiva ("!!!!!") no son utiles para modelos bag-of-words; solo agregan dimensionalidad sin informacion.',
          'La limpieza reduce el tamano del vocabulario significativamente, lo que mejora eficiencia y reduce overfitting.',
          'Un texto limpio permite que las etapas posteriores (tokenizacion, TF-IDF) funcionen correctamente sin artefactos.',
        ],
        ejemplos: [
          {
            titulo: 'Eliminacion de HTML',
            antes: 'Great movie!<br/><br/>Loved it',
            despues: 'Great movie Loved it',
            explicacion: 'Las etiquetas <br/> son restos del formato web de IMDb. Se eliminan con expresiones regulares: text.replace(/<[^>]*>/g, "")',
          },
          {
            titulo: 'Entidades HTML',
            antes: 'It&apos;s a 10/10 &amp; worth watching',
            despues: "It's a 10 10 worth watching",
            explicacion: 'Las entidades HTML se decodifican o eliminan. &apos; se convierte en apostrofe, &amp; se elimina como caracter especial.',
          },
          {
            titulo: 'Puntuacion excesiva',
            antes: 'TERRIBLE!!!! WORST EVER!!!!',
            despues: 'TERRIBLE WORST EVER',
            explicacion: 'La intensidad emocional de "!!!!" se pierde, pero para modelos bag-of-words la presencia de "TERRIBLE" es suficiente. Modelos mas sofisticados podrian preservar esta senal.',
          },
        ],
        en_articulo: 'El articulo menciona "Eliminacion de etiquetas HTML" como primer paso de preprocesamiento. Las resenas crudas del dataset de Maas et al. contienen HTML del scraping original de la web de IMDb.',
        impacto: {
          bien: 'Vocabulario limpio, menos dimensionalidad, tokens de mejor calidad para TF-IDF.',
          mal: 'HTML y basura generan tokens como "br", "amp", "nbsp" que diluyen las features discriminativas reales.',
        },
        herramientas: [
          { nombre: 'BeautifulSoup', uso: 'Parsing y limpieza de HTML en Python' },
          { nombre: 'regex', uso: 'Patrones para eliminar caracteres especiales' },
          { nombre: 'html.unescape()', uso: 'Decodificar entidades HTML a texto' },
        ],
      },
    },
    {
      nombre: 'Normalizacion',
      descripcion: 'Convertir a minusculas para unificar representacion',
      icono: '\uD83D\uDD21',
      color: '#FFFBEB',
      detalle: {
        descripcion_extendida: 'La normalizacion convierte todo el texto a minusculas para que el modelo trate "Movie", "movie" y "MOVIE" como el mismo token. Sin esta etapa, cada variante de capitalizacion se trataria como una palabra diferente en el vocabulario, multiplicando innecesariamente la dimensionalidad. Tambien se podrian incluir otras normalizaciones como expansion de contracciones ("don\'t" a "do not"), correccion ortografica, o normalizacion de acentos, pero el articulo de referencia se limita a la conversion a minusculas.',
        por_que_importa: [
          '"Good" y "good" transmiten el mismo sentimiento pero sin normalizacion serian dos features separados en TF-IDF, dividiendo la evidencia.',
          'Reduce el tamano del vocabulario drasticamente: "The" + "the" + "THE" se unifican en una sola entrada.',
          'Es una operacion sin perdida de informacion semantica para la mayoria de tareas de clasificacion de sentimientos.',
          'En ingles, la capitalizacion rara vez cambia el sentimiento de una palabra (excepcion: acronimos como "LOL").',
        ],
        ejemplos: [
          {
            titulo: 'Unificacion basica',
            antes: 'The Movie Was GREAT',
            despues: 'the movie was great',
            explicacion: 'Cuatro tokens diferentes se mantienen igual, pero ahora "The/the/THE" se cuentan como uno solo en el vocabulario.',
          },
          {
            titulo: 'Contracciones (ingles)',
            antes: "I didn't like it, wasn't good",
            despues: "i didn't like it, wasn't good",
            explicacion: 'Las contracciones con negacion ("didn\'t", "wasn\'t") se mantienen. Algunos pipelines las expanden a "did not", "was not" para que "not" sea un token separado.',
          },
          {
            titulo: 'Caso donde se pierde informacion',
            antes: 'LOL this was SO bad',
            despues: 'lol this was so bad',
            explicacion: 'La mayuscula en "SO" indica enfasis que se pierde. Sin embargo, para modelos bag-of-words esta perdida es minima comparada con el beneficio de reducir vocabulario.',
          },
        ],
        en_articulo: 'El articulo incluye "Conversion a minusculas" como segundo paso de preprocesamiento, indicando que normaliza el texto "para tratar Movie y movie como el mismo token".',
        impacto: {
          bien: 'Vocabulario ~30% mas pequeno, features mas robustos, mejor generalizacion del modelo.',
          mal: 'Sin normalizacion, el modelo ve "good", "Good" y "GOOD" como 3 palabras diferentes, fragmentando la evidencia de sentimiento positivo.',
        },
      },
    },
    {
      nombre: 'Tokenizacion',
      descripcion: 'Separar el texto en palabras individuales (tokens)',
      icono: '\u2702\uFE0F',
      color: '#ECFDF5',
      detalle: {
        descripcion_extendida: 'La tokenizacion divide el texto continuo en unidades discretas (tokens) que el modelo puede procesar individualmente. En su forma mas simple, se divide por espacios en blanco. Versiones mas sofisticadas manejan contracciones ("don\'t" como ["do", "n\'t"]), guiones compuestos ("well-known" como ["well", "known"]), y puntuacion adherida ("movie." como ["movie", "."]). La eleccion del tokenizador impacta directamente que informacion captura el modelo: un tokenizador agresivo puede destruir n-gramas utiles, mientras uno conservador puede dejar ruido.',
        por_que_importa: [
          'La tokenizacion define el vocabulario del modelo: cada token unico se convierte en una dimension del espacio de features.',
          'Tokenizadores diferentes producen vocabularios diferentes y por tanto representaciones TF-IDF diferentes.',
          'Las contracciones con negacion ("n\'t", "not") son criticas para sentimiento; un mal tokenizador puede perder esta senal.',
          'Para el metodo hibrido del articulo, los tokens son la base tanto de BoW como de TF-IDF.',
        ],
        ejemplos: [
          {
            titulo: 'Tokenizacion simple por espacios',
            antes: "it's not a bad movie at all",
            despues: "it's | not | a | bad | movie | at | all",
            explicacion: 'Divide por espacios. "it\'s" queda como un solo token. En pasos posteriores, "not", "a", "at", "all" se eliminaran como stopwords.',
          },
          {
            titulo: 'Resultado: lista de tokens',
            antes: 'The acting was terrible',
            despues: 'the | acting | was | terrible',
            explicacion: 'Despues de la normalizacion, cada palabra se convierte en un token individual. El modelo procesara cada token de forma independiente (bag-of-words).',
          },
          {
            titulo: 'Bigramas generados a partir de tokens',
            antes: 'not good, really bad',
            despues: '"not good" | "really bad" (bigramas)',
            explicacion: 'Ademas de tokens individuales (unigramas), se generan pares consecutivos (bigramas) como "not good" que capturan negaciones que un unigrama solo no detecta.',
          },
        ],
        en_articulo: 'El articulo usa tokenizacion estandar como parte del preprocesamiento. Los tokens resultantes alimentan tanto Bag of Words (frecuencia de cada token) como TF-IDF (frecuencia ponderada por importancia).',
        impacto: {
          bien: 'Vocabulario coherente que preserva negaciones y expresiones compuestas importantes para sentimiento.',
          mal: 'Un tokenizador que separa "don\'t" en "don" y "t" pierde la senal de negacion, confundiendo al clasificador.',
        },
        herramientas: [
          { nombre: 'NLTK word_tokenize', uso: 'Tokenizador que maneja contracciones y puntuacion' },
          { nombre: 'spaCy tokenizer', uso: 'Tokenizacion linguistica con reglas por idioma' },
          { nombre: 'sklearn CountVectorizer', uso: 'Tokeniza internamente al construir la matriz BoW' },
        ],
      },
    },
    {
      nombre: 'Eliminacion de Stopwords',
      descripcion: 'Filtrar palabras funcionales sin valor semantico',
      icono: '\uD83D\uDEAB',
      color: '#F3E8FF',
      detalle: {
        descripcion_extendida: 'Las stopwords son palabras de alta frecuencia que cumplen funciones gramaticales pero no aportan informacion de sentimiento: articulos ("the", "a", "an"), preposiciones ("in", "on", "at"), pronombres ("I", "he", "they"), verbos auxiliares ("is", "was", "have"), y conectores ("and", "but", "or"). Estas palabras aparecen en practicamente todas las resenas, tanto positivas como negativas, por lo que no son discriminativas para la clasificacion. Eliminarlas reduce la dimensionalidad del espacio de features y permite que el modelo se enfoque en las palabras que realmente indican sentimiento.',
        por_que_importa: [
          'Las stopwords representan ~40-60% de los tokens en un texto tipico en ingles, pero aportan 0% de informacion de sentimiento.',
          'Al eliminarlas, el modelo se enfoca en palabras discriminativas: "terrible", "amazing", "boring", "masterpiece".',
          'Reduce la dimensionalidad del vector TF-IDF significativamente, mejorando eficiencia y reduciendo overfitting.',
          'CUIDADO: algunas stopwords como "not", "no", "never" son criticas para negacion y no deben eliminarse ciegamente.',
        ],
        ejemplos: [
          {
            titulo: 'Eliminacion tipica',
            antes: 'the movie was not very good at all',
            despues: 'movie good',
            explicacion: 'Se eliminan "the", "was", "not", "very", "at", "all". Problema: se pierde "not" que invierte el sentimiento. Por eso algunos pipelines preservan negaciones.',
          },
          {
            titulo: 'Impacto en dimensionalidad',
            antes: '15 tokens originales',
            despues: '7 tokens relevantes (-53%)',
            explicacion: 'En una resena tipica de 230 palabras, ~100-130 son stopwords. Eliminarlas deja solo las palabras con contenido semantico.',
          },
          {
            titulo: 'El debate sobre "not"',
            antes: '"not" en lista de stopwords',
            despues: '"not" preservado como excepcion',
            explicacion: 'Eliminar "not" de "not good" deja solo "good" = falso positivo. Algunos investigadores excluyen negaciones de la lista de stopwords para evitar este problema.',
          },
        ],
        en_articulo: 'El articulo aplica "Eliminacion de stop words" usando la lista estandar de NLTK para ingles. Describe que se filtran "palabras funcionales de alta frecuencia (the, is, a, etc.) que no contribuyen al sentimiento". No se menciona tratamiento especial para negaciones.',
        impacto: {
          bien: 'El modelo se enfoca en palabras de contenido: accuracy puede mejorar 1-3 pp por menor ruido en features.',
          mal: 'Eliminar negaciones ("not", "no") causa falsos positivos sistematicos en resenas negativas con estructura "not good".',
        },
        herramientas: [
          { nombre: 'NLTK stopwords', uso: 'Lista de 179 stopwords para ingles' },
          { nombre: 'spaCy is_stop', uso: 'Atributo booleano por token, personalizable' },
          { nombre: 'sklearn stop_words', uso: 'Parametro de CountVectorizer y TfidfVectorizer' },
        ],
      },
    },
    {
      nombre: 'Vectorizacion TF-IDF',
      descripcion: 'Convertir tokens en representacion numerica ponderada',
      icono: '\uD83D\uDCCA',
      color: '#FFF7ED',
      detalle: {
        descripcion_extendida: 'TF-IDF (Term Frequency-Inverse Document Frequency) convierte el texto en un vector numerico que los clasificadores pueden procesar. TF mide cuantas veces aparece un termino en el documento (frecuencia local), mientras IDF mide que tan raro es ese termino en todo el corpus (importancia global). El producto TF x IDF da un score alto a palabras que son frecuentes en un documento pero raras en el corpus — exactamente las palabras mas discriminativas. El articulo propone un metodo hibrido que concatena los vectores BoW (solo frecuencia) con TF-IDF (frecuencia ponderada), capturando informacion complementaria.',
        por_que_importa: [
          'TF-IDF es la representacion mas efectiva para clasificacion de texto con modelos clasicos (NB, LR, SVM).',
          'Palabras como "terrible" (rara pero muy negativa) obtienen score alto. Palabras como "movie" (frecuente en todo el corpus) obtienen score bajo.',
          'El metodo hibrido del articulo (BoW + TF-IDF) mejora +1.25 pp sobre TF-IDF solo, porque captura informacion complementaria.',
          'La dimension del vector TF-IDF se controla con max_features: el articulo no especifica, nuestra implementacion usa 50,000.',
        ],
        ejemplos: [
          {
            titulo: 'Formula TF-IDF',
            antes: 'TF(t,d) x log(N / DF(t))',
            despues: 'Score = frecuencia_local x importancia_global',
            explicacion: 'TF = veces que aparece el termino en el documento. IDF = logaritmo de (total documentos / documentos que contienen el termino). Palabras raras pero relevantes obtienen IDF alto.',
          },
          {
            titulo: 'Ejemplo numerico',
            antes: '"terrible" en 1 de 100 resenas',
            despues: 'TF=2, IDF=log(100/1)=4.6, TF-IDF=9.2',
            explicacion: '"terrible" aparece 2 veces en la resena y solo en 1 de 100 resenas del corpus. Su score TF-IDF (9.2) es alto, indicando que es muy discriminativo.',
          },
          {
            titulo: 'Comparacion BoW vs TF-IDF vs Hibrido',
            antes: 'BoW: 84.00% | TF-IDF: 84.25%',
            despues: 'Hibrido: 84.50% (NB)',
            explicacion: 'Con Naive Bayes, la mejora es modesta (+0.50 pp). Pero con SVM, la mejora es mayor: BoW 87.50% vs TF-IDF 88.25% vs Hibrido 88.75% (+1.25 pp).',
          },
        ],
        en_articulo: 'Este es el aporte central del articulo. Keerthi Kumar propone concatenar BoW y TF-IDF en un vector hibrido. Los resultados muestran que el hibrido supera a ambos metodos individuales en los 3 clasificadores: NB (+0.50 pp), LR (+1.25 pp), SVM (+1.25 pp) sobre BoW.',
        impacto: {
          bien: 'TF-IDF con SVM alcanza 88.25%, el hibrido 88.75%. La representacion numerica correcta es la diferencia entre un modelo mediocre y uno competitivo.',
          mal: 'Usar solo frecuencia bruta (BoW) no distingue "movie" (comun) de "masterpiece" (rara y discriminativa), perdiendo hasta 1.25 pp de accuracy.',
        },
        herramientas: [
          { nombre: 'sklearn TfidfVectorizer', uso: 'Genera matriz TF-IDF con n-gramas configurables' },
          { nombre: 'sklearn CountVectorizer', uso: 'Genera la matriz BoW de frecuencias brutas' },
          { nombre: 'scipy hstack', uso: 'Concatena matrices BoW y TF-IDF para el metodo hibrido' },
        ],
      },
    },
    {
      nombre: 'Clasificacion',
      descripcion: 'Prediccion del sentimiento con NB, LR y SVM',
      icono: '\uD83C\uDFAF',
      color: '#F0FDF4',
      detalle: {
        descripcion_extendida: 'La etapa final del pipeline aplica un clasificador de aprendizaje automatico sobre el vector TF-IDF (o hibrido) para predecir si la resena es positiva o negativa. El articulo evalua tres clasificadores: Naive Bayes (probabilistico, rapido pero simplista), Regresion Logistica (lineal, buen balance rendimiento/eficiencia), y Maquina de Vectores de Soporte o SVM (encuentra el hiperplano optimo de separacion, mejor rendimiento). Cada clasificador tiene fortalezas diferentes: NB es el mas rapido, LR es el mas interpretable, y SVM es el mas preciso en este dominio.',
        por_que_importa: [
          'El clasificador es solo tan bueno como las features que recibe: el preprocesamiento y la vectorizacion determinan el techo de rendimiento.',
          'SVM supera a NB por ~4 puntos porcentuales en todos los metodos de extraccion, lo que indica que la suposicion de independencia de NB es demasiado restrictiva para texto.',
          'LR y SVM tienen resultados muy cercanos (~0.25-0.50 pp), sugiriendo que la separacion en este espacio de features es casi lineal.',
          'La eleccion del clasificador importa menos que la calidad de las features: la diferencia NB vs SVM (~4 pp) es menor que la diferencia entre un buen y mal preprocesamiento (~5-8 pp).',
        ],
        ejemplos: [
          {
            titulo: 'Naive Bayes (NB)',
            antes: 'P(pos|features) vs P(neg|features)',
            despues: 'Hibrido: 84.50% accuracy',
            explicacion: 'Aplica el teorema de Bayes asumiendo que cada feature es independiente. Rapido de entrenar (<1 segundo) pero la suposicion de independencia limita la precision con features correlacionadas.',
          },
          {
            titulo: 'Regresion Logistica (LR)',
            antes: 'w1*x1 + w2*x2 + ... + b > 0?',
            despues: 'Hibrido: 88.50% accuracy',
            explicacion: 'Modelo lineal que asigna un peso a cada feature. Si la suma ponderada supera un umbral, predice positivo. Interpretable: los pesos mas altos revelan las palabras mas importantes.',
          },
          {
            titulo: 'SVM (Maquina de Vectores de Soporte)',
            antes: 'Maximizar margen entre clases',
            despues: 'Hibrido: 88.75% accuracy (MEJOR)',
            explicacion: 'Encuentra el hiperplano que maximiza la distancia entre las resenas positivas y negativas mas cercanas (vectores de soporte). Robusto ante overfitting en espacios de alta dimension como TF-IDF.',
          },
        ],
        en_articulo: 'Los resultados del articulo muestran que SVM + Hibrido alcanza 88.75%, superando a Tripathy et al. (2016) con 88.06% y a Dey et al. (2016) con 87.50% en el mismo dataset. SVM es consistentemente el mejor clasificador en las 3 representaciones (BoW, TF-IDF, Hibrido).',
        impacto: {
          bien: 'SVM con kernel lineal y features hibridas logra el estado del arte para metodos clasicos en IMDb: 88.75%.',
          mal: 'Usar NB con BoW basico da 84.00%, casi 5 puntos menos. La combinacion clasificador + features es critica.',
        },
        herramientas: [
          { nombre: 'sklearn MultinomialNB', uso: 'Naive Bayes para features discretas/frecuencias' },
          { nombre: 'sklearn LogisticRegression', uso: 'Regresion logistica con regularizacion L2' },
          { nombre: 'sklearn LinearSVC', uso: 'SVM con kernel lineal, el mas efectivo para texto' },
        ],
      },
    },
  ];

  private stopwordsEn = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
    'for', 'with', 'about', 'against', 'between', 'through', 'during', 'before', 'after',
    'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
    'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn',
    'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren',
    'won', 'wouldn',
  ]);

  private stopwordsEs = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'en', 'y', 'o',
    'que', 'es', 'se', 'no', 'por', 'con', 'para', 'su', 'lo', 'como', 'mas', 'pero', 'sus',
    'le', 'ya', 'fue', 'ha', 'son', 'muy', 'sin', 'sobre', 'ser', 'esta', 'entre', 'cuando',
    'hay', 'este', 'si', 'desde', 'nos', 'durante', 'uno', 'ni', 'mi', 'me', 'te', 'tu',
  ]);

  private positiveWords = new Set([
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'brilliant', 'love',
    'loved', 'best', 'beautiful', 'perfect', 'enjoy', 'enjoyed', 'entertaining', 'fun',
    'masterpiece', 'outstanding', 'superb', 'recommend', 'worth', 'impressive', 'incredible',
    'buena', 'bueno', 'excelente', 'increible', 'genial', 'maravillosa', 'fantastica',
    'mejor', 'encanto', 'perfecta', 'hermosa', 'disfrute', 'brillantes',
  ]);

  private negativeWords = new Set([
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'boring', 'waste', 'poor', 'disappointing',
    'disappointed', 'hate', 'hated', 'stupid', 'dull', 'mediocre', 'fails', 'failed', 'ugly',
    'annoying', 'painful', 'avoid', 'forgettable', 'predictable', 'overrated',
    'mala', 'malo', 'terrible', 'horrible', 'peor', 'aburrida', 'pesima', 'decepcionante',
    'odio', 'mediocre', 'predecible',
  ]);

  detectedLang = computed(() => {
    const text = this.inputText.toLowerCase();
    const esWords = ['el', 'la', 'los', 'las', 'fue', 'una', 'del', 'esta', 'pelicula', 'muy', 'pero', 'como', 'que', 'sin', 'mas', 'mejor', 'por', 'con', 'para', 'duda', 'ano', 'actuaciones', 'direccion', 'increible', 'excelente'];
    let esCount = 0;
    esWords.forEach(w => { if (text.includes(w)) esCount++; });
    return esCount >= 3 ? 'es' : 'en';
  });

  cleanedText = computed(() => {
    let text = this.inputText;
    text = text.replace(/<[^>]*>/g, '');
    text = text.replace(/&\w+;/gi, ' ');
    text = text.replace(/[^\w\s'-]/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  });

  lowercasedText = computed(() => this.cleanedText().toLowerCase());

  tokens = computed(() => {
    return this.lowercasedText().split(/\s+/).filter(t => t.length > 0);
  });

  filteredTokens = computed(() => {
    return this.tokens().filter(t => !this.stopwordsEn.has(t) && !this.stopwordsEs.has(t) && t.length > 1);
  });

  removedStopwords = computed(() => {
    return this.tokens().filter(t => this.stopwordsEn.has(t) || this.stopwordsEs.has(t));
  });

  tfidfFeatures = computed(() => {
    const tokens = this.filteredTokens();
    const freq: Record<string, number> = {};
    tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });

    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      freq[bigram] = (freq[bigram] || 0) + 1;
    }

    const maxFreq = Math.max(...Object.values(freq), 1);
    const entries = Object.entries(freq)
      .map(([term, count]) => {
        const idf = 1 + Math.log(10 / (1 + (term.includes(' ') ? 3 : 5)));
        const score = (count / maxFreq) * idf;
        let sentiment: 'pos' | 'neg' | 'neutral' = 'neutral';
        const words = term.split(' ');
        if (words.some(w => this.positiveWords.has(w))) sentiment = 'pos';
        if (words.some(w => this.negativeWords.has(w))) sentiment = 'neg';
        return { term, score, sentiment };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    const maxScore = Math.max(...entries.map(e => e.score), 1);
    return entries.map(e => ({ ...e, score: e.score / maxScore }));
  });

  predictions = computed(() => {
    const tokens = this.filteredTokens();
    let posCount = 0;
    let negCount = 0;
    tokens.forEach(t => {
      if (this.positiveWords.has(t)) posCount++;
      if (this.negativeWords.has(t)) negCount++;
    });

    const total = posCount + negCount || 1;
    const posRatio = posCount / total;

    const sentiment = posRatio >= 0.5 ? 'positivo' : 'negativo';
    const conf = Math.max(posRatio, 1 - posRatio);

    return [
      { modelo: 'Naive Bayes', sentimiento: sentiment, confianza: Math.min(conf * 0.92, 0.97), accuracy_real: '84.50' },
      { modelo: 'Reg. Logistica', sentimiento: sentiment, confianza: Math.min(conf * 0.96, 0.98), accuracy_real: '88.50' },
      { modelo: 'SVM', sentimiento: sentiment, confianza: Math.min(conf * 0.98, 0.99), accuracy_real: '88.75' },
    ];
  });

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.fileName.set(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      this.inputText = content.trim().substring(0, 5000);
      this.processPipeline();
    };
    reader.readAsText(file);
    input.value = '';
  }

  clearFile() {
    this.fileName.set('');
    this.inputText = '';
  }

  processPipeline() {}

  useExample(type: string) {
    switch (type) {
      case 'en':
        this.inputText = 'This movie was absolutely terrible! The acting was bad, but the cinematography wasn\'t entirely without merit. I wouldn\'t recommend it to anyone.';
        break;
      case 'es':
        this.inputText = 'Esta pelicula fue una experiencia increible. Las actuaciones fueron brillantes y la direccion fue excelente. Sin duda la mejor pelicula del año.';
        break;
      case 'sarcasm':
        this.inputText = 'Oh brilliant, another superhero movie. Just what the world needed. The groundbreaking plot of good vs evil really surprised me.';
        break;
      case 'mixed':
        this.inputText = 'The story was weak and predictable, but I have to admit the visual effects were absolutely stunning. The lead actor was terrible, though the supporting cast did their best with a mediocre script.';
        break;
    }
    this.processPipeline();
  }
}
