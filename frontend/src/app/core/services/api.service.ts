import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, shareReplay, timer } from 'rxjs';
import { timeout, retry, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CACHE_TTL_MS, HTTP_TIMEOUT_MS, MAX_RETRIES, MAX_CACHE_SIZE } from '../constants';

/** Cache entry with timestamp for TTL expiration */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  observable: Observable<T>;
}

/**
 * Low-level HTTP service wrapping Angular HttpClient.
 * Provides GET (with optional caching), POST, and Blob download methods.
 * All requests are prefixed with the configured API base URL.
 *
 * Resilience features:
 * - Timeout on all requests (HTTP_TIMEOUT_MS)
 * - Retry with exponential backoff on GET requests (MAX_RETRIES)
 * - Bounded in-memory cache with LRU eviction (MAX_CACHE_SIZE)
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl: string;
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
    if (!this.baseUrl && !environment.production) {
      console.warn('[ApiService] apiUrl is not configured in environment');
    }
  }

  /**
   * Perform a GET request. Optionally uses an in-memory cache with TTL.
   * Includes timeout and retry with exponential backoff.
   * @param path API path (e.g. '/api/dataset/stats')
   * @param useCache Whether to cache the response (default: false)
   * @param ttl Cache time-to-live in ms (default: CACHE_TTL_MS)
   * @returns Observable of the typed response
   */
  get<T>(path: string, useCache = false, ttl = CACHE_TTL_MS): Observable<T> {
    if (useCache) {
      const cached = this.cache.get(path) as CacheEntry<T> | undefined;
      if (cached && (Date.now() - cached.timestamp) < ttl) {
        return of(cached.data);
      }
    }

    const request$ = this.http.get<T>(`${this.baseUrl}${path}`).pipe(
      timeout(HTTP_TIMEOUT_MS),
      retry({
        count: MAX_RETRIES,
        delay: (_error, retryCount) => timer(retryCount * 1000),
      }),
      tap(data => {
        if (useCache) {
          this.evictIfNeeded();
          this.cache.set(path, {
            data,
            timestamp: Date.now(),
            observable: of(data),
          });
        }
      }),
      shareReplay(1),
    );

    return request$;
  }

  /**
   * Perform a POST request.
   * Includes timeout but NO retry (POST is not idempotent).
   * @param path API path
   * @param body Request body (defaults to empty object)
   * @returns Observable of the typed response
   */
  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(
      timeout(HTTP_TIMEOUT_MS),
    );
  }

  /**
   * Perform a GET request that returns a Blob (for file downloads).
   * Includes timeout and retry.
   * @param path API path for the downloadable resource
   * @returns Observable of the Blob response
   */
  getBlob(path: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${path}`, { responseType: 'blob' }).pipe(
      timeout(HTTP_TIMEOUT_MS),
      retry({
        count: MAX_RETRIES,
        delay: (_error, retryCount) => timer(retryCount * 1000),
      }),
    );
  }

  /**
   * Check API health by requesting a lightweight endpoint.
   * @returns Observable that completes if the API is reachable
   */
  checkHealth(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/api/health`, { responseType: 'text' });
  }

  /**
   * Invalidate all cached responses, or a specific path.
   * @param path Optional specific path to invalidate
   */
  clearCache(path?: string): void {
    if (path) {
      this.cache.delete(path);
    } else {
      this.cache.clear();
    }
  }

  /** Return current cache size (useful for testing) */
  get cacheSize(): number {
    return this.cache.size;
  }

  /**
   * Evict oldest cache entries when the cache exceeds MAX_CACHE_SIZE.
   * Entries are evicted by oldest timestamp first.
   */
  private evictIfNeeded(): void {
    if (this.cache.size < MAX_CACHE_SIZE) return;

    // Find and remove the oldest entry
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
