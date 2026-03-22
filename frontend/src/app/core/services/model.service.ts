import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ModelResults, ComparisonTable, TrainingStatus, PredictionResponse } from '../models';

/**
 * Service for ML model-related API calls.
 * Provides access to model results, comparisons, training, and prediction.
 *
 * Uses shareReplay(1) on cacheable endpoints to deduplicate in-flight
 * requests and ensure data consistency across multiple subscribers.
 */
@Injectable({ providedIn: 'root' })
export class ModelService {
  /** Cached results observable shared across subscribers */
  private results$?: Observable<ModelResults>;
  /** Cached comparison observable shared across subscribers */
  private comparison$?: Observable<ComparisonTable>;

  constructor(private api: ApiService) {}

  /**
   * Fetch detailed results for all three classifiers (NB, LR, SVM).
   * Cached because model results are static after training.
   * Uses shareReplay(1) for request deduplication across subscribers.
   * @returns Observable of ModelResults keyed by model name
   */
  getResults(): Observable<ModelResults> {
    if (!this.results$) {
      this.results$ = this.api.get<ModelResults>('/api/model/results', true).pipe(
        shareReplay(1),
      );
    }
    return this.results$;
  }

  /**
   * Fetch the comparison table across all classifiers.
   * Cached for the same reason as getResults.
   * Uses shareReplay(1) for request deduplication across subscribers.
   * @returns Observable of ComparisonTable
   */
  getComparison(): Observable<ComparisonTable> {
    if (!this.comparison$) {
      this.comparison$ = this.api.get<ComparisonTable>('/api/model/comparison', true).pipe(
        shareReplay(1),
      );
    }
    return this.comparison$;
  }

  /**
   * Fetch current training status (progress, current step, etc.).
   * Not cached because status changes during training.
   * @returns Observable of TrainingStatus
   */
  getStatus(): Observable<TrainingStatus> {
    return this.api.get<TrainingStatus>('/api/model/status');
  }

  /**
   * Trigger a new training run on the backend.
   * @returns Observable with task ID and initial status
   */
  train(): Observable<{ message: string; status: string; task_id: string }> {
    return this.api.post('/api/model/train');
  }

  /**
   * Predict the sentiment of a given text.
   * @param text The review text to classify (English or Spanish)
   * @returns Observable of PredictionResponse with sentiment, confidence, and scores
   */
  predict(text: string): Observable<PredictionResponse> {
    return this.api.post<PredictionResponse>('/api/model/predict', { text });
  }
}
