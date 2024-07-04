import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatToolbar } from '@angular/material/toolbar';
import { OpenApiService } from '../services/open-api.service';
import { MappingDict } from '../models';
import { Observable, catchError, tap } from 'rxjs';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { MappingsTableComponentDict } from '../mappings-table-dict/mappings-table-dict.component';
import {
  MatProgressSpinner,
  ProgressSpinnerMode,
} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
  imports: [
    MatButton,
    MatFormField,
    MatInput,
    MatToolbar,
    AsyncPipe,
    JsonPipe,
    MappingsTableComponentDict,
    NgIf,
    MatProgressSpinner,
  ],
})
export class UploadComponent {
  constructor(private openApiService: OpenApiService) {}

  fileName = '';
  currentFile!: File;
  mapping_dict$!: Observable<MappingDict[]>;
  isLoadingData = false;
  uploadError: { error: { detail: string } } | undefined = undefined;

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.currentFile = event.target.files[0];
      this.fileName = this.currentFile?.name || '';
    } else {
      this.fileName = 'Select File';
    }
  }

  uploadFile() {
    this.uploadError = undefined;
    this.isLoadingData = true;
    this.mapping_dict$ = this.openApiService.upload(this.currentFile).pipe(
      tap(() => (this.isLoadingData = false)),
      catchError((err) => {
        this.uploadError = err;
        this.isLoadingData = false;
        return [];
      })
    );
  }
}
