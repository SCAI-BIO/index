export interface OLS {
  id: string;
  label: string;
  description?: string;
}

export interface OHDSI {
  id: string;
  label: string;
  domain: string;
}

export interface Study {
  name: string;
  variable: string;
  definition?: string;
}

export interface CoreModel {
  id: string;
  label: string;
  description: string;
  ols: OLS;
  ohdsi: OHDSI;
  studies: Study[];
}
