export interface Book {
  id: string;
  title: string;
  author: string;
  average_rating: number;
  num_pages: number;
  publication_year: number;
  bookshelves: string;
  user_rating: number;
  date_added: string;
  binding?: string; // Important for Audio Track / Kindle slots
  priority_score?: number;
}

export type SlotType = 
  | 'deep-anchor' 
  | 'narrative-engine' 
  | 'satellite' 
  | 'audio-track' 
  | 'wildcard' 
  | 'slow-burn';

export interface SlotDefinition {
  id: SlotType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Cluster {
  name: string;
  type: 'author' | 'shelf' | 'manual';
  bookIds: string[];
  score: number; // Relevance/Size
}

export interface PortfolioState {
  activeCluster: Cluster | null;
  slots: Record<SlotType, Book | null>;
  shortlist: Book[]; // The "Sprint Backlog"
}
