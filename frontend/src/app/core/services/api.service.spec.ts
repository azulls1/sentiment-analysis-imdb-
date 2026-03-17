import { TestBed } from '@angular/core/testing';
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
});
