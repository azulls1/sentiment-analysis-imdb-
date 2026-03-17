import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModelService } from './model.service';
import { ApiService } from './api.service';

describe('ModelService', () => {
  let service: ModelService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'getBlob']);

    TestBed.configureTestingModule({
      providers: [
        ModelService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });
    service = TestBed.inject(ModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call correct URL for results', () => {
    const mockResults = { naive_bayes: {}, logistic_regression: {}, svm: {} };
    apiSpy.get.and.returnValue(of(mockResults));

    service.getResults().subscribe((data) => {
      expect(data).toEqual(mockResults as any);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('/api/model/results');
  });

  it('should call correct URL for comparison', () => {
    const mockComparison = {
      modelos: ['NB', 'LR', 'SVM'],
      accuracy: [85, 89, 90],
      precision: [85, 89, 90],
      recall: [85, 89, 90],
      f1_score: [85, 89, 90],
      tiempo_entrenamiento_seg: [1, 5, 142],
      mejor_modelo: 'SVM',
      mejor_accuracy: 90,
      analisis: 'SVM is best',
    };
    apiSpy.get.and.returnValue(of(mockComparison));

    service.getComparison().subscribe((data) => {
      expect(data).toEqual(mockComparison as any);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('/api/model/comparison');
  });

  it('should call correct URL for status', () => {
    const mockStatus = {
      status: 'completed',
      progress: 100,
      current_step: 'done',
      steps_completed: ['step1', 'step2'],
    };
    apiSpy.get.and.returnValue(of(mockStatus));

    service.getStatus().subscribe((data) => {
      expect(data).toEqual(mockStatus as any);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('/api/model/status');
  });

  it('should call train with POST', () => {
    const mockResponse = { message: 'Training started', status: 'running', task_id: 'abc123' };
    apiSpy.post.and.returnValue(of(mockResponse));

    service.train().subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    expect(apiSpy.post).toHaveBeenCalledWith('/api/model/train');
  });

  it('should call predict with text body', () => {
    const mockPrediction = {
      texto: 'Great movie',
      sentimiento: 'positive',
      confianza: 0.95,
      scores: { positivo: 0.95, negativo: 0.05 },
      modelo: 'svm-tfidf',
      idioma: 'en',
    };
    apiSpy.post.and.returnValue(of(mockPrediction));

    service.predict('Great movie').subscribe((data) => {
      expect(data).toEqual(mockPrediction as any);
    });

    expect(apiSpy.post).toHaveBeenCalledWith('/api/model/predict', { text: 'Great movie' });
  });
});
