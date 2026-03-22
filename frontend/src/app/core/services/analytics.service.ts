import { Injectable, signal } from '@angular/core';

/**
 * Lightweight in-memory analytics service for tracking key user interactions.
 *
 * Tracks page views, predictions, and exports without any external dependency.
 * Metrics are available via `getMetrics()` for debugging, monitoring dashboards,
 * or future integration with an external analytics provider.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private _pageViews = signal(0);
  private _predictions = signal(0);
  private _exports = signal(0);

  /** Record a page view event. */
  trackPageView(): void {
    this._pageViews.update(v => v + 1);
  }

  /** Record a prediction event (successful ML prediction). */
  trackPrediction(): void {
    this._predictions.update(v => v + 1);
  }

  /** Record an export event (PDF, notebook, CSV download). */
  trackExport(): void {
    this._exports.update(v => v + 1);
  }

  /** Return current metrics snapshot. */
  getMetrics(): { pageViews: number; predictions: number; exports: number } {
    return {
      pageViews: this._pageViews(),
      predictions: this._predictions(),
      exports: this._exports(),
    };
  }
}
