export interface StatDefinition {
  id: string;
  label: string;
  category?: string;
  format?: 'number' | 'currency' | 'slider';
}

export interface Country {
  id: string;
  name: string;
  flagCode: string; // ISO 2-letter code for flag api
  score: number; // Manual points set by admin (Higher is better)
  rank: number; // Manual or derived
  description: string;
  stats: Record<string, number>; // Dynamic key-value pairs
  isGenerated?: boolean;
}

export interface Aircraft {
  id: string;
  name: string;
  image?: string; // Optional URL or placeholder
  origin: string; // Country of origin
  score: number;
  rank: number;
  description: string;
  stats: Record<string, number>;
  isGenerated?: boolean;
}

export enum AppView {
  RANKINGS = 'RANKINGS',
  DETAIL = 'DETAIL',
  COMPARE = 'COMPARE',
  ADMIN = 'ADMIN',
  AIRCRAFT_RANKINGS = 'AIRCRAFT_RANKINGS',
  AIRCRAFT_DETAIL = 'AIRCRAFT_DETAIL'
}

export interface ComparisonResult {
  analysis: string;
  winnerPrediction: string;
  keyFactors: string[];
}