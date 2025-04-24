import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { forkJoin, Subscription } from 'rxjs';

import { Mapping, Response } from '../interfaces/mapping';
import { ApiService } from '../services/api.service';
import { FileService } from '../services/file.service';
import { TopMatchesDialogComponent } from '../top-matches-dialog/top-matches-dialog.component';

@Component({
  selector: 'app-harmonize',
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  closestMappings: Response[] = [];
  dataSource = new MatTableDataSource<Response>([]);
  displayedColumns: string[] = [
    'similarity',
    'variable',
    'description',
    'conceptID',
    'prefLabel',
    'actions',
  ];
  embeddingModels: string[] = [];
  fileName = '';
  fileToUpload: File | null = null;
  harmonizeFormData = new FormData();
  harmonizeForm: FormGroup;
  loading = false;
  requiredFileType =
    '.csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  terminologies: string[] = [];
  topMatches: Mapping[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private fileService: FileService,
    private fb: FormBuilder,
    private dialog: MatDialog
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
      .fetchClosestMappingsDictionary(this.harmonizeFormData)
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

  fetchTopMatches(description: string, row: Response): void {
    const { selectedEmbeddingModel, selectedTerminology } =
      this.harmonizeForm.value;
    const queryFormData = new FormData();
    queryFormData.set('text', description);
    queryFormData.set('model', selectedEmbeddingModel);
    queryFormData.set('terminology_name', selectedTerminology);
    queryFormData.set('limit', '10');

    this.loading = true;
    const sub = this.apiService
      .fetchClosestMappingsQuery(queryFormData)
      .subscribe({
        next: (mappings) => {
          const dialogRef = this.dialog.open(TopMatchesDialogComponent, {
            width: '1000px',
            data: { matches: mappings, variable: row.variable },
          });

          dialogRef.afterClosed().subscribe((selectedMapping: Mapping) => {
            if (selectedMapping) {
              row.mappings[0] = selectedMapping;
              this.dataSource.data = [...this.closestMappings];
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
        complete: () => (this.loading = false),
      });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loading = true;

    const sub = forkJoin({
      terminologies: this.apiService.fetchTerminologies(),
      models: this.apiService.fetchEmbeddingModels(),
    }).subscribe({
      next: ({ terminologies, models }) => {
        this.terminologies = terminologies.map((t) => t.name);
        this.embeddingModels = models;
      },
      error: (err) => {
        console.error('Error loading data', err);
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
    this.subscriptions.push(sub);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileToUpload = input.files[0];
      this.fileName = this.fileToUpload.name;
      this.harmonizeFormData.set('file', this.fileToUpload);
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

      this.harmonizeFormData.set('variable_field', variableField);
      this.harmonizeFormData.set('description_field', descriptionField);
      this.harmonizeFormData.set('model', selectedEmbeddingModel);
      this.harmonizeFormData.set('terminology_name', selectedTerminology);

      this.fetchClosestMappings();
    } else {
      console.error('Form is invalid:', this.harmonizeForm.value);
    }
  }
}
