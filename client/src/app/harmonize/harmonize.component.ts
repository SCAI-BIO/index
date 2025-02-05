import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Subscription } from 'rxjs';

import { Response, Terminology } from '../interfaces/mapping';
import { environment } from '../../environments/environment';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-harmonize',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './harmonize.component.html',
  styleUrl: './harmonize.component.scss',
})
export class HarmonizeComponent implements OnDestroy, OnInit {
  @ViewChild('paginator') paginator!: MatPaginator;
  closestMappings: Response[] = [];
  dataSource = new MatTableDataSource<Response>([]);
  displayedColumns: string[] = [
    'similarity',
    'variable',
    'description',
    'conceptID',
    'prefLabel',
  ];
  embeddingModels: string[] = [];
  fileName: string = '';
  fileToUpload: File | null = null;
  formData = new FormData();
  harmonizeForm: FormGroup;
  loading: boolean = false;
  requiredFileType: string =
    '.csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  terminologies: string[] = [];
  private readonly API_URL = environment.openApiUrl;
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.harmonizeForm = this.fb.group({
      selectedTerminology: ['', Validators.required],
      selectedEmbeddingModel: ['', Validators.required],
      variableField: ['', Validators.required],
      descriptionField: ['', Validators.required],
      limit: [1],
    });
  }

  convertToCSV(data: Response[]): string {
    const headers = [
      'Similarity',
      'Variable',
      'Description',
      'ConceptID',
      'PrefLabel',
    ];

    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = data.map((item) =>
      [
        item.mappings[0].similarity,
        escapeCSV(item.variable),
        escapeCSV(item.description),
        escapeCSV(item.mappings[0].concept.id),
        escapeCSV(item.mappings[0].concept.name),
      ].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  async downloadTableAsCSV(): Promise<void> {
    const csvData = this.convertToCSV(this.closestMappings);
    const blob = new Blob([csvData], { type: 'text/csv' });

    // Extend TypeScript to recognize showSaveFilePicker
    if ('showSaveFilePicker' in window) {
      try {
        const saveFilePicker = window.showSaveFilePicker;
        if (typeof saveFilePicker === 'function') {
          const handle = await saveFilePicker({
            suggestedName: `kitsune-harmonization-${new Date().toISOString()}.csv`,
            types: [
              {
                description: 'CSV file',
                accept: { 'text/csv': ['.csv'] },
              },
            ],
          });

          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          return;
        }
      } catch (error) {
        console.error('File saving canceled or failed:', error);
      }
    }
  }

  fetchClosestMappings(): Subscription | undefined {
    if (!this.harmonizeForm.valid) {
      console.error('Form is invalid:', this.harmonizeForm.value);
      return;
    }

    this.loading = true;

    return this.http
      .post<Response[]>(`${this.API_URL}/mappings/dict`, this.formData, {
        headers: new HttpHeaders({ Accept: 'application/json' }),
      })
      .subscribe({
        next: (response) => {
          this.closestMappings = response;
          this.dataSource.data = response;
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

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileToUpload = input.files[0];
      this.fileName = this.fileToUpload.name;
      this.formData.set('file', this.fileToUpload);
    }
  }

  onSubmit(): void {
    if (this.harmonizeForm.valid) {
      const {
        variableField,
        descriptionField,
        selectedEmbeddingModel,
        selectedTerminology,
      } = this.harmonizeForm.value;

      this.formData.set('variable_field', variableField);
      this.formData.set('description_field', descriptionField);
      this.formData.set('model', selectedEmbeddingModel);
      this.formData.set('terminology_name', selectedTerminology);

      this.subscriptions.add(this.fetchClosestMappings());
    } else {
      console.error('Form is invalid:', this.harmonizeForm.value);
    }
  }
}
