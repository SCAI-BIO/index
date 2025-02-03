export interface Terminology {
  readonly id: string;
  readonly name: string;
}

export interface Concept {
  readonly id: string;
  readonly name: string;
  readonly terminology: Terminology;
}

export interface Mapping {
  readonly concept: Concept;
  readonly text: string;
  readonly similarity: number;
}
