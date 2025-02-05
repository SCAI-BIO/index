import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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

import { Mapping } from '../interfaces/mapping';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-query',
  standalone: true,
  imports: [
    CommonModule,
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
export class QueryComponent implements OnInit {
  @ViewChild('paginator') paginator!: MatPaginator;
  closestMappings: Mapping[] = [];
  dataSource = new MatTableDataSource<Mapping>([]);
  displayedColumns = ['similarity', 'conceptName', 'conceptID', 'terminology'];
  embeddingModels: string[] = [];
  formData = new FormData();
  loading: boolean = false;
  queryForm: FormGroup;
  terminologies: string[] = [];

  constructor(private apiService: ApiService, private fb: FormBuilder) {
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
    this.apiService.fetchClosestMappingsQuery(this.formData).subscribe({
      next: (mappings) => {
        this.closestMappings = mappings;
        this.dataSource.data = mappings;
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
  }

  fetchEmbeddingModels(): void {
    this.apiService.fetchEmbeddingModels().subscribe({
      next: (models) => {
        this.embeddingModels = models;
      },
      error: (err) => {
        console.error('Error fetching closest mappings', err);
        this.loading = false;
        const errorMessage =
          err.error?.message || err.message || 'Unknown error occurred';
        alert(`An error occurred while fetching mappings: ${errorMessage}`);
      },
    });
  }

  fetchTerminologies(): void {
    this.apiService.fetchTerminologies().subscribe({
      next: (terminologies) => {
        this.terminologies = terminologies.map((t) => t.name);
      },
    });
  }

  ngOnInit(): void {
    this.fetchTerminologies();
    this.fetchEmbeddingModels();
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
