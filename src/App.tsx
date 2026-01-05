import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { UploadSection } from './components/UploadSection';
import { PortfolioView } from './components/PortfolioView';
import { Book, Cluster, SlotType } from './types';

interface PortfolioData {
  activeCluster: Cluster | null;
  slots: Record<SlotType, Book | null>;
  shortlist: Book[];
}

function App() {
  const [step, setStep] = useState<'upload' | 'portfolio'>('upload');
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadComplete = () => {
    // After upload, we immediately fetch the initial portfolio (no cluster selected yet)
    // But first we need to get the clusters that were detected during upload? 
    // Actually, the upload endpoint now returns clusters. We need to capture them.
    // The UploadSection component needs to pass data back.
    // Let's modify UploadSection to pass response data.
  };

  // We need to modify UploadSection to pass the data back
  const handleUploadSuccess = (data: { clusters: Cluster[] }) => {
    setClusters(data.clusters || []);
    // Auto-select the first cluster if available, or generate generic portfolio
    const initialCluster = (data.clusters && data.clusters.length > 0) ? data.clusters[0].name : null;
    fetchPortfolio(initialCluster);
  };

  const fetchPortfolio = async (clusterName: string | null) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster: clusterName }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Server Error Response:', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.details || errorData.error || 'Failed to generate portfolio');
        } catch (e) {
          throw new Error(`Server Error (${response.status}): ${text.slice(0, 100)}`);
        }
      }
      
      const data = await response.json();
      setPortfolio(data);
      setStep('portfolio');
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
          <UploadSection onUploadComplete={() => {}} onDataReceived={handleUploadSuccess} />
        )}
        
        {step === 'portfolio' && portfolio && (
          <PortfolioView 
            slots={portfolio.slots}
            activeCluster={portfolio.activeCluster}
            shortlist={portfolio.shortlist}
            clusters={clusters}
            onClusterSelect={fetchPortfolio}
          />
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-indigo-900 font-medium">Constructing Cognitive Portfolio...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
