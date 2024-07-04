import { Routes } from '@angular/router';
import {MappingsComponent} from "./mappings/mappings.component";
import {UploadComponent} from "./upload/upload.component";

export const routes: Routes = [
  {
    path: 'mappings', component: MappingsComponent
  },
  {
    path: 'upload', component: UploadComponent
  },
  {
    path: '**', redirectTo: '/mappings'
  }
];
