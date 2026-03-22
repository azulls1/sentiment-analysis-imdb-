import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ErrorHandlingService } from './error-handling.service';

/** Current download status for UI feedback */
export type DownloadStatus = 'idle' | 'downloading' | 'success' | 'error';

/**
 * Service for downloading exported files (PDF, notebook, ZIP).
 * Triggers browser downloads via Blob URLs.
 *
 * Exposes a `downloadStatus` signal for components to show feedback.
 * All subscriptions are cleaned up when a new download starts or the service is destroyed.
 */
@Injectable({ providedIn: 'root' })
export class ExportService {
  /** Current download status for UI consumption */
  readonly downloadStatus = signal<DownloadStatus>('idle');

  /** Filename of the last download attempt */
  readonly lastFilename = signal<string>('');

  private cancel$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private errorService: ErrorHandlingService,
  ) {}

  /** Download the academic report as PDF */
  downloadPdf(): void {
    this.startDownload('/api/export/pdf', 'informe.pdf');
  }

  /** Download the Jupyter notebook */
  downloadNotebook(): void {
    this.startDownload('/api/export/notebook', 'notebook.ipynb');
  }

  /** Download the complete deliverables ZIP */
  downloadZip(): void {
    this.startDownload('/api/export/zip', 'entrega_actividad2_SAMAEL.zip');
  }

  /**
   * Generic download handler with error handling and status tracking.
   * @param path API path for the downloadable resource
   * @param filename The suggested filename for the download
   */
  private startDownload(path: string, filename: string): void {
    // Cancel any in-flight download
    this.cancel$.next();

    this.downloadStatus.set('downloading');
    this.lastFilename.set(filename);

    this.api.getBlob(path).pipe(
      takeUntil(this.cancel$),
    ).subscribe({
      next: (blob) => {
        this.triggerDownload(blob, filename);
        this.downloadStatus.set('success');
      },
      error: (err) => {
        this.downloadStatus.set('error');
        this.errorService.handleError(
          err?.status ?? 0,
          `Error al descargar ${filename}`,
          path,
        );
      },
    });
  }

  /**
   * Create a temporary object URL and trigger a download.
   * @param blob The file content
   * @param filename The suggested filename for the download
   */
  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
