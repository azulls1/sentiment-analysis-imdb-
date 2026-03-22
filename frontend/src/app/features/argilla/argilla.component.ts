import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';

interface Ejemplo {
  codigo?: string;
  texto: string;
  explicacion: string;
}

interface Seccion {
  id: string;
  titulo: string;
  icono: string;
  descripcion: string;
  categoria: 'concepto' | 'flujo' | 'adaptacion';
  detalle: {
    descripcion_extendida: string;
    puntos_clave: string[];
    ejemplos: Ejemplo[];
    como_funciona?: string[];
    beneficios: string[];
    limitaciones?: string[];
    conexion_actividad: string;
    referencias: { autores: string; detalle: string }[];
  };
}

interface Paso {
  numero: number;
  titulo: string;
  descripcion: string;
  codigo?: string;
  tips?: string[];
  resultado?: string;
}

@Component({
  selector: 'app-argilla',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-wide">
      <div class="page-header animate-fadeIn">
        <h1 class="page-header__title font-display">Tutorial Argilla</h1>
        <p class="page-header__desc">Flujo de trabajo para construir un analizador de sentimientos con anotacion iterativa</p>
      </div>

      <!-- Hero -->
      <div class="card-hero animate-fadeInUp" style="margin-bottom:32px;">
        <h2 class="card-hero__title">Predict &rarr; Log &rarr; Label</h2>
        <p class="card-hero__desc">
          Argilla es una plataforma open-source de anotacion que permite crear un ciclo iterativo
          de mejora continua: el modelo predice, las predicciones se registran, los humanos corrigen,
          y el modelo se re-entrena con datos de mayor calidad. Haz click en cada seccion para explorar a fondo.
        </p>
      </div>

      <!-- Filtros por categoria -->
      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;" class="animate-fadeIn">
        <button class="btn btn-ghost" [class.btn-primary]="filtro() === 'todos'" (click)="filtro.set('todos')">Todos ({{ secciones.length }})</button>
        <button class="btn btn-ghost" [class.btn-primary]="filtro() === 'concepto'" (click)="filtro.set('concepto')">Conceptos</button>
        <button class="btn btn-ghost" [class.btn-primary]="filtro() === 'flujo'" (click)="filtro.set('flujo')">Flujo de Trabajo</button>
        <button class="btn btn-ghost" [class.btn-primary]="filtro() === 'adaptacion'" (click)="filtro.set('adaptacion')">Adaptaciones</button>
      </div>

      <!-- Grid de secciones -->
      <div class="stagger-children" style="display:grid;grid-template-columns:1fr;gap:20px;margin-bottom:32px;">
        @for (sec of seccionesFiltradas(); track sec.id) {
          <div class="card animate-fadeInUp argilla-card" role="button" tabindex="0" (click)="abrirModal(sec)" (keydown.enter)="abrirModal(sec)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;"
                     [style.background]="getCategoriaColor(sec.categoria).bg">
                  {{ sec.icono }}
                </div>
                <h3 class="font-display" style="font-size:1rem;font-weight:600;color:var(--color-text-primary);margin:0;">
                  {{ sec.titulo }}
                </h3>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge"
                      [style.background]="getCategoriaColor(sec.categoria).bg"
                      [style.color]="getCategoriaColor(sec.categoria).text"
                      style="font-size:0.7rem;">
                  {{ getCategoriaLabel(sec.categoria) }}
                </span>
                <span style="font-size:0.75rem;color:var(--color-text-muted);">Ver detalle &#8250;</span>
              </div>
            </div>
            <p style="margin:0;line-height:1.7;font-size:0.875rem;color:var(--color-text-secondary);">
              {{ sec.descripcion }}
            </p>
          </div>
        }
      </div>

      <!-- Metodologia: 7 Pasos -->
      <div class="card-section animate-fadeInUp" style="margin-bottom:32px;">
        <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 4px;">
          Metodologia: 7 Pasos para Mejorar un Analizador de Sentimientos
        </h3>
        <p style="margin:0 0 18px;font-size:0.78rem;color:var(--color-text-muted);line-height:1.5;">
          Proceso sistematico para llevar un modelo base al rendimiento deseado mediante anotacion iterativa con Argilla.
        </p>

        <!-- Barra de progreso visual -->
        <div style="display:flex;gap:2px;margin-bottom:20px;">
          @for (paso of pasos; track paso.numero) {
            <div class="paso-tab" [class.paso-tab-active]="pasoActivo() === paso.numero"
                 [class.paso-tab-done]="pasoActivo() > paso.numero"
                 (click)="pasoActivo.set(paso.numero)">
              <span class="paso-tab-num">{{ paso.numero }}</span>
              <span class="paso-tab-label">{{ paso.etiqueta }}</span>
            </div>
          }
        </div>

        @for (paso of pasos; track paso.numero) {
          @if (pasoActivo() === paso.numero) {
            <div class="animate-fadeIn">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
                <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;background:var(--color-bg-muted);">
                  {{ paso.icono }}
                </div>
                <div>
                  <h4 style="margin:0;font-size:0.92rem;font-weight:600;color:var(--color-text-primary);">{{ paso.titulo }}</h4>
                  <span style="font-size:0.72rem;color:var(--color-text-muted);">Paso {{ paso.numero }} de 7</span>
                </div>
              </div>

              <p style="margin:0 0 16px;line-height:1.7;font-size:0.875rem;color:var(--color-text-secondary);">
                {{ paso.descripcion }}
              </p>

              <!-- Que se hace concretamente -->
              @if (paso.acciones) {
                <div style="margin-bottom:14px;">
                  <p style="margin:0 0 8px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);">Que se hace en este paso</p>
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    @for (accion of paso.acciones; track $index) {
                      <div style="display:flex;gap:8px;align-items:flex-start;">
                        <span style="color:#059669;font-size:0.8rem;flex-shrink:0;margin-top:1px;">&#10003;</span>
                        <span style="font-size:0.82rem;color:var(--color-text-secondary);line-height:1.5;">{{ accion }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Ejemplo concreto aplicado a nuestro proyecto -->
              @if (paso.ejemplo_proyecto) {
                <div style="background:rgba(91,112,101,0.06);border-radius:8px;padding:12px 16px;border-left:3px solid var(--color-text-accent, #5B7065);margin-bottom:14px;">
                  <p style="margin:0 0 4px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-accent, #5B7065);">Aplicado a nuestro proyecto IMDb</p>
                  <p style="margin:0;font-size:0.82rem;color:var(--color-text-secondary);line-height:1.6;">{{ paso.ejemplo_proyecto }}</p>
                </div>
              }

              <!-- Consideraciones importantes -->
              @if (paso.consideraciones) {
                <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                  <p style="margin:0 0 6px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);">Consideraciones</p>
                  <ul style="margin:0;padding-left:18px;font-size:0.82rem;color:var(--color-text-secondary);line-height:1.6;">
                    @for (tip of paso.consideraciones; track $index) {
                      <li>{{ tip }}</li>
                    }
                  </ul>
                </div>
              }

              @if (paso.resultado) {
                <div class="alert alert-success" style="margin-top:14px;">
                  <div class="alert__content">{{ paso.resultado }}</div>
                </div>
              }

              <div style="display:flex;justify-content:space-between;margin-top:16px;">
                <button class="btn btn-ghost" [disabled]="paso.numero === 1" (click)="pasoActivo.set(paso.numero - 1)">&#8592; Anterior</button>
                <button class="btn btn-primary" [disabled]="paso.numero === 7" (click)="pasoActivo.set(paso.numero + 1)">Siguiente &#8594;</button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Ciclo Iterativo Predict-Log-Label - Rediseñado -->
      <div class="card-section animate-fadeInUp" style="padding:28px;">
        <div style="text-align:center;margin-bottom:28px;">
          <h3 class="font-display" style="font-size:1.1rem;font-weight:700;color:var(--color-text-primary);margin:0 0 8px;">
            Ciclo Iterativo Predict-Log-Label
          </h3>
          <p style="margin:0;font-size:0.84rem;color:var(--color-text-secondary);max-width:560px;margin:0 auto;line-height:1.6;">
            El corazon de Argilla: un bucle de retroalimentacion entre el modelo y los anotadores humanos
            que convierte un clasificador generico en uno especializado para tu dominio.
          </p>
        </div>

        <!-- Diagrama circular de 4 fases -->
        <div class="ciclo-container">
          @for (fase of fases; track fase.nombre; let i = $index) {
            <div class="ciclo-fase" (click)="faseActivaCiclo.set(i)">
              <!-- Numero de paso -->
              <div class="ciclo-paso-num" [style.background]="fase.color" [style.color]="fase.textColor">
                {{ i + 1 }}
              </div>
              <!-- Icono principal -->
              <div class="ciclo-icono" [style.background]="fase.color" [style.color]="fase.textColor"
                   [class.ciclo-icono-active]="faseActivaCiclo() === i">
                {{ fase.icono }}
              </div>
              <!-- Nombre de la fase -->
              <div class="ciclo-nombre" [style.color]="fase.textColor">{{ fase.nombre }}</div>
              <!-- Descripcion breve -->
              <div class="ciclo-desc">{{ fase.desc }}</div>
            </div>
            @if (i < fases.length - 1) {
              <div class="ciclo-flecha">
                <svg width="36" height="20" viewBox="0 0 36 20">
                  <path d="M2 10h26M24 4l8 6-8 6" fill="none" stroke="var(--color-text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
                </svg>
              </div>
            }
          }
        </div>

        <!-- Flecha de retorno -->
        <div style="text-align:center;margin-top:8px;margin-bottom:24px;">
          <svg width="280" height="36" viewBox="0 0 280 36" style="overflow:visible;">
            <defs>
              <marker id="arrowRetorno" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-text-muted)" opacity="0.5"/>
              </marker>
            </defs>
            <path d="M250 4 C265 4 272 14 272 18 C272 22 265 32 250 32 L30 32 C15 32 8 22 8 18 C8 14 15 4 30 4"
                  fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.4"
                  marker-start="url(#arrowRetorno)"/>
          </svg>
          <div style="font-size:0.72rem;color:var(--color-text-muted);margin-top:-2px;font-style:italic;">
            El ciclo se repite hasta alcanzar la precision deseada (tipicamente 3-5 iteraciones)
          </div>
        </div>

        <!-- Detalle de la fase seleccionada -->
        <div class="ciclo-detalle animate-fadeIn" [style.border-left-color]="fases[faseActivaCiclo()].textColor">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;"
                 [style.background]="fases[faseActivaCiclo()].color" [style.color]="fases[faseActivaCiclo()].textColor">
              {{ fases[faseActivaCiclo()].icono }}
            </div>
            <div>
              <h4 style="margin:0;font-size:0.9rem;font-weight:700;color:var(--color-text-primary);">
                Fase {{ faseActivaCiclo() + 1 }}: {{ fases[faseActivaCiclo()].nombre }}
              </h4>
              <p style="margin:0;font-size:0.72rem;color:var(--color-text-muted);">
                {{ fases[faseActivaCiclo()].rol }}
              </p>
            </div>
          </div>

          <p style="margin:0 0 14px;font-size:0.84rem;color:var(--color-text-secondary);line-height:1.7;">
            {{ fases[faseActivaCiclo()].descripcion_larga }}
          </p>

          <!-- Actividades de la fase -->
          <div style="margin-bottom:14px;">
            <p style="margin:0 0 8px;font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);">
              Actividades clave
            </p>
            <div style="display:flex;flex-direction:column;gap:6px;">
              @for (act of fases[faseActivaCiclo()].actividades; track $index) {
                <div style="display:flex;gap:8px;align-items:flex-start;">
                  <span style="color:#059669;font-size:0.8rem;flex-shrink:0;margin-top:1px;">&#10003;</span>
                  <span style="font-size:0.82rem;color:var(--color-text-secondary);line-height:1.5;">{{ act }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Input/Output -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div style="background:var(--color-bg-muted);border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 4px;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);">Entrada</p>
              <p style="margin:0;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.5;">{{ fases[faseActivaCiclo()].entrada }}</p>
            </div>
            <div style="background:var(--color-bg-muted);border-radius:8px;padding:10px 14px;">
              <p style="margin:0 0 4px;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-text-muted);">Salida</p>
              <p style="margin:0;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.5;">{{ fases[faseActivaCiclo()].salida }}</p>
            </div>
          </div>

          <!-- Navegacion entre fases -->
          <div style="display:flex;justify-content:space-between;margin-top:16px;">
            <button class="btn btn-ghost" [disabled]="faseActivaCiclo() === 0" (click)="faseActivaCiclo.set(faseActivaCiclo() - 1)" style="font-size:0.8rem;">
              &#8592; Anterior
            </button>
            <div style="display:flex;gap:6px;align-items:center;">
              @for (fase of fases; track fase.nombre; let j = $index) {
                <div class="ciclo-dot" [class.ciclo-dot-active]="faseActivaCiclo() === j"
                     [style.background]="faseActivaCiclo() === j ? fases[j].textColor : ''"
                     (click)="faseActivaCiclo.set(j)"></div>
              }
            </div>
            <button class="btn btn-ghost" [disabled]="faseActivaCiclo() === fases.length - 1" (click)="faseActivaCiclo.set(faseActivaCiclo() + 1)" style="font-size:0.8rem;">
              Siguiente &#8594;
            </button>
          </div>
        </div>

        <!-- Curva de mejora por iteracion -->
        <div style="margin-top:24px;background:var(--color-bg-muted);border-radius:12px;padding:20px;">
          <h4 style="margin:0 0 16px;font-size:0.85rem;font-weight:600;color:var(--color-text-primary);">
            Curva de Mejora por Iteracion
          </h4>
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;">
            @for (iter of iteraciones; track iter.num) {
              <div style="text-align:center;">
                <div class="iter-barra-container">
                  <div class="iter-barra" [style.height]="iter.pct + '%'" [style.background]="iter.color">
                    <span class="iter-valor">{{ iter.accuracy }}%</span>
                  </div>
                </div>
                <div style="font-size:0.72rem;font-weight:600;color:var(--color-text-primary);margin-top:6px;">{{ iter.label }}</div>
                <div style="font-size:0.65rem;color:var(--color-text-muted);margin-top:2px;">{{ iter.correcciones }}</div>
              </div>
            }
          </div>
          <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--color-border, #e5e7eb);">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:0.8rem;">&#128161;</span>
              <p style="margin:0;font-size:0.78rem;color:var(--color-text-secondary);line-height:1.5;">
                <strong>Rendimientos decrecientes:</strong> La primera iteracion aporta +3-5 pp, las siguientes cada vez menos.
                El punto optimo de parada es cuando la mejora marginal es menor que el costo de anotar el siguiente batch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    @if (modalSeccion()) {
      <div style="position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;"
           (click)="cerrarModal()">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);"></div>

        <div style="position:relative;background:var(--color-bg-primary, #fff);border-radius:16px;max-width:720px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 24px 48px rgba(0,0,0,0.2);animation:modalIn 0.25s ease-out;"
             (click)="$event.stopPropagation()">

          <!-- Modal header -->
          <div style="position:sticky;top:0;z-index:1;background:var(--color-bg-primary, #fff);border-bottom:1px solid var(--color-border, #e5e7eb);padding:20px 24px;border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;"
                   [style.background]="getCategoriaColor(modalSeccion()!.categoria).bg">
                {{ modalSeccion()!.icono }}
              </div>
              <div>
                <h2 class="font-display" style="font-size:1.15rem;font-weight:700;color:var(--color-text-primary);margin:0;">
                  {{ modalSeccion()!.titulo }}
                </h2>
                <span class="badge" style="margin-top:4px;display:inline-block;font-size:0.7rem;"
                      [style.background]="getCategoriaColor(modalSeccion()!.categoria).bg"
                      [style.color]="getCategoriaColor(modalSeccion()!.categoria).text">
                  {{ getCategoriaLabel(modalSeccion()!.categoria) }}
                </span>
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
                {{ modalSeccion()!.detalle.descripcion_extendida }}
              </p>
            </div>

            <!-- Puntos clave -->
            <div style="margin-bottom:24px;">
              <h3 class="modal-section-title">Puntos Clave</h3>
              <div style="display:flex;flex-direction:column;gap:8px;">
                @for (punto of modalSeccion()!.detalle.puntos_clave; track $index) {
                  <div style="display:flex;gap:10px;align-items:flex-start;">
                    <span style="min-width:22px;height:22px;border-radius:50%;background:var(--color-bg-muted);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:var(--color-text-muted);flex-shrink:0;">
                      {{ $index + 1 }}
                    </span>
                    <p style="margin:0;font-size:0.84rem;color:var(--color-text-secondary);line-height:1.6;">{{ punto }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Como funciona (si existe) -->
            @if (modalSeccion()!.detalle.como_funciona) {
              <div style="margin-bottom:24px;">
                <h3 class="modal-section-title">Como Funciona</h3>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  @for (paso of modalSeccion()!.detalle.como_funciona!; track $index) {
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                      <span style="min-width:24px;height:24px;border-radius:50%;background:var(--color-text-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;flex-shrink:0;">
                        {{ $index + 1 }}
                      </span>
                      <p style="margin:0;font-size:0.84rem;color:var(--color-text-secondary);line-height:1.6;">{{ paso }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Ejemplos -->
            <div style="margin-bottom:24px;">
              <h3 class="modal-section-title">Ejemplos Practicos</h3>
              <div style="display:flex;flex-direction:column;gap:10px;">
                @for (ej of modalSeccion()!.detalle.ejemplos; track $index) {
                  <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                    @if (ej.codigo) {
                      <pre style="background:#04202C;color:#C9D1C8;border-radius:6px;padding:12px;font-size:0.78rem;overflow-x:auto;line-height:1.5;font-family:'JetBrains Mono',monospace;margin:0 0 8px;">{{ ej.codigo }}</pre>
                    }
                    @if (ej.texto) {
                      <p style="margin:0 0 6px;font-size:0.84rem;font-weight:600;color:var(--color-text-primary);line-height:1.5;">
                        {{ ej.texto }}
                      </p>
                    }
                    <p style="margin:0;font-size:0.78rem;color:var(--color-text-secondary);line-height:1.5;">
                      {{ ej.explicacion }}
                    </p>
                  </div>
                }
              </div>
            </div>

            <!-- Beneficios y Limitaciones -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
              <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;border-left:3px solid #059669;">
                <p style="margin:0 0 8px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#059669;">Beneficios</p>
                <ul style="margin:0;padding-left:16px;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.6;">
                  @for (b of modalSeccion()!.detalle.beneficios; track $index) {
                    <li style="margin-bottom:4px;">{{ b }}</li>
                  }
                </ul>
              </div>
              @if (modalSeccion()!.detalle.limitaciones) {
                <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;border-left:3px solid #DC2626;">
                  <p style="margin:0 0 8px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#DC2626;">Limitaciones</p>
                  <ul style="margin:0;padding-left:16px;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.6;">
                    @for (l of modalSeccion()!.detalle.limitaciones!; track $index) {
                      <li style="margin-bottom:4px;">{{ l }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Conexion con la actividad -->
            <div style="margin-bottom:24px;background:rgba(91,112,101,0.06);border-radius:8px;padding:14px 18px;border-left:3px solid var(--color-text-accent, #5B7065);">
              <h3 style="font-size:0.8rem;color:var(--color-text-accent, #5B7065);font-weight:600;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.04em;">
                Conexion con Nuestra Actividad
              </h3>
              <p style="margin:0;line-height:1.7;font-size:0.84rem;color:var(--color-text-secondary);">
                {{ modalSeccion()!.detalle.conexion_actividad }}
              </p>
            </div>

            <!-- Referencias -->
            <div>
              <h3 class="modal-section-title">Referencias</h3>
              <div style="display:flex;flex-direction:column;gap:6px;">
                @for (ref of modalSeccion()!.detalle.referencias; track $index) {
                  <div style="display:flex;gap:8px;align-items:baseline;">
                    <span style="color:var(--color-text-muted);font-size:0.75rem;flex-shrink:0;">[{{ $index + 1 }}]</span>
                    <p style="margin:0;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.5;">
                      <strong>{{ ref.autores }}</strong> — {{ ref.detalle }}
                    </p>
                  </div>
                }
              </div>
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
    .argilla-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .argilla-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
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

    /* Pasos metodologia */
    .paso-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 4px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      min-width: 0;
    }
    .paso-tab:hover {
      background: var(--color-bg-muted);
    }
    .paso-tab-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      background: var(--color-bg-muted);
      color: var(--color-text-muted);
      transition: background 0.2s, color 0.2s;
    }
    .paso-tab-active .paso-tab-num {
      background: var(--color-text-primary);
      color: white;
    }
    .paso-tab-done .paso-tab-num {
      background: #059669;
      color: white;
    }
    .paso-tab-label {
      font-size: 0.62rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--color-text-muted);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .paso-tab-active .paso-tab-label {
      color: var(--color-text-primary);
    }

    /* Ciclo Iterativo */
    .ciclo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .ciclo-fase {
      text-align: center;
      min-width: 130px;
      padding: 12px 8px;
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .ciclo-fase:hover {
      background: var(--color-bg-muted);
      transform: translateY(-2px);
    }
    .ciclo-paso-num {
      position: absolute;
      top: 8px;
      right: 12px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
      opacity: 0.7;
    }
    .ciclo-icono {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin: 0 auto 10px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .ciclo-icono-active {
      transform: scale(1.12);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    .ciclo-nombre {
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .ciclo-desc {
      font-size: 0.72rem;
      color: var(--color-text-muted);
      max-width: 130px;
      margin: 4px auto 0;
      line-height: 1.4;
    }
    .ciclo-flecha {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .ciclo-detalle {
      background: var(--color-bg-primary, #fff);
      border: 1px solid var(--color-border, #e5e7eb);
      border-left: 4px solid;
      border-radius: 12px;
      padding: 20px 24px;
    }
    .ciclo-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-border, #d1d5db);
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }
    .ciclo-dot:hover {
      transform: scale(1.3);
    }
    .ciclo-dot-active {
      transform: scale(1.3);
    }

    /* Barras de iteracion */
    .iter-barra-container {
      height: 100px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0 8px;
    }
    .iter-barra {
      width: 100%;
      max-width: 56px;
      border-radius: 6px 6px 0 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 6px;
      transition: height 0.6s ease;
    }
    .iter-valor {
      font-size: 0.7rem;
      font-weight: 700;
      color: white;
    }
  `],
})
export class ArgillaComponent {
  filtro = signal<string>('todos');
  pasoActivo = signal(1);
  modalSeccion = signal<Seccion | null>(null);

  abrirModal(sec: Seccion) {
    this.modalSeccion.set(sec);
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.modalSeccion.set(null);
    document.body.style.overflow = '';
  }

  getCategoriaColor(cat: string) {
    switch (cat) {
      case 'concepto': return { bg: '#EFF6FF', text: '#2563EB' };
      case 'flujo': return { bg: '#ECFDF5', text: '#059669' };
      case 'adaptacion': return { bg: '#F3E8FF', text: '#7C3AED' };
      default: return { bg: '#F7F8F7', text: '#5B7065' };
    }
  }

  getCategoriaLabel(cat: string) {
    switch (cat) {
      case 'concepto': return 'Concepto';
      case 'flujo': return 'Flujo de Trabajo';
      case 'adaptacion': return 'Adaptacion';
      default: return cat;
    }
  }

  faseActivaCiclo = signal(0);

  fases: any[] = [
    {
      nombre: 'PREDICT', icono: '\uD83E\uDD16', desc: 'El modelo genera predicciones', color: '#EFF6FF', textColor: '#2563EB',
      rol: 'Automatico - ejecutado por el modelo',
      descripcion_larga: 'El modelo actual (ya sea zero-shot o fine-tuned de iteraciones previas) genera predicciones sobre un batch de datos sin etiquetar. Cada prediccion incluye la etiqueta asignada y un score de confianza (0.0 a 1.0). Los ejemplos con confianza baja (~0.5) son los candidatos prioritarios para revision humana, ya que son los que el modelo encuentra mas dificiles y donde la correccion humana tiene mayor impacto.',
      actividades: [
        'Aplicar el modelo sobre datos sin etiquetar o con etiquetas ruidosas',
        'Calcular scores de confianza (predict_proba en sklearn, softmax en Transformers)',
        'Ordenar predicciones por confianza ascendente para priorizacion',
        'Seleccionar batch de N ejemplos mas inciertos para revision',
      ],
      entrada: 'Datos sin etiquetar + modelo actual',
      salida: 'Predicciones con scores de confianza',
    },
    {
      nombre: 'LOG', icono: '\uD83D\uDCDD', desc: 'Se registran en Argilla', color: '#FFFBEB', textColor: '#D97706',
      rol: 'Automatico - registro via API Python',
      descripcion_larga: 'Las predicciones del modelo se registran en la plataforma Argilla como pre-anotaciones. Cada registro contiene el texto original, la prediccion del modelo, el score de confianza, y metadata adicional (modelo usado, timestamp, iteracion). Argilla almacena todo en Elasticsearch, permitiendo busqueda, filtrado y priorizacion eficiente. Este paso crea la trazabilidad completa: se sabe exactamente que modelo predijo que, cuando, y con que confianza.',
      actividades: [
        'Crear registros TextClassificationRecord con texto + prediccion + score',
        'Incluir metadata: modelo, version, iteracion, timestamp',
        'Enviar batch a Argilla via rg.log(records, name="dataset")',
        'Verificar que los registros aparecen en la interfaz web',
      ],
      entrada: 'Predicciones del modelo con metadata',
      salida: 'Dataset registrado en Argilla listo para anotacion',
    },
    {
      nombre: 'LABEL', icono: '\uD83D\uDC64', desc: 'Humanos corrigen errores', color: '#ECFDF5', textColor: '#059669',
      rol: 'Manual - requiere anotadores humanos',
      descripcion_larga: 'Los anotadores humanos acceden a la interfaz web de Argilla y revisan las pre-anotaciones del modelo. Para cada ejemplo, confirman la prediccion (un click si es correcta) o la corrigen (seleccionan la etiqueta correcta). Argilla prioriza automaticamente los ejemplos con menor confianza, implementando active learning implicito. Los anotadores pueden agregar comentarios en casos ambiguos (sarcasmo, ironia) que sirven como documentacion para futuras guidelines.',
      actividades: [
        'Revisar pre-anotaciones ordenadas por confianza (menor primero)',
        'Confirmar predicciones correctas con un solo click',
        'Corregir predicciones incorrectas seleccionando etiqueta correcta',
        'Agregar comentarios en casos ambiguos para documentar patrones',
      ],
      entrada: 'Pre-anotaciones del modelo en la interfaz Argilla',
      salida: 'Dataset con correcciones humanas validadas',
    },
    {
      nombre: 'TRAIN', icono: '\u2699\uFE0F', desc: 'Re-entrenar modelo', color: '#F3E8FF', textColor: '#7C3AED',
      rol: 'Automatico - re-entrenamiento del modelo',
      descripcion_larga: 'El modelo se re-entrena con el dataset expandido que incluye las correcciones humanas. Para modelos clasicos (sklearn), esto toma segundos: se exportan datos de Argilla como DataFrame, se recalculan features TF-IDF, y se ejecuta svm.fit(). Para Transformers, se usa ArgillaTrainer para fine-tuning (30-60 min en GPU). Tras el entrenamiento, se evalua contra un test set fijo que nunca se usa para anotacion, y se comparan las metricas con la iteracion anterior para medir la mejora real.',
      actividades: [
        'Exportar datos corregidos desde Argilla (to_pandas o to_datasets)',
        'Combinar con datos de entrenamiento originales (aumentar, no reemplazar)',
        'Re-entrenar modelo: sklearn.fit() o HuggingFace Trainer.train()',
        'Evaluar contra test set fijo con classification_report completo',
      ],
      entrada: 'Dataset corregido + datos originales',
      salida: 'Modelo mejorado + metricas de evaluacion',
    },
  ];

  iteraciones = [
    { num: 0, label: 'Baseline', accuracy: 88.75, correcciones: 'Sin Argilla', color: '#94A3B8', pct: 65 },
    { num: 1, label: 'Iter. 1', accuracy: 91.2, correcciones: '+500 correcciones', color: '#2563EB', pct: 78 },
    { num: 2, label: 'Iter. 2', accuracy: 92.8, correcciones: '+300 correcciones', color: '#059669', pct: 88 },
    { num: 3, label: 'Iter. 3', accuracy: 93.5, correcciones: '+200 correcciones', color: '#7C3AED', pct: 95 },
  ];

  secciones: Seccion[] = [
    {
      id: 'que-es-argilla',
      titulo: 'Que es Argilla',
      icono: '\uD83D\uDCCA',
      categoria: 'concepto',
      descripcion: 'Plataforma open-source de anotacion y feedback para NLP. Integra modelos de ML en el flujo de anotacion, permitiendo un ciclo iterativo donde las predicciones del modelo guian la anotacion humana y las correcciones humanas mejoran el modelo.',
      detalle: {
        descripcion_extendida: 'Argilla es una plataforma de anotacion de datos open-source (licencia Apache 2.0) disenada especificamente para proyectos de Procesamiento de Lenguaje Natural (NLP). A diferencia de herramientas de anotacion tradicionales como Label Studio o Prodigy, Argilla esta construida con la filosofia de "human-in-the-loop": en lugar de anotar datos desde cero, integra las predicciones de modelos de ML como pre-anotaciones que los humanos revisan y corrigen. Esto reduce drasticamente el tiempo de anotacion (hasta 5x mas rapido) y mejora la calidad al enfocar la atencion humana en los casos que el modelo encuentra dificiles. Argilla se despliega como un servicio web que se conecta a Elasticsearch (o OpenSearch) para almacenar y buscar anotaciones de forma eficiente. Su interfaz web permite a multiples anotadores trabajar simultaneamente, con soporte para metricas de acuerdo inter-anotador y resolucion de conflictos.',
        puntos_clave: [
          'Open-source con licencia Apache 2.0: se puede instalar en servidores propios sin costos de licencia ni dependencia de terceros.',
          'Integracion nativa con el ecosistema HuggingFace: Transformers, Datasets, Hub. Los modelos y datos fluyen sin friccion entre bibliotecas.',
          'Soporte para multiples tareas NLP: clasificacion de texto, NER, question answering, generacion de texto, y feedback para LLMs (RLHF).',
          'API Python completa: toda la funcionalidad de la interfaz web esta disponible programaticamente, permitiendo automatizar flujos de anotacion.',
          'Metricas integradas: acuerdo inter-anotador, distribucion de etiquetas, progreso de anotacion, y analisis de sesgos en las anotaciones.',
        ],
        ejemplos: [
          {
            texto: 'Instalacion rapida con pip',
            codigo: 'pip install argilla\nimport argilla as rg\nrg.init(api_url="http://localhost:6900",\n        api_key="admin.apikey")',
            explicacion: 'Se instala como cualquier paquete Python. El servidor se levanta con Docker (docker run -d -p 6900:6900 argilla/argilla-server) o se usa Argilla Cloud para desarrollo rapido sin infraestructura.',
          },
          {
            texto: 'Crear un dataset de clasificacion',
            codigo: 'dataset = rg.FeedbackDataset(\n    fields=[rg.TextField(name="text")],\n    questions=[rg.LabelQuestion(\n        name="sentiment",\n        labels=["positive", "negative"]\n    )]\n)\ndataset.push_to_argilla("imdb_sentiment")',
            explicacion: 'Argilla v2 usa FeedbackDataset como abstraccion principal. Define campos (lo que ve el anotador) y preguntas (lo que responde). Soporta multiples tipos de pregunta: labels, rankings, texto libre, escala.',
          },
        ],
        como_funciona: [
          'Se despliega el servidor Argilla (Docker o cloud) y se conecta la API Python.',
          'Se define la estructura del dataset: campos de entrada y preguntas/etiquetas de salida.',
          'Se cargan datos con o sin pre-anotaciones del modelo.',
          'Los anotadores revisan y etiquetan en la interfaz web.',
          'Se exportan los datos anotados para entrenar o evaluar modelos.',
        ],
        beneficios: [
          'Reduce tiempo de anotacion 3-5x con pre-anotaciones de ML',
          'Interfaz web moderna e intuitiva para anotadores no tecnicos',
          'Multiples anotadores con metricas de acuerdo',
          'Integracion directa con HuggingFace Transformers',
          'Gratis y auto-hospedable (sin vendor lock-in)',
        ],
        limitaciones: [
          'Requiere Elasticsearch/OpenSearch como dependencia (mas complejo que SQLite)',
          'La curva de aprendizaje de la API v2 (FeedbackDataset) es mas pronunciada que v1',
          'El rendimiento degrada con datasets > 500K registros sin optimizacion',
          'La interfaz web no soporta anotacion de audio o video nativamente',
        ],
        conexion_actividad: 'En nuestra actividad, Argilla complementa el pipeline de analisis de sentimientos: despues de entrenar el SVM con TF-IDF hibrido al 88.75%, podemos usar Argilla para identificar las resenas que el modelo clasifica con baja confianza, corregirlas manualmente, y re-entrenar para superar ese techo de precision. Es el puente entre el modelo estadistico y la mejora basada en datos.',
        referencias: [
          { autores: 'Argilla Team (2023)', detalle: 'Argilla: Open-source data curation platform for LLMs. Documentacion oficial en docs.argilla.io.' },
          { autores: 'Daniel Vila-Suero et al. (2022)', detalle: 'Argilla: An Open-Source Framework for Data-Centric NLP. Presentacion en NeurIPS Data-Centric AI Workshop.' },
          { autores: 'Monarch, R. (2021)', detalle: 'Human-in-the-Loop Machine Learning. Manning Publications. Libro de referencia sobre anotacion iterativa.' },
        ],
      },
    },
    {
      id: 'problema-resuelve',
      titulo: 'Problema que Resuelve',
      icono: '\u26A0\uFE0F',
      categoria: 'concepto',
      descripcion: 'Un modelo zero-shot entrenado en datos genericos pierde rendimiento al aplicarse a un dominio especifico como resenas de peliculas IMDb. Argilla propone un flujo para adaptar el modelo iterativamente sin necesidad de anotar miles de ejemplos desde cero.',
      detalle: {
        descripcion_extendida: 'El problema fundamental que Argilla resuelve es la brecha entre los modelos genericos pre-entrenados y las necesidades especificas de un dominio. Un modelo como distilbert-sst-2-english alcanza ~91% en el benchmark SST-2, pero al aplicarlo a resenas de IMDb sin ajuste, el rendimiento cae a ~85-87% porque el vocabulario, el estilo y los matices son diferentes. Anotar datos desde cero para cada dominio es prohibitivamente costoso: un anotador profesional etiqueta ~100-200 ejemplos por hora, lo que significa que anotar 10,000 resenas costaria ~50-100 horas de trabajo humano. Argilla resuelve esto con el paradigma "predict-then-correct": el modelo genera predicciones como punto de partida, y el humano solo corrige los errores. Estudios muestran que este enfoque reduce el esfuerzo de anotacion en un 60-80% comparado con anotacion desde cero, mientras produce datos de igual o mayor calidad.',
        puntos_clave: [
          'Los modelos pre-entrenados genericos pierden 3-8 puntos porcentuales al aplicarse a un dominio especifico sin fine-tuning.',
          'La anotacion manual desde cero es costosa: ~$0.10-0.50 USD por ejemplo anotado, dependiendo de la complejidad de la tarea.',
          'El paradigma "predict-then-correct" reduce el costo de anotacion en 60-80% al aprovechar las predicciones correctas del modelo (~85%) como base.',
          'Cada iteracion del ciclo mejora el modelo: con solo 200-500 correcciones, el modelo puede ganar 2-5 puntos porcentuales de precision en el dominio.',
          'El efecto es acumulativo: la primera iteracion corrige los errores mas obvios; las siguientes iteraciones atacan casos cada vez mas sutiles.',
        ],
        ejemplos: [
          {
            texto: 'Escenario sin Argilla',
            explicacion: 'Un equipo necesita clasificar 10,000 resenas de peliculas. Sin herramienta: 2 anotadores x 50 horas = 100 horas-persona. Costo: ~$2,000-5,000 USD. Tiempo: 2-3 semanas. Los anotadores se fatigan y la calidad decae en las ultimas horas.',
          },
          {
            texto: 'Escenario con Argilla',
            explicacion: 'El mismo equipo: el modelo pre-anota las 10,000 resenas en 10 minutos. Los anotadores revisan y corrigen solo los ~1,500 errores (~15%). Esfuerzo: 2 anotadores x 10 horas = 20 horas-persona. Costo: ~$400-1,000 USD. Tiempo: 3-5 dias. Los anotadores se enfocan en casos dificiles, manteniendo la concentracion.',
          },
          {
            texto: 'Iteracion 1 vs Iteracion 3',
            explicacion: 'Iteracion 1: modelo generico 85% -> corregir 750 errores -> modelo ajustado 90%. Iteracion 2: modelo 90% -> corregir 500 errores -> modelo 93%. Iteracion 3: modelo 93% -> corregir 350 errores -> modelo 95%. Cada ciclo requiere menos correcciones porque el modelo ya aprende de los errores previos.',
          },
        ],
        beneficios: [
          'Reduce costo de anotacion en 60-80%',
          'Acelera el time-to-production de modelos NLP',
          'Mejora la calidad al enfocar atencion en casos dificiles',
          'Permite a expertos de dominio (no ML) participar en la mejora',
          'Cuantifica el progreso en cada iteracion',
        ],
        limitaciones: [
          'Si el modelo base es muy malo (<60% accuracy), las pre-anotaciones confunden mas que ayudan',
          'Requiere un modelo base razonable como punto de partida',
          'Los anotadores pueden desarrollar "sesgo de confirmacion": aceptar la prediccion del modelo sin pensar criticamente',
        ],
        conexion_actividad: 'Nuestro SVM con TF-IDF hibrido alcanza 88.75% en IMDb. Usando Argilla, podriamos tomar las ~2,800 resenas mal clasificadas (11.25% de 25,000), priorizarlas por baja confianza del modelo, corregir las 500 mas ambiguas, y re-entrenar. Basandonos en la curva de mejora tipica, esto podria elevar la accuracy a ~91-92% sin cambiar de algoritmo.',
        referencias: [
          { autores: 'Settles, B. (2012)', detalle: 'Active Learning. Morgan & Claypool. Survey fundacional sobre como seleccionar los ejemplos mas informativos para anotar.' },
          { autores: 'Ratner et al. (2017)', detalle: 'Snorkel: Rapid Training Data Creation with Weak Supervision. NeurIPS. Paradigma alternativo de supervision debil.' },
          { autores: 'Ng, A. (2021)', detalle: 'Data-Centric AI vs. Model-Centric AI. NeurIPS Keynote. Argumento de que mejorar datos es mas efectivo que mejorar modelos.' },
        ],
      },
    },
    {
      id: 'predict-log-label',
      titulo: 'Ciclo Predict-Log-Label',
      icono: '\uD83D\uDD04',
      categoria: 'flujo',
      descripcion: 'El corazon de Argilla: un ciclo iterativo de cuatro fases (Predict, Log, Label, Train) que convierte un modelo generico en un modelo especializado para tu dominio. Cada iteracion mejora la precision.',
      detalle: {
        descripcion_extendida: 'El ciclo Predict-Log-Label-Train es el patron central del flujo de trabajo con Argilla. Funciona como un loop de retroalimentacion entre el modelo de ML y los anotadores humanos. En la fase PREDICT, el modelo genera predicciones sobre datos no etiquetados. En LOG, esas predicciones se registran en Argilla como pre-anotaciones. En LABEL, los anotadores humanos revisan las predicciones, confirman las correctas y corrigen las incorrectas. En TRAIN, el modelo se re-entrena con los datos corregidos. Este ciclo se repite hasta alcanzar la precision deseada. La clave es que cada iteracion es mas eficiente que la anterior: el modelo aprende de sus errores y genera menos predicciones incorrectas, reduciendo el trabajo humano necesario. Tipicamente, 3-5 iteraciones son suficientes para alcanzar rendimiento de produccion.',
        puntos_clave: [
          'PREDICT: El modelo genera predicciones con scores de confianza. Los ejemplos con baja confianza son candidatos prioritarios para revision humana.',
          'LOG: Las predicciones se almacenan en Argilla con metadata (confianza, modelo usado, timestamp). Esto permite trazabilidad completa del origen de cada anotacion.',
          'LABEL: La interfaz prioriza automaticamente los ejemplos mas inciertos (active learning implicito). Los anotadores trabajan donde mas impacto tienen.',
          'TRAIN: El modelo se re-entrena con el dataset expandido/corregido. Se evalua contra un test set fijo para medir la mejora real.',
          'El ciclo converge: cada iteracion produce menos errores, hasta que la mejora marginal es minima (tipicamente en 3-5 iteraciones).',
        ],
        como_funciona: [
          'Fase PREDICT: Se aplica el modelo actual (zero-shot o fine-tuned) sobre un batch de datos sin etiquetar. Se registra la prediccion y el score de confianza para cada ejemplo.',
          'Fase LOG: Los registros se envian a Argilla via API Python (rg.log). Cada registro incluye texto, prediccion, confianza, y metadata del modelo.',
          'Fase LABEL: Los anotadores acceden a la interfaz web, ven las pre-anotaciones, y las confirman o corrigen. Argilla ordena por baja confianza para maximizar impacto.',
          'Fase TRAIN: Se exportan los datos anotados, se entrena el modelo (Transformers fine-tuning o sklearn fit), y se evalua contra test set.',
          'Fase EVALUATE: Se comparan metricas antes/despues. Si la mejora es suficiente, se despliega. Si no, se repite el ciclo con el modelo mejorado.',
        ],
        ejemplos: [
          {
            texto: 'Iteracion 1: Modelo zero-shot',
            codigo: '# PREDICT\npredictions = model("This movie was terrible")\n# -> {"label": "NEGATIVE", "score": 0.95}\n\n# LOG\nrg.log(records, name="imdb_v1")\n\n# LABEL: Anotador confirma 425/500, corrige 75\n# TRAIN: re-entrenar con 500 ejemplos\n# Resultado: accuracy sube de 85% a 89%',
            explicacion: 'La primera iteracion es la que produce mayor ganancia. El modelo zero-shot ya acierta en la mayoria de casos; corregir los errores mas claros tiene alto impacto.',
          },
          {
            texto: 'Iteracion 3: Modelo fine-tuned',
            codigo: '# PREDICT con modelo v2\npredictions = model_v2("Not bad, actually")\n# -> {"label": "POSITIVE", "score": 0.62}\n# Score bajo = candidato para revision\n\n# LABEL: Anotador revisa 200 casos de baja confianza\n# TRAIN: accuracy sube de 92% a 94%',
            explicacion: 'En iteraciones posteriores, el modelo ya es bueno en casos faciles. Los errores restantes son casos ambiguos (sarcasmo, negacion) que requieren atencion humana experta.',
          },
        ],
        beneficios: [
          'Convergencia rapida: 3-5 iteraciones para rendimiento de produccion',
          'Eficiencia creciente: cada iteracion requiere menos correcciones',
          'Active learning implicito: prioriza los ejemplos mas informativos',
          'Trazabilidad completa: se sabe quien anoto que y cuando',
          'Reproducible: el ciclo completo se puede automatizar con scripts',
        ],
        limitaciones: [
          'Requiere un test set fijo y separado para medir mejora real (no contaminar)',
          'Si los anotadores son inconsistentes entre si, el modelo aprende ruido',
          'El cold-start es dificil: sin modelo base razonable, las pre-anotaciones no ayudan',
        ],
        conexion_actividad: 'Nuestro pipeline puede implementar este ciclo: (1) El SVM predice las 25,000 resenas de test con scores de confianza. (2) Se registran en Argilla las 500 con menor confianza. (3) Se corrigen manualmente. (4) Se re-entrena el SVM. Esto es exactamente lo que el articulo de Keerthi Kumar no hace: su evaluacion es estatica (entrena una vez, evalua una vez). El ciclo iterativo es nuestra contribucion adicional.',
        referencias: [
          { autores: 'Argilla Docs (2024)', detalle: 'Training and Fine-tuning with Argilla. Guia oficial del ciclo predict-log-label con code examples.' },
          { autores: 'Settles, B. (2012)', detalle: 'Active Learning. Morgan & Claypool. Fundamentos teoricos de la seleccion activa de ejemplos para anotar.' },
          { autores: 'Ren et al. (2021)', detalle: 'A Survey of Deep Active Learning. ACM CSUR. Survey moderno de active learning con deep learning.' },
        ],
      },
    },
    {
      id: 'anotacion-humana',
      titulo: 'Anotacion Humana en Argilla',
      icono: '\uD83D\uDC64',
      categoria: 'flujo',
      descripcion: 'La interfaz de anotacion de Argilla permite a revisores humanos corregir predicciones del modelo eficientemente. Incluye priorizacion por confianza, metricas de acuerdo inter-anotador y resolucion de conflictos.',
      detalle: {
        descripcion_extendida: 'La anotacion humana es la fase mas critica del ciclo: es donde se genera la "senal de supervision" que el modelo usara para mejorar. Argilla optimiza este proceso con una interfaz disenada para minimizar el esfuerzo cognitivo del anotador. Los registros se presentan con la pre-anotacion del modelo visible, permitiendo al anotador confirmar con un click (caso correcto) o cambiar la etiqueta (caso incorrecto). El sistema prioriza automaticamente los ejemplos con menor score de confianza del modelo, implementando una forma de active learning que maximiza el valor informativo de cada anotacion. Para equipos, Argilla soporta multiples anotadores con metricas de acuerdo (Kappa de Cohen, porcentaje de acuerdo) y un sistema de resolucion de conflictos donde un anotador senior puede decidir el desempate.',
        puntos_clave: [
          'Priorizacion por confianza: los ejemplos donde el modelo duda mas (score ~0.5) se muestran primero porque son los mas informativos para el re-entrenamiento.',
          'Anotacion con un click: si la prediccion es correcta, el anotador solo confirma. Esto reduce el esfuerzo de ~85% de los casos a un solo click.',
          'Interfaz contextual: el anotador ve el texto completo, la prediccion del modelo, el score de confianza, y puede agregar comentarios para casos ambiguos.',
          'Soporte multi-anotador: cada ejemplo puede ser anotado por 2-3 personas independientemente, y Argilla calcula metricas de acuerdo automaticamente.',
          'Filtros avanzados: filtrar por estado (anotado, pendiente, en conflicto), por confianza del modelo, por etiqueta predicha, o por busqueda de texto.',
        ],
        como_funciona: [
          'El anotador accede a la interfaz web de Argilla (localhost:6900 o cloud).',
          'Selecciona el dataset a anotar (ej. "imdb_sentiment").',
          'Los registros aparecen ordenados por prioridad (menor confianza primero).',
          'Para cada registro, ve el texto de la resena y la prediccion del modelo con su score.',
          'Confirma (click en la etiqueta sugerida) o corrige (click en la etiqueta correcta).',
          'Opcionalmente agrega comentarios en casos ambiguos ("sarcasmo", "ironia", etc.).',
          'El progreso se guarda automaticamente y se muestra en el dashboard de metricas.',
        ],
        ejemplos: [
          {
            texto: 'Caso facil: confirmacion rapida',
            explicacion: 'Resena: "Absolutely loved this movie, 10/10!" Prediccion: POSITIVE (0.99). El anotador confirma con un click. Tiempo: 2 segundos. Estos casos (~85%) son triviales gracias a la pre-anotacion.',
          },
          {
            texto: 'Caso dificil: correccion necesaria',
            explicacion: 'Resena: "Well, that was... an experience. I guess you could call it a movie." Prediccion: POSITIVE (0.52). El anotador lee, detecta sarcasmo, cambia a NEGATIVE, agrega comentario "sarcasmo". Tiempo: 15-20 segundos. Estos son los casos que realmente mejoran el modelo.',
          },
          {
            texto: 'Caso conflictivo: desacuerdo entre anotadores',
            explicacion: 'Resena: "Not the worst movie I have seen, but nothing special." Anotador 1: NEGATIVE. Anotador 2: POSITIVE. Kappa = 0.0 (desacuerdo). Un anotador senior revisa y decide: NEGATIVE (critica matizada). Este tipo de desacuerdo revela ambiguedad real en los datos.',
          },
        ],
        beneficios: [
          'Anotacion 3-5x mas rapida que herramientas sin pre-anotacion',
          'Active learning implicito maximiza valor de cada anotacion',
          'Metricas de acuerdo detectan problemas de calidad temprano',
          'Comentarios en casos ambiguos crean documentacion viva de las guidelines',
          'Dashboard de progreso motiva a los anotadores con metricas visibles',
        ],
        limitaciones: [
          'Sesgo de confirmacion: los anotadores tienden a aceptar la prediccion del modelo sin cuestionarla, especialmente con scores altos',
          'Fatiga de anotacion: despues de ~200 ejemplos, la atencion y calidad decaen',
          'Requiere guidelines claras: sin instrucciones de anotacion, cada anotador interpreta diferente',
        ],
        conexion_actividad: 'Para nuestro proyecto de IMDb, la anotacion humana resolveria los ~2,800 errores del SVM. Priorizando por confianza, los primeros 500 casos serian los mas ambiguos (sarcasmo, negacion, sentimiento implicito), exactamente los retos que identificamos en la seccion de Retos Abiertos. Cada correccion alimenta directamente la mejora del modelo.',
        referencias: [
          { autores: 'Monarch, R. (2021)', detalle: 'Human-in-the-Loop Machine Learning. Manning. Capitulos 3-5 cubren estrategias de anotacion y calidad.' },
          { autores: 'Artstein & Poesio (2008)', detalle: 'Inter-Coder Agreement for Computational Linguistics. Metricas de acuerdo entre anotadores.' },
          { autores: 'Hovy & Lavid (2010)', detalle: 'Towards a Science of Corpus Annotation. LREC. Principios para diseno de tareas de anotacion.' },
        ],
      },
    },
    {
      id: 'adaptacion-ml-clasico',
      titulo: 'Adaptacion para ML Clasico',
      icono: '\u2699\uFE0F',
      categoria: 'adaptacion',
      descripcion: 'Como usar Argilla con modelos clasicos de scikit-learn (NB, LR, SVM) en lugar de Transformers. Ideal para proyectos sin GPU donde TF-IDF + clasificador es la arquitectura principal.',
      detalle: {
        descripcion_extendida: 'El tutorial estandar de Argilla asume modelos Transformer de HuggingFace, pero el ciclo predict-log-label funciona igual de bien con modelos clasicos de scikit-learn. La diferencia es que en lugar de un modelo zero-shot pre-entrenado, usamos un clasificador entrenado con TF-IDF como fase PREDICT. Las predicciones y sus probabilidades (predict_proba) se registran en Argilla igual que las de un Transformer. Los anotadores corrigen de la misma forma. Y el re-entrenamiento usa sklearn.fit() en lugar de Trainer de HuggingFace. Esta adaptacion es especialmente relevante para nuestro proyecto porque el modelo base es SVM con TF-IDF hibrido, no un Transformer. La ventaja adicional es que el entrenamiento es ordenes de magnitud mas rapido (segundos vs. horas) y no requiere GPU.',
        puntos_clave: [
          'predict_proba de sklearn proporciona scores de confianza equivalentes a los de Transformers para priorizacion en Argilla.',
          'El SVM con kernel lineal (LinearSVC) no tiene predict_proba nativo, pero se puede usar CalibratedClassifierCV para obtenerlo.',
          'El re-entrenamiento con sklearn.fit() toma segundos (vs. horas con fine-tuning de BERT), permitiendo iteraciones mucho mas rapidas.',
          'Se puede exportar datos de Argilla como DataFrame de pandas y alimentar directamente el pipeline de sklearn.',
          'Los features TF-IDF se re-calculan con cada iteracion porque el vocabulario corregido puede cambiar la ponderacion.',
        ],
        como_funciona: [
          'Entrenar el modelo inicial: TfidfVectorizer + SVM con los datos originales de IMDb.',
          'Generar predicciones con predict_proba sobre datos no anotados o el test set.',
          'Registrar en Argilla: texto + prediccion + probabilidad como pre-anotacion.',
          'Los anotadores corrigen los casos de baja confianza en la interfaz web.',
          'Exportar datos corregidos: rg.load("dataset").to_pandas() -> DataFrame.',
          'Re-entrenar: vectorizer.fit_transform(textos_corregidos) -> svm.fit(X, y).',
          'Evaluar en test set fijo y repetir si es necesario.',
        ],
        ejemplos: [
          {
            texto: 'Generar predicciones con sklearn',
            codigo: 'from sklearn.calibration import CalibratedClassifierCV\n\n# Envolver SVM para obtener probabilidades\ncalibrated = CalibratedClassifierCV(svm, cv=5)\ncalibrated.fit(X_train, y_train)\n\n# Predecir con confianza\nprobas = calibrated.predict_proba(X_test)\nconfidence = probas.max(axis=1)  # max prob = confianza',
            explicacion: 'LinearSVC no tiene predict_proba directo. CalibratedClassifierCV ajusta una capa de calibracion (Platt scaling o isotonic) que convierte los scores de decision en probabilidades validas.',
          },
          {
            texto: 'Registrar en Argilla desde sklearn',
            codigo: 'records = [\n    rg.TextClassificationRecord(\n        text=text,\n        prediction=[\n            ("positive", float(proba[1])),\n            ("negative", float(proba[0]))\n        ],\n        prediction_agent="svm-tfidf-hybrid"\n    )\n    for text, proba in zip(texts, probas)\n]\nrg.log(records, name="imdb_svm_review")',
            explicacion: 'El formato es identico al de Transformers. Argilla no distingue si la prediccion viene de BERT o SVM. Lo unico que importa es el texto, la etiqueta predicha y el score de confianza.',
          },
          {
            texto: 'Exportar y re-entrenar',
            codigo: 'import pandas as pd\ndf = rg.load("imdb_svm_review").to_pandas()\ncorrected = df[df.status == "Validated"]\n\nX_new = vectorizer.transform(corrected.text)\ny_new = corrected.annotation\nsvm.fit(X_new, y_new)  # Re-entrenar en 2 segundos',
            explicacion: 'El re-entrenamiento con sklearn es casi instantaneo. Esto permite iterar 10 veces en el tiempo que un fine-tuning de BERT tomaria una sola iteracion.',
          },
        ],
        beneficios: [
          'No requiere GPU: todo corre en CPU en segundos',
          'Iteraciones rapidas: el ciclo completo toma minutos, no horas',
          'Familiar: sklearn es la biblioteca mas usada en ML clasico',
          'Interpretable: los coeficientes del SVM muestran que palabras importan',
          'Ligero: el modelo serializado pesa KB, no GB',
        ],
        limitaciones: [
          'TF-IDF no captura semantica: "not bad" sigue siendo problema',
          'El techo de rendimiento es menor que Transformers (~89% vs ~95%)',
          'Requiere CalibratedClassifierCV para obtener probabilidades de SVM',
          'El vocabulario TF-IDF es fijo tras fit; nuevas palabras no se consideran sin re-fit',
        ],
        conexion_actividad: 'Esta adaptacion es exactamente lo que necesitamos: nuestro modelo es SVM con TF-IDF hibrido, no un Transformer. Podemos implementar el ciclo predict-log-label usando CalibratedClassifierCV para obtener scores de confianza, registrar las predicciones en Argilla, corregir los ~500 casos mas inciertos, y re-entrenar en segundos. Es la forma mas practica de mejorar el 88.75% sin cambiar de arquitectura.',
        referencias: [
          { autores: 'Platt, J. (1999)', detalle: 'Probabilistic Outputs for SVMs. Advances in Large Margin Classifiers. Fundamento del CalibratedClassifierCV.' },
          { autores: 'Pedregosa et al. (2011)', detalle: 'Scikit-learn: Machine Learning in Python. JMLR. Documentacion de CalibratedClassifierCV y pipelines.' },
          { autores: 'Argilla Docs (2024)', detalle: 'Using Argilla with scikit-learn. Guia oficial de integracion con modelos clasicos.' },
        ],
      },
    },
    {
      id: 'adaptacion-espanol',
      titulo: 'Adaptacion para Espanol',
      icono: '\uD83C\uDF0D',
      categoria: 'adaptacion',
      descripcion: 'Como adaptar el flujo de Argilla para analisis de sentimientos en espanol, usando modelos multilingues como BETO y XLM-RoBERTa, y recursos lexicos especificos del idioma.',
      detalle: {
        descripcion_extendida: 'Adaptar el pipeline de analisis de sentimientos al espanol presenta desafios unicos que van mas alla de la simple traduccion. El espanol tiene morfologia verbal mas rica (6 tiempos de indicativo + 4 de subjuntivo), genero gramatical que afecta concordancia, y variaciones dialectales significativas entre paises. Para el flujo de Argilla, esto implica tres adaptaciones: (1) usar modelos pre-entrenados en espanol como BETO o XLM-RoBERTa en lugar de modelos solo-ingles; (2) adaptar el preprocesamiento (tokenizacion, stopwords, lematizacion) al espanol con herramientas como spaCy-es o Stanza; (3) enriquecer con recursos lexicos especificos como ML-SentiCon (lexico de sentimiento en espanol) o iSOL (lexico de opinion). El ciclo predict-log-label funciona igual, pero los anotadores deben ser hablantes nativos que entiendan las variaciones dialectales.',
        puntos_clave: [
          'BETO es un modelo BERT pre-entrenado exclusivamente en espanol (corpus de Wikipedia, periódicos y libros). Supera a mBERT en tareas de espanol por 2-4 puntos porcentuales.',
          'XLM-RoBERTa es multilingue pero con mejor transferencia cross-lingual. Util cuando se quiere un solo modelo para ingles y espanol.',
          'La lematizacion en espanol es mas importante que en ingles: "corri", "corrimos", "correrian" deben mapearse a "correr". spaCy-es maneja esto nativamente.',
          'Los lexicos de sentimiento en espanol son mas limitados: ML-SentiCon tiene ~5,500 palabras vs. ~8,000 de SentiWordNet en ingles.',
          'Las variaciones dialectales son criticas: "chido" (Mexico), "guay" (Espana), "copado" (Argentina) significan lo mismo pero un modelo entrenado en un pais falla en los otros.',
        ],
        como_funciona: [
          'Seleccionar modelo base: BETO para solo-espanol, XLM-RoBERTa para multilingue.',
          'Adaptar preprocesamiento: spaCy "es_core_news_lg" para tokenizacion, lematizacion y deteccion de entidades.',
          'Opcionalmente enriquecer con lexico: ML-SentiCon asigna scores de polaridad a palabras en espanol.',
          'Generar predicciones sobre datos en espanol y registrar en Argilla.',
          'Reclutar anotadores nativos (idealmente de la misma variante dialectal del corpus).',
          'Fine-tune el modelo con datos corregidos usando HuggingFace Trainer o sklearn.',
        ],
        ejemplos: [
          {
            texto: 'Usar BETO para prediccion en espanol',
            codigo: 'from transformers import pipeline\n\n# BETO fine-tuned para sentimiento\nsentiment_es = pipeline(\n    "sentiment-analysis",\n    model="dccuchile/bert-base-spanish-wwm-cased"\n)\n\nresult = sentiment_es("Esta pelicula es increible")\n# -> [{"label": "POS", "score": 0.94}]',
            explicacion: 'BETO (Bidirectional Encoder Representations from Transformers en Espanol) fue entrenado por la Universidad de Chile en un corpus de 3B de palabras en espanol. Para sentimiento, se puede fine-tunear con datos de TASS o SensaCine.',
          },
          {
            texto: 'Preprocesamiento con spaCy en espanol',
            codigo: 'import spacy\nnlp = spacy.load("es_core_news_lg")\n\ndoc = nlp("Las actuaciones fueron increiblemente malas")\nlemmas = [t.lemma_ for t in doc if not t.is_stop]\n# -> ["actuacion", "ser", "increiblemente", "malo"]',
            explicacion: 'spaCy en espanol maneja lematizacion (malas -> malo), deteccion de stopwords, y POS tagging. Es crucial usar lematizacion en lugar de stemming para espanol porque el stemmer de Porter esta disenado para ingles.',
          },
          {
            texto: 'Variaciones dialectales en anotacion',
            explicacion: 'Al anotar en Argilla, incluir guidelines especificas: "Esta chido" = positivo (Mexico), "Mola mucho" = positivo (Espana), "Es re piola" = positivo (Argentina). Sin estas guidelines, un anotador de Espana podria no entender jerga mexicana y viceversa.',
          },
        ],
        beneficios: [
          'Acceso a audiencias hispanohablantes (500M+ hablantes nativos)',
          'BETO y XLM-R alcanzan rendimiento competitivo sin datos de entrenamiento masivos',
          'spaCy y Stanza ofrecen herramientas NLP maduras para espanol',
          'Argilla soporta cualquier idioma en su interfaz de anotacion',
          'El know-how se transfiere: el pipeline es identico al de ingles',
        ],
        limitaciones: [
          'Menos datasets anotados disponibles que en ingles',
          'Las variaciones dialectales requieren anotadores de multiples paises',
          'Los lexicos de sentimiento en espanol tienen menor cobertura',
          'No existe un equivalente de SST-2 con arboles composicionales en espanol',
        ],
        conexion_actividad: 'Aunque nuestra actividad se centra en IMDb (ingles), la adaptacion al espanol es una extension natural y relevante para el contexto del Master UNIR (espanol). Un trabajo futuro seria aplicar el mismo pipeline sobre resenas de SensaCine o FilmAffinity, usando BETO como modelo base y Argilla para anotacion iterativa con hablantes nativos. Esto demostraria la transferibilidad del enfoque.',
        referencias: [
          { autores: 'Canete et al. (2020)', detalle: 'Spanish Pre-Trained BERT Model and Evaluation Data. LREC. Introduce BETO y benchmarks en espanol.' },
          { autores: 'Cruz et al. (2020)', detalle: 'TASS 2020 Task 1: Sentiment Analysis in Spanish. Workshop TASS at SEPLN. Benchmark principal de SA en espanol.' },
          { autores: 'Perez et al. (2022)', detalle: 'pysentimiento: A Python Toolkit for Opinion Mining and Social NLP in Spanish. Herramienta de SA especifica para espanol con modelos pre-entrenados.' },
        ],
      },
    },
    {
      id: 'fine-tuning-iterativo',
      titulo: 'Fine-Tuning Iterativo',
      icono: '\uD83D\uDE80',
      categoria: 'flujo',
      descripcion: 'El proceso de re-entrenar el modelo con datos corregidos en Argilla. Cada iteracion produce un modelo mas preciso que genera mejores pre-anotaciones para la siguiente ronda.',
      detalle: {
        descripcion_extendida: 'El fine-tuning iterativo es la fase que cierra el ciclo y convierte las correcciones humanas en mejoras medibles del modelo. A diferencia del entrenamiento unico tradicional (entrenar una vez con todos los datos y evaluar), el fine-tuning iterativo procede en rondas: cada ronda agrega un batch de datos corregidos al dataset de entrenamiento, re-entrena el modelo, y evalua la mejora. La curva de aprendizaje tipica muestra rendimientos decrecientes: la primera iteracion puede mejorar 3-5 puntos porcentuales, la segunda 1-2 pp, la tercera <1 pp. El momento optimo para detenerse es cuando la mejora marginal es menor que el costo de anotar el siguiente batch. Para modelos clasicos (sklearn), el re-entrenamiento es instantaneo. Para Transformers, cada iteracion toma 30-60 minutos en GPU. La evaluacion siempre se hace contra un test set fijo que nunca se usa para entrenamiento ni anotacion.',
        puntos_clave: [
          'Siempre mantener un test set fijo y separado que nunca se usa para anotacion ni entrenamiento. Sin esto, no se puede medir la mejora real.',
          'La primera iteracion produce la mayor ganancia. Corregir los 100 errores mas claros tiene mas impacto que corregir los ultimos 100 errores ambiguos.',
          'Para sklearn, re-entrenar toma segundos. Para Transformers, 30-60 minutos por iteracion en GPU.',
          'Evaluar con multiples metricas: accuracy, pero tambien precision, recall y F1 por clase. A veces la accuracy sube pero el recall de una clase baja.',
          'Documentar cada iteracion: que se corrigio, cuantos ejemplos, que mejoro, que empeoro. Esto crea un registro de decisiones de anotacion.',
        ],
        como_funciona: [
          'Exportar datos corregidos de Argilla como DataFrame o Dataset de HuggingFace.',
          'Combinar datos corregidos con datos de entrenamiento originales (no reemplazar, aumentar).',
          'Re-entrenar el modelo: sklearn.fit() para clasicos, Trainer.train() para Transformers.',
          'Evaluar contra test set fijo con classification_report (precision, recall, F1, accuracy).',
          'Comparar metricas con iteracion anterior y decidir si continuar o detener el ciclo.',
          'Si se continua: generar nuevas predicciones con el modelo mejorado y repetir desde PREDICT.',
        ],
        ejemplos: [
          {
            texto: 'Re-entrenamiento con sklearn (2 segundos)',
            codigo: '# Combinar datos originales + corregidos\nX_combined = vstack([X_train_original, X_corrected])\ny_combined = np.concatenate([y_train_original, y_corrected])\n\n# Re-entrenar SVM\nsvm.fit(X_combined, y_combined)\n\n# Evaluar\nprint(classification_report(y_test, svm.predict(X_test)))',
            explicacion: 'El SVM se re-entrena con todos los datos (originales + corregidos). No se hace fine-tuning incremental como en deep learning; se re-entrena desde cero porque es instantaneo.',
          },
          {
            texto: 'Curva de mejora tipica',
            explicacion: 'Iteracion 0 (baseline): 88.75%. Iteracion 1 (+500 correcciones): ~91%. Iteracion 2 (+300 correcciones): ~92.5%. Iteracion 3 (+200 correcciones): ~93.2%. El punto de parada depende del costo/beneficio: si anotar 200 ejemplos cuesta $100 y la mejora es solo 0.7%, puede no valer la pena.',
          },
          {
            texto: 'Fine-tuning de Transformer con ArgillaTrainer',
            codigo: 'from argilla.training import ArgillaTrainer\n\ntrainer = ArgillaTrainer(\n    name="imdb_sentiment",\n    framework="transformers",\n    model="distilbert-base-uncased-finetuned-sst-2-english",\n    train_size=0.8\n)\ntrainer.train(output_dir="model_v2")',
            explicacion: 'ArgillaTrainer abstrae el proceso: conecta directamente al dataset de Argilla, divide en train/eval, configura el Trainer de HuggingFace, y entrena. Una linea para un proceso que normalmente requiere 20.',
          },
        ],
        beneficios: [
          'Mejora medible en cada iteracion con metricas cuantificables',
          'Para sklearn, el costo computacional es negligible (segundos)',
          'Los datos corregidos son reutilizables: se acumulan con cada iteracion',
          'ArgillaTrainer simplifica el fine-tuning de Transformers a una linea',
          'El registro de iteraciones documenta el proceso para reproducibilidad',
        ],
        limitaciones: [
          'Rendimientos decrecientes: cada iteracion mejora menos que la anterior',
          'Riesgo de overfitting si el dataset corregido es muy pequeno',
          'Para Transformers, cada iteracion tiene costo computacional significativo (GPU)',
          'Requiere disciplina: un test set contaminado invalida todas las metricas',
        ],
        conexion_actividad: 'El fine-tuning iterativo es el paso que falta en nuestro pipeline. Actualmente entrenamos una vez y evaluamos una vez (como Keerthi Kumar). Implementar 2-3 iteraciones con Argilla podria llevar la accuracy de 88.75% a ~92-93%, superando significativamente el resultado del articulo original. Esto seria una contribucion concreta y medible de nuestra actividad.',
        referencias: [
          { autores: 'Argilla Docs (2024)', detalle: 'ArgillaTrainer: Train and Fine-tune Models. Documentacion oficial de la clase ArgillaTrainer.' },
          { autores: 'Howard & Ruder (2018)', detalle: 'Universal Language Model Fine-tuning for Text Classification. ACL. Fundamentos del fine-tuning gradual en NLP.' },
          { autores: 'Sun et al. (2019)', detalle: 'How to Fine-Tune BERT for Text Classification. CCL. Mejores practicas de fine-tuning de BERT para clasificacion.' },
        ],
      },
    },
    {
      id: 'valoracion-utilidad',
      titulo: 'Valoracion de Utilidad',
      icono: '\u2705',
      categoria: 'concepto',
      descripcion: 'Analisis critico de cuando Argilla es util y cuando no. No todas las tareas NLP se benefician del ciclo predict-log-label. Evaluacion honesta de costos vs. beneficios.',
      detalle: {
        descripcion_extendida: 'Argilla no es la solucion universal para todos los problemas de NLP. Su utilidad depende de varios factores: la disponibilidad de un modelo base razonable (>70% accuracy), la cantidad de datos sin anotar disponibles, el presupuesto para anotacion humana, y la necesidad de mejora iterativa. En escenarios donde ya existe un dataset de alta calidad (como IMDb con 50K resenas etiquetadas), Argilla es menos critico porque el modelo puede entrenarse directamente. Pero en escenarios de dominio nuevo (resenas de salud, opinion politica, feedback de producto), donde no hay datos etiquetados y el modelo generico falla, Argilla se vuelve esencial. La valoracion honesta es que Argilla agrega complejidad operacional (servidor, anotadores, ciclos) a cambio de mejora incremental que puede o no justificar el esfuerzo.',
        puntos_clave: [
          'Argilla es mas valioso cuando hay abundancia de datos sin anotar y escasez de datos anotados (el caso tipico en la industria).',
          'Para datasets grandes ya anotados (como IMDb 50K), la utilidad principal es corregir los errores del dataset existente, no crear anotaciones nuevas.',
          'El costo operacional es real: mantener un servidor Elasticsearch, reclutar y coordinar anotadores, gestionar ciclos de iteracion.',
          'La alternativa de supervision debil (Snorkel) puede ser mas eficiente cuando no hay presupuesto para anotadores humanos.',
          'Para proyectos academicos (como nuestra actividad), Argilla aporta valor pedagogico: enseña el flujo profesional de data-centric AI.',
        ],
        ejemplos: [
          {
            texto: 'Escenario ideal para Argilla',
            explicacion: 'Una startup de e-commerce quiere clasificar resenas de su producto. Tiene 100K resenas sin etiquetar, 0 resenas anotadas, y un presupuesto de $500 para anotacion. Argilla permite: (1) usar un modelo generico como base, (2) anotar 500 resenas en 2 dias, (3) fine-tunear y alcanzar 90%+ accuracy. Sin Argilla, necesitarian anotar 5,000+ resenas ($5,000+) para el mismo resultado.',
          },
          {
            texto: 'Escenario donde Argilla NO es necesario',
            explicacion: 'Un proyecto academico que usa IMDb (50K resenas pre-etiquetadas) para comparar clasificadores. Los datos ya estan etiquetados, no hay necesidad de anotacion adicional. Argilla no aporta valor directo. Sin embargo, si el objetivo es mejorar la calidad de las etiquetas existentes (corregir errores en la binarizacion de IMDb), entonces si aporta.',
          },
          {
            texto: 'Comparacion de costo/beneficio',
            explicacion: 'Sin Argilla: entrenar SVM en IMDb = 88.75%. Con Argilla (3 iteraciones, 1,000 correcciones, ~20 horas-persona): ~92-93%. El delta de 3-4 pp justifica las 20 horas? Depende del contexto. En produccion (millones de predicciones), si. En un proyecto academico, el valor es pedagogico.',
          },
        ],
        beneficios: [
          'Demuestra el paradigma data-centric AI (tendencia actual en la industria)',
          'Ensena el flujo profesional de mejora iterativa de modelos',
          'Cuantifica el impacto de la calidad de datos en el rendimiento',
          'Herramienta gratuita y open-source (sin costo de licencia)',
        ],
        limitaciones: [
          'Complejidad operacional: requiere servidor, anotadores, coordinacion',
          'No sustituye tener un buen modelo base (basura entra, basura sale)',
          'Para datasets ya etiquetados de alta calidad, el beneficio marginal es bajo',
          'El ciclo iterativo puede volverse interminable sin criterio de parada claro',
        ],
        conexion_actividad: 'En nuestra actividad, Argilla cumple un rol dual: (1) valor practico — podria mejorar la accuracy del SVM de 88.75% a ~92% corrigiendo los errores mas claros del dataset; (2) valor academico — demuestra que entendemos el paradigma data-centric AI que Andrew Ng y la comunidad NLP consideran el futuro del campo. Incluir Argilla diferencia nuestro trabajo de una implementacion puramente tecnica.',
        referencias: [
          { autores: 'Ng, A. (2021)', detalle: 'A Chat with Andrew on MLOps. DeepLearning.AI. Argumento de que el 80% del esfuerzo deberia ir a datos, no a modelos.' },
          { autores: 'Liang et al. (2022)', detalle: 'Advances, Challenges and Opportunities in Creating Data for NLP. ACL. Survey de los desafios actuales en creacion de datos.' },
          { autores: 'Sambasivan et al. (2021)', detalle: '"Everyone wants to do the model work, not the data work". CHI. Estudio sobre la infravaloración del trabajo con datos.' },
        ],
      },
    },
  ];

  seccionesFiltradas = computed(() => {
    const f = this.filtro();
    if (f === 'todos') return this.secciones;
    return this.secciones.filter(s => s.categoria === f);
  });

  pasos: any[] = [
    {
      numero: 1,
      etiqueta: 'Modelo',
      icono: '\uD83E\uDD16',
      titulo: 'Obtener un modelo base de partida',
      descripcion: 'El primer paso es contar con un modelo de clasificacion de sentimientos que sirva como punto de partida. Puede ser un modelo pre-entrenado (como DistilBERT fine-tuned en SST-2) o un modelo entrenado por nosotros (como el SVM con TF-IDF hibrido del articulo de Keerthi Kumar). Lo importante es que este modelo ya tenga una precision razonable (>70%) para que sus predicciones sirvan como pre-anotaciones utiles.',
      acciones: [
        'Seleccionar o entrenar un clasificador de sentimientos (SVM, Regresion Logistica, BERT, etc.)',
        'Verificar que el modelo pueda generar scores de confianza ademas de la etiqueta (positivo/negativo)',
        'Evaluar la precision base del modelo en un conjunto de prueba para tener la linea de referencia',
      ],
      ejemplo_proyecto: 'Nuestro modelo base es el SVM con metodo hibrido (BoW + TF-IDF) que alcanza 88.75% de accuracy en IMDb. Este sera nuestro punto de partida para el ciclo de mejora iterativa.',
      consideraciones: [
        'Si el modelo base tiene menos de 70% de accuracy, las pre-anotaciones confundiran mas que ayudaran',
        'Guardar las metricas de evaluacion base como referencia para medir mejoras posteriores',
      ],
    },
    {
      numero: 2,
      etiqueta: 'Datos',
      icono: '\uD83D\uDCC2',
      titulo: 'Preparar los datos a revisar',
      descripcion: 'Seleccionar el conjunto de datos que el modelo analizara. Pueden ser datos sin etiquetar (nuevas resenas) o datos ya etiquetados donde queremos verificar y corregir la calidad de las etiquetas existentes. En ambos casos, el modelo generara predicciones que serviran como punto de partida para la revision humana.',
      acciones: [
        'Seleccionar un subconjunto representativo de datos (500-1,000 ejemplos para la primera iteracion)',
        'Priorizar datos donde el modelo tiene menor confianza (los mas dificiles e informativos)',
        'Separar un conjunto de prueba fijo que NUNCA se usara para anotacion (para medir mejoras reales)',
      ],
      ejemplo_proyecto: 'De las 25,000 resenas de test de IMDb, seleccionamos las 500 donde nuestro SVM tiene menor confianza en su prediccion. Estas son las resenas ambiguas (sarcasmo, negacion, sentimiento implicito) que mas se benefician de correccion humana.',
      consideraciones: [
        'Empezar con un subconjunto pequeno (500) e ir escalando en cada iteracion',
        'El conjunto de prueba debe mantenerse intacto para no contaminar la evaluacion',
      ],
    },
    {
      numero: 3,
      etiqueta: 'Prediccion',
      icono: '\uD83D\uDD2E',
      titulo: 'Generar predicciones automaticas',
      descripcion: 'Aplicar el modelo sobre los datos seleccionados para obtener predicciones automaticas con sus respectivos scores de confianza. Estas predicciones se convierten en pre-anotaciones: sugerencias que el anotador humano vera y podra confirmar o corregir. Esto es lo que hace el proceso 3-5 veces mas rapido que anotar desde cero.',
      acciones: [
        'Ejecutar el modelo sobre cada texto para obtener la etiqueta predicha (positivo/negativo)',
        'Calcular el score de confianza de cada prediccion (probabilidad de la clase ganadora)',
        'Ordenar las predicciones por confianza: las de menor confianza son prioritarias para revision',
      ],
      ejemplo_proyecto: 'El SVM predice cada resena como positiva o negativa, y con CalibratedClassifierCV obtenemos la probabilidad. Una resena con prediccion "positiva" y confianza 0.52 es casi aleatoria — esa resena necesita revision humana urgente.',
      consideraciones: [
        'Los modelos tipo SVM necesitan calibracion (CalibratedClassifierCV) para generar probabilidades validas',
        'Las predicciones con confianza >0.95 casi siempre son correctas; el valor esta en revisar las de confianza <0.70',
      ],
    },
    {
      numero: 4,
      etiqueta: 'Registro',
      icono: '\uD83D\uDCDD',
      titulo: 'Registrar predicciones en Argilla',
      descripcion: 'Cargar las predicciones del modelo en la plataforma Argilla, donde quedan almacenadas como pre-anotaciones. Cada registro contiene el texto de la resena, la prediccion del modelo, el score de confianza, y metadata adicional (que modelo genero la prediccion, en que iteracion). Argilla organiza y prioriza estos registros para la fase de anotacion humana.',
      acciones: [
        'Crear un dataset en Argilla con la estructura adecuada (campos de texto y etiquetas de sentimiento)',
        'Cargar cada resena con su prediccion automatica como sugerencia para el anotador',
        'Incluir el score de confianza para que Argilla priorice automaticamente los casos mas inciertos',
        'Agregar metadata de trazabilidad: nombre del modelo, version, numero de iteracion',
      ],
      ejemplo_proyecto: 'Las 500 resenas seleccionadas se registran en Argilla con su prediccion del SVM hibrido. Argilla las ordena por confianza: las resenas con sarcasmo o negacion compleja (confianza ~0.50) aparecen primero para revision.',
      consideraciones: [
        'La trazabilidad es importante: saber que modelo genero cada prediccion permite auditar el proceso completo',
        'Argilla soporta multiples tipos de tareas: clasificacion, NER, ranking, etc.',
      ],
    },
    {
      numero: 5,
      etiqueta: 'Anotacion',
      icono: '\uD83D\uDC64',
      titulo: 'Revision y correccion humana',
      descripcion: 'Este es el paso mas critico: los anotadores humanos revisan las predicciones del modelo en la interfaz de Argilla. Para cada resena, ven el texto completo y la sugerencia del modelo. Si la prediccion es correcta, la confirman con un click. Si es incorrecta, la corrigen seleccionando la etiqueta correcta. Los casos dificiles (sarcasmo, ironia, negacion) reciben atencion especial con comentarios explicativos.',
      acciones: [
        'Revisar cada resena presentada: leer el texto y evaluar si la prediccion del modelo es correcta',
        'Confirmar predicciones correctas (mayoria, ~85% de los casos) con un solo click',
        'Corregir predicciones incorrectas cambiando la etiqueta (positivo a negativo o viceversa)',
        'Documentar casos ambiguos con comentarios: "sarcasmo", "negacion doble", "opinion mixta"',
      ],
      ejemplo_proyecto: 'De las 500 resenas revisadas, ~425 tienen la prediccion correcta y se confirman rapidamente. Las ~75 restantes son errores del modelo: resenas sarcasticas clasificadas como positivas, negaciones sutiles ignoradas, etc. Estas correcciones son la "senal de oro" para mejorar el modelo.',
      consideraciones: [
        'Cuidado con el sesgo de confirmacion: no aceptar automaticamente la sugerencia del modelo sin leer',
        'Despues de ~200 anotaciones, tomar un descanso para mantener la calidad de las correcciones',
        'Si hay multiples anotadores, medir el acuerdo entre ellos (Kappa de Cohen) para detectar inconsistencias',
      ],
      resultado: 'Conjunto de datos con correcciones humanas de alta calidad, listo para mejorar el modelo.',
    },
    {
      numero: 6,
      etiqueta: 'Entrena',
      icono: '\u2699\uFE0F',
      titulo: 'Re-entrenar el modelo con datos corregidos',
      descripcion: 'Exportar los datos corregidos de Argilla y usarlos para re-entrenar el modelo. Los datos corregidos se combinan con los datos de entrenamiento originales (se aumentan, no se reemplazan). El modelo aprende de sus errores previos y mejora su capacidad de clasificacion, especialmente en los casos dificiles que fueron corregidos por los anotadores.',
      acciones: [
        'Exportar las anotaciones corregidas desde Argilla como un dataset estructurado',
        'Combinar los datos corregidos con el dataset de entrenamiento original',
        'Re-entrenar el modelo con el dataset expandido (sklearn: segundos; Transformers: minutos a horas)',
        'Guardar una copia del modelo anterior por si se necesita comparar o revertir',
      ],
      ejemplo_proyecto: 'Se exportan las 500 resenas corregidas, se combinan con las 25,000 de entrenamiento original, y se re-entrena el SVM. El proceso toma ~2 segundos con sklearn. El modelo actualizado ahora "sabe" que ciertas expresiones sarcasticas son negativas.',
      consideraciones: [
        'Para SVM/sklearn el re-entrenamiento es instantaneo (segundos), lo cual permite iterar rapidamente',
        'Para modelos tipo BERT, cada re-entrenamiento puede tomar 30-60 minutos con GPU',
        'Documentar cada iteracion: cuantos datos se agregaron, que tipo de errores se corrigieron',
      ],
    },
    {
      numero: 7,
      etiqueta: 'Evaluar',
      icono: '\uD83D\uDCCA',
      titulo: 'Evaluar mejora y decidir si iterar',
      descripcion: 'Evaluar el modelo re-entrenado contra el conjunto de prueba fijo que se separo al inicio. Comparar las metricas (accuracy, precision, recall, F1) con la iteracion anterior para medir la mejora real. Si la mejora es significativa y aun hay margen, repetir el ciclo desde el paso 2. Si la mejora es marginal (<0.5 puntos porcentuales), el modelo ha convergido y se detiene el proceso.',
      acciones: [
        'Evaluar el modelo actualizado en el conjunto de prueba fijo (nunca usado para anotacion)',
        'Comparar accuracy, precision, recall y F1-Score con la iteracion anterior',
        'Analizar que tipos de errores se corrigieron y cuales persisten',
        'Decidir: si la mejora justifica otra iteracion, volver al paso 2 con el modelo mejorado',
      ],
      ejemplo_proyecto: 'Tras la primera iteracion con 500 correcciones, el SVM pasa de 88.75% a ~91%. La mejora de +2.25 pp justifica una segunda iteracion. En la tercera iteracion, la mejora es solo +0.5 pp, asi que se detiene el ciclo con ~93% de accuracy final.',
      consideraciones: [
        'NUNCA evaluar en los mismos datos que se usaron para anotacion (data leakage invalida las metricas)',
        'Criterio de parada recomendado: cuando la mejora entre iteraciones sea menor a 0.5 puntos porcentuales',
        'Tipicamente 3-5 iteraciones son suficientes para alcanzar el rendimiento optimo del modelo',
      ],
      resultado: 'Modelo optimizado con metricas superiores a la linea base. Listo para produccion o para el siguiente ciclo de mejora.',
    },
  ];
}
