import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ReportContent } from '../models';

/**
 * Service for academic report content.
 * Fetches the structured report data from the backend.
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private api: ApiService) {}

  /**
   * Fetch the full report content including metadata and all section blocks.
   * Cached because the report content is static.
   * @returns Observable of ReportContent
   */
  getContent(): Observable<ReportContent> {
    return this.api.get<ReportContent>('/api/report/content', true);
  }
}
