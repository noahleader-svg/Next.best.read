import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Book, Cluster, SlotType, SlotDefinition } from '../types';
import { Anchor, Zap, Globe, Headphones, Sparkles, Coffee, RefreshCw, Download, CheckCircle } from 'lucide-react';
import { useBookMetadata } from '../hooks/useBookMetadata';

interface PortfolioViewProps {
  slots: Record<SlotType, Book | null>;
  activeCluster: Cluster | null;
  shortlist: Book[];
  clusters: Cluster[];
  onClusterSelect: (clusterName: string) => void;
}

// ... (SLOT_DEFINITIONS remain the same)
const SLOT_DEFINITIONS: Record<SlotType, SlotDefinition> = {
  'deep-anchor': {
    id: 'deep-anchor',
    name: 'Deep Anchor',
    description: 'Heavy Non-Fiction. The core learning project.',
    icon: 'Anchor',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  'narrative-engine': {
    id: 'narrative-engine',
    name: 'Narrative Engine',
    description: 'High-momentum Fiction. The reward.',
    icon: 'Zap',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  'satellite': {
    id: 'satellite',
    name: 'The Satellite',
    description: 'Contextual Non-Fiction. Supports the Anchor.',
    icon: 'Globe',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200'
  },
  'audio-track': {
    id: 'audio-track',
    name: 'Audio Track',
    description: 'Biography or Narrative NF. For chores/commute.',
    icon: 'Headphones',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  'wildcard': {
    id: 'wildcard',
    name: 'The Wildcard',
    description: 'Serendipity, Poetry, or Short. High variance.',
    icon: 'Sparkles',
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  },
  'slow-burn': {
    id: 'slow-burn',
    name: 'The Slow Burn',
    description: 'Classic or Foundational. Small daily increments.',
    icon: 'Coffee',
    color: 'bg-stone-100 text-stone-700 border-stone-200'
  }
};

const IconMap: Record<string, React.ElementType> = {
  Anchor, Zap, Globe, Headphones, Sparkles, Coffee
};

const SlotCard: React.FC<{ slotKey: SlotType; book: Book | null }> = ({ slotKey, book }) => {
  const def = SLOT_DEFINITIONS[slotKey];
  const Icon = IconMap[def.icon];
  const metadata = useBookMetadata(book);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-3xl p-6 border-2 flex flex-col h-full ${def.color.replace('bg-', 'border-').replace('100', '100')} bg-white overflow-hidden group`}
    >
      <div className={`absolute top-4 right-4 p-2 rounded-xl ${def.color} z-10`}>
        <Icon size={20} />
      </div>
      
      <div className="mb-4 pr-10 relative z-10">
        <h3 className="text-lg font-bold text-gray-900">{def.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{def.description}</p>
      </div>

      {book ? (
        <div className="mt-auto bg-gray-50 rounded-xl p-4 border border-gray-100 relative overflow-hidden">
           {metadata?.cover_image && (
            <div className="absolute right-0 top-0 h-full w-24 opacity-20 transform translate-x-4 skew-x-12 pointer-events-none">
              <img src={metadata.cover_image} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          
          <div className="relative z-10">
            <h4 className="font-bold text-gray-800 line-clamp-2 mb-1">{book.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{book.author}</p>
            <div className="flex gap-2 text-xs text-gray-400 mb-2">
              <span>{book.publication_year}</span>
              <span>•</span>
              <span>{book.num_pages} pages</span>
            </div>
            {metadata?.description && (
              <p className="text-xs text-gray-500 line-clamp-3 italic">
                {metadata.description}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-auto border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400">
          <span className="text-sm">No suitable candidate found</span>
        </div>
      )}
    </motion.div>
  );
};

export const PortfolioView: React.FC<PortfolioViewProps> = ({ slots, activeCluster, shortlist, clusters, onClusterSelect }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const activeStackIds = Object.values(slots).filter(b => b).map(b => b!.id);
      const shortlistIds = shortlist.map(b => b.id);

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeStackIds, shortlistIds }),
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cognitive-portfolio-export.csv';
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
    <div className="max-w-6xl mx-auto py-12 px-4">
      
      {/* Header & Cluster Selection */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cognitive Portfolio</h2>
        <p className="text-gray-500 max-w-2xl mx-auto mb-8">
          A balanced investment strategy for your attention. 
          {activeCluster ? (
            <span className="block mt-2 font-semibold text-indigo-600 bg-indigo-50 py-1 px-3 rounded-full inline-block">
              Active Cluster: {activeCluster.name}
            </span>
          ) : (
            <span className="block mt-2 text-gray-400">No active cluster selected</span>
          )}
        </p>

        {clusters.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {clusters.map((cluster) => (
              <button
                key={cluster.name}
                onClick={() => onClusterSelect(cluster.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCluster?.name === cluster.name
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {cluster.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {(Object.keys(SLOT_DEFINITIONS) as SlotType[]).map((slotKey, index) => (
           <SlotCard key={slotKey} slotKey={slotKey} book={slots[slotKey]} />
        ))}
      </div>

      {/* Shortlist & Actions */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Sprint Backlog</h3>
            <p className="text-gray-500">Next best candidates ("On Deck")</p>
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
            Export to Goodreads
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortlist.map((book, i) => (
            <div key={book.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                {i + 1}
              </div>
              <div className="min-w-0 flex-grow">
                <p className="font-medium text-gray-900 truncate">{book.title}</p>
                <p className="text-sm text-gray-500 truncate">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
