import { useState, useEffect } from 'react';
import { Book } from '../types';

interface BookMetadata {
  cover_image?: string;
  description?: string;
}

const CACHE: Record<string, BookMetadata> = {};

export function useBookMetadata(book: Book | null) {
  const [metadata, setMetadata] = useState<BookMetadata | null>(null);

  useEffect(() => {
    if (!book) {
      setMetadata(null);
      return;
    }

    const cacheKey = `${book.title}-${book.author}`;
    if (CACHE[cacheKey]) {
      setMetadata(CACHE[cacheKey]);
      return;
    }

    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const query = `intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}`;
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
        const data = await res.json();

        if (data.items && data.items.length > 0) {
          const info = data.items[0].volumeInfo;
          const meta = {
            cover_image: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
            description: info.description
          };
          CACHE[cacheKey] = meta;
          if (isMounted) setMetadata(meta);
        }
      } catch (err) {
        console.error('Failed to fetch book metadata', err);
      }
    };

    fetchMetadata();

    return () => {
      isMounted = false;
    };
  }, [book]);

  return metadata;
}
