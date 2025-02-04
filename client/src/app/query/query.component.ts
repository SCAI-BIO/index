import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Subscription } from 'rxjs';

import { Mapping, Terminology } from '../interfaces/mapping';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-query',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss',
})
export class QueryComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator!: MatPaginator;
  closestMappings: Mapping[] = [];
  dataSource = new MatTableDataSource<Mapping>([]);
  displayedColumns = ['similarity', 'conceptName', 'conceptID', 'terminology'];
  embeddingModels: string[] = [];
  formData = new FormData();
  loading: boolean = false;
  queryForm: FormGroup;
  terminologies: string[] = [];
  private readonly API_URL = environment.openApiUrl;
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.queryForm = this.fb.group({
      text: ['', Validators.required],
      selectedTerminology: ['', Validators.required],
      selectedEmbeddingModel: ['', Validators.required],
      limit: [100],
    });
  }

  fetchClosestMappings(): void {
    if (!this.queryForm.valid) {
      console.error('Form is invalid:', this.queryForm.value);
      return;
    }

    this.loading = true;

    this.http
      .post<Mapping[]>(`${this.API_URL}/mappings`, this.formData, {
        headers: new HttpHeaders({ Accept: 'application/json' }),
      })
      .subscribe({
        next: (mapping) => {
          this.closestMappings = mapping;
          this.dataSource.data = mapping;
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
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
    this.subscriptions.add(this.fetchTerminologies());
    this.subscriptions.add(this.fetchEmbeddingModels());
  }

  onSubmit(): void {
    if (this.queryForm.valid) {
      const { text, selectedEmbeddingModel, selectedTerminology, limit } =
        this.queryForm.value;

      this.formData.set('text', text);
      this.formData.set('terminology_name', selectedTerminology);
      this.formData.set('model', selectedEmbeddingModel);
      this.formData.set('limit', limit.toString());
      this.fetchClosestMappings();
    } else {
      console.error('Form is invalid:', this.queryForm.value);
    }
  }
}
