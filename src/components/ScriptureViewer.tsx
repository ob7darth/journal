import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import { Passage } from '../types/ReadingPlan';
import { BookOpen, ExternalLink, Loader } from 'lucide-react';

interface ScriptureViewerProps {
  passage: Passage;
  version?: string;
}

const ScriptureViewer: React.FC<ScriptureViewerProps> = ({ 
  passage, 
  version = 'NIV'
}) => {
  const [scripture, setScripture] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  const formattedPassage = `${passage.book} ${passage.chapter}:${passage.verses}`;
  const bibleGatewayUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(formattedPassage)}&version=${version}`;

  useEffect(() => {
    const fetchScripture = async () => {
      if (!expanded) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Note: In a production app, you would use a proxy server to handle this request
        // to avoid CORS issues. For this demo, we'll show a fallback message.
        setScripture(`<p class="text-center text-gray-500 italic">Due to cross-origin restrictions, we can't directly fetch the content.</p>
                      <p class="text-center text-gray-500 italic">Please click the "Read on Bible Gateway" button to view the full passage.</p>`);
      } catch (err) {
        setError('Unable to load scripture. Please try again later.');
        console.error('Error fetching scripture:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScripture();
  }, [formattedPassage, version, expanded]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3">
      <div 
        className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-primary-600" />
          <span className="font-medium">{formattedPassage}</span>
        </div>
        <div>
          {expanded ? (
            <span className="text-sm text-gray-500">Hide</span>
          ) : (
            <span className="text-sm text-gray-500">Show</span>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="p-6 flex justify-center">
              <Loader size={24} className="animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="p-6 text-red-500 text-center">{error}</div>
          ) : (
            <div className="p-4">
              <div className="scripture-content mb-4">
                {parse(scripture)}
              </div>
              <div className="flex justify-center">
                <a 
                  href={bibleGatewayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Read on Bible Gateway
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScriptureViewer;