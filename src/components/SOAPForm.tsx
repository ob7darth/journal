import React, { useState } from 'react';
import { Save, ArrowLeft, BookOpen, Share2, Search } from 'lucide-react';
import { DailyReading } from '../types/ReadingPlan';
import { SOAPEntry } from '../types/SOAPEntry';
import { BibleVerse } from '../services/BibleService';
import BibleSearch from './BibleSearch';

interface SOAPFormProps {
  day: number;
  reading: DailyReading;
  existingEntry?: SOAPEntry;
  onSave: (day: number, entry: SOAPEntry) => void;
  onBack: () => void;
  onShare?: (entry: SOAPEntry) => void;
}

const SOAPForm: React.FC<SOAPFormProps> = ({ 
  day, 
  reading, 
  existingEntry, 
  onSave, 
  onBack,
  onShare
}) => {
  const [scripture, setScripture] = useState(existingEntry?.scripture || '');
  const [observation, setObservation] = useState(existingEntry?.observation || '');
  const [application, setApplication] = useState(existingEntry?.application || '');
  const [prayer, setPrayer] = useState(existingEntry?.prayer || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showBibleSearch, setShowBibleSearch] = useState(false);

  const handleSave = async () => {
    if (!scripture.trim() || !observation.trim() || !application.trim() || !prayer.trim()) {
      alert('Please fill in all fields before saving.');
      return;
    }

    setIsSaving(true);
    
    const entry: SOAPEntry = {
      day,
      scripture: scripture.trim(),
      observation: observation.trim(),
      application: application.trim(),
      prayer: prayer.trim(),
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate save delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSave(day, entry);
    setIsSaving(false);
    
    // Show success message
    alert('Your SOAP entry has been saved!');
  };

  const handleShare = () => {
    if (!scripture.trim() || !observation.trim() || !application.trim() || !prayer.trim()) {
      alert('Please complete your SOAP entry before sharing.');
      return;
    }

    const entry: SOAPEntry = {
      day,
      scripture: scripture.trim(),
      observation: observation.trim(),
      application: application.trim(),
      prayer: prayer.trim(),
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onShare?.(entry);
  };

  const handleVerseSelect = (verse: BibleVerse) => {
    const verseText = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`;
    setScripture(verseText);
    setShowBibleSearch(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Reading
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            Day {day} SOAP Study
          </h2>
        </div>
        
        {/* Reading Reference */}
        <div className="bg-warm-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-warm-600" />
            <span className="font-medium text-warm-800">Today's Reading:</span>
          </div>
          <div className="text-sm text-warm-700">
            {reading.passages.map((passage, index) => (
              <span key={index}>
                {passage.book} {passage.chapter}:{passage.verses}
                {index < reading.passages.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
        {/* Scripture */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-800">
              📖 Scripture
              <span className="font-normal text-gray-600 ml-2">
                Choose a verse that stands out to you
              </span>
            </label>
            <button
              onClick={() => setShowBibleSearch(!showBibleSearch)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              <Search size={16} />
              Search Verses
            </button>
          </div>
          
          {showBibleSearch && (
            <div className="mb-4">
              <BibleSearch onVerseSelect={handleVerseSelect} />
            </div>
          )}
          
          <textarea
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            placeholder="Write the verse that spoke to you today..."
            className="textarea-field h-24"
            rows={3}
          />
        </div>

        {/* Observation */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            👁️ Observation
            <span className="font-normal text-gray-600 ml-2">
              What is this passage saying?
            </span>
          </label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="What do you observe about this scripture? What is the context? What is God saying?"
            className="textarea-field h-32"
            rows={4}
          />
        </div>

        {/* Application */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            🎯 Application
            <span className="font-normal text-gray-600 ml-2">
              How does this apply to your life?
            </span>
          </label>
          <textarea
            value={application}
            onChange={(e) => setApplication(e.target.value)}
            placeholder="How can you apply this to your life today? What changes might God be calling you to make?"
            className="textarea-field h-32"
            rows={4}
          />
        </div>

        {/* Prayer */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            🙏 Prayer
            <span className="font-normal text-gray-600 ml-2">
              Talk to God about what you learned
            </span>
          </label>
          <textarea
            value={prayer}
            onChange={(e) => setPrayer(e.target.value)}
            placeholder="Write a prayer based on what you've learned today..."
            className="textarea-field h-32"
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save SOAP Entry
              </>
            )}
          </button>

          {onShare && (
            <button
              onClick={handleShare}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              Share Entry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOAPForm;