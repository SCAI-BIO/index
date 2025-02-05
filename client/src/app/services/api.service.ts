import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { Mapping, Response, Terminology } from '../interfaces/mapping';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_URL = environment.openApiUrl;

  constructor(private http: HttpClient) {}

  fetchClosestMappingsDictionary(formData: FormData): Observable<Response[]> {
    return this.http.post<Response[]>(
      `${this.API_URL}/mappings/dict`,
      formData,
      {
        headers: new HttpHeaders({ Accept: 'application/json' }),
      }
    );
  }

  fetchClosestMappingsQuery(formData: FormData): Observable<Mapping[]> {
    return this.http.post<Mapping[]>(`${this.API_URL}/mappings`, formData, {
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }

  fetchEmbeddingModels(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/models`);
  }

  fetchTerminologies(): Observable<Terminology[]> {
    return this.http.get<Terminology[]>(`${this.API_URL}/terminologies`);
  }
}
