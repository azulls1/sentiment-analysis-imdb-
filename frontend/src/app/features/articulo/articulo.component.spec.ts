import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ArticuloComponent } from './articulo.component';
import { ArticleService } from '../../core/services/article.service';

describe('ArticuloComponent', () => {
  let component: ArticuloComponent;
  let fixture: ComponentFixture<ArticuloComponent>;
  let articleServiceSpy: jasmine.SpyObj<ArticleService>;

  const mockArticle = {
    titulo: 'Análisis de Sentimientos en Reseñas IMDb',
    titulo_original: 'Sentiment Analysis on IMDb Movie Reviews Using Hybrid Feature Extraction Method',
    autores: 'Keerthi Kumar, Harish',
    revista: 'IJIMAI',
    anio: 2019,
    doi: '10.9781/ijimai.2019.02.003',
    abstract: 'This paper proposes a hybrid feature extraction method...',
    keywords: ['sentiment analysis', 'TF-IDF', 'SVM'],
    objetivo: {
      principal: 'Comparar clasificadores con método híbrido BoW+TF-IDF.',
      especificos: ['Evaluar NB, LR, SVM'],
      hipotesis: 'El método híbrido supera a BoW y TF-IDF por separado.',
    },
    dataset: {
      nombre: 'IMDb Large Movie Review',
      descripcion: 'Dataset con 50,000 reseñas.',
      total_reviews: 50000,
      train_reviews: 25000,
      test_reviews: 25000,
      tipo_tarea: 'Clasificación binaria',
      idioma: 'Inglés',
      dominio: 'Cine',
      positivas: 25000,
      negativas: 25000,
      balance: 'Balanceado',
      referencia_dataset: 'Maas et al. (2011)',
    },
    metodologia: {
      preprocesamiento: [{ paso: 'Limpieza HTML', descripcion: 'Eliminar etiquetas HTML' }],
      extraccion_features: [
        { nombre: 'TF-IDF', descripcion: 'Term Frequency-Inverse Document Frequency', formula: 'tf * idf', ventaja: 'Captura importancia', limitacion: 'Ignora orden' },
      ],
      clasificadores: [
        { nombre: 'SVM', descripcion: 'Support Vector Machine', ventaja: 'Alta precisión', limitacion: 'Lento' },
      ],
      evaluacion: {
        descripcion: 'Hold-out 50/50',
        metrica_principal: 'Accuracy',
        otras_metricas: ['Precision', 'Recall', 'F1'],
        validacion: '80/20 split',
      },
    },
    resultados_clave: {
      BoW: { NB: '82.00', LR: '87.50', SVM: '87.75' },
      'TF-IDF': { NB: '83.50', LR: '88.00', SVM: '88.25' },
      Hibrido: { NB: '84.00', LR: '88.50', SVM: '88.75' },
    },
    mejor_resultado: { clasificador: 'SVM', metodo: 'Híbrido', accuracy: '88.75' },
    conclusiones: ['SVM con método híbrido es el mejor clasificador.'],
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ArticleService', ['getSummary']);
    spy.getSummary.and.returnValue(of(mockArticle));

    await TestBed.configureTestingModule({
      imports: [ArticuloComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ArticleService, useValue: spy },
      ],
    }).compileComponents();

    articleServiceSpy = TestBed.inject(ArticleService) as jasmine.SpyObj<ArticleService>;
    fixture = TestBed.createComponent(ArticuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start with loading true and set to false after data loads', () => {
    expect(component.loading()).toBeFalse();
    expect(articleServiceSpy.getSummary).toHaveBeenCalledTimes(1);
  });

  it('should set article signal with loaded data', () => {
    expect(component.article()).toBeTruthy();
    expect(component.article().titulo).toBe(mockArticle.titulo);
  });

  it('should set loading false even on error', async () => {
    articleServiceSpy.getSummary.and.returnValue(throwError(() => new Error('HTTP error')));
    fixture = TestBed.createComponent(ArticuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.loading()).toBeFalse();
  });

  it('should render the Articulo page heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Artículo');
  });
});
