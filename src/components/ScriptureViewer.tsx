import React, { useState, useEffect } from 'react';
import { Passage } from '../types/ReadingPlan';
import { BookOpen, ExternalLink, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { bibleService, BiblePassage } from '../services/BibleService';

interface ScriptureViewerProps {
  passage: Passage;
  version?: string;
}

const ScriptureViewer: React.FC<ScriptureViewerProps> = ({ 
  passage, 
  version = 'NIV'
}) => {
  const [scripture, setScripture] = useState<BiblePassage | null>(null);
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
        const result = await bibleService.getPassage(passage.book, passage.chapter, passage.verses);
        setScripture(result);
      } catch (err) {
        setError('Unable to load scripture. Please try again later.');
        console.error('Error fetching scripture:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScripture();
  }, [passage.book, passage.chapter, passage.verses, expanded]);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="text-primary-600" />
          <div>
            <span className="font-semibold text-gray-900">{formattedPassage}</span>
            <span className="text-sm text-gray-500 ml-2">({version})</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={bibleGatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 p-1"
            onClick={(e) => e.stopPropagation()}
            title="Open in Bible Gateway"
          >
            <ExternalLink size={16} />
          </a>
          {expanded ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          {loading ? (
            <div className="p-6 flex justify-center">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader size={20} className="animate-spin" />
                <span>Loading scripture...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-red-600 text-center">{error}</div>
          ) : scripture ? (
            <div className="p-6">
              <div className="space-y-3">
                {scripture.text.map((verse, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-sm font-medium text-primary-600 min-w-[2rem]">
                      {verse.verse}
                    </span>
                    <p className="text-gray-800 leading-relaxed flex-1">
                      {verse.text}
                    </p>
                  </div>
                ))}
              </div>
              
              {scripture.text.length === 1 && scripture.text[0].text.includes('not yet loaded') && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This passage is not yet available in our local database. 
                    Click the link above to read it on Bible Gateway.
                  </p>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
                <a 
                  href={bibleGatewayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Read full chapter on Bible Gateway
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6 text-gray-500 text-center">
              No scripture content available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScriptureViewer;