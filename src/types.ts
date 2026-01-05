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
  binding?: string;
  priority_score?: number;
}

export interface RecommendationCriteria {
  genre?: string;
  minLength?: number;
  maxLength?: number;
  minYear?: number;
  weights: {
    genre: number;
    rating: number;
    length: number;
    year: number;
    recency: number;
  };
}
