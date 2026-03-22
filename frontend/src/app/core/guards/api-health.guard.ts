import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ErrorHandlingService } from '../services/error-handling.service';
import { map, catchError, of, timeout } from 'rxjs';
import { HEALTH_CACHE_TTL_MS } from '../constants';

/** Cached health check state */
let lastHealthCheck: { result: boolean; timestamp: number } | null = null;

/**
 * Route guard that checks whether the backend API is reachable.
 * Always allows navigation but sets a health warning signal
 * in ErrorHandlingService when the API is down.
 *
 * Features:
 * - 5-second timeout on health check
 * - Caches health result for 30 seconds to avoid excessive checks
 * - On failure/timeout: still allows navigation but flags API as unhealthy
 */
export const apiHealthGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const errorService = inject(ErrorHandlingService);

  // Use cached result if still valid
  if (lastHealthCheck && (Date.now() - lastHealthCheck.timestamp) < HEALTH_CACHE_TTL_MS) {
    errorService.setApiHealth(lastHealthCheck.result);
    return of(true);
  }

  return api.checkHealth().pipe(
    timeout(5000),
    map(() => {
      lastHealthCheck = { result: true, timestamp: Date.now() };
      errorService.setApiHealth(true);
      return true;
    }),
    catchError(() => {
      lastHealthCheck = { result: false, timestamp: Date.now() };
      errorService.setApiHealth(false);
      // Allow navigation even if API is down; components handle errors gracefully
      return of(true);
    }),
  );
};

/**
 * Reset the cached health check (useful for testing).
 */
export function resetHealthCache(): void {
  lastHealthCheck = null;
}
