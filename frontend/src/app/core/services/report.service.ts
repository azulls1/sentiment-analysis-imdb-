import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ReportContent } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private api: ApiService) {}

  getContent(): Observable<ReportContent> {
    return this.api.get<ReportContent>('/api/report/content');
  }
}
