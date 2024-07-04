import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {Mapping} from "../models";

@Injectable({
  providedIn: 'root'
})
export class OpenApiService {

  openApiUrl = environment.openApiUrl;

  constructor(private client: HttpClient) {

  }

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    return  this.client.post<any>(`${this.openApiUrl}/upload`, formData);
  }

  getMappings(search: string): Observable<Mapping[]> {
    const url = `${this.openApiUrl}/mappings?text=${search}`;
     return this.client.post<Mapping[]>(url, {})
  }
}
