import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { UpperCasePipe } from '@angular/common';

interface Ejemplo {
  texto: string;
  explicacion: string;
}

interface Enfoque {
  nombre: string;
  descripcion: string;
  efectividad: string;
}

interface Referencia {
  autores: string;
  detalle: string;
}

interface Reto {
  id: string;
  titulo: string;
  icono: string;
  descripcion: string;
  ejemplo: string;
  importancia: 'alta' | 'media' | 'critica';
  enfoques: string[];
  detalle: {
    descripcion_extendida: string;
    por_que_es_dificil: string[];
    ejemplos: Ejemplo[];
    impacto_imdb: string;
    impacto_sst2: string;
    enfoques_detallados: Enfoque[];
    estado_actual: string;
    conexion_actividad: string;
    referencias: Referencia[];
  };
}

@Component({
  selector: 'app-retos',
  standalone: true,
  imports: [UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-wide">
      <div class="page-header animate-fadeIn">
        <h1 class="page-header__title font-display">Retos Abiertos en TSA</h1>
        <p class="page-header__desc">Desafios actuales en el analisis de sentimientos que la comunidad investigadora trabaja por resolver</p>
      </div>

      <!-- Hero -->
      <div class="card-hero animate-fadeInUp" style="margin-bottom:32px;">
        <h2 class="card-hero__title">Retos en Analisis de Sentimientos</h2>
        <p class="card-hero__desc">
          A pesar de los avances con modelos como BERT y GPT, el analisis de sentimientos enfrenta
          desafios fundamentales que limitan su precision en escenarios reales.
          Estos retos son especialmente relevantes para datasets como IMDb y SST-2.
        </p>
      </div>

      <!-- Leyenda de impacto -->
      <div class="card animate-fadeIn" style="padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 10px;font-size:0.8rem;font-weight:600;color:var(--color-text-primary);">
          Impacto en la clasificacion de sentimientos
        </p>
        <p style="margin:0 0 12px;font-size:0.78rem;color:var(--color-text-secondary);line-height:1.6;">
          Cada reto se clasifica segun el porcentaje de errores que causa en los modelos actuales de analisis de sentimientos y la dificultad para resolverlo:
        </p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge" style="background:#FEF2F2;color:#DC2626;font-size:0.72rem;">CRITICA</span>
            <span style="font-size:0.78rem;color:var(--color-text-secondary);">Causa 5-12% de los errores. Sin solucion efectiva aun.</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge" style="background:#FFFBEB;color:#D97706;font-size:0.72rem;">ALTA</span>
            <span style="font-size:0.78rem;color:var(--color-text-secondary);">Causa 3-5% de errores. Soluciones parciales existen.</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge" style="background:#EFF6FF;color:#2563EB;font-size:0.72rem;">MEDIA</span>
            <span style="font-size:0.78rem;color:var(--color-text-secondary);">Afecta calidad y confianza mas que precision directa.</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;" class="animate-fadeIn">
        <button class="btn btn-ghost" [class.btn-primary]="filtro() === 'todos'" (click)="filtro.set('todos')">Todos ({{ retos.length }})</button>
        <button class="btn btn-ghost" [class.btn-primary]="filtro() === 'critica'" (click)="filtro.set('critica')">Critica</button>
        <button class="btn btn-ghost" [class.btn-primary]="filtro() === 'alta'" (click)="filtro.set('alta')">Alta</button>
        <button class="btn btn-ghost" [class.btn-primary]="filtro() === 'media'" (click)="filtro.set('media')">Media</button>
      </div>

      <!-- Grid de retos -->
      <div class="stagger-children" style="display:grid;grid-template-columns:1fr;gap:20px;">
        @for (reto of retosFiltrados(); track reto.id) {
          <div class="card animate-fadeInUp reto-card"
               role="button" tabindex="0"
               (click)="abrirModal(reto)" (keydown.enter)="abrirModal(reto)">
            <!-- Header con importancia -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 0;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;"
                     [style.background]="getImportanciaColor(reto.importancia).bg">
                  {{ reto.icono }}
                </div>
                <div>
                  <h3 class="font-display" style="font-size:1rem;font-weight:600;color:var(--color-text-primary);margin:0;">
                    {{ reto.titulo }}
                  </h3>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge"
                      [style.background]="getImportanciaColor(reto.importancia).bg"
                      [style.color]="getImportanciaColor(reto.importancia).text">
                  {{ reto.importancia | uppercase }}
                </span>
                <span style="font-size:0.75rem;color:var(--color-text-muted);">Ver detalle &#8250;</span>
              </div>
            </div>

            <div style="padding:16px 24px 20px;">
              <p style="margin:0 0 16px;line-height:1.7;font-size:0.875rem;color:var(--color-text-secondary);">
                {{ reto.descripcion }}
              </p>

              <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;margin-bottom:16px;">
                <p style="margin:0 0 4px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);">Ejemplo</p>
                <p style="margin:0;font-size:0.85rem;color:var(--color-text-secondary);font-style:italic;line-height:1.6;">
                  {{ reto.ejemplo }}
                </p>
              </div>

              <div>
                <p style="margin:0 0 8px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-text-muted);">Enfoques Actuales</p>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                  @for (enfoque of reto.enfoques; track enfoque) {
                    <span class="tag">{{ enfoque }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Resumen -->
      <div class="card-section animate-fadeInUp" style="margin-top:32px;">
        <h3 class="font-display" style="font-size:0.95rem;font-weight:600;color:var(--color-text-primary);margin:0 0 12px;">
          Relevancia para IMDb y SST-2
        </h3>
        <p style="margin:0 0 12px;line-height:1.7;font-size:0.875rem;color:var(--color-text-secondary);">
          Estos retos impactan directamente en los resultados de clasificacion de resenas de peliculas.
          En IMDb, las resenas largas suelen contener sarcasmo, negacion compleja y sentimientos mixtos
          que dificultan la clasificacion binaria. En SST-2, las frases cortas presentan el reto adicional
          de capturar semantica composicional con contexto limitado.
        </p>
        <p style="margin:0;line-height:1.7;font-size:0.875rem;color:var(--color-text-secondary);">
          Los modelos clasicos (NB, LR, SVM) con TF-IDF alcanzan ~89% de accuracy en IMDb,
          pero los retos descritos representan el techo que impide superar ~95% sin tecnicas
          mas sofisticadas como Transformers con atencion contextual.
        </p>
      </div>
    </div>

    <!-- MODAL OVERLAY -->
    @if (modalReto()) {
      <div style="position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;"
           (click)="cerrarModal()">
        <!-- Backdrop -->
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);"></div>

        <!-- Modal content -->
        <div style="position:relative;background:var(--color-bg-primary, #fff);border-radius:16px;max-width:720px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 24px 48px rgba(0,0,0,0.2);animation:modalIn 0.25s ease-out;"
             (click)="$event.stopPropagation()">

          <!-- Modal header -->
          <div style="position:sticky;top:0;z-index:1;background:var(--color-bg-primary, #fff);border-bottom:1px solid var(--color-border, #e5e7eb);padding:20px 24px;border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;"
                   [style.background]="getImportanciaColor(modalReto()!.importancia).bg">
                {{ modalReto()!.icono }}
              </div>
              <div>
                <h2 class="font-display" style="font-size:1.15rem;font-weight:700;color:var(--color-text-primary);margin:0;">
                  {{ modalReto()!.titulo }}
                </h2>
                <span class="badge" style="margin-top:4px;display:inline-block;"
                      [style.background]="getImportanciaColor(modalReto()!.importancia).bg"
                      [style.color]="getImportanciaColor(modalReto()!.importancia).text">
                  Importancia {{ modalReto()!.importancia | uppercase }}
                </span>
              </div>
            </div>
            <button (click)="cerrarModal()"
                    class="modal-close-btn">
              &#10005;
            </button>
          </div>

          <!-- Modal body -->
          <div style="padding:24px;">
            <!-- Descripcion extendida -->
            <div style="margin-bottom:24px;">
              <h3 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em;">
                Descripcion
              </h3>
              <p style="margin:0;line-height:1.8;font-size:0.875rem;color:var(--color-text-secondary);text-align:justify;">
                {{ modalReto()!.detalle.descripcion_extendida }}
              </p>
            </div>

            <!-- Por que es dificil -->
            <div style="margin-bottom:24px;">
              <h3 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em;">
                Por que es dificil
              </h3>
              <div style="display:flex;flex-direction:column;gap:8px;">
                @for (razon of modalReto()!.detalle.por_que_es_dificil; track $index) {
                  <div style="display:flex;gap:10px;align-items:flex-start;">
                    <span style="min-width:22px;height:22px;border-radius:50%;background:var(--color-bg-muted);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:var(--color-text-muted);flex-shrink:0;">
                      {{ $index + 1 }}
                    </span>
                    <p style="margin:0;font-size:0.84rem;color:var(--color-text-secondary);line-height:1.6;">{{ razon }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Ejemplos detallados -->
            <div style="margin-bottom:24px;">
              <h3 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em;">
                Ejemplos Detallados
              </h3>
              <div style="display:flex;flex-direction:column;gap:10px;">
                @for (ej of modalReto()!.detalle.ejemplos; track $index) {
                  <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                    <p style="margin:0 0 6px;font-size:0.85rem;font-style:italic;color:var(--color-text-primary);line-height:1.6;">
                      "{{ ej.texto }}"
                    </p>
                    <p style="margin:0;font-size:0.78rem;color:var(--color-text-secondary);line-height:1.5;">
                      {{ ej.explicacion }}
                    </p>
                  </div>
                }
              </div>
            </div>

            <!-- Impacto en datasets -->
            <div style="margin-bottom:24px;">
              <h3 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em;">
                Impacto en Datasets
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;border-left:3px solid #D97706;">
                  <p style="margin:0 0 6px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#D97706;">IMDb</p>
                  <p style="margin:0;font-size:0.82rem;color:var(--color-text-secondary);line-height:1.6;">
                    {{ modalReto()!.detalle.impacto_imdb }}
                  </p>
                </div>
                <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;border-left:3px solid #2563EB;">
                  <p style="margin:0 0 6px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#2563EB;">SST-2</p>
                  <p style="margin:0;font-size:0.82rem;color:var(--color-text-secondary);line-height:1.6;">
                    {{ modalReto()!.detalle.impacto_sst2 }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Enfoques detallados -->
            <div style="margin-bottom:24px;">
              <h3 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em;">
                Enfoques y Soluciones
              </h3>
              <div style="display:flex;flex-direction:column;gap:10px;">
                @for (enf of modalReto()!.detalle.enfoques_detallados; track enf.nombre) {
                  <div style="background:var(--color-bg-muted);border-radius:8px;padding:12px 16px;">
                    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
                      <p style="margin:0;font-size:0.85rem;font-weight:600;color:var(--color-text-primary);">{{ enf.nombre }}</p>
                      <span class="tag" style="font-size:0.7rem;">{{ enf.efectividad }}</span>
                    </div>
                    <p style="margin:0;font-size:0.8rem;color:var(--color-text-secondary);line-height:1.6;">{{ enf.descripcion }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Estado actual -->
            <div style="margin-bottom:24px;">
              <h3 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em;">
                Estado Actual de la Investigacion
              </h3>
              <p style="margin:0;line-height:1.8;font-size:0.85rem;color:var(--color-text-secondary);text-align:justify;">
                {{ modalReto()!.detalle.estado_actual }}
              </p>
            </div>

            <!-- Conexion con la actividad -->
            <div style="margin-bottom:24px;background:rgba(91,112,101,0.06);border-radius:8px;padding:14px 18px;border-left:3px solid var(--color-text-accent, #5B7065);">
              <h3 style="font-size:0.8rem;color:var(--color-text-accent, #5B7065);font-weight:600;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.04em;">
                Conexion con Nuestra Actividad
              </h3>
              <p style="margin:0;line-height:1.7;font-size:0.84rem;color:var(--color-text-secondary);">
                {{ modalReto()!.detalle.conexion_actividad }}
              </p>
            </div>

            <!-- Referencias -->
            <div>
              <h3 style="font-size:0.8rem;color:var(--color-text-muted);font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em;">
                Referencias Clave
              </h3>
              <div style="display:flex;flex-direction:column;gap:6px;">
                @for (ref of modalReto()!.detalle.referencias; track $index) {
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
    .reto-card {
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .reto-card:hover {
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
    .modal-close-btn:focus-visible {
      outline: 2px solid var(--color-forest, #04202C);
      outline-offset: 2px;
    }
    .reto-card:focus-visible {
      outline: 2px solid var(--color-forest, #04202C);
      outline-offset: 2px;
    }
  `],
})
export class RetosComponent {
  filtro = signal<string>('todos');
  modalReto = signal<Reto | null>(null);

  abrirModal(reto: Reto) {
    this.modalReto.set(reto);
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.modalReto.set(null);
    document.body.style.overflow = '';
  }

  retos: Reto[] = [
    {
      id: 'sarcasmo',
      titulo: 'Sarcasmo e Ironia',
      icono: '\uD83C\uDFAD',
      descripcion: 'El sarcasmo invierte el significado literal de una expresion. Un clasificador basado en palabras clave asigna polaridad positiva a frases que en realidad expresan critica. Este fenomeno es particularmente frecuente en resenas de peliculas de IMDb, donde los usuarios utilizan humor para expresar descontento.',
      ejemplo: '"Oh brilliant, another superhero movie. Just what the world needed." — Superficie positiva, sentimiento real negativo.',
      importancia: 'critica',
      enfoques: ['Modelos de contexto (BERT)', 'Features pragmaticas', 'Deteccion multi-modal', 'Incongruencia semantica'],
      detalle: {
        descripcion_extendida: 'El sarcasmo es una figura retorica donde el hablante dice lo contrario de lo que quiere expresar, generalmente con intencion critica o humoristica. En el analisis de sentimientos, es uno de los problemas mas dificiles porque requiere comprender la intencion del autor mas alla del significado literal de las palabras. Los modelos basados en BoW o TF-IDF son especialmente vulnerables porque tratan cada palabra de forma independiente, sin capturar la incongruencia entre lo que se dice y lo que se quiere decir. Incluso modelos contextuales como BERT tienen dificultades significativas, alcanzando solo ~70-75% de precision en benchmarks de deteccion de sarcasmo.',
        por_que_es_dificil: [
          'Las palabras individuales tienen polaridad positiva ("brilliant", "great", "amazing") pero la intencion global es negativa, lo que confunde a cualquier modelo bag-of-words.',
          'Requiere conocimiento del mundo y contexto cultural: "What a time to be alive" puede ser sincero o sarcastico dependiendo del contexto.',
          'No existe una marca linguistica universal del sarcasmo en texto; en habla oral se usa tono, pero en texto escrito solo hay pistas sutiles.',
          'La frecuencia es alta en resenas de peliculas (~8-12% de resenas en IMDb contienen sarcasmo segun estudios empiricos), suficiente para impactar la accuracy global.',
        ],
        ejemplos: [
          {
            texto: 'Oh brilliant, another superhero movie. Just what the world needed.',
            explicacion: 'Todas las palabras de sentimiento son positivas ("brilliant", "needed"), pero el contexto revela critica. Un clasificador BoW/TF-IDF asignaria con alta confianza polaridad positiva.',
          },
          {
            texto: 'The plot was so predictable that I figured out the ending during the opening credits. Truly groundbreaking cinema.',
            explicacion: 'La incongruencia entre "predictable" (negativo) y "groundbreaking" (positivo) en la misma resena genera confusion. La ultima frase es sarcastica pero contiene vocabulario de alta polaridad positiva.',
          },
          {
            texto: 'I love paying $15 to watch actors sleepwalk through a script written by a committee.',
            explicacion: '"Love" es positivo, pero el contexto ("sleepwalk", "written by a committee") revela que es sarcastico. La estructura "I love + [experiencia negativa]" es un patron de sarcasmo comun.',
          },
        ],
        impacto_imdb: 'Las resenas de IMDb son extensas (150-300 palabras en promedio) y los usuarios suelen mezclar sarcasmo con critica directa. Esto significa que una resena puede contener frases sarcasticas y literales simultáneamente, complicando la clasificacion binaria.',
        impacto_sst2: 'En SST-2, las frases son cortas (una oracion), lo que reduce el contexto disponible para detectar sarcasmo. Sin embargo, la anotacion a nivel de frase del Stanford Sentiment Treebank facilita el etiquetado correcto de frases sarcasticas individuales.',
        enfoques_detallados: [
          {
            nombre: 'Deteccion de Incongruencia Semantica',
            descripcion: 'Identifica contradicciones entre segmentos de texto (ej. "brilliant" + contexto negativo). Usa embeddings contextuales para medir la discrepancia entre la polaridad esperada y la observada en distintas partes de la oracion.',
            efectividad: 'Alta (~78%)',
          },
          {
            nombre: 'BERT + Fine-tuning para Sarcasmo',
            descripcion: 'Entrena BERT especificamente en datasets de sarcasmo (iSarcasm, SemEval) y luego aplica transfer learning al analisis de sentimientos. La atencion multi-head puede capturar relaciones no literales.',
            efectividad: 'Alta (~80%)',
          },
          {
            nombre: 'Features Pragmaticas',
            descripcion: 'Agrega features explicitas como signos de exclamacion, uso de mayusculas, elipsis, intensificadores y contrastes semanticos. Estas senales pragmaticas complementan los modelos estadisticos.',
            efectividad: 'Media (~72%)',
          },
          {
            nombre: 'Deteccion Multi-modal',
            descripcion: 'En redes sociales, combina texto con imagenes, tono de voz o emojis para detectar incongruencia. No aplica directamente a IMDb (solo texto) pero es el futuro del campo.',
            efectividad: 'Emergente',
          },
        ],
        estado_actual: 'La deteccion de sarcasmo sigue siendo un problema abierto con accuracy humana de ~75% (incluso las personas fallan). Los mejores modelos automaticos alcanzan ~80% en benchmarks controlados, pero el rendimiento cae significativamente en datos "in the wild". La tendencia actual es usar LLMs (GPT-4, Claude) con prompting especifico, que alcanzan ~82-85% pero con alto costo computacional. No existe aun una solucion practica que sea simultaneamente precisa, eficiente y generalizable.',
        conexion_actividad: 'En nuestro proyecto, el modelo SVM con TF-IDF hibrido no tiene capacidad explicita de detectar sarcasmo. Las resenas sarcasticas en IMDb son clasificadas incorrectamente como positivas, lo que contribuye al ~11% de error. Implementar un pre-filtro de sarcasmo o usar features pragmaticas podria mejorar la accuracy en 1-2 puntos porcentuales.',
        referencias: [
          { autores: 'Joshi et al. (2017)', detalle: 'Automatic Sarcasm Detection: A Survey. ACM Computing Surveys. Taxonomia completa de metodos de deteccion de sarcasmo.' },
          { autores: 'Oprea & Magdy (2020)', detalle: 'iSarcasm: A Dataset of Intended Sarcasm. ACL. Dataset con sarcasmo etiquetado por los propios autores del texto.' },
          { autores: 'Ghosh et al. (2020)', detalle: 'Sarcasm Analysis Using Conversation Context. Computational Linguistics. Uso de contexto conversacional para mejorar la deteccion.' },
        ],
      },
    },
    {
      id: 'negacion',
      titulo: 'Negacion y Composicionalidad',
      icono: '\u26D4',
      descripcion: 'La negacion altera la polaridad de una oracion de formas complejas. "Not bad" no es simplemente lo opuesto de "bad". La composicionalidad semantica, especialmente relevante en SST-2 con frases del Stanford Sentiment Treebank, requiere entender como las palabras combinadas cambian el significado.',
      ejemplo: '"The movie is not entirely without merit, though it never quite lives up to its potential." — Doble negacion con sentimiento mixto.',
      importancia: 'critica',
      enfoques: ['Arboles de composicion (RNTN)', 'Embedding de negacion', 'Reglas de alcance', 'Atencion jerarquica'],
      detalle: {
        descripcion_extendida: 'La negacion es un fenomeno linguistico que modifica o invierte la polaridad de una expresion. Aunque parece simple ("not good" = negativo), en la practica presenta complejidad significativa. La doble negacion ("not unhappy"), la negacion parcial ("not entirely bad"), los atenuadores ("hardly impressive") y los cuantificadores negativos ("nothing special") crean un espectro de intensidad que los modelos bag-of-words no pueden capturar. La composicionalidad semantica, teorizada por Frege, establece que el significado de una expresion compleja se construye a partir de los significados de sus partes y las reglas de combinacion. En analisis de sentimientos, esto significa que el sentimiento de una frase depende de como se combinan sus componentes, no solo de que palabras contiene.',
        por_que_es_dificil: [
          'Los modelos BoW/TF-IDF tratan "not" y "good" como tokens independientes. "Not good" y "good" comparten la misma feature "good", perdiendo el efecto de la negacion.',
          'El alcance de la negacion es ambiguo: en "I don\'t think this movie is bad", la negacion afecta a "think" o a "bad"? La interpretacion correcta cambia el sentimiento.',
          'La doble negacion no equivale a afirmacion simple: "not bad" es ligeramente positivo (~0.3 en escala -1 a +1), no neutral. Los modelos discretos no capturan esta graduacion.',
          'Los intensificadores y atenuadores interactuan con la negacion de formas no lineales: "not very good" es peor que "not good", contra la intuicion de que "very" deberia amplificar.',
        ],
        ejemplos: [
          {
            texto: 'The movie is not entirely without merit, though it never quite lives up to its potential.',
            explicacion: 'Triple negacion implicita ("not" + "without" + "never"). Un humano interpreta esto como "tiene algo bueno pero decepciona". Un modelo BoW ve: not(neg), without(neg), merit(pos), never(neg), potential(pos) = confusion total.',
          },
          {
            texto: 'Not bad, but not great either.',
            explicacion: '"Not bad" = ligeramente positivo. "Not great" = ligeramente negativo. El resultado neto es neutro-tibio, pero un modelo binario debe elegir positivo o negativo. TF-IDF asigna pesos similares a "bad" y "great", cancelando el sentimiento.',
          },
          {
            texto: 'No one could have predicted how utterly this film would fail to disappoint.',
            explicacion: 'Cadena de negaciones: "no one" + "fail to" + "disappoint". Desempaquetar: "fail to disappoint" = "no decepciona" = positivo. "No one could have predicted" = sorpresa. Sentimiento final: positivamente sorprendente, pero la superficie esta llena de palabras negativas.',
          },
        ],
        impacto_imdb: 'En resenas de IMDb, la negacion aparece en ~40% de las frases. Los patrones mas problematicos son las evaluaciones matizadas ("not the worst, but far from the best") que son comunes en resenas de 5-6 estrellas, justo las que IMDb descarta por ser neutrales.',
        impacto_sst2: 'SST-2 usa arboles de sintaxis anotados con sentimiento en cada nodo. Esto permite evaluar directamente la composicionalidad: el sentimiento de "not good" se anota como negativo, mientras que "good" solo es positivo. Es el dataset ideal para estudiar este reto.',
        enfoques_detallados: [
          {
            nombre: 'Recursive Neural Tensor Networks (RNTN)',
            descripcion: 'Propuesto por Socher et al. (2013) junto con SST. Procesa arboles de sintaxis bottom-up, componiendo sentimiento desde las hojas. Captura que "not good" es diferente de "not bad" usando matrices de composicion aprendidas.',
            efectividad: 'Alta en SST (~85%)',
          },
          {
            nombre: 'Reglas de Alcance de Negacion (NegEx)',
            descripcion: 'Define reglas explicitas para el alcance de particulas negativas. "Not" afecta las N palabras siguientes hasta un delimitador (punto, coma, conjuncion). Simple pero efectivo como preprocesamiento para modelos clasicos.',
            efectividad: 'Media (~74%)',
          },
          {
            nombre: 'Embeddings Sensibles a Negacion',
            descripcion: 'Modifica los word embeddings en presencia de negacion: "not_good" tiene un embedding diferente de "good". Puede implementarse como prefijo ("NOT_") o como transformacion lineal del vector.',
            efectividad: 'Media-Alta (~78%)',
          },
          {
            nombre: 'Atencion Jerarquica (HAN)',
            descripcion: 'Usa atencion a nivel de palabra y de frase para ponderar la importancia de cada componente. La negacion recibe atencion alta cuando modifica palabras de sentimiento, permitiendo al modelo "enfocar" la composicion correcta.',
            efectividad: 'Alta (~82%)',
          },
        ],
        estado_actual: 'Los Transformers (BERT, RoBERTa) manejan mejor la negacion gracias a la atencion bidireccional, pero aun fallan en cadenas de negacion largas (3+ negaciones) y en negacion implicita ("fails to impress"). Los benchmarks actuales muestran que la negacion sigue causando ~5-8% de los errores en clasificacion de sentimientos, incluso con modelos state-of-the-art. La tendencia es combinar parsing sintactico con modelos neuronales para representar explicitamente la estructura composicional.',
        conexion_actividad: 'Nuestro modelo SVM con TF-IDF no maneja negacion de forma explicita. Cada negacion se trata como un token independiente. Una mejora directa seria implementar el prefijo "NOT_" en el preprocesamiento: tras detectar una particula negativa, agregar "NOT_" a las siguientes 3-4 palabras. Esta tecnica simple puede mejorar la accuracy en 1-3 puntos porcentuales segun Pang & Lee (2004).',
        referencias: [
          { autores: 'Socher et al. (2013)', detalle: 'Recursive Deep Models for Semantic Compositionality Over a Sentiment Treebank. EMNLP. Introduce SST y RNTN.' },
          { autores: 'Pang & Lee (2004)', detalle: 'A Sentimental Education: Sentiment Analysis Using Subjectivity Summarization. ACL. Tecnicas clasicas de negacion con prefijo NOT.' },
          { autores: 'Zhu et al. (2014)', detalle: 'An Empirical Study on the Effect of Negation Words on Sentiment. ACL. Estudio empirico del impacto de la negacion en clasificacion.' },
        ],
      },
    },
    {
      id: 'dominio',
      titulo: 'Dependencia de Dominio',
      icono: '\uD83C\uDF10',
      descripcion: 'Un modelo entrenado en resenas de peliculas puede fallar al aplicarse a resenas de restaurantes o productos. Palabras como "unpredictable" son positivas para peliculas pero negativas para servicios bancarios. La transferencia entre dominios es un problema abierto que afecta la generalizacion de los clasificadores.',
      ejemplo: '"Unpredictable plot" (positivo en cine) vs. "Unpredictable service" (negativo en hosteleria) — misma palabra, polaridad opuesta.',
      importancia: 'alta',
      enfoques: ['Domain adaptation (Pan & Yang)', 'Fine-tuning por dominio', 'Pivot features', 'Meta-learning'],
      detalle: {
        descripcion_extendida: 'La dependencia de dominio es el fenomeno por el cual un modelo de analisis de sentimientos entrenado en un dominio (ej. peliculas) sufre una caida significativa de rendimiento al aplicarse en otro dominio (ej. restaurantes, electronica, finanzas). Esto ocurre porque la polaridad de muchas palabras y expresiones es especifica del contexto. En cine, "predictable" es negativo (trama predecible = mala), pero en logistica, "predictable" es positivo (entregas predecibles = confiables). Los modelos basados en frecuencia de palabras (BoW, TF-IDF) son particularmente vulnerables porque asignan una polaridad fija a cada termino. Incluso los modelos contextuales como BERT necesitan fine-tuning especifico por dominio para alcanzar rendimiento optimo.',
        por_que_es_dificil: [
          'El vocabulario de sentimiento es parcialmente diferente entre dominios: "breathtaking" es comun en cine pero raro en resenas de electronica. Los modelos pierden features informativas al cambiar de dominio.',
          'La misma palabra tiene polaridad opuesta en distintos dominios. No es solo ambiguedad: es una inversion sistematica que no se resuelve con mas datos del dominio origen.',
          'Los datasets anotados son costosos de crear. Existe abundancia para cine (IMDb, SST) y productos (Amazon), pero escasez para dominios especializados (medicina, legal, finanzas).',
          'La distribucion de topicos y el estilo de escritura varian entre dominios. Las resenas de peliculas son mas literarias y emocionales; las de electronica son mas tecnicas y factuales.',
        ],
        ejemplos: [
          {
            texto: 'This product is unpredictable.',
            explicacion: 'En electronica, "unpredictable" es claramente negativo (producto defectuoso). Un modelo entrenado en IMDb podria no penalizarlo porque en cine "unpredictable" es positivo.',
          },
          {
            texto: 'The battery runs out quickly.',
            explicacion: '"Runs out quickly" no contiene palabras de sentimiento explicitas. Es negativo solo por conocimiento del dominio (bateria = mas duracion es mejor). Un modelo de peliculas no tiene este conocimiento.',
          },
          {
            texto: 'This restaurant has a very long menu.',
            explicacion: 'Ambiguo: "long menu" puede ser positivo (variedad) o negativo (demasiadas opciones, baja calidad). La interpretacion depende de las expectativas del dominio de hosteleria.',
          },
        ],
        impacto_imdb: 'IMDb es uno de los datasets mas usados, pero los modelos entrenados en el tienen transferencia limitada. Estudios muestran caidas de 10-15 puntos porcentuales al aplicar un modelo IMDb a resenas de Amazon Electronics o Yelp Restaurants.',
        impacto_sst2: 'SST-2 contiene frases de resenas de Rotten Tomatoes, un dominio muy cercano a IMDb. La transferencia entre ambos es buena (~2-3% de caida), pero esto es una excepcion debido a la similitud de dominios, no la regla general.',
        enfoques_detallados: [
          {
            nombre: 'Domain Adaptation con Pivot Features',
            descripcion: 'Identifica "pivot features" que tienen la misma polaridad en ambos dominios (ej. "excellent" siempre es positivo). Usa estas features como puente para alinear las representaciones de dominio origen y destino.',
            efectividad: 'Media-Alta (~80%)',
          },
          {
            nombre: 'Fine-tuning BERT por Dominio',
            descripcion: 'Pre-entrena BERT con datos no etiquetados del dominio objetivo (MLM), y luego lo fine-tunea con datos etiquetados. Combina conocimiento linguistico general con vocabulario especifico del dominio.',
            efectividad: 'Alta (~85-88%)',
          },
          {
            nombre: 'Meta-Learning (MAML)',
            descripcion: 'Entrena un modelo que aprende a aprender de pocos ejemplos. Con 50-100 ejemplos etiquetados del nuevo dominio, el modelo se adapta rapidamente sin olvidar el conocimiento previo.',
            efectividad: 'Emergente (~76%)',
          },
          {
            nombre: 'Lexicos de Sentimiento Multi-Dominio',
            descripcion: 'Construye lexicos de sentimiento especificos para cada dominio usando embeddings y propagacion de etiquetas. Combina SentiWordNet (generico) con polaridades aprendidas del dominio objetivo.',
            efectividad: 'Media (~74%)',
          },
        ],
        estado_actual: 'La adaptacion de dominio es un area activa de investigacion. Los LLMs como GPT-4 y Claude muestran mejor generalizacion cross-domain gracias a su pre-entrenamiento masivo, pero aun necesitan few-shot examples para dominios muy especializados. La tendencia es hacia modelos "domain-agnostic" que aprenden representaciones de sentimiento invariantes al dominio.',
        conexion_actividad: 'Nuestro proyecto se enfoca exclusivamente en el dominio de cine (IMDb), por lo que la dependencia de dominio no afecta directamente la accuracy reportada. Sin embargo, es un reto critico a considerar si se quisiera extender el modelo a otros dominios. El enfoque hibrido BoW+TF-IDF de Keerthi Kumar es particularmente sensible al dominio porque depende de features de frecuencia que son dominio-especificas.',
        referencias: [
          { autores: 'Blitzer et al. (2007)', detalle: 'Biographies, Bollywood, Boom-boxes and Blenders: Domain Adaptation for Sentiment Classification. ACL. Trabajo fundacional en domain adaptation para sentimientos.' },
          { autores: 'Pan & Yang (2010)', detalle: 'A Survey on Transfer Learning. IEEE TKDE. Survey completo de tecnicas de transfer learning aplicables a NLP.' },
          { autores: 'Gururangan et al. (2020)', detalle: 'Don\'t Stop Pretraining: Adapt Language Models to Domains and Tasks. ACL. Demuestra que domain-adaptive pre-training mejora significativamente BERT.' },
        ],
      },
    },
    {
      id: 'implicito',
      titulo: 'Sentimiento Implicito y Aspectual',
      icono: '\uD83D\uDD0D',
      descripcion: 'No todo sentimiento se expresa con adjetivos explicitos. "La pelicula dura tres horas" no contiene palabras de opinion, pero puede implicar critica. Ademas, una resena puede ser positiva sobre la actuacion pero negativa sobre el guion, requiriendo analisis a nivel de aspecto.',
      ejemplo: '"Great acting, terrible script, predictable ending." — Tres aspectos, tres polaridades diferentes en una sola oracion.',
      importancia: 'alta',
      enfoques: ['Aspect-Based SA (ABSA)', 'Modelos de atencion multi-head', 'Graph Neural Networks', 'Extraccion de opiniones'],
      detalle: {
        descripcion_extendida: 'El sentimiento implicito se expresa sin usar palabras de opinion explicitas. Frases como "The movie lasted three hours" o "I left the theater early" comunican sentimiento negativo a traves de hechos objetivos que el lector interpreta emocionalmente. El analisis de sentimiento a nivel de aspecto (ABSA) reconoce que un documento puede expresar opiniones diferentes sobre distintos aspectos de una entidad. Una resena de pelicula puede elogiar la fotografia, criticar el guion y ser neutral sobre la musica. Los modelos de clasificacion binaria (positivo/negativo) pierden esta granularidad al asignar una sola etiqueta al documento completo.',
        por_que_es_dificil: [
          'El sentimiento implicito requiere razonamiento pragmatico: "I checked my watch three times" es negativo (pelicula aburrida) pero no contiene ninguna palabra de sentimiento. Los lexicos de sentimiento no pueden capturar esto.',
          'Identificar aspectos automaticamente es un problema de extraccion de informacion: distinguir entre "the acting was brilliant" (aspecto: actuacion) y "the script was awful" (aspecto: guion) requiere parsing semantico.',
          'La agregacion de multiples aspectos en una sola etiqueta binaria pierde informacion: una pelicula con "great visuals but terrible story" es negativa, positiva, o depende del peso de cada aspecto?',
          'Los aspectos pueden ser implicitos: "The theater was freezing" critica la experiencia del cine, no la pelicula, pero aparece en la misma resena.',
        ],
        ejemplos: [
          {
            texto: 'Great acting, terrible script, predictable ending.',
            explicacion: 'Tres aspectos explicitos con polaridades diferentes: actuacion (+), guion (-), final (-). Un modelo binario debe decidir: 2 negativos vs 1 positivo = negativo? Pero si la actuacion pesa mas para el reviewer?',
          },
          {
            texto: 'I checked my phone twice during the second act.',
            explicacion: 'Cero palabras de sentimiento. El sentimiento negativo (pelicula aburrida) se deduce pragmaticamente del hecho de que el espectador se distrajo. TF-IDF asigna polaridad neutra o aleatoria.',
          },
          {
            texto: 'The director clearly spent the budget on special effects rather than actors.',
            explicacion: 'Sentimiento implicito complejo: efectos especiales recibieron inversion (neutro/positivo?) pero a costa de los actores (negativo implicito). La critica esta en "rather than", no en las palabras individuales.',
          },
        ],
        impacto_imdb: 'Las resenas de IMDb son largas y multi-aspectuales por naturaleza. Los usuarios comentan sobre actuacion, guion, direccion, musica, efectos y experiencia personal. La clasificacion binaria pierde toda esta riqueza. Estudios estiman que ~30% de las resenas de IMDb contienen aspectos con polaridades mixtas.',
        impacto_sst2: 'Las frases de SST-2 son mas cortas y usualmente expresan sentimiento sobre un solo aspecto, lo que reduce el problema aspectual. Sin embargo, el sentimiento implicito sigue presente en frases factuales como "The movie is two and a half hours long."',
        enfoques_detallados: [
          {
            nombre: 'Aspect-Based Sentiment Analysis (ABSA)',
            descripcion: 'Divide la tarea en: (1) extraccion de aspectos, (2) clasificacion de sentimiento por aspecto. Usa secuencias de atencion para asociar cada aspecto con sus palabras de opinion. SemEval tiene benchmarks especificos para ABSA.',
            efectividad: 'Alta (F1 ~78-82%)',
          },
          {
            nombre: 'Graph Neural Networks (GNN)',
            descripcion: 'Modela las dependencias sintacticas como grafo: cada palabra es un nodo, las relaciones gramaticales son aristas. Permite propagar sentimiento desde palabras de opinion a sus aspectos objetivo a traves de la estructura sintactica.',
            efectividad: 'Alta (~80%)',
          },
          {
            nombre: 'Multi-Head Attention',
            descripcion: 'Cada "head" de atencion se especializa en un aspecto diferente. Una head atiende a palabras de actuacion, otra al guion, otra a la musica. Permite extraer sentimiento paralelo por aspecto sin anotacion explicita de aspectos.',
            efectividad: 'Media-Alta (~77%)',
          },
          {
            nombre: 'Lexicos de Sentimiento Implicito',
            descripcion: 'Construye lexicos de expresiones que implican sentimiento sin contener palabras de opinion: "checked my phone" = boredom, "left early" = negative, "watched it again" = positive. Requiere construccion manual o semi-supervisada.',
            efectividad: 'Media (~70%)',
          },
        ],
        estado_actual: 'ABSA es una de las areas mas activas en NLP, con competiciones anuales en SemEval. Los modelos actuales combinan BERT con grafos de dependencia para alcanzar F1 ~82% en benchmarks. Sin embargo, la extraccion de aspectos implicitos y el sentimiento implicito siguen siendo problemas abiertos. La tendencia es hacia modelos unificados que extraen aspectos, opiniones y sentimiento en un solo paso.',
        conexion_actividad: 'Nuestro proyecto usa clasificacion binaria a nivel de documento, lo que ignora completamente la granularidad aspectual. Las resenas de IMDb que tienen aspectos mixtos ("great acting, bad script") son particularmente dificiles para nuestro modelo SVM. Considerar ABSA seria una extension valiosa pero requeriria cambiar fundamentalmente la arquitectura del modelo y el esquema de anotacion.',
        referencias: [
          { autores: 'Pontiki et al. (2016)', detalle: 'SemEval-2016 Task 5: Aspect Based Sentiment Analysis. SemEval. Benchmark principal para ABSA con datasets en 8 dominios.' },
          { autores: 'Sun et al. (2019)', detalle: 'Utilizing BERT for Aspect-Based Sentiment Analysis via Constructing Auxiliary Sentences. NAACL. Adapta BERT para ABSA con frases auxiliares.' },
          { autores: 'Zhang et al. (2019)', detalle: 'Aspect-based Sentiment Classification with Aspect-specific Graph Convolutional Networks. EMNLP. Usa GCN sobre arboles de dependencia para ABSA.' },
        ],
      },
    },
    {
      id: 'multilingue',
      titulo: 'Desafios Multilingues',
      icono: '\uD83C\uDF0D',
      descripcion: 'La mayoria de recursos y modelos estan disenados para ingles. Adaptar el analisis de sentimientos a espanol implica retos adicionales: morfologia mas rica, negacion compleja ("no me parece mal"), recursos lexicos limitados y escasez de datasets anotados de calidad.',
      ejemplo: 'Traducir IMDb al espanol pierde matices culturales. "Esta padre" (positivo en Mexico) vs. "Esta regular" (ambiguo segun pais).',
      importancia: 'alta',
      enfoques: ['Modelos multilingues (mBERT, XLM-R)', 'Traduccion + alineacion', 'Lexicos de sentimiento en espanol', 'Transfer cross-lingual'],
      detalle: {
        descripcion_extendida: 'El analisis de sentimientos multilingue enfrenta la asimetria fundamental entre la abundancia de recursos para ingles y la escasez para otros idiomas. El espanol, siendo el segundo idioma mas hablado del mundo, tiene significativamente menos datasets anotados, lexicos de sentimiento y modelos pre-entrenados especificos. Ademas, la riqueza morfologica del espanol (conjugaciones, genero, modo subjuntivo), las variaciones dialectales entre paises hispanohablantes (Mexico, Espana, Argentina) y las expresiones coloquiales presentan desafios que los modelos entrenados en ingles no pueden resolver directamente. La traduccion automatica como solucion intermedia introduce errores y pierde matices culturales.',
        por_que_es_dificil: [
          'El espanol tiene morfologia verbal mucho mas rica: "no me habria gustado" vs "I wouldn\'t have liked it". La negacion interactua con el modo verbal (subjuntivo, condicional) de formas complejas.',
          'Las variaciones dialectales cambian la polaridad: "Esta chido" (Mexico, positivo), "Es una pasada" (Espana, positivo), "Es re copado" (Argentina, positivo) son equivalentes pero lexicamente diferentes.',
          'Los datasets anotados en espanol son escasos y de menor calidad. TASS (Workshop on Sentiment Analysis at SEPLN) es el principal pero tiene ~60K tweets, vs los 50K+ documentos de IMDb.',
          'La traduccion automatica (Google Translate, DeepL) pierde sarcasmo, coloquialismos y matices culturales. "This movie is sick" (positivo en slang ingles) se traduce como "Esta pelicula esta enferma" (confuso en espanol).',
        ],
        ejemplos: [
          {
            texto: 'Esta padre (Mexico) / Esta guay (Espana) / Esta copado (Argentina)',
            explicacion: 'Tres formas de decir "esta genial" en espanol que un modelo entrenado en un pais no reconoceria en otro. Los lexicos de sentimiento genericos no incluyen estas variantes coloquiales.',
          },
          {
            texto: 'No me parece que no sea una mala pelicula.',
            explicacion: 'Cadena de negaciones en espanol con modo subjuntivo. Desempaquetar: "no mala" = buena, "no sea buena" = no es buena, "no me parece que no es buena" = me parece buena? Ambiguo incluso para hablantes nativos.',
          },
          {
            texto: 'La pelicula me dejo con un sabor agridulce.',
            explicacion: 'Metafora cultural ("sabor agridulce" = sentimientos mixtos) que no tiene equivalente literal en ingles. Un modelo de traduccion la convertira en "bittersweet taste" perdiendo la naturalidad.',
          },
        ],
        impacto_imdb: 'IMDb es un dataset en ingles. Cualquier extension al espanol requiere: (1) traduccion del dataset, (2) creacion de un dataset nativo en espanol, o (3) uso de modelos multilingues. Cada opcion tiene trade-offs de calidad vs esfuerzo.',
        impacto_sst2: 'No existe un equivalente de SST-2 en espanol con anotacion a nivel de frase y arbol sintactico. El dataset mas cercano es TASS, pero con anotacion a nivel de tweet (no de frase) y sin arboles composicionales.',
        enfoques_detallados: [
          {
            nombre: 'mBERT / XLM-RoBERTa',
            descripcion: 'Modelos Transformer pre-entrenados en 100+ idiomas simultaneamente. Aprenden representaciones compartidas que permiten zero-shot transfer: entrenar en IMDb (ingles) y evaluar en resenas en espanol sin datos etiquetados.',
            efectividad: 'Alta (~82-85%)',
          },
          {
            nombre: 'Translate-Train-Translate',
            descripcion: 'Traduce el dataset de entrenamiento al idioma objetivo, entrena un modelo monolingue, y luego traduce las predicciones de vuelta. Simple pero introduce errores de traduccion en cada paso.',
            efectividad: 'Media (~78%)',
          },
          {
            nombre: 'Lexicos Multilingues (ML-SentiCon)',
            descripcion: 'Lexicos de sentimiento construidos para espanol con polaridad por palabra. ML-SentiCon, iSOL, y SEL son los principales. Utiles como features adicionales para modelos clasicos pero limitados en cobertura.',
            efectividad: 'Media (~72%)',
          },
          {
            nombre: 'Few-Shot Cross-Lingual Transfer',
            descripcion: 'Usa un modelo multilingue pre-entrenado + pocos ejemplos etiquetados en espanol (50-200) para adaptar el modelo. Combina la capacidad del pre-entrenamiento con conocimiento especifico del idioma objetivo.',
            efectividad: 'Alta (~83%)',
          },
        ],
        estado_actual: 'Los modelos multilingues como XLM-RoBERTa han reducido significativamente la brecha entre ingles y otros idiomas. Para espanol, el rendimiento cross-lingual alcanza ~90% del rendimiento monolingue en ingles. BETO (BERT en espanol) y modelos especificos mejoran aun mas. Sin embargo, dialectos, jerga juvenil y nuevas expresiones de redes sociales siguen siendo problematicos.',
        conexion_actividad: 'Nuestro proyecto trabaja con IMDb en ingles, pero la actividad esta contextualizada en un Master en espanol. Esto crea una oportunidad para discutir la transferencia cross-lingual como trabajo futuro: podria nuestro modelo SVM entrenado en IMDb funcionar con resenas de SensaCine (equivalente espanol)? La respuesta corta es no, sin adaptacion significativa.',
        referencias: [
          { autores: 'Conneau et al. (2020)', detalle: 'Unsupervised Cross-lingual Representation Learning at Scale. ACL. Introduce XLM-RoBERTa para transfer cross-lingual.' },
          { autores: 'Canete et al. (2020)', detalle: 'Spanish Pre-Trained BERT Model and Evaluation Data. LREC. Introduce BETO, BERT pre-entrenado especificamente en espanol.' },
          { autores: 'Vilares et al. (2017)', detalle: 'Supervised Sentiment Analysis in Multilingual Environments. Information Processing & Management. Survey de SA multilingue con enfoque en espanol.' },
        ],
      },
    },
    {
      id: 'anotacion',
      titulo: 'Calidad de Anotacion y Sesgos',
      icono: '\u2696\uFE0F',
      descripcion: 'Los datasets como IMDb dependen de puntuaciones de usuarios como proxy de sentimiento, lo que introduce ruido. Una resena con 6/10 estrellas es positiva o negativa? Los sesgos demograficos, culturales y de seleccion en las anotaciones afectan la equidad del modelo.',
      ejemplo: 'IMDb binariza en 1-4 (negativo) y 7-10 (positivo), descartando resenas neutrales (5-6). Esto simplifica pero sesga el modelo.',
      importancia: 'media',
      enfoques: ['Inter-annotator agreement', 'Calibracion de etiquetas', 'Analisis de sesgos', 'Anotacion iterativa (Argilla)'],
      detalle: {
        descripcion_extendida: 'La calidad de los datos de entrenamiento determina el techo de rendimiento de cualquier modelo de ML. En analisis de sentimientos, la "ground truth" es inherentemente subjetiva: dos personas pueden leer la misma resena y asignarle diferente sentimiento. Los datasets como IMDb usan la puntuacion del usuario como proxy (1-4 estrellas = negativo, 7-10 = positivo), lo que introduce sesgos sistematicos. Las resenas de puntuacion intermedia (5-6) se descartan, creando un dataset artificialmente polarizado. Ademas, los sesgos demograficos (genero, edad, cultura) en los anotadores y usuarios afectan que se considera "positivo" o "negativo". La herramienta Argilla aborda este problema permitiendo anotacion iterativa con multiples anotadores y metricas de acuerdo.',
        por_que_es_dificil: [
          'El sentimiento es subjetivo: el inter-annotator agreement en tareas de sentimiento es tipicamente 75-85%, lo que pone un techo teorico a la accuracy de cualquier modelo automatico.',
          'El rating numerico no siempre correlaciona con el texto: un usuario puede dar 3/10 con una resena que suena positiva ("la pelicula tiene buenos momentos pero...") o 8/10 con criticas ("a pesar de sus defectos, me gusto").',
          'El sesgo de seleccion es fuerte: las personas que escriben resenas en IMDb son un subconjunto no representativo de la audiencia. Tienden a ser mas criticos y verbalmente articulados que el espectador promedio.',
          'Los sesgos culturales y demograficos afectan las anotaciones: estudios muestran que anotadores jovenes son mas tolerantes con ciertos generos (terror, comedia) que anotadores mayores.',
        ],
        ejemplos: [
          {
            texto: 'Resena con 6/10 estrellas descartada por IMDb por ser "neutral".',
            explicacion: 'IMDb descarta resenas de 5-6 estrellas, eliminando ~20% de los datos. Estas resenas "neutrales" contienen senales valiosas de sentimiento mixto que el modelo nunca aprende.',
          },
          {
            texto: 'A pesar de sus muchos defectos, hay algo irresistiblemente encantador en esta pelicula.',
            explicacion: 'Sentimiento ambiguo: reconoce defectos pero el sentimiento global es positivo. Si el usuario dio 5/10, se descarta. Si dio 7/10, es "positivo". La etiqueta depende del umbral, no del texto.',
          },
          {
            texto: 'Dos anotadores: uno etiqueta "positivo", otro "negativo".',
            explicacion: 'Con inter-annotator agreement de ~80%, 1 de cada 5 ejemplos tiene etiqueta discutible. Esto introduce ruido en el entrenamiento que ningun modelo puede resolver completamente.',
          },
        ],
        impacto_imdb: 'El dataset de IMDb tiene un sesgo de polarizacion: al descartar ratings 5-6, crea una distribucion bimodal artificial. Los modelos entrenados asi son buenos para extremos pero malos para sentimientos matizados. La accuracy de 88.75% refleja rendimiento en este escenario simplificado.',
        impacto_sst2: 'SST-2 usa anotadores humanos entrenados (via Amazon Mechanical Turk) con instrucciones especificas, lo que reduce (pero no elimina) el ruido de etiquetado. El arbol de composicion permite verificar consistencia entre nodos padre e hijo.',
        enfoques_detallados: [
          {
            nombre: 'Inter-Annotator Agreement (IAA)',
            descripcion: 'Mide el acuerdo entre multiples anotadores usando metricas como Kappa de Cohen o Alpha de Krippendorff. Un IAA bajo indica que la tarea es inherentemente subjetiva y el modelo no deberia aspirar a accuracy perfecta.',
            efectividad: 'Diagnostica (~80% IAA)',
          },
          {
            nombre: 'Anotacion Iterativa con Argilla',
            descripcion: 'Plataforma de anotacion que permite crear guidelines detalladas, resolver conflictos entre anotadores, y mejorar iterativamente la calidad del dataset. Soporta active learning para priorizar ejemplos ambiguos.',
            efectividad: 'Alta (mejora IAA +5-10%)',
          },
          {
            nombre: 'Label Smoothing',
            descripcion: 'En lugar de etiquetas duras (0 o 1), usa probabilidades suaves (ej. 0.85 positivo, 0.15 negativo) para reflejar la incertidumbre de la anotacion. Reduce overfitting a ejemplos con etiquetas ruidosas.',
            efectividad: 'Media-Alta (regularizacion)',
          },
          {
            nombre: 'Analisis de Sesgos (Fairness)',
            descripcion: 'Audita el modelo para detectar sesgos sistematicos: rinde peor en resenas de ciertos generos cinematograficos? Tiene sesgo de genero en las palabras de sentimiento? Usa metricas de equidad (demographic parity, equalized odds).',
            efectividad: 'Diagnostica + correctiva',
          },
        ],
        estado_actual: 'La comunidad de NLP reconoce cada vez mas la importancia de la calidad de datos. Iniciativas como Dynabench (Facebook AI), Data-centric AI (Andrew Ng) y herramientas como Argilla y Label Studio estan cambiando el paradigma de "mas datos" a "mejores datos". Para sentimiento, la tendencia es usar soft labels (probabilidades) en lugar de hard labels (binario) y documentar sesgos conocidos en las datasheets de los datasets.',
        conexion_actividad: 'Nuestro proyecto incluye una seccion de Argilla precisamente para abordar este reto. La integracion con Argilla permite visualizar las resenas mas ambiguas de IMDb, re-anotarlas con criterios consistentes, y medir el impacto en la accuracy del modelo. Este es uno de los diferenciadores de nuestra actividad respecto al articulo original de Keerthi Kumar.',
        referencias: [
          { autores: 'Gebru et al. (2021)', detalle: 'Datasheets for Datasets. Communications of the ACM. Propone documentacion estandarizada de datasets incluyendo sesgos y limitaciones.' },
          { autores: 'Artstein & Poesio (2008)', detalle: 'Inter-Coder Agreement for Computational Linguistics. Computational Linguistics. Guia completa de metricas de acuerdo entre anotadores.' },
          { autores: 'Ng, A. (2021)', detalle: 'Data-centric AI. NeurIPS Keynote. Paradigma de mejorar datos en lugar de modelos para incrementar rendimiento.' },
        ],
      },
    },
    {
      id: 'interpretabilidad',
      titulo: 'Interpretabilidad de Modelos',
      icono: '\uD83E\uDDE0',
      descripcion: 'Los modelos de deep learning alcanzan alta precision pero funcionan como cajas negras. Entender por que un modelo clasifica una resena como positiva o negativa es crucial para la confianza del usuario, la depuracion de errores y el cumplimiento regulatorio.',
      ejemplo: 'LIME muestra que SVM clasifica "This movie is not bad" como negativo porque pesa mas "not" y "bad" que la composicion semantica.',
      importancia: 'media',
      enfoques: ['LIME (Ribeiro et al.)', 'SHAP (Lundberg & Lee)', 'Attention visualization', 'Saliency maps'],
      detalle: {
        descripcion_extendida: 'La interpretabilidad en analisis de sentimientos se refiere a la capacidad de explicar por que un modelo asigna una determinada polaridad a un texto. Esto es critico por multiples razones: (1) depuracion: si el modelo falla, necesitamos entender por que para corregirlo; (2) confianza: los usuarios finales no adoptaran un sistema que no pueden entender; (3) regulacion: normativas como GDPR y la AI Act de la UE requieren explicabilidad en decisiones automatizadas. Los modelos clasicos como Naive Bayes y Regresion Logistica son inherentemente interpretables (se pueden inspeccionar los pesos de cada feature), pero los modelos de deep learning (BERT, GPT) son cajas negras con millones de parametros no interpretables directamente. Las tecnicas post-hoc como LIME y SHAP ofrecen explicaciones aproximadas pero no perfectas.',
        por_que_es_dificil: [
          'Los modelos de deep learning tienen millones de parametros que interactuan de formas no lineales. No hay una correspondencia simple entre "esta neurona = esta feature".',
          'Las explicaciones post-hoc (LIME, SHAP) son aproximaciones locales: explican una prediccion individual pero pueden ser inconsistentes entre predicciones similares.',
          'Existe un trade-off precision vs interpretabilidad: los modelos mas interpretables (NB, LR) son menos precisos que los modelos opacos (BERT, GPT). Elegir entre 85% accuracy interpretable o 93% accuracy opaco es una decision de negocio.',
          'La evaluacion de explicaciones es subjetiva: como medir si una explicacion es "buena"? No existe una metrica universalmente aceptada para calidad de explicaciones.',
        ],
        ejemplos: [
          {
            texto: 'LIME en "This movie is not bad": destaca "not" (negativo) y "bad" (negativo).',
            explicacion: 'LIME perturba el texto y observa como cambian las predicciones. Concluye que "not" y "bad" son las palabras mas influyentes. Pero no captura que "not bad" es una unidad semantica positiva, no dos palabras negativas.',
          },
          {
            texto: 'SHAP en SVM: feature "brilliant" tiene SHAP value +0.3, "boring" tiene -0.4.',
            explicacion: 'SHAP asigna un valor de contribucion a cada feature. Para SVM con TF-IDF, esto es directamente interpretable: cada palabra "empuja" la prediccion hacia positivo o negativo con un valor cuantificable.',
          },
          {
            texto: 'Attention map de BERT: atencion concentrada en "masterpiece" para clasificar como positivo.',
            explicacion: 'Las attention weights de BERT muestran que tokens atienden a cuales. Para "A true masterpiece of cinema", la atencion se concentra en "masterpiece", lo cual es intuitivo. Pero la atencion no siempre correlaciona con importancia causal.',
          },
        ],
        impacto_imdb: 'Con resenas largas (150-300 palabras), la interpretabilidad es especialmente valiosa: por que el modelo clasifico esta resena de 250 palabras como negativa? LIME puede resaltar las 10 palabras mas influyentes, reduciendo la resena a sus senales clave.',
        impacto_sst2: 'Las frases cortas de SST-2 son mas faciles de interpretar: con 10-20 palabras, es posible visualizar la contribucion de cada token. Los arboles composicionales de SST facilitan la comparacion entre la composicion del modelo y la anotacion humana.',
        enfoques_detallados: [
          {
            nombre: 'LIME (Local Interpretable Model-agnostic Explanations)',
            descripcion: 'Crea un modelo lineal local alrededor de cada prediccion perturbando el input y observando como cambia el output. Model-agnostic: funciona con cualquier clasificador (SVM, BERT, Random Forest). Genera explicaciones visuales con palabras resaltadas.',
            efectividad: 'Alta (estandar de facto)',
          },
          {
            nombre: 'SHAP (SHapley Additive exPlanations)',
            descripcion: 'Usa teoria de juegos (valores de Shapley) para asignar una contribucion justa a cada feature. Tiene propiedades teoricas deseables (consistencia, eficiencia). Para NLP, calcula el SHAP value de cada palabra o n-grama.',
            efectividad: 'Alta (teoricamente superior)',
          },
          {
            nombre: 'Attention Visualization',
            descripcion: 'Visualiza las attention weights de Transformers para entender que tokens "miran" a cuales. Intuitivo pero controversial: estudios muestran que atencion no siempre corresponde a importancia causal (Jain & Wallace, 2019).',
            efectividad: 'Media (util pero debatida)',
          },
          {
            nombre: 'Modelos Inherentemente Interpretables',
            descripcion: 'Usar modelos cuya estructura es directamente interpretable: Naive Bayes (pesos log-probabilisticos), Regresion Logistica (coeficientes por feature), arboles de decision. Sacrifican precision por transparencia total.',
            efectividad: 'Completa (trade-off accuracy)',
          },
        ],
        estado_actual: 'La interpretabilidad es un area en rapido crecimiento, impulsada por regulacion (AI Act UE, GDPR Art. 22) y demanda de la industria. LIME y SHAP son los metodos mas usados en produccion. Para LLMs, la investigacion se centra en "mechanistic interpretability": entender que hacen circuitos individuales dentro del modelo. Anthropic y OpenAI lideran esta linea de investigacion.',
        conexion_actividad: 'Nuestro proyecto usa SVM con TF-IDF, que es relativamente interpretable: podemos inspeccionar los coeficientes del SVM para ver que palabras son mas discriminativas. Agregar LIME o SHAP como capa de explicacion seria una extension natural y valiosa. La seccion de modelo en la app podria mostrar explicaciones por resena: "esta resena es negativa porque las palabras X, Y, Z contribuyen negativamente".',
        referencias: [
          { autores: 'Ribeiro et al. (2016)', detalle: '"Why Should I Trust You?": Explaining the Predictions of Any Classifier. KDD. Introduce LIME, el metodo de explicacion local mas citado.' },
          { autores: 'Lundberg & Lee (2017)', detalle: 'A Unified Approach to Interpreting Model Predictions. NeurIPS. Introduce SHAP, unificando 6 metodos de explicacion previos bajo teoria de Shapley.' },
          { autores: 'Jain & Wallace (2019)', detalle: 'Attention is not Explanation. NAACL. Demuestra que attention weights no son explicaciones fiables de las predicciones de modelos.' },
        ],
      },
    },
  ];

  retosFiltrados = computed(() => {
    const f = this.filtro();
    if (f === 'todos') return this.retos;
    return this.retos.filter(r => r.importancia === f);
  });

  getImportanciaColor(nivel: string) {
    switch (nivel) {
      case 'critica': return { bg: '#FEF2F2', text: '#DC2626' };
      case 'alta': return { bg: '#FFFBEB', text: '#D97706' };
      case 'media': return { bg: '#EFF6FF', text: '#2563EB' };
      default: return { bg: '#F7F8F7', text: '#5B7065' };
    }
  }
}
