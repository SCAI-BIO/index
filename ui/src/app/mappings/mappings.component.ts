import { Component } from '@angular/core';
import { OpenApiService } from '../services/open-api.service';
import { Mapping } from '../models';
import { Observable } from 'rxjs';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { MappingsTableComponent } from '../mappings-table/mappings-table.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mappings',
  standalone: true,
  templateUrl: './mappings.component.html',
  styleUrl: './mappings.component.scss',
  imports: [
    AsyncPipe,
    JsonPipe,
    MappingsTableComponent,
    NgIf,
    ReactiveFormsModule,
    MatButtonModule,
  ],
})
export class MappingsComponent {
  mappings$!: Observable<Mapping[]>;
  displayedColumns: string[] = ['name'];

  form = new FormGroup({
    searchTerm: new FormControl(''),
    limit: new FormControl(1),
  });

  constructor(private openApiService: OpenApiService) {}

  formSubmit() {
    const searchTerm = this.form.value.searchTerm || '';
    const limit = this.form.value.limit || 1;
    this.mappings$ = this.openApiService.getMapping(searchTerm, limit);
  }
}
