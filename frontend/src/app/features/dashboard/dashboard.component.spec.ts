import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, EMPTY, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DatasetService } from '../../core/services/dataset.service';
import { ModelService } from '../../core/services/model.service';

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
});
