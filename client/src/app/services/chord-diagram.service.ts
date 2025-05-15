import { Injectable } from '@angular/core';

import * as d3 from 'd3';

import {
  ChordData,
  ChordLink,
  ChordNode,
  LabeledChordGroup,
} from '../interfaces/chord-diagram';

@Injectable({
  providedIn: 'root',
})
export class ChordDiagramService {
  dataChunks: ChordData[] = [];
  private colorScale: d3.ScaleOrdinal<string, string>;

  constructor() {
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  }

  // Chunk the data into smaller parts for easier processing
  chunkData(data: ChordData, chunkSize: number): ChordData[] {
    const chunks: ChordData[] = [];
    for (let i = 0; i < data.nodes.length; i += chunkSize) {
      chunks.push({
        nodes: data.nodes.slice(i, i + chunkSize),
        links: data.links.filter((link: ChordLink) =>
          data.nodes
            .slice(i, i + chunkSize)
            .some(
              (node: ChordNode) =>
                node.name === link.source || node.name === link.target
            )
        ),
      });
    }
    this.dataChunks = chunks;
    return chunks;
  }

  // Create chord diagrams for each chunk of data
  createChordDiagrams(dataChunks: ChordData[], index: number): void {
    const chunk = dataChunks[index];
    this.createChordDiagram(chunk, 0);
  }

  setColors(): void {
    const studyColors = {
      CDM: '#d62728',
      OLS: '#1f77b4',
      OHDSI: '#ff7f0e',
      Study1: '#2ca02c',
      Study2: '#9467bd',
    };
    const colors = Object.fromEntries(
      Object.entries(studyColors).map(([key, value]) => [key, value])
    );

    this.colorScale = d3
      .scaleOrdinal<string, string>()
      .domain(Object.keys(colors))
      .range(Object.values(colors));
  }

  getColorScale(): d3.ScaleOrdinal<string, string> {
    return this.colorScale;
  }

  initializeColorScale(data: ChordData): void {
    const allGroups = Array.from(
      new Set(data.nodes.map((node: ChordNode) => node.group))
    );
    this.colorScale.domain(allGroups);
  }

  // Create a single chord diagram for a given chunk of data
  private createChordDiagram(data: ChordData, index: number): void {
    const svgElement = d3.selectAll('.chord-diagram').nodes()[index];
    const svg = d3.select(svgElement).select('svg');
    svg.selectAll('*').remove();

    const width = 800;
    const height = 800;
    const outerRadius = Math.min(width, height) * 0.4 - 100;
    const innerRadius = outerRadius - 30;

    let nodes: ChordNode[] = data.nodes.map((node: ChordNode) => ({
      ...node,
      id: `${node.name}_${node.group}`,
    }));
    const links: ChordLink[] = data.links;

    nodes = nodes.sort((a, b) => a.group.localeCompare(b.group));

    const nodeIndex = new Map(
      nodes.map((node: ChordNode, i: number) => [node.id, i])
    );

    const matrix = Array(nodes.length)
      .fill(0)
      .map(() => Array(nodes.length).fill(0));

    links.forEach((link: ChordLink) => {
      const sourceNodes = nodes.filter(
        (node: ChordNode) => node.name === link.source
      );
      const targetNodes = nodes.filter(
        (node: ChordNode) => node.name === link.target
      );

      sourceNodes.forEach((sourceNode) => {
        targetNodes.forEach((targetNode) => {
          if (sourceNode.group !== targetNode.group) {
            const sourceIndex = nodeIndex.get(sourceNode.id!);
            const targetIndex = nodeIndex.get(targetNode.id!);
            if (sourceIndex !== undefined && targetIndex !== undefined) {
              matrix[sourceIndex][targetIndex] = 1;
              matrix[targetIndex][sourceIndex] = 1;
            }
          }
        });
      });
    });

    const chord = d3.chord().padAngle(0.06).sortSubgroups(d3.descending);
    const chords = chord(matrix);

    const arc = d3
      .arc<d3.ChordGroup>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);
    const ribbon = d3.ribbon<unknown, d3.Chord>().radius(innerRadius);

    const svgGroup = svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width + 200} ${height + 200}`)
      .append('g')
      .attr(
        'transform',
        `translate(${(width + 200) / 2},${(height + 200) / 2})`
      );

    const group = svgGroup
      .append('g')
      .selectAll('g')
      .data(chords.groups)
      .enter()
      .append('g');

    group
      .append('path')
      .style('fill', (d: d3.ChordGroup) => {
        const feature = nodes[d.index];
        return this.colorScale(feature.group);
      })
      .style('stroke', (d: d3.ChordGroup) => {
        const feature = nodes[d.index];
        return d3.rgb(this.colorScale(feature.group)).darker().toString();
      })
      .attr('d', (d) => arc(d)!);

    group
      .append('text')
      .each((d: LabeledChordGroup) => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr('dy', '.35em')
      .attr(
        'transform',
        (d: LabeledChordGroup) => `
                rotate(${(d.angle! * 180) / Math.PI - 90})
                translate(${outerRadius + 20})
                ${d.angle! > Math.PI ? 'rotate(180)' : ''}
            `
      )
      .style('text-anchor', (d: LabeledChordGroup) =>
        d.angle! > Math.PI ? 'end' : null
      )
      .style('font-size', '16px')
      .text((d: d3.ChordGroup) => nodes[d.index].name)
      .on('mouseover', function (event: MouseEvent, d: d3.ChordGroup) {
        const index = d.index;
        svgGroup
          .selectAll<SVGPathElement, d3.Chord>('.ribbon')
          .filter(
            (r: d3.Chord) =>
              r.source.index === index || r.target.index === index
          )
          .style('fill', 'black')
          .style('stroke', 'black');
      })
      .on('mouseout', () => {
        svgGroup
          .selectAll('.ribbon')
          .style('fill', 'skyblue')
          .style('stroke', 'skyblue');
      });

    svgGroup
      .append('g')
      .attr('fill-opacity', 0.75)
      .attr('stroke-opacity', 0.75)
      .attr('cursor', 'pointer')
      .selectAll<SVGPathElement, d3.Chord>('path')
      .data(chords)
      .enter()
      .append('path')
      .attr('class', 'ribbon')
      .attr('d', (d) => ribbon(d)!);

    const existingGroups = Array.from(
      new Set(nodes.map((node) => node.group))
    ).sort();

    d3.select(svgElement).selectAll('.legend').remove();

    const legend = d3.select(svgElement).append('div').attr('class', 'legend');

    existingGroups.forEach((group) => {
      const legendRow = legend.append('div').attr('class', 'legend-row');

      legendRow
        .append('div')
        .attr('class', 'legend-color')
        .style('background-color', this.colorScale(group));

      legendRow.append('div').attr('class', 'legend-text').text(group);
    });
  }
}
