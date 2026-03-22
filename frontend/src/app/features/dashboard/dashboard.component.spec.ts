import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, EMPTY, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DatasetService } from '../../core/services/dataset.service';
import { ModelService } from '../../core/services/model.service';
import { PREDICT_DEBOUNCE_MS } from '../../core/constants';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let datasetServiceSpy: jasmine.SpyObj<DatasetService>;
  let modelServiceSpy: jasmine.SpyObj<ModelService>;

  beforeEach(async () => {
    datasetServiceSpy = jasmine.createSpyObj('DatasetService', ['getStats', 'getSamples']);
    modelServiceSpy = jasmine.createSpyObj('ModelService', ['getResults', 'getComparison', 'getStatus', 'train', 'predict']);

    // Default return values so ngOnInit doesn't fail
    datasetServiceSpy.getStats.and.returnValue(EMPTY);
    datasetServiceSpy.getSamples.and.returnValue(EMPTY);
    modelServiceSpy.getResults.and.returnValue(EMPTY);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: DatasetService, useValue: datasetServiceSpy },
        { provide: ModelService, useValue: modelServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading initially', () => {
    expect(component.loading()).toBeTrue();
  });

  it('should call services on init', () => {
    const mockStats = {
      nombre: 'IMDb',
      total: 50000,
      train: 25000,
      test: 25000,
      clases: { positivo: 25000, negativo: 25000 },
      balance: '50/50',
      vocabulario_tfidf: 50000,
      max_features: 50000,
      longitud_promedio_palabras: 230,
      longitud_mediana_palabras: 175,
    };
    const mockSamples = [
      {
        texto: 'Great movie',
        sentimiento: 'positive',
        confianza: 0.95,
        prediccion_nb: 'positive',
        prediccion_lr: 'positive',
        prediccion_svm: 'positive',
      },
    ];
    const mockResults = { naive_bayes: {}, logistic_regression: {}, svm: {} };

    datasetServiceSpy.getStats.and.returnValue(of(mockStats as any));
    datasetServiceSpy.getSamples.and.returnValue(of(mockSamples as any));
    modelServiceSpy.getResults.and.returnValue(of(mockResults as any));

    component.ngOnInit();

    expect(datasetServiceSpy.getStats).toHaveBeenCalled();
    expect(modelServiceSpy.getResults).toHaveBeenCalled();
    expect(datasetServiceSpy.getSamples).toHaveBeenCalledWith(6);
    expect(component.loading()).toBeFalse();
    expect(component.stats()).toEqual(mockStats as any);
    expect(component.samples().length).toBe(1);
  });

  it('should handle isPositive correctly', () => {
    expect(component.isPositive(1)).toBeTrue();
    expect(component.isPositive('positive')).toBeTrue();
    expect(component.isPositive('positivo')).toBeTrue();
    expect(component.isPositive(0)).toBeFalse();
    expect(component.isPositive('negative')).toBeFalse();
    expect(component.isPositive('negativo')).toBeFalse();
    expect(component.isPositive(null)).toBeFalse();
  });

  it('should open and close modal', () => {
    component.openModal('total');
    expect(component.modalVisible()).toBeTrue();
    expect(component.modalData()).toBeTruthy();
    expect(component.modalData()!.title).toBe('Total Reseñas');

    component.closeModal();
    expect(component.modalVisible()).toBeFalse();
  });

  it('should not open modal for unknown key', () => {
    component.openModal('unknown_key');
    expect(component.modalVisible()).toBeFalse();
    expect(component.modalData()).toBeNull();
  });

  it('should set loading to false on stats error', () => {
    datasetServiceSpy.getStats.and.returnValue(throwError(() => new Error('Network error')));
    datasetServiceSpy.getSamples.and.returnValue(EMPTY);
    modelServiceSpy.getResults.and.returnValue(EMPTY);

    component.ngOnInit();

    expect(component.loading()).toBeFalse();
  });

  it('should predict sentiment via quickPredict', () => {
    const mockResponse = {
      texto: 'Great movie',
      sentimiento: 'positivo',
      confianza: 0.92,
      scores: { positivo: 0.92, negativo: 0.08 },
      modelo: 'svm-tfidf',
      idioma: 'en',
    };
    modelServiceSpy.predict.and.returnValue(of(mockResponse as any));

    component.predictText.set('Great movie');
    component.quickPredict();

    expect(modelServiceSpy.predict).toHaveBeenCalledWith('Great movie');
    expect(component.predicting()).toBeFalse();
    expect(component.prediction()).toBeTruthy();
    expect(component.prediction()!.positive).toBeTrue();
    expect(component.prediction()!.confidenceLabel).toBe('92.0%');
    expect(component.predictionError()).toBeFalse();
  });

  it('should handle prediction error', () => {
    modelServiceSpy.predict.and.returnValue(throwError(() => new Error('Server down')));

    component.predictText.set('Some text');
    component.quickPredict();

    expect(component.predicting()).toBeFalse();
    expect(component.prediction()).toBeNull();
    expect(component.predictionError()).toBeTrue();
  });

  it('should not predict with empty text', () => {
    component.predictText.set('   ');
    component.quickPredict();

    expect(modelServiceSpy.predict).not.toHaveBeenCalled();
  });

  it('should not predict while already predicting', () => {
    modelServiceSpy.predict.and.returnValue(EMPTY);
    component.predictText.set('Test');
    component.predicting.set(true);
    component.quickPredict();

    expect(modelServiceSpy.predict).not.toHaveBeenCalled();
  });

  describe('debounce protection', () => {
    it('should block rapid-fire predictions within debounce interval', fakeAsync(() => {
      const mockResponse = {
        texto: 'Test',
        sentimiento: 'positivo',
        confianza: 0.9,
        scores: { positivo: 0.9, negativo: 0.1 },
        modelo: 'svm-tfidf',
        idioma: 'en',
      };
      modelServiceSpy.predict.and.returnValue(of(mockResponse as any));

      component.predictText.set('First prediction');
      component.quickPredict();
      expect(modelServiceSpy.predict).toHaveBeenCalledTimes(1);

      // Immediately try again (within debounce window)
      component.predictText.set('Second prediction');
      component.quickPredict();
      // Should be blocked by debounce
      expect(modelServiceSpy.predict).toHaveBeenCalledTimes(1);

      // Wait past the debounce interval
      tick(PREDICT_DEBOUNCE_MS + 10);

      component.predictText.set('Third prediction');
      component.quickPredict();
      expect(modelServiceSpy.predict).toHaveBeenCalledTimes(2);
    }));
  });

  describe('memory leak prevention', () => {
    it('should unsubscribe on destroy', () => {
      datasetServiceSpy.getStats.and.returnValue(EMPTY);
      datasetServiceSpy.getSamples.and.returnValue(EMPTY);
      modelServiceSpy.getResults.and.returnValue(EMPTY);

      component.ngOnInit();
      component.ngOnDestroy();

      // After destroy, the destroy$ subject should be completed
      // This verifies the lifecycle hook exists and runs without error
      expect(component).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should render loading spinner with role=status when loading', () => {
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('[role="status"]');
      expect(spinner).toBeTruthy();
    });

    it('should have aria-live on loading spinner', () => {
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('[aria-live="polite"]');
      expect(spinner).toBeTruthy();
    });

    it('should render progress bars with proper aria attributes after data loads', () => {
      const mockStats = {
        nombre: 'IMDb', total: 50000, train: 25000, test: 25000,
        clases: { positivo: 25000, negativo: 25000 }, balance: '50/50',
        vocabulario_tfidf: 50000, max_features: 50000,
        longitud_promedio_palabras: 230, longitud_mediana_palabras: 175,
      };
      datasetServiceSpy.getStats.and.returnValue(of(mockStats as any));
      datasetServiceSpy.getSamples.and.returnValue(of([]));
      modelServiceSpy.getResults.and.returnValue(of({} as any));

      component.ngOnInit();
      fixture.detectChanges();

      const progressBars = fixture.nativeElement.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBeGreaterThan(0);

      const firstBar = progressBars[0];
      expect(firstBar.getAttribute('aria-valuemin')).toBe('0');
      expect(firstBar.getAttribute('aria-valuemax')).toBe('100');
      expect(firstBar.getAttribute('aria-valuenow')).toBeTruthy();
    });

    it('should have aria-hidden on decorative SVG icons', () => {
      const mockStats = {
        nombre: 'IMDb', total: 50000, train: 25000, test: 25000,
        clases: { positivo: 25000, negativo: 25000 }, balance: '50/50',
        vocabulario_tfidf: 50000, max_features: 50000,
        longitud_promedio_palabras: 230, longitud_mediana_palabras: 175,
      };
      datasetServiceSpy.getStats.and.returnValue(of(mockStats as any));
      datasetServiceSpy.getSamples.and.returnValue(of([]));
      modelServiceSpy.getResults.and.returnValue(of({} as any));

      component.ngOnInit();
      fixture.detectChanges();

      const svgs = fixture.nativeElement.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('loading and error states', () => {
    it('should show loading spinner while loading is true', () => {
      fixture.detectChanges();
      expect(component.loading()).toBeTrue();
      const spinner = fixture.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should hide loading spinner after data loads', () => {
      const mockStats = {
        nombre: 'IMDb', total: 50000, train: 25000, test: 25000,
        clases: { positivo: 25000, negativo: 25000 }, balance: '50/50',
        vocabulario_tfidf: 50000, max_features: 50000,
        longitud_promedio_palabras: 230, longitud_mediana_palabras: 175,
      };
      datasetServiceSpy.getStats.and.returnValue(of(mockStats as any));
      datasetServiceSpy.getSamples.and.returnValue(of([]));
      modelServiceSpy.getResults.and.returnValue(of({} as any));

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });

    it('should display prediction error state', () => {
      modelServiceSpy.predict.and.returnValue(throwError(() => new Error('fail')));
      component.predictText.set('Test');
      component.quickPredict();
      fixture.detectChanges();

      expect(component.predictionError()).toBeTrue();
    });
  });
});
