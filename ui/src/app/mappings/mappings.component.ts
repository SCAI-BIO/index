import { Component } from '@angular/core';
import {OpenApiService} from "../services/open-api.service";
import {Observable} from "rxjs";
import {Mapping} from "../models";

@Component({
  selector: 'app-mappings',
  standalone: true,
  imports: [],
  templateUrl: './mappings.component.html',
  styleUrl: './mappings.component.scss'
})
export class MappingsComponent {

  mappings$!: Observable<Mapping[]>;

   constructor(private openApiService: OpenApiService) {
     this.openApiService.getMappings('cold')
       .subscribe((mappings: Mapping[]) => {
       console.log(mappings);
     });
   }
}
