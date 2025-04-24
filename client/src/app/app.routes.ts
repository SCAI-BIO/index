import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { QueryComponent } from './query/query.component';
import { HarmonizeComponent } from './harmonize/harmonize.component';
import { TsneComponent } from './tsne/tsne.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'query',
    component: QueryComponent,
  },
  {
    path: 'harmonize',
    component: HarmonizeComponent,
  },
  {
    path: 't-sne',
    component: TsneComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
