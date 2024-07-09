import { Component } from '@angular/core';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  selector: 'app-embedding-plot',
  standalone: true,
  imports: [PlotlyModule],
  templateUrl: './embedding-plot.component.html',
  styleUrl: './embedding-plot.component.scss',
})
export class EmbeddingPlotComponent {
  public graph = {
    data: [
      {
        x: [1, 2, 3],
        y: [2, 6, 3],
        type: 'scatter',
        mode: 'lines+points',
        marker: { color: 'red' },
      },
      { x: [1, 2, 3], y: [2, 5, 3], type: 'bar' },
    ],
    layout: { width: 320, height: 240, title: 'A Fancy Plot' },
  };
}
