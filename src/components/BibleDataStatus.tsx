import React, { useState, useEffect } from 'react';
import { BookOpen, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { bibleService } from '../services/BibleService';

const BibleDataStatus: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({ totalVerses: 0, totalBooks: 0, totalChapters: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      
      // Wait a moment for the service to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const loaded = bibleService.isLoaded();
      setIsLoaded(loaded);
      
      if (loaded) {
        try {
          const bibleStats = await bibleService.getStats();
          setStats(bibleStats);
        } catch (error) {
          console.error('Error getting Bible stats:', error);
        }
      }
      
      setLoading(false);
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <Loader className="text-blue-600 animate-spin" size={16} />
          <span className="text-sm text-blue-800">Checking Bible data status...</span>
        </div>
      </div>
    );
  }

  if (isLoaded && stats.totalVerses > 100) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="text-green-600" size={16} />
          <span className="text-sm font-medium text-green-800">Bible Data Loaded Successfully</span>
        </div>
        <div className="text-xs text-green-700">
          {stats.totalVerses.toLocaleString()} verses • {stats.totalBooks} books • {stats.totalChapters} chapters
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
        <div className="flex-1">
          <div className="text-sm font-medium text-yellow-800 mb-2">
            Using Sample Bible Data
          </div>
          <div className="text-xs text-yellow-700 mb-3">
            For the full Bible experience, you can add the complete NASB text file to your project.
            Currently showing {stats.totalVerses} sample verses.
          </div>
          <details className="text-xs text-yellow-700">
            <summary className="cursor-pointer font-medium mb-2">Setup Instructions</summary>
            <div className="space-y-2 pl-4">
              <p>1. Download the NASB text file from archive.org</p>
              <p>2. Rename it to "bible-data.txt"</p>
              <p>3. Place it in the "public" folder</p>
              <p>4. Restart the development server</p>
              <p className="text-yellow-600 font-medium">
                Note: Ensure you have proper rights to use copyrighted Bible text.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BibleDataStatus;