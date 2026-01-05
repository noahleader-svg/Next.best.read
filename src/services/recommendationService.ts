import { Book, RecommendationCriteria } from '../types';
import db from '../db';

export function calculatePriorityScore(book: Book, criteria: RecommendationCriteria): number {
  let score = 0;

  // 1. Genre Preference
  if (criteria.genre && book.bookshelves.toLowerCase().includes(criteria.genre.toLowerCase())) {
    score += criteria.weights.genre * 100;
  }

  // 2. Rating (0-5 scale, normalized to ~100)
  if (book.average_rating) {
    score += (book.average_rating / 5) * 100 * criteria.weights.rating;
  }

  // 3. Length Preference
  if (criteria.minLength && criteria.maxLength) {
    if (book.num_pages >= criteria.minLength && book.num_pages <= criteria.maxLength) {
      score += criteria.weights.length * 100;
    }
  } else if (criteria.maxLength && book.num_pages <= criteria.maxLength) {
      score += criteria.weights.length * 100;
  }

  // 4. Year Preference
  if (criteria.minYear && book.publication_year >= criteria.minYear) {
     score += criteria.weights.year * 100;
  }

  // 5. Recency (Boost recently added)
  try {
    const addedDate = new Date(book.date_added);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const recencyScore = Math.max(0, 100 - (diffDays / 365) * 100);
    score += recencyScore * criteria.weights.recency;
  } catch (e) {
    // Ignore invalid dates
  }

  return score;
}

export function getRecommendations(criteria: RecommendationCriteria): Book[] {
  const books = db.prepare('SELECT * FROM books').all() as Book[];

  const scoredBooks = books.map(book => ({
    ...book,
    priority_score: calculatePriorityScore(book, criteria)
  }));

  // Sort by score descending
  scoredBooks.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  return scoredBooks.slice(0, 5);
}

export function importBooks(books: any[]) {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO books (id, title, author, average_rating, num_pages, publication_year, bookshelves, user_rating, date_added, binding)
    VALUES (@id, @title, @author, @average_rating, @num_pages, @publication_year, @bookshelves, @user_rating, @date_added, @binding)
  `);

  const insertMany = db.transaction((books) => {
    for (const book of books) {
      insert.run(book);
    }
  });

  insertMany(books);
}
