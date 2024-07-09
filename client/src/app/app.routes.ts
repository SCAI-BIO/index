import { Routes } from '@angular/router';
import { MappingsComponent } from './mappings/mappings.component';
import { UploadComponent } from './upload/upload.component';
import { EmbeddingPlotComponent } from './embedding-plot/embedding-plot.component';
import { WelcomeComponent } from './welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
  },
  {
    path: 'mappings',
    component: MappingsComponent,
  },
  {
    path: 'upload',
    component: UploadComponent,
  },
  {
    path: 'embedding_plot',
    component: EmbeddingPlotComponent,
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
