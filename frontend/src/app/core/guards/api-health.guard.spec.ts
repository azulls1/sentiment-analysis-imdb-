import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { apiHealthGuard, resetHealthCache } from './api-health.guard';
import { ApiService } from '../services/api.service';
import { ErrorHandlingService } from '../services/error-handling.service';

describe('apiHealthGuard', () => {
  let apiSpy: jasmine.SpyObj<ApiService>;
  let errorService: ErrorHandlingService;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['checkHealth']);
    resetHealthCache();

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: apiSpy },
        ErrorHandlingService,
      ],
    });

    errorService = TestBed.inject(ErrorHandlingService);
  });

  it('should allow navigation when API is healthy', (done) => {
    apiSpy.checkHealth.and.returnValue(of('ok'));

    TestBed.runInInjectionContext(() => {
      const result$ = apiHealthGuard(mockRoute, mockState);
      if (result$ && typeof (result$ as any).subscribe === 'function') {
        (result$ as any).subscribe((result: boolean) => {
          expect(result).toBeTrue();
          expect(errorService.apiHealthy()).toBeTrue();
          done();
        });
      }
    });
  });

  it('should allow navigation even when API is down and set apiHealthy to false', (done) => {
    apiSpy.checkHealth.and.returnValue(throwError(() => new Error('Connection refused')));

    TestBed.runInInjectionContext(() => {
      const result$ = apiHealthGuard(mockRoute, mockState);
      if (result$ && typeof (result$ as any).subscribe === 'function') {
        (result$ as any).subscribe((result: boolean) => {
          expect(result).toBeTrue();
          expect(errorService.apiHealthy()).toBeFalse();
          done();
        });
      }
    });
  });

  it('should use cached result within TTL', (done) => {
    apiSpy.checkHealth.and.returnValue(of('ok'));

    TestBed.runInInjectionContext(() => {
      // First call
      const result1$ = apiHealthGuard(mockRoute, mockState);
      (result1$ as any).subscribe(() => {
        expect(apiSpy.checkHealth).toHaveBeenCalledTimes(1);

        // Second call should use cache
        const result2$ = apiHealthGuard(mockRoute, mockState);
        (result2$ as any).subscribe((result: boolean) => {
          expect(result).toBeTrue();
          // Should not have made a second HTTP call
          expect(apiSpy.checkHealth).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });

  it('should set apiHealthy to true when API responds', (done) => {
    // First set it to false
    errorService.setApiHealth(false);
    apiSpy.checkHealth.and.returnValue(of('ok'));

    TestBed.runInInjectionContext(() => {
      const result$ = apiHealthGuard(mockRoute, mockState);
      (result$ as any).subscribe(() => {
        expect(errorService.apiHealthy()).toBeTrue();
        done();
      });
    });
  });
});
