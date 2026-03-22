import { Injectable, signal, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Structured error information */
export interface AppError {
  status: number;
  message: string;
  url?: string;
  timestamp: Date;
}

/**
 * Centralized error handling service.
 * Collects application errors and exposes them as signals for UI consumption.
 * In production mode, console output is suppressed.
 *
 * Also tracks:
 * - Browser online/offline status via `isOnline` signal
 * - API health status via `apiHealthy` signal
 */
@Injectable({ providedIn: 'root' })
export class ErrorHandlingService implements OnDestroy {
  /** The most recent error, or null */
  readonly lastError = signal<AppError | null>(null);

  /** All errors collected during the session */
  readonly errors = signal<AppError[]>([]);

  /** Whether the browser currently has network connectivity */
  readonly isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  /** Whether the backend API is considered healthy */
  readonly apiHealthy = signal<boolean>(true);

  private onlineFn = () => this.isOnline.set(true);
  private offlineFn = () => this.isOnline.set(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onlineFn);
      window.addEventListener('offline', this.offlineFn);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineFn);
      window.removeEventListener('offline', this.offlineFn);
    }
  }

  /**
   * Record an error from an HTTP response or other source.
   * @param status HTTP status code (0 for network errors)
   * @param message Human-readable error description
   * @param url The URL that failed, if applicable
   */
  handleError(status: number, message: string, url?: string): void {
    const error: AppError = { status, message, url, timestamp: new Date() };
    this.lastError.set(error);
    this.errors.update(list => [...list.slice(-49), error]); // keep last 50

    if (!environment.production) {
      console.error(`[AppError] ${status}: ${message}`, url);
    }
  }

  /** Update the API health status */
  setApiHealth(healthy: boolean): void {
    this.apiHealthy.set(healthy);
  }

  /** Clear all recorded errors */
  clearErrors(): void {
    this.lastError.set(null);
    this.errors.set([]);
  }

  /**
   * Manually re-check API health by pinging the health endpoint.
   * Updates `apiHealthy` signal based on the result.
   */
  recheckApi(): void {
    const baseUrl = environment.production ? '' : 'http://localhost:8000';
    fetch(`${baseUrl}/api/health`, { method: 'GET', signal: AbortSignal.timeout(5000) })
      .then(res => this.apiHealthy.set(res.ok))
      .catch(() => this.apiHealthy.set(false));
  }
}
