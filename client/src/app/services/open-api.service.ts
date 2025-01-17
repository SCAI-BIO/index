import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmbeddingPlot, Mapping, MappingDict } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OpenApiService {
  openApiUrl!: string;
  constructor(private client: HttpClient) {
    this.openApiUrl = environment.openApiUrl;
  }

  getMapping(search: string, limit: number): Observable<Mapping[]> {
    const url = `${this.openApiUrl}/mappings?text=${search}&limit=${limit}`;
    console.log(url);
    return this.client.post<Mapping[]>(url, {});
  }

  getEmbedding(): Observable<EmbeddingPlot> {
    const url = `${this.openApiUrl}/visualization?data_type=json`;
    console.log(url);
    return this.client.get<EmbeddingPlot>(url, {});
  }

  upload(file: File): Observable<MappingDict[]> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    return this.client.post<MappingDict[]>(
      `${this.openApiUrl}/mappings/dict`,
      formData
    );
  }
}
