import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ArticleSummary } from '../models';

/**
 * Service for fetching the reference article summary.
 * Provides access to the Keerthi Kumar & Harish (2019) article data.
 */
@Injectable({ providedIn: 'root' })
export class ArticleService {
  constructor(private api: ApiService) {}

  /**
   * Fetch the structured article summary (abstract, methodology, results, etc.).
   * Cached because article data is static.
   * @returns Observable of ArticleSummary
   */
  getSummary(): Observable<ArticleSummary> {
    return this.api.get<ArticleSummary>('/api/article/summary', true);
  }
}
