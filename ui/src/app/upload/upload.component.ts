import { Component } from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatToolbar} from "@angular/material/toolbar";
import {OpenApiService} from "../services/open-api.service";

@Component({
  selector: 'app-upload',
  standalone: true,
    imports: [
        MatButton,
        MatFormField,
        MatInput,
        MatToolbar
    ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {

  constructor(private openApiService: OpenApiService) {
  }

  fileName = '';
  currentFile!: File;

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.currentFile = event.target.files[0];
      this.fileName = this.currentFile?.name || '';
    } else {
      this.fileName = 'Select File';
    }
  }

  uploadFile() {
    this.openApiService.upload(this.currentFile).subscribe();

  }

}
