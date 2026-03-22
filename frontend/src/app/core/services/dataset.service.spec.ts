import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DatasetService } from './dataset.service';
import { ApiService } from './api.service';
import { DatasetStats, SampleReview } from '../models';

describe('DatasetService', () => {
  let service: DatasetService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'getBlob', 'checkHealth', 'clearCache']);

    TestBed.configureTestingModule({
      providers: [
        DatasetService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });
    service = TestBed.inject(DatasetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call correct URL for stats with caching', () => {
    const mockStats: DatasetStats = {
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

    apiSpy.get.and.returnValue(of(mockStats));

    service.getStats().subscribe((data) => {
      expect(data).toEqual(mockStats);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('/api/dataset/stats', true);
  });

  it('should call correct URL for samples with default limit', () => {
    const mockSamples: SampleReview[] = [];
    apiSpy.get.and.returnValue(of(mockSamples));

    service.getSamples().subscribe((data) => {
      expect(data).toEqual(mockSamples);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('/api/dataset/samples?limit=8');
  });

  it('should call correct URL for samples with custom limit', () => {
    const mockSamples: SampleReview[] = [];
    apiSpy.get.and.returnValue(of(mockSamples));

    service.getSamples(15).subscribe((data) => {
      expect(data).toEqual(mockSamples);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('/api/dataset/samples?limit=15');
  });
});
