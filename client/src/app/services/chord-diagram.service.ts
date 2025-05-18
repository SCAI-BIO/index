import { Injectable } from '@angular/core';
import * as d3 from 'd3';

import { STUDY_COLORS } from '../constants/chord-colors';
import {
  ChordData,
  ChordLink,
  ChordNode,
  LabeledChordGroup,
} from '../interfaces/chord-diagram';

@Injectable({ providedIn: 'root' })
export class ChordDiagramService {
  dataChunks: ChordData[] = [];
  private colorScale: d3.ScaleOrdinal<string, string> = d3.scaleOrdinal();

  constructor() {
    this.setColors();
  }

  /**
   * Initializes the color scale using predefined study colors.
   */
  private setColors(): void {
    this.colorScale = d3
      .scaleOrdinal<string, string>()
      .domain(Object.keys(STUDY_COLORS))
      .range(Object.values(STUDY_COLORS));
  }

  /**
   * Returns the D3 color scale used for group coloring.
   */
  getColorScale(): d3.ScaleOrdinal<string, string> {
    return this.colorScale;
  }

  /**
   * Reinitializes the color scale domain based on the provided data.
   * @param data - The chord data containing nodes ith group identifiers.
   */
  initializeColorScale(data: ChordData): void {
    const allGroups = Array.from(
      new Set(data.nodes.map((node: ChordNode) => node.group))
    );
    this.colorScale.domain(allGroups);
  }

  /**
   * Splits a large chord dataset into smaller chunks.
   * @param data - Full chord data to be chunked.
   * @param chunkSize - Number of nodes per chunk.
   * @returns Array of ChordData chunks.
   */
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

  /**
   * Entry point for creating a chord diagram for a specific data chunk.
   * @param dataChunks - Array of ChordData chunks.
   * @param index - Index of the chunk to visualize.
   */
  createChordDiagrams(dataChunks: ChordData[], index: number): void {
    const chunk = dataChunks[index];
    this.createChordDiagram(chunk);
  }

  /**
   * Builds and renders the full chord diagram visualization.
   * @param data - The ChordData for the diagram.
   */
  private createChordDiagram(data: ChordData): void {
    const svgElement = d3.selectAll('.chord-diagram').node();
    const svg = d3.select(svgElement).select<SVGSVGElement>('svg');
    svg.selectAll('*').remove();

    const width = 800;
    const height = 800;
    const outerRadius = Math.min(width, height) * 0.4 - 100;
    const innerRadius = outerRadius - 0.1;

    const nodes = this.prepareNodes(data);
    const matrix = this.buildMatrix(nodes, data.links);
    const chords = d3.chord().padAngle(0.06).sortSubgroups(d3.descending)(
      matrix
    );

    const svgGroup = this.initSvgGroup(svg, width, height);

    const grouped = this.groupChordGroupsByName(chords.groups, nodes);
    this.drawGroupArcs(svgGroup, grouped, outerRadius);
    this.drawGroupLabels(svgGroup, grouped, outerRadius);
    this.drawNodeLabels(svgGroup, chords, nodes, outerRadius);
    this.drawRibbons(svgGroup, chords, innerRadius);
  }

