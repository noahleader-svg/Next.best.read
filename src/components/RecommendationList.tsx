import React, { useState } from 'react';
import { Book } from '../types';
import { Star, Calendar, BookOpen, Download, RefreshCw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useBookMetadata } from '../hooks/useBookMetadata';

interface RecommendationListProps {
  books: Book[];
  onReset: () => void;
}

const BookCard: React.FC<{ book: Book; index: number }> = ({ book, index }) => {
  const metadata = useBookMetadata(book);
  const [feedbackState, setFeedbackState] = useState<'none' | 'helpful' | 'not_helpful'>('none');

  const handleFeedback = async (rating: 'helpful' | 'not_helpful') => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, rating }),
      });
      setFeedbackState(rating);
    } catch (err) {
      console.error('Failed to send feedback', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
    >
      <div className="flex-shrink-0 w-full md:w-32 h-48 bg-gray-100 rounded-lg overflow-hidden relative">
         {metadata?.cover_image ? (
            <img src={metadata.cover_image} alt="" className="w-full h-full object-cover" />
         ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
                <BookOpen size={32} />
            </div>
         )}
         <div className="absolute top-2 left-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
            {index + 1}
         </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h3>
        <p className="text-lg text-gray-600 mb-3">{book.author}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span>{book.average_rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={16} />
            <span>{book.num_pages} pages</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{book.publication_year}</span>
          </div>
        </div>

        <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
                {metadata?.description || "No description available."}
            </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
            {book.bookshelves.split(',').slice(0, 3).map(shelf => (
                <span key={shelf} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                    {shelf.trim()}
                </span>
            ))}
        </div>

        {/* Feedback Buttons */}
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium uppercase">Was this helpful?</span>
            <button
                onClick={() => handleFeedback('helpful')}
                disabled={feedbackState !== 'none'}
                className={`p-1.5 rounded-full transition-colors ${
                    feedbackState === 'helpful' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
            >
                {feedbackState === 'helpful' ? <Check size={16} /> : <ThumbsUp size={16} />}
            </button>
             <button
                onClick={() => handleFeedback('not_helpful')}
                disabled={feedbackState !== 'none'}
                className={`p-1.5 rounded-full transition-colors ${
                    feedbackState === 'not_helpful' ? 'bg-red-100 text-red-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
            >
                <ThumbsDown size={16} />
            </button>
        </div>
      </div>

      <div className="flex flex-col justify-center items-end min-w-[100px]">
         <div className="text-indigo-600 font-bold text-2xl mb-1">
            {Math.round(book.priority_score || 0)}
         </div>
         <div className="text-xs text-gray-400 uppercase tracking-wide">Score</div>
      </div>
    </motion.div>
  );
};

export const RecommendationList: React.FC<RecommendationListProps> = ({ books, onReset }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const recommendedIds = books.map(b => b.id);
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendedIds }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'next-best-read-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
      alert('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Next Best Reads</h2>
            <p className="text-gray-500">Based on your criteria and library.</p>
        </div>
        <div className="flex gap-3">
             <button
                onClick={onReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
                Start Over
            </button>
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
                {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                Export to Goodreads
            </button>
        </div>
      </div>

      <div className="space-y-6">
        {books.map((book, index) => (
          <BookCard key={book.id} book={book} index={index} />
        ))}
      </div>
    </div>
  );
};
