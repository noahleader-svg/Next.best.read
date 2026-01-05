import db, { initDb } from './src/db';
import { importBooks, generatePortfolio, detectClusters } from './src/services/recommendationService';

console.log('--- Starting Test ---');

try {
  console.log('1. Initializing DB...');
  initDb();
  console.log('DB Initialized.');

  console.log('2. Importing Mock Books...');
  const mockBooks = [
    {
      id: '1',
      title: 'Heavy Book',
      author: 'Smart Guy',
      average_rating: 4.5,
      num_pages: 500,
      publication_year: 2020,
      bookshelves: 'non-fiction, history',
      user_rating: 0,
      date_added: '2023/01/01',
      binding: 'Hardcover'
    },
    {
      id: '2',
      title: 'Fun Book',
      author: 'Fun Guy',
      average_rating: 4.8,
      num_pages: 300,
      publication_year: 2021,
      bookshelves: 'fiction, sci-fi',
      user_rating: 0,
      date_added: '2023/01/02',
      binding: 'Kindle Edition'
    }
  ];
  
  importBooks(mockBooks);
  console.log('Books Imported.');

  console.log('3. Verifying DB Content...');
  const rows = db.prepare('SELECT * FROM books').all();
  console.log('Rows in DB:', rows.length);
  console.log('First row:', rows[0]);

  console.log('4. Detecting Clusters...');
  const clusters = detectClusters(mockBooks as any);
  console.log('Clusters:', clusters);

  console.log('5. Generating Portfolio...');
  const portfolio = generatePortfolio(null);
  console.log('Portfolio generated:', JSON.stringify(portfolio, null, 2));

  console.log('--- Test Passed ---');
} catch (error: any) {
  console.error('--- Test Failed ---');
  console.error(error);
}