  /**
   * Preprares node data by assigning unique IDs and sorting by group.
   * @param data - ChordData to extract and process nodes from.
   * @returns Sorted and ID-augmented node array.
   */
  private prepareNodes(data: ChordData): ChordNode[] {
    return data.nodes
      .map((node: ChordNode) => ({ ...node, id: `${node.name}_${node.group}` }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }

  /**
   * Builds the adjacency matrix used for chord layout calculations.
   * @param nodes - Array of nodes to include in the matrix.
   * @param links - Array of links defining relationships between nodes.
   * @returns 2D matrix of connection weights.
   */
  private buildMatrix(nodes: ChordNode[], links: ChordLink[]): number[][] {
    const nodeIndex = new Map(
      nodes.map((node: ChordNode, i: number) => [node.id, i])
    );
    const matrix = Array(nodes.length)
      .fill(0)
      .map(() => Array(nodes.length).fill(0));

    links.forEach((link) => {
      const sourceNodes = nodes.filter((n) => n.name === link.source);
      const targetNodes = nodes.filter((n) => n.name === link.target);

      sourceNodes.forEach((s) => {
        targetNodes.forEach((t) => {
          if (s.group !== t.group) {
            const i = nodeIndex.get(s.id!);
            const j = nodeIndex.get(t.id!);
            if (i !== undefined && j !== undefined) {
              matrix[i][j] = 1;
              matrix[j][i] = 1;
            }
          }
        });
      });
    });

    return matrix;
  }

  /**
   * Group chord diagram arcs by group name.
   * @param groups - Array of chord group segments.
   * @param nodes - Original node definitions used for group lookup.
   * @returns Grouped chord segments keyed by group.
   */
  private groupChordGroupsByName(
    groups: d3.ChordGroup[],
    nodes: ChordNode[]
  ): [string, d3.ChordGroup[]][] {
    return d3.groups(groups, (d) => nodes[d.index].group);
  }

  /**
   * Initializes and returns the root <g> element for the chord diagram SVG.
   * @param svg - D3 selection of the parent SVG element.
   * @param width - Width of the viewBox.
   * @param height - Height of the viewBox.
   * @returns D3 selection of the translated <g> group.
   */
  private initSvgGroup(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) {
    return svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width + 200} ${height + 200}`)
      .style('overflow', 'visible') // prevents clipping of filter effects
      .append('g')
      .attr(
        'transform',
        `translate(${(width + 200) / 2},${(height + 200) / 2})`
      );
  }

  /**
   * Draws outer arcs to visually group related node arcs.
   * @param svgGroup - D3 selection of the root SVG group.
   * @param grouped - Grouped chord segments.
   * @param outerRadius - Readius for drawing the outer group arcs.
   */
  private drawGroupArcs(
    svgGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    grouped: [string, d3.ChordGroup[]][],
    outerRadius: number
  ) {
    const arc = d3
      .arc<d3.ChordGroup>()
      .innerRadius(outerRadius + 5)
      .outerRadius(outerRadius + 30);

    svgGroup
      .append('g')
      .attr('class', 'group-highlight')
      .selectAll('path')
      .data(grouped)
      .enter()
      .append('path')
      .attr('d', ([, groupChords]) => {
        const startAngle = d3.min(groupChords, (d) => d.startAngle)!;
        const endAngle = d3.max(groupChords, (d) => d.endAngle)!;
        return arc({
          startAngle,
          endAngle,
          value: 1,
          index: 0,
        } as d3.ChordGroup)!;
      })
      .attr('fill', ([group]) => this.colorScale(group));
  }

  /**
   * Draws curved group labels along the outer arcs of the chord diagram.
   *
   * For each group of chord segments, this method generates a hidden SVG arc path
   * positioned just outside the outerRadius, and then renders the group name along
   * that path using <textPath>. The labels follow the curvature of the arc and
   * are centered within their respective group spans.
   *
   * @param svgGroup - The main SVG <g> container where the labels will be appended.
   * @param grouped - An array of tuples where each tuple contains a group name and the
   *                  corresponding chord group segments.
   * @param outerRadius - The base radius of the chord diagram used to position labels
   *                      slightly outside the outer arc.
   */
  private drawGroupLabels(
    svgGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    grouped: [string, d3.ChordGroup[]][],
    outerRadius: number
  ) {
    const groupLabels = svgGroup
      .append('g')
      .attr('class', 'group-labels')
      .selectAll('text')
      .data(grouped)
      .enter();

    // Create curved text paths for each group
    groupLabels
      .append('path')
      .attr('id', (d, i) => `groupLabelArc-${i}`)
      .attr('d', ([, groupChords]) => {
        const startAngle = d3.min(groupChords, (d) => d.startAngle)!;
        const endAngle = d3.max(groupChords, (d) => d.endAngle)!;
        const radius = outerRadius + 17.5; // Position in the middle of the arc (5px + 30px) / 2 + 5px

        // Generate an arc path for the text to follow
        const arcGenerator = d3
          .arc<null>()
          .innerRadius(radius)
          .outerRadius(radius)
          .startAngle(startAngle)
          .endAngle(endAngle);

        return arcGenerator(null)!;
      })
      .style('fill', 'none'); // Path should be invisible

    // Add text that follows the created path
    groupLabels
      .append('text')
      .attr('dy', '5px')
      .append('textPath')
      .attr('xlink:href', (d, i) => `#groupLabelArc-${i}`)
      .attr('startOffset', '25%') // Start text at 25% along the path
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', 'black')
      .text(([groupName]) => groupName);
  }

  /**
   * Draws node arc segments and their labels with hover interactivity.
   * @param svgGroup - D3 selection of the root SVG group.
   * @param chords - D3 chords containing groups and links.
   * @param nodes - Original node definitions.
   * @param outerRadius - Radius for drawing outer node arcs.
   */
  private drawNodeLabels(
    svgGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    chords: d3.Chords,
    nodes: ChordNode[],
    outerRadius: number
  ) {
    const arc = d3
      .arc<d3.ChordGroup>()
      .innerRadius(outerRadius - 0.1)
      .outerRadius(outerRadius);

    const group = svgGroup
      .append('g')
      .selectAll('g')
      .data(chords.groups)
      .enter()
      .append('g');

    group
      .append('path')
      .style('fill', '#e0e0e0')
      .style('stroke', '#bdbdbd')
      .attr('d', arc);

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
        translate(${outerRadius + 35})
        ${d.angle! > Math.PI ? 'rotate(180)' : ''}`
      )
      .style('text-anchor', (d: LabeledChordGroup) =>
        d.angle! > Math.PI ? 'end' : null
      )
      .style('font-size', '16px')
      .text((d: d3.ChordGroup) => nodes[d.index].name)
      .on('mouseover', function (event: MouseEvent, d: d3.ChordGroup) {
        const index = d.index;
        svgGroup
          .selectAll<SVGPathElement, d3.Chord>('path.ribbon')
          .filter(
            (r: d3.Chord) =>
              r.source.index === index || r.target.index === index
          )
          .transition()
          .duration(200)
          .style('fill', 'black')
          .style('stroke', 'black')
          .style('opacity', 0.8);
      })
      .on('mouseout', () => {
        svgGroup
          .selectAll<SVGPathElement, d3.Chord>('path.ribbon')
          .transition()
          .duration(200)
          .style('filter', null)
          .style('fill', '#0066cc')
          .style('stroke', 'white')
          .style('opacity', 0.9);
      });
  }

  /**
   * Draws the inner ribbons that represent connections between node arcs.
   * @param svgGroup - D3 selection of the root SVG group.
   * @param chords - D3 chords representing relationships.
   * @param innerRadius - Radius used for the ribbon path.
   */
  private drawRibbons(
    svgGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    chords: d3.Chords,
    innerRadius: number
  ) {
    const ribbon = d3.ribbon<unknown, d3.Chord>().radius(innerRadius);

    svgGroup
      .append('g')
      .attr('cursor', 'pointer')
      .selectAll<SVGPathElement, d3.Chord>('path')
      .data(chords)
      .enter()
      .append('path')
      .attr('class', 'ribbon')
      .style('filter', null)
      .attr('d', ribbon)
      .style('fill', '#0066cc')
      .style('stroke', 'white')
      .style('opacity', 0.9);
  }
}
