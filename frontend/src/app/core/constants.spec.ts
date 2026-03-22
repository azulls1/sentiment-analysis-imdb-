import { isPositiveSentiment, SENTIMENT, LANGUAGE, CACHE_TTL_MS } from './constants';

describe('Constants', () => {
  describe('isPositiveSentiment', () => {
    it('should return true for numeric positive (1)', () => {
      expect(isPositiveSentiment(1)).toBeTrue();
    });

    it('should return true for English positive string', () => {
      expect(isPositiveSentiment('positive')).toBeTrue();
    });

    it('should return true for Spanish positive string', () => {
      expect(isPositiveSentiment('positivo')).toBeTrue();
    });

    it('should return true for short positive string', () => {
      expect(isPositiveSentiment('pos')).toBeTrue();
    });

    it('should return false for numeric negative (0)', () => {
      expect(isPositiveSentiment(0)).toBeFalse();
    });

    it('should return false for English negative string', () => {
      expect(isPositiveSentiment('negative')).toBeFalse();
    });

    it('should return false for Spanish negative string', () => {
      expect(isPositiveSentiment('negativo')).toBeFalse();
    });

    it('should return false for null/undefined', () => {
      expect(isPositiveSentiment(null)).toBeFalse();
      expect(isPositiveSentiment(undefined)).toBeFalse();
    });

    it('should be case-insensitive', () => {
      expect(isPositiveSentiment('POSITIVE')).toBeTrue();
      expect(isPositiveSentiment('Positivo')).toBeTrue();
    });

    it('should trim whitespace', () => {
      expect(isPositiveSentiment(' positive ')).toBeTrue();
    });
  });

  describe('SENTIMENT constants', () => {
    it('should have expected values', () => {
      expect(SENTIMENT.POSITIVE_EN).toBe('positive');
      expect(SENTIMENT.NEGATIVE_EN).toBe('negative');
      expect(SENTIMENT.POSITIVE_ES).toBe('positivo');
      expect(SENTIMENT.NEGATIVE_ES).toBe('negativo');
    });
  });

  describe('LANGUAGE constants', () => {
    it('should have expected values', () => {
      expect(LANGUAGE.ENGLISH).toBe('en');
      expect(LANGUAGE.SPANISH).toBe('es');
    });
  });

  describe('CACHE_TTL_MS', () => {
    it('should be 5 minutes in milliseconds', () => {
      expect(CACHE_TTL_MS).toBe(300000);
    });
  });
});
