import { TestBed } from '@angular/core/testing';
import { ErrorHandlingService } from './error-handling.service';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no errors', () => {
    expect(service.lastError()).toBeNull();
    expect(service.errors().length).toBe(0);
  });

  it('should record an error', () => {
    service.handleError(500, 'Server Error', '/api/test');

    expect(service.lastError()).toBeTruthy();
    expect(service.lastError()!.status).toBe(500);
    expect(service.lastError()!.message).toBe('Server Error');
    expect(service.lastError()!.url).toBe('/api/test');
    expect(service.errors().length).toBe(1);
  });

  it('should keep last 50 errors maximum', () => {
    for (let i = 0; i < 60; i++) {
      service.handleError(500, `Error ${i}`);
    }

    expect(service.errors().length).toBe(50);
    // Should keep the latest ones
    expect(service.errors()[49].message).toBe('Error 59');
  });

  it('should clear all errors', () => {
    service.handleError(500, 'Error 1');
    service.handleError(404, 'Error 2');

    service.clearErrors();

    expect(service.lastError()).toBeNull();
    expect(service.errors().length).toBe(0);
  });

  it('should update lastError with the most recent error', () => {
    service.handleError(500, 'First');
    service.handleError(404, 'Second');

    expect(service.lastError()!.message).toBe('Second');
  });

  describe('isOnline signal', () => {
    it('should default to true (browser is online)', () => {
      expect(service.isOnline()).toBeTrue();
    });

    it('should update on offline event', () => {
      window.dispatchEvent(new Event('offline'));
      expect(service.isOnline()).toBeFalse();

      // Restore
      window.dispatchEvent(new Event('online'));
      expect(service.isOnline()).toBeTrue();
    });

    it('should update on online event', () => {
      window.dispatchEvent(new Event('offline'));
      expect(service.isOnline()).toBeFalse();

      window.dispatchEvent(new Event('online'));
      expect(service.isOnline()).toBeTrue();
    });
  });

  describe('apiHealthy signal', () => {
    it('should default to true', () => {
      expect(service.apiHealthy()).toBeTrue();
    });

    it('should update via setApiHealth', () => {
      service.setApiHealth(false);
      expect(service.apiHealthy()).toBeFalse();

      service.setApiHealth(true);
      expect(service.apiHealthy()).toBeTrue();
    });
  });
});
