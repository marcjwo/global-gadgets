import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BigQueryService {
  private apiUrl = '/api/bigquery/query';

  constructor(private http: HttpClient) { }

  query(query: string): Observable<any[]> {
    return this.http.post<any[]>(this.apiUrl, { query });
  }
}
