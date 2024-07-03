import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mapping } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OpenApiService {
  openApiUrl!: string;
  constructor(private client: HttpClient) {
    this.openApiUrl = environment.openApiUrl;
  }

  getMapping(search: string): Observable<Mapping[]> {
    const url = `${this.openApiUrl}/mappings?text=${search}`;
    console.log(url);
    return this.client.post<Mapping[]>(url, {});
  }
}
