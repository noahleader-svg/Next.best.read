import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import Papa from 'papaparse';
import fs from 'fs';
import { initDb, default as db } from './src/db';
import { importBooks, generatePortfolio, detectClusters } from './src/services/recommendationService';
import { Book } from './src/types';

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
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
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
        fs.unlinkSync(req.file!.path);
        
        res.json({ message: 'Import successful', count: books.length });
      },
      error: (error: any) => {
        res.status(500).json({ error: 'CSV parsing failed', details: error });
      }
    });
  });

  app.post('/api/generate-portfolio', (req, res) => {
    try {
      const { cluster } = req.body; // Optional cluster name
      const portfolio = generatePortfolio(cluster);
      res.json(portfolio);
    } catch (error: any) {
      console.error('Generate Portfolio Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'Portfolio generation failed', details: errorMessage });
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
      // We only need Book Id and Bookshelves for Goodreads update, but let's include Title/Author for clarity
      const csvRows = [
        ['Book Id', 'Title', 'Author', 'Bookshelves']
      ];

      books.forEach(book => {
        let shelves = book.bookshelves || '';
        if (recommendedIds.includes(book.id)) {
          if (shelves) shelves += ', ';
          shelves += 'recommended-for-you';
        }
        // Only include if modified? Or all? 
        // PRD says "export a CSV file... that adds a custom... shelf". 
        // Usually better to export only the changes or the whole library with changes.
        // Let's export only the recommended books to keep it small and focused, 
        // OR export the whole library if the user wants to update their whole backup.
        // The PRD says "The application will generate a CSV... It will take the original... and for the recommended books, it will append...".
        // This implies the full list.
        
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
