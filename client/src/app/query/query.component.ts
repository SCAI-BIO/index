import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Subscription } from 'rxjs';

import { Mapping, Terminology } from '../interfaces/mapping';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-query',
  standalone: true,
  imports: [HttpClientModule, MatPaginatorModule, MatFormFieldModule],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss',
})
export class QueryComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  closestMappings: Mapping[] = [];
  dataSource!: MatTableDataSource<Mapping>;
  displayedColumns = ['similarity', 'conceptName', 'conceptID', 'terminology'];
  embeddingModels: string[] = [];
  formData = new FormData();
  loading: boolean = false;
  ontologies: string[] = [];
  queryForm: FormGroup;
  terminologies: string[] = [];
  private readonly API_URL = environment.openApiUrl;
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.queryForm = this.fb.group({
      text: ['', Validators.required],
      selectedOntology: ['', Validators.required],
      selectedEmbeddingModel: ['sentence-transformers/all-mpnet-base-v2'],
    });
  }

  fetchClosestMappings(): void {
    if (!this.queryForm.valid) {
      console.error('Form is invalid:', this.queryForm.value);
      return;
    }

    this.loading = true;

    const requestBody = {
      text: this.queryForm.value.text,
      terminology_name: this.queryForm.value.selectedOntology,
      model: this.queryForm.value.selectedEmbeddingModel,
    };

    this.http
      .post<Mapping[]>(`${this.API_URL}/mappings`, requestBody, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .subscribe({
        next: (mapping) => {
          this.closestMappings = mapping;
          this.dataSource.data = mapping;

          // Ensure paginator is available before setting
          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
          });
        },
        error: (err) => {
          console.error('Error fetching closest mappings', err);
          this.loading = false;
          const errorMessage =
            err.error?.message || err.message || 'Unknown error occurred';
          alert(`An error occurred while fetching mappings: ${errorMessage}`);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  fetchEmbeddingModels(): Subscription {
    return this.http.get<string[]>(`${this.API_URL}/models`).subscribe({
      next: (models) => (this.embeddingModels = models),
      error: (err) => console.error('Error fetching embeddings models:', err),
    });
  }

  fetchTerminologies(): Subscription {
    return this.http
      .get<Terminology[]>(`${this.API_URL}/terminologies`)
      .subscribe({
        next: (terminologies) => {
          this.terminologies = terminologies.map((t) => t.name);
        },
        error: (err) => console.error('Error fetching terminologies', err),
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Mapping>([]);
    this.subscriptions.add(this.fetchTerminologies());
    this.subscriptions.add(this.fetchEmbeddingModels());
  }

  onSubmit(): void {
    if (this.queryForm.valid) {
      this.fetchClosestMappings();
    }
  }
}
