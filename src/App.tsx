import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { UploadSection } from './components/UploadSection';
import { PreferencesForm } from './components/PreferencesForm';
import { RecommendationList } from './components/RecommendationList';
import { Book, RecommendationCriteria } from './types';

function App() {
  const [step, setStep] = useState<'upload' | 'preferences' | 'recommendations'>('upload');
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadComplete = () => {
    setStep('preferences');
  };

  const handleGenerateRecommendations = async (criteria: RecommendationCriteria) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server Error Response:', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.details || errorData.error || 'Failed to generate recommendations');
        } catch (e) {
          throw new Error(`Server Error (${response.status}): ${text.slice(0, 100)}`);
        }
      }

      const data = await response.json();
      setRecommendations(data);
      setStep('recommendations');
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Hero />

        {step === 'upload' && (
          <UploadSection onUploadComplete={handleUploadComplete} />
        )}

        {step === 'preferences' && (
          <PreferencesForm onGenerate={handleGenerateRecommendations} isLoading={isLoading} />
        )}

        {step === 'recommendations' && (
          <RecommendationList
            books={recommendations}
            onReset={() => setStep('preferences')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
