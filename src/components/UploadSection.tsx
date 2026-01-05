import React, { useState } from 'react';
import { Upload, FileUp, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadProps {
  onUploadComplete: () => void;
  onDataReceived?: (data: any) => void;
}

export const UploadSection: React.FC<UploadProps> = ({ onUploadComplete, onDataReceived }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      if (onDataReceived) onDataReceived(data);
      onUploadComplete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-4 border-dashed rounded-3xl p-12 text-center transition-colors ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
            {isUploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Upload size={32} />
              </motion.div>
            ) : (
              <FileUp size={32} />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-800">
            {isUploading ? 'Importing Library...' : 'Drop your Goodreads Export'}
          </h3>
          
          <p className="text-gray-500">
            or <label className="text-indigo-600 cursor-pointer font-semibold hover:underline">
              browse files
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
          </p>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm"
        >
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};
