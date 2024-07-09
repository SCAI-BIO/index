export interface Mapping {
  concept: {
    id: string;
    name: string;
    terminology: {
      id: string;
      name: string;
    };
    text: string;
    similarity: number;
  };
}

export interface MappingDict {
  variable: string;
  description: string;
  mappings: Mapping[];
}

//['title', 'xaxis', 'yaxis', 'template']
export interface EmbeddingDataRow {
  x: number[];
  y: number[];
  type: string;
  mode?: string;
  marker?: { color: string };
}

export interface EmbeddingPlot {
  data: EmbeddingDataRow[];
  layout: any;
}
