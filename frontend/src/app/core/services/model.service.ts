import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ModelResults, ComparisonTable, TrainingStatus, PredictionResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ModelService {
  constructor(private api: ApiService) {}

  getResults(): Observable<ModelResults> {
    return this.api.get<ModelResults>('/api/model/results');
  }

  getComparison(): Observable<ComparisonTable> {
    return this.api.get<ComparisonTable>('/api/model/comparison');
  }

  getStatus(): Observable<TrainingStatus> {
    return this.api.get<TrainingStatus>('/api/model/status');
  }

  train(): Observable<{ message: string; status: string; task_id: string }> {
    return this.api.post('/api/model/train');
  }

  predict(text: string): Observable<PredictionResponse> {
    return this.api.post<PredictionResponse>('/api/model/predict', { text });
  }
}
