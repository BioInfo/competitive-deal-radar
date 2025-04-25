export interface Deal {
  id: string;
  date: string;
  companyA: string;
  companyB: string;
  asset: string;
  modality: string;
  indication: string;
  stage: string;
  upfront: number;
  milestones: number;
  total: number;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  hq: string;
  focus: string[];
  description: string;
  website: string;
}

export interface Indication {
  id: string;
  name: string;
  fullName: string;
  category: string;
  prevalence: number;
}

export interface Modality {
  id: string;
  name: string;
  fullName: string;
  category: string;
  description: string;
}

export interface TimelineDataPoint {
  month: string;
  count: number;
}

export interface DealFilters {
  indication: string[];
  modality: string[];
  stage: string[];
  valueRange: [number, number];
  dateRange: [string, string];
  companies: string[];
}

export interface HeatmapCell {
  indication: string;
  modality: string;
  count: number;
}
