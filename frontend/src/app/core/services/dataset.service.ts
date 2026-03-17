import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DatasetStats, SampleReview } from '../models';

@Injectable({ providedIn: 'root' })
export class DatasetService {
  constructor(private api: ApiService) {}

  getStats(): Observable<DatasetStats> {
    return this.api.get<DatasetStats>('/api/dataset/stats');
  }

  getSamples(limit = 8): Observable<SampleReview[]> {
    return this.api.get<SampleReview[]>(`/api/dataset/samples?limit=${limit}`);
  }
}
