import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ModeloComponent } from './modelo.component';
import { ModelService } from '../../core/services/model.service';

describe('ModeloComponent', () => {
  let component: ModeloComponent;
  let fixture: ComponentFixture<ModeloComponent>;
  let modelServiceSpy: jasmine.SpyObj<ModelService>;

  const mockResults = {
    naive_bayes: {
      nombre: 'Naïve Bayes',
      nombre_corto: 'NB',
      accuracy: 0.8565,
      precision_macro: 0.857,
      recall_macro: 0.856,
      f1_macro: 0.856,
      tiempo_entrenamiento: 1.23,
      tiempo_prediccion: 0.05,
      precision_pos: 0.86,
      recall_pos: 0.855,
      f1_pos: 0.857,
      precision_neg: 0.857,
      recall_neg: 0.858,
      f1_neg: 0.857,
      confusion_matrix: [[10678, 1822], [1788, 10712]],
    },
  };

  const mockComparison = {
    modelos: ['Naïve Bayes', 'Regresión Logística', 'SVM'],
    accuracy: [0.8565, 0.8936, 0.8968],
    precision: [0.857, 0.894, 0.897],
    recall: [0.856, 0.893, 0.896],
    f1_score: [0.856, 0.893, 0.896],
    tiempo_entrenamiento_seg: [1.23, 5.67, 142.35],
    analisis: 'SVM achieves the best accuracy.',
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ModelService', [
      'getResults',
      'getComparison',
      'predict',
    ]);
    spy.getResults.and.returnValue(of(mockResults));
    spy.getComparison.and.returnValue(of(mockComparison));
    spy.predict.and.returnValue(
      of({ sentimiento: 'positivo', confianza: 0.92, modelo: 'SVM', idioma: 'en', scores: { positivo: 0.92, negativo: 0.08 } })
    );

    await TestBed.configureTestingModule({
      imports: [ModeloComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ModelService, useValue: spy },
      ],
    }).compileComponents();

    modelServiceSpy = TestBed.inject(ModelService) as jasmine.SpyObj<ModelService>;
    fixture = TestBed.createComponent(ModeloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start with loading true then set to false after data loads', () => {
    // After detectChanges, ngOnInit has run and loading should be false
    expect(component.loading()).toBeFalse();
  });

  it('should populate modelList from service response', () => {
    expect(component.modelList().length).toBeGreaterThan(0);
    expect(component.modelList()[0].key).toBe('naive_bayes');
  });

  it('should set bestModelKey after loading results', () => {
    expect(component.bestModelKey()).toBeTruthy();
    expect(typeof component.bestModelKey()).toBe('string');
  });

  it('should call predict service when predict() is invoked with text', () => {
    component.predictText.set('This movie was great!');
    component.predict();
    expect(modelServiceSpy.predict).toHaveBeenCalledWith('This movie was great!');
  });

  it('should open modal when openModelModal is called', () => {
    component.openModelModal(component.modelList()[0]);
    expect(component.modalVisible()).toBeTrue();
    expect(component.modalData()).toBeTruthy();
  });
});
