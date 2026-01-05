import Database from 'better-sqlite3';

const db = new Database('books.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT,
      author TEXT,
      average_rating REAL,
      num_pages INTEGER,
      publication_year INTEGER,
      bookshelves TEXT,
      user_rating REAL,
      date_added TEXT,
      binding TEXT,
      priority_score REAL
    )
  `);
}

export default db;
