import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  constructor(private api: ApiService) {}

  getSummary(): Observable<any> {
    return this.api.get('/api/article/summary');
  }
}
