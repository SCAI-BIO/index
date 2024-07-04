import { Component } from '@angular/core';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { OpenApiService } from '../services/open-api.service';
import { Observable, map } from 'rxjs';
import { EmbeddingPlot } from '../models';
import { AsyncPipe, JsonPipe } from '@angular/common';

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  selector: 'app-embedding-plot',
  standalone: true,
  imports: [PlotlyModule, JsonPipe, AsyncPipe],
  templateUrl: './embedding-plot.component.html',
  styleUrl: './embedding-plot.component.scss',
})
export class EmbeddingPlotComponent {
  data$!: Observable<EmbeddingPlot>;

  constructor(private service: OpenApiService) {
    this.data$ = service.getEmbedding().pipe(
      map((ret) => ({
        data: ret.data,
        layout: ret.layout,
      }))
    );
  }

  // public graph = {
  //   data: [
  //     {
  //       x: [1, 2, 3],
  //       y: [2, 6, 3],
  //       type: 'scatter',
  //       mode: 'lines+points',
  //       marker: { color: 'red' },
  //     },
  //     { x: [1, 2, 3], y: [2, 5, 3], type: 'bar' },
  //   ],
  //   layout: { width: 320, height: 240, title: 'A Fancy Plot' },
  // };
}
