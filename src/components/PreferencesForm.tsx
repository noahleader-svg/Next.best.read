import React, { useState } from 'react';
import { RecommendationCriteria } from '../types';
import { Sliders, Check, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PreferencesFormProps {
  onGenerate: (criteria: RecommendationCriteria) => void;
  isLoading: boolean;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ onGenerate, isLoading }) => {
  const [criteria, setCriteria] = useState<RecommendationCriteria>({
    weights: {
      genre: 1,
      rating: 1,
      length: 1,
      year: 1,
      recency: 1
    }
  });

  const handleChange = (field: keyof RecommendationCriteria, value: any) => {
    setCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handleWeightChange = (field: keyof RecommendationCriteria['weights'], value: number) => {
      setCriteria(prev => ({
          ...prev,
          weights: {
              ...prev.weights,
              [field]: value
          }
      }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
          <Sliders size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customize Your Recommendations</h2>
          <p className="text-gray-500">Tell us what you're in the mood for.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Genre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Genre (Optional)</label>
          <input
            type="text"
            className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            placeholder="e.g., Sci-Fi, History, Thriller"
            value={criteria.genre || ''}
            onChange={(e) => handleChange('genre', e.target.value)}
          />
        </div>

        {/* Length Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Pages</label>
            <input
              type="number"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="0"
              value={criteria.minLength || ''}
              onChange={(e) => handleChange('minLength', parseInt(e.target.value) || undefined)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Pages</label>
            <input
              type="number"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="Any"
              value={criteria.maxLength || ''}
              onChange={(e) => handleChange('maxLength', parseInt(e.target.value) || undefined)}
            />
          </div>
        </div>

        {/* Year */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Published After (Year)</label>
             <input
              type="number"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="e.g. 2000"
              value={criteria.minYear || ''}
              onChange={(e) => handleChange('minYear', parseInt(e.target.value) || undefined)}
            />
        </div>

         {/* Weights (Simple Sliders) */}
         <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4">Priority Weights</h3>
            <div className="space-y-4">
                {Object.entries(criteria.weights).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-4">
                        <span className="w-24 text-sm font-medium text-gray-600 capitalize">{key}</span>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="1"
                            value={val}
                            onChange={(e) => handleWeightChange(key as any, parseInt(e.target.value))}
                            className="flex-grow accent-indigo-600"
                        />
                        <span className="w-8 text-right text-sm text-gray-500">{val}</span>
                    </div>
                ))}
            </div>
         </div>

        <button
          onClick={() => onGenerate(criteria)}
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            'Analyzing Library...'
          ) : (
            <>
              Find Next Best Read <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
