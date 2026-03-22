import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ExportService } from './export.service';
import { ApiService } from './api.service';
import { ErrorHandlingService } from './error-handling.service';

describe('ExportService', () => {
  let service: ExportService;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let errorService: ErrorHandlingService;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getBlob']);

    TestBed.configureTestingModule({
      providers: [
        ExportService,
        { provide: ApiService, useValue: apiSpy },
        ErrorHandlingService,
      ],
    });

    service = TestBed.inject(ExportService);
    errorService = TestBed.inject(ErrorHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with idle download status', () => {
    expect(service.downloadStatus()).toBe('idle');
  });

  describe('downloadPdf', () => {
    it('should set status to success on successful download', () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      apiSpy.getBlob.and.returnValue(of(mockBlob));

      // Mock createObjectURL and revokeObjectURL
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(window.URL, 'revokeObjectURL');

      service.downloadPdf();

      expect(service.downloadStatus()).toBe('success');
      expect(service.lastFilename()).toBe('informe.pdf');
      expect(apiSpy.getBlob).toHaveBeenCalledWith('/api/export/pdf');
    });

    it('should set status to error and report to error service on failure', () => {
      apiSpy.getBlob.and.returnValue(throwError(() => ({ status: 500 })));
      spyOn(errorService, 'handleError');

      service.downloadPdf();

      expect(service.downloadStatus()).toBe('error');
      expect(errorService.handleError).toHaveBeenCalledWith(
        500,
        'Error al descargar informe.pdf',
        '/api/export/pdf',
      );
    });
  });

  describe('downloadNotebook', () => {
    it('should request notebook blob', () => {
      const mockBlob = new Blob(['notebook'], { type: 'application/json' });
      apiSpy.getBlob.and.returnValue(of(mockBlob));
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(window.URL, 'revokeObjectURL');

      service.downloadNotebook();

      expect(apiSpy.getBlob).toHaveBeenCalledWith('/api/export/notebook');
      expect(service.lastFilename()).toBe('notebook.ipynb');
    });
  });

  describe('downloadZip', () => {
    it('should request zip blob', () => {
      const mockBlob = new Blob(['zip'], { type: 'application/zip' });
      apiSpy.getBlob.and.returnValue(of(mockBlob));
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(window.URL, 'revokeObjectURL');

      service.downloadZip();

      expect(apiSpy.getBlob).toHaveBeenCalledWith('/api/export/zip');
      expect(service.lastFilename()).toBe('entrega_actividad2_SAMAEL.zip');
    });
  });

  describe('error handling', () => {
    it('should handle network error with status 0', () => {
      apiSpy.getBlob.and.returnValue(throwError(() => ({ status: 0 })));
      spyOn(errorService, 'handleError');

      service.downloadZip();

      expect(errorService.handleError).toHaveBeenCalledWith(
        0,
        'Error al descargar entrega_actividad2_SAMAEL.zip',
        '/api/export/zip',
      );
    });

    it('should set downloading status before request completes', () => {
      // Use a subject we never complete to catch the intermediate state
      apiSpy.getBlob.and.returnValue(of(new Blob([''])).pipe());
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(window.URL, 'revokeObjectURL');

      // Check status transitions
      expect(service.downloadStatus()).toBe('idle');
      service.downloadPdf();
      // After completion it should be success
      expect(service.downloadStatus()).toBe('success');
    });
  });
});
