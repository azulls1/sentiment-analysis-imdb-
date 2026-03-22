/**
 * Application-wide constants for the sentiment analysis platform.
 * Centralizes magic strings and reusable values.
 */

/** Sentiment label values returned by the API */
export const SENTIMENT = {
  POSITIVE_NUM: 1,
  POSITIVE_EN: 'positive',
  POSITIVE_ES: 'positivo',
  POSITIVE_SHORT: 'pos',
  NEGATIVE_NUM: 0,
  NEGATIVE_EN: 'negative',
  NEGATIVE_ES: 'negativo',
  NEGATIVE_SHORT: 'neg',
} as const;

/** Model keys used in the API responses */
export const MODEL_KEYS = {
  NAIVE_BAYES: 'naive_bayes',
  LOGISTIC_REGRESSION: 'logistic_regression',
  SVM: 'svm',
  REFERENCE: 'ref',
} as const;

/** Language codes */
export const LANGUAGE = {
  ENGLISH: 'en',
  SPANISH: 'es',
} as const;

/** Importance levels for challenges */
export const IMPORTANCE = {
  CRITICAL: 'critica',
  HIGH: 'alta',
  MEDIUM: 'media',
} as const;

/** Default cache TTL in milliseconds (5 minutes) */
export const CACHE_TTL_MS = 5 * 60 * 1000;

/** HTTP request timeout in milliseconds (15 seconds) */
export const HTTP_TIMEOUT_MS = 15_000;

/** Maximum number of retries for idempotent (GET) requests */
export const MAX_RETRIES = 2;

/** Maximum number of entries allowed in the API response cache */
export const MAX_CACHE_SIZE = 50;

/** Health check cache TTL in milliseconds (30 seconds) */
export const HEALTH_CACHE_TTL_MS = 30_000;

/** Minimum interval between predictions in milliseconds */
export const PREDICT_DEBOUNCE_MS = 500;

/**
 * Checks whether a sentiment value represents a positive sentiment.
 * Handles numeric, English, and Spanish variants.
 */
/**
 * Re-export the active locale for convenient access from components.
 * Usage: import { LOCALE } from '@core/constants';
 *        LOCALE.dashboard.title  // type-safe, centralized
 */
export { LOCALE } from './i18n';
export { type LocaleStrings } from './i18n';

/**
 * Checks whether a sentiment value represents a positive sentiment.
 * Handles numeric, English, and Spanish variants.
 */
export function isPositiveSentiment(value: unknown): boolean {
  if (typeof value === 'number') return value === SENTIMENT.POSITIVE_NUM;
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim();
    return v === SENTIMENT.POSITIVE_ES || v === SENTIMENT.POSITIVE_EN || v === SENTIMENT.POSITIVE_SHORT;
  }
  return false;
}
