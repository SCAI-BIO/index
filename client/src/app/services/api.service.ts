import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, shareReplay } from 'rxjs';

import { Mapping, Response, Terminology } from '../interfaces/mapping';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_URL = environment.openApiUrl;
  private embeddingModels$: Observable<string[]> | null = null;
  private terminologies$: Observable<Terminology[]> | null = null;
  private lastFetched = 0;
  private CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

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
    return this.http.post<Mapping[]>(`${this.API_URL}/mappings/`, formData, {
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }

  fetchEmbeddingModels(): Observable<string[]> {
    const now = Date.now();

    // Return cached observable if available and not stale
    if (this.embeddingModels$ && now - this.lastFetched <= this.CACHE_TTL) {
      return this.embeddingModels$;
    }

    // Else: make API cal and cache the observable
    this.embeddingModels$ = this.http
      .get<string[]>(`${this.API_URL}/models`)
      .pipe(shareReplay(1));
    this.lastFetched = now;
    return this.embeddingModels$;
  }

  fetchTerminologies(): Observable<Terminology[]> {
    const now = Date.now();

    // Return cached observable if available and not stale
    if (this.terminologies$ && now - this.lastFetched <= this.CACHE_TTL) {
      return this.terminologies$;
    }

    // Else: make API cal and cache the observable
    this.terminologies$ = this.http
      .get<Terminology[]>(`${this.API_URL}/terminologies`)
      .pipe(shareReplay(1));
    this.lastFetched = now;
    return this.terminologies$;
  }

  clearCache(): void {
    this.embeddingModels$ = null;
    this.terminologies$ = null;
    this.lastFetched = 0;
  }
}
