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
