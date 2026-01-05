import React from 'react';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center py-20 px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-indigo-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-200"
      >
        <BookOpen size={48} className="text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight"
      >
        Next Best <span className="text-indigo-600">Read</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
      >
        Conquer your "want to read" list. Our intelligent engine analyzes your Goodreads library to find the perfect book for your current mood.
      </motion.p>
    </div>
  );
};
