import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import Papa from 'papaparse';
import fs from 'fs';
import { initDb, default as db } from './src/db';
import { importBooks, getRecommendations } from './src/services/recommendationService';
import { RecommendationCriteria } from './src/types';

const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB
  initDb();

  app.use(express.json());

  // API Routes
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const fileContent = await fs.promises.readFile(req.file.path, 'utf8');

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const books = results.data.map((row: any) => ({
            id: row['Book Id'],
            title: row['Title'],
            author: row['Author'],
            average_rating: parseFloat(row['Average Rating']) || 0,
            num_pages: parseInt(row['Number of Pages']) || 0,
            publication_year: parseInt(row['Year Published']) || 0,
            bookshelves: row['Bookshelves'] || '',
            user_rating: parseFloat(row['My Rating']) || 0,
            date_added: row['Date Added'] || '',
            binding: row['Binding'] || ''
          })).filter((b: any) => b.id); // Ensure ID exists

          importBooks(books);

          // Clean up uploaded file
          await fs.promises.unlink(req.file!.path);

          res.json({ message: 'Import successful', count: books.length });
        },
        error: (error: any) => {
          res.status(500).json({ error: 'CSV parsing failed', details: error });
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: 'File processing failed', details: err.message });
    }
  });

  app.post('/api/recommend', (req, res) => {
    try {
      const criteria: RecommendationCriteria = req.body;
      const recommendations = getRecommendations(criteria);
      res.json(recommendations);
    } catch (error: any) {
      console.error('Recommendation Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Recommendation generation failed', details: errorMessage });
    }
  });

  app.post('/api/feedback', (req, res) => {
    try {
      const { bookId, rating } = req.body;
      if (!bookId || !['helpful', 'not_helpful'].includes(rating)) {
        return res.status(400).json({ error: 'Invalid feedback' });
      }

      const stmt = db.prepare('INSERT INTO feedback (book_id, rating) VALUES (@bookId, @rating)');
      stmt.run({ bookId, rating });

      res.json({ message: 'Feedback recorded' });
    } catch (error: any) {
      console.error('Feedback Error:', error);
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  });

  app.post('/api/export', (req, res) => {
    try {
      const { recommendedIds } = req.body; // Array of book IDs
      if (!recommendedIds || !Array.isArray(recommendedIds)) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      const books = db.prepare('SELECT * FROM books').all() as any[];

      // Generate CSV
      const csvRows = [
        ['Book Id', 'Title', 'Author', 'Bookshelves']
      ];

      books.forEach(book => {
        let shelves = book.bookshelves || '';
        if (recommendedIds.includes(book.id)) {
          // Check if already has the tag to avoid duplicates (though PRD implies just append)
          if (!shelves.includes('recommended-for-you')) {
             if (shelves) shelves += ', ';
             shelves += 'recommended-for-you';
          }
        }

        csvRows.push([
          book.id,
          `"${book.title.replace(/"/g, '""')}"`, // Escape quotes
          `"${book.author.replace(/"/g, '""')}"`,
          `"${shelves.replace(/"/g, '""')}"`
        ]);
      });

      const csvContent = csvRows.map(row => row.join(',')).join('\n');

      res.header('Content-Type', 'text/csv');
      res.attachment('goodreads_update.csv');
      res.send(csvContent);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Export failed' });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
