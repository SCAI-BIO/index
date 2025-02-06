import { CommonModule } from '@angular/common';
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
import { RouterModule } from '@angular/router';

import { Subscription } from 'rxjs';

import { Response } from '../interfaces/mapping';
import { ApiService } from '../services/api.service';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-harmonize',
  standalone: true,
  imports: [
    CommonModule,
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
  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private fileService: FileService,
    private fb: FormBuilder
  ) {
    this.harmonizeForm = this.fb.group({
      selectedTerminology: ['', Validators.required],
      selectedEmbeddingModel: ['', Validators.required],
      variableField: ['', Validators.required],
      descriptionField: ['', Validators.required],
      limit: [1],
    });
  }

  downloadTableAsCSV(): void {
    this.fileService.downloadCSV(
      this.closestMappings,
      'kitsune-harmonization.csv'
    );
  }

  fetchClosestMappings(): void {
    if (!this.harmonizeForm.valid) {
      console.error('Form is invalid:', this.harmonizeForm.value);
      return;
    }

    this.loading = true;
    const sub = this.apiService
      .fetchClosestMappingsDictionary(this.formData)
      .subscribe({
        next: (responses) => {
          this.closestMappings = responses;
          this.dataSource.data = responses;
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
        complete: () => (this.loading = false),
      });
    this.subscriptions.push(sub);
  }

  fetchEmbeddingModels(): void {
    const sub = this.apiService.fetchEmbeddingModels().subscribe({
      next: (models) => {
        this.embeddingModels = models;
      },
      error: (err) => {
        console.error('Error fetching embedding models', err);
      },
    });
    this.subscriptions.push(sub);
  }

  fetchTerminologies(): void {
    const sub = this.apiService.fetchTerminologies().subscribe({
      next: (terminologies) => {
        this.terminologies = terminologies.map((t) => t.name);
      },
      error: (err) => {
        console.error('Error fetching terminologies', err);
      },
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.fetchTerminologies();
    this.fetchEmbeddingModels();
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

      this.fetchClosestMappings();
    } else {
      console.error('Form is invalid:', this.harmonizeForm.value);
    }
  }
}
