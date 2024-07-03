import { Routes } from '@angular/router';
import { MappingsComponent } from './mappings/mappings.component';

export const routes: Routes = [
  { path: 'mappings', component: MappingsComponent },
  { path: '**', redirectTo: '/mappings' },
];
