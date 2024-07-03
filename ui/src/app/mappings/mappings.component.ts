import { Component } from '@angular/core';
import { OpenApiService } from '../services/open-api.service';
import { Mapping } from '../models';
import { Observable } from 'rxjs';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-mappings',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  templateUrl: './mappings.component.html',
  styleUrl: './mappings.component.scss',
})
export class MappingsComponent {
  mappings$!: Observable<Mapping[]>;

  constructor(private openApiService: OpenApiService) {
    this.mappings$ = this.openApiService.getMapping('cold');
  }
}
