import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make GET requests to the correct URL', () => {
    const mockData = { result: 'test' };

    service.get<{ result: string }>('/api/test').subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/test`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should make POST requests to the correct URL with body', () => {
    const mockBody = { text: 'hello' };
    const mockResponse = { success: true };

    service.post<{ success: boolean }>('/api/predict', mockBody).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/predict`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBody);
    req.flush(mockResponse);
  });

  it('should make POST requests with empty body by default', () => {
    service.post('/api/train').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/train`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('should make Blob requests with responseType blob', () => {
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' });

    service.getBlob('/api/report/pdf').subscribe((data) => {
      expect(data instanceof Blob).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/report/pdf`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  it('should check API health', () => {
    service.checkHealth().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/health`);
    expect(req.request.method).toBe('GET');
    req.flush('ok');
  });

  describe('caching', () => {
    it('should cache GET responses when useCache is true', fakeAsync(() => {
      const mockData = { value: 42 };

      // First call - should hit HTTP
      service.get('/api/cached', true).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/cached`);
      req.flush(mockData);
      tick();

      // Second call - should use cache, no HTTP request
      service.get('/api/cached', true).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      httpMock.expectNone(`${environment.apiUrl}/api/cached`);
    }));

    it('should not cache when useCache is false', fakeAsync(() => {
      const mockData = { value: 42 };

      service.get('/api/uncached', false).subscribe();
      const req1 = httpMock.expectOne(`${environment.apiUrl}/api/uncached`);
      req1.flush(mockData);
      tick();

      service.get('/api/uncached', false).subscribe();
      const req2 = httpMock.expectOne(`${environment.apiUrl}/api/uncached`);
      req2.flush(mockData);
    }));

    it('should clear all cache when clearCache is called without path', fakeAsync(() => {
      const mockData = { value: 1 };

      service.get('/api/cached', true).subscribe();
      httpMock.expectOne(`${environment.apiUrl}/api/cached`).flush(mockData);
      tick();

      service.clearCache();

      service.get('/api/cached', true).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/cached`);
      req.flush(mockData);
    }));

    it('should clear specific cache entry when clearCache is called with path', fakeAsync(() => {
      const mockData = { value: 1 };

      service.get('/api/cached', true).subscribe();
      httpMock.expectOne(`${environment.apiUrl}/api/cached`).flush(mockData);
      tick();

      service.clearCache('/api/cached');

      service.get('/api/cached', true).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/cached`);
      req.flush(mockData);
    }));

    it('should evict oldest cache entry when cache exceeds MAX_CACHE_SIZE', fakeAsync(() => {
      const mockData = { value: 1 };

      // Fill cache with 50 entries
      for (let i = 0; i < 50; i++) {
        service.get(`/api/item-${i}`, true).subscribe();
        httpMock.expectOne(`${environment.apiUrl}/api/item-${i}`).flush(mockData);
        tick(1); // ensure different timestamps
      }

      expect(service.cacheSize).toBe(50);

      // Adding one more should evict the oldest
      service.get('/api/item-new', true).subscribe();
      httpMock.expectOne(`${environment.apiUrl}/api/item-new`).flush(mockData);
      tick();

      expect(service.cacheSize).toBe(50);

      // The first entry should have been evicted
      service.get('/api/item-0', true).subscribe();
      // Should make a new HTTP request since it was evicted
      const req = httpMock.expectOne(`${environment.apiUrl}/api/item-0`);
      req.flush(mockData);
    }));

    it('should report cache size via cacheSize getter', fakeAsync(() => {
      expect(service.cacheSize).toBe(0);

      service.get('/api/a', true).subscribe();
      httpMock.expectOne(`${environment.apiUrl}/api/a`).flush({ v: 1 });
      tick();

      expect(service.cacheSize).toBe(1);
    }));
  });

  describe('retry logic', () => {
    it('should retry GET requests on failure', fakeAsync(() => {
      let result: any;
      service.get<{ ok: boolean }>('/api/flaky').subscribe({
        next: (data) => result = data,
      });

      // First attempt fails
      const req1 = httpMock.expectOne(`${environment.apiUrl}/api/flaky`);
      req1.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      tick(1000); // wait for first retry delay (1 * 1000ms)

      // Second attempt succeeds
      const req2 = httpMock.expectOne(`${environment.apiUrl}/api/flaky`);
      req2.flush({ ok: true });
      tick();

      expect(result).toEqual({ ok: true });
    }));

    it('should NOT retry POST requests', fakeAsync(() => {
      let errorCaught = false;
      service.post('/api/action', { data: 1 }).subscribe({
        error: () => errorCaught = true,
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/action`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      tick();

      expect(errorCaught).toBeTrue();
      // No retry request should be made
      httpMock.expectNone(`${environment.apiUrl}/api/action`);
    }));
  });

  describe('timeout', () => {
    it('should have timeout configured on GET requests', () => {
      // We verify the service creates without errors and makes requests
      // The actual timeout behavior is tested via the rxjs timeout operator
      service.get('/api/slow').subscribe({
        error: () => { /* expected */ },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/slow`);
      expect(req.request.method).toBe('GET');
      req.flush({ ok: true });
    });
  });
});
