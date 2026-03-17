import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor(private api: ApiService) {}

  downloadPdf(): void {
    this.api.getBlob('/api/export/pdf').subscribe(blob => {
      this.triggerDownload(blob, 'informe.pdf');
    });
  }

  downloadNotebook(): void {
    this.api.getBlob('/api/export/notebook').subscribe(blob => {
      this.triggerDownload(blob, 'notebook.ipynb');
    });
  }

  downloadZip(): void {
    this.api.getBlob('/api/export/zip').subscribe(blob => {
      this.triggerDownload(blob, 'entrega_actividad2_SAMAEL.zip');
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
