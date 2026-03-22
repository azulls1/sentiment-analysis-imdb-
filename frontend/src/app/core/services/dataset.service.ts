import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DatasetStats, SampleReview } from '../models';

/**
 * Service for dataset-related API calls.
 * Provides access to IMDb dataset statistics and sample reviews.
 *
 * Uses shareReplay(1) to deduplicate in-flight requests so multiple
 * subscribers receive the same response without extra HTTP calls.
 */
@Injectable({ providedIn: 'root' })
export class DatasetService {
  /** Cached stats observable shared across subscribers */
  private stats$?: Observable<DatasetStats>;

  constructor(private api: ApiService) {}

  /**
   * Fetch aggregated dataset statistics (totals, balance, vocabulary size, etc.).
   * Results are cached for performance since dataset stats rarely change.
   * Uses shareReplay(1) for request deduplication across subscribers.
   * @returns Observable of DatasetStats
   */
  getStats(): Observable<DatasetStats> {
    if (!this.stats$) {
      this.stats$ = this.api.get<DatasetStats>('/api/dataset/stats', true).pipe(
        shareReplay(1),
      );
    }
    return this.stats$;
  }

  /**
   * Fetch sample reviews with predictions from each classifier.
   * @param limit Maximum number of samples to return (default: 8)
   * @returns Observable of SampleReview array
   */
  getSamples(limit = 8): Observable<SampleReview[]> {
    return this.api.get<SampleReview[]>(`/api/dataset/samples?limit=${limit}`).pipe(
      shareReplay(1),
    );
  }
}
