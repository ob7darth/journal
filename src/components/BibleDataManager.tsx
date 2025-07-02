import React, { useState, useEffect } from 'react';
import { Database, Upload, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { checkBibleDataStatus, loadBibleData } from '../utils/bibleDataLoader';

const BibleDataManager: React.FC = () => {
  const [dataStatus, setDataStatus] = useState<{isLoaded: boolean, stats: any} | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const status = await checkBibleDataStatus();
      setDataStatus(status);
    } catch (error) {
      console.error('Failed to check Bible data status:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      const text = await file.text();
      const format = file.name.split('.').pop()?.toLowerCase() as 'json' | 'csv' | 'xml' | 'txt';
      
      if (!['json', 'csv', 'xml', 'txt'].includes(format)) {
        throw new Error('Unsupported file format. Please use JSON, CSV, XML, or TXT files.');
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await loadBibleData(text, format);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Refresh status
      await checkStatus();
      
      alert('Bible data loaded successfully!');
    } catch (error) {
      console.error('Failed to load Bible data:', error);
      alert(`Failed to load Bible data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const downloadSampleFormat = () => {
    const sampleData = [
      { book: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heavens and the earth." },
      { book: "Genesis", chapter: 1, verse: 2, text: "And the earth was waste and void; and darkness was upon the face of the deep: and the Spirit of God moved upon the face of the waters." },
      { book: "Genesis", chapter: 1, verse: 3, text: "And God said, Let there be light: and there was light." }
    ];

    const jsonString = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asv-bible-sample-format.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="text-primary-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">Bible Data Manager</h2>
      </div>

      {/* Status Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Current Status</h3>
        {dataStatus ? (
          <div className={`p-4 rounded-lg border ${
            dataStatus.isLoaded 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {dataStatus.isLoaded ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-yellow-600" size={20} />
              )}
              <span className={`font-medium ${
                dataStatus.isLoaded ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {dataStatus.isLoaded ? 'Full Bible Loaded' : 'Sample Data Only'}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Total Verses: {dataStatus.stats.totalVerses.toLocaleString()}</p>
              <p>Total Books: {dataStatus.stats.totalBooks}</p>
              <p>Total Chapters: {dataStatus.stats.totalChapters}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader className="animate-spin" size={16} />
            <span>Checking status...</span>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Load Full ASV Bible</h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600 mb-4">
              Upload a file containing the complete ASV Bible text
            </p>
            <input
              type="file"
              accept=".json,.csv,.xml,.txt"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
              id="bible-file-upload"
            />
            <label
              htmlFor="bible-file-upload"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Loading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Choose File
                </>
              )}
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: JSON, CSV, XML, TXT
            </p>
          </div>

          {loading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sample Format Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Data Format</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Your Bible data should be in JSON format with the following structure:
          </p>
          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`[
  {
    "book": "Genesis",
    "chapter": 1,
    "verse": 1,
    "text": "In the beginning God created..."
  },
  ...
]`}
          </pre>
          <button
            onClick={downloadSampleFormat}
            className="mt-3 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
          >
            <Download size={14} />
            Download Sample Format
          </button>
        </div>
      </div>

      {/* Data Sources Section */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Recommended Data Sources</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>Bible Database Project</span>
            <a 
              href="https://github.com/scrollmapper/bible_databases" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              Visit →
            </a>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>Open Bible Data</span>
            <a 
              href="https://openbible.com/data/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              Visit →
            </a>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>Bible API</span>
            <a 
              href="https://bible-api.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              Visit →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleDataManager;